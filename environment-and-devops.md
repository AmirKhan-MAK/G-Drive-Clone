# DriveClone Environment & DevOps Engineering Guide

This document specifies the local development setup, service port allocation, configuration properties, environment variables, and Docker Compose orchestration for **DriveClone**.

---

## 1. System Requirements & Prerequisites

### 1.1 Development Workstation Setup
- **Operating System:** Windows 10/11
- **Java Development Kit:** JDK 17 or higher (OpenJDK / Eclipse Temurin)
- **Build Tool:** Apache Maven 3.8+ or Gradle 7.x
- **Node.js Environment:** Node.js 18.x LTS & npm 9.x+
- **Database Engine:** MySQL Server 8.0+ running on port `3306`
- **IDE:** IntelliJ IDEA / Eclipse for Java, VS Code for React

---

## 2. Network Architecture & Port Allocation

| Component / Microservice | Module Directory | Service Port | Protocol | Discovery Name |
| :--- | :--- | :--- | :--- | :--- |
| **Eureka Server** | `backend/eureka-server` | `8761` | HTTP | `EUREKA-SERVER` |
| **API Gateway** | `backend/api-gateway` | `8080` | HTTP | `API-GATEWAY` |
| **Auth Service** | `backend/auth-service` | `8081` | HTTP | `AUTH-SERVICE` |
| **File Service** | `backend/file-service` | `8082` | HTTP | `FILE-SERVICE` |
| **Folder Service** | `backend/folder-service` | `8083` | HTTP | `FOLDER-SERVICE` |
| **Share Service (Future)** | `backend/share-service` | `8084` | HTTP | `SHARE-SERVICE` |
| **React UI App** | `frontend/react-drive` | `3000` | HTTP | N/A |
| **MySQL Database** | Host Service | `3306` | JDBC | N/A |

---

## 3. Storage Infrastructure & Local Paths

### 3.1 Local Filesystem Setup (Windows)
The MVP stores actual binary file bytes on the host disk under a dedicated root folder:

```text
D:/GoogleDriveClone/storage/
├── temp/                      # Temporary upload buffers
└── users/                     # Production user storage
    ├── user-101/              # User ID 101 isolated storage
    │   ├── 550e8400-e29b.pdf  # Physical UUID-named files
    │   └── 9b1deb4d-3a7c.jpg
    └── user-102/
        └── 1b2c3d4e-5f6a.zip
```

---

## 4. Microservice Configuration Files

### 4.1 File Service Configuration (`file-service/src/main/resources/application.yml`)
```yaml
server:
  port: 8082

spring:
  application:
    name: file-service
  datasource:
    url: jdbc:mysql://localhost:3306/file_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:root}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 500MB

storage:
  base-path: D:/GoogleDriveClone/storage
  quota-bytes: 16106127360 # 15 GB

jwt:
  secret: 9a2f8c4e7b1d4a6f8e3c2b5a7d9e1f4c6b8a3d5e7f9a2c4b6e8d1f3a5c7b9e2f

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

### 4.2 API Gateway Configuration (`api-gateway/src/main/resources/application.yml`)
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "http://localhost:3000"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true
      routes:
        - id: auth-service
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/auth/**

        - id: file-service
          uri: lb://FILE-SERVICE
          predicates:
            - Path=/api/files/**

        - id: folder-service
          uri: lb://FOLDER-SERVICE
          predicates:
            - Path=/api/folders/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

---

## 5. Containerized Infrastructure (`docker-compose.yml`)

For Phase 6 deployment, the application stack is orchestrated via Docker Compose:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: driveclone-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  eureka-server:
    build: ./backend/eureka-server
    container_name: driveclone-eureka
    ports:
      - "8761:8761"

  api-gateway:
    build: ./backend/api-gateway
    container_name: driveclone-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server

  auth-service:
    build: ./backend/auth-service
    container_name: driveclone-auth
    ports:
      - "8081:8081"
    depends_on:
      - mysql
      - eureka-server

  file-service:
    build: ./backend/file-service
    container_name: driveclone-file
    ports:
      - "8082:8082"
    volumes:
      - D:/GoogleDriveClone/storage:/app/storage
    depends_on:
      - mysql
      - eureka-server

  folder-service:
    build: ./backend/folder-service
    container_name: driveclone-folder
    ports:
      - "8083:8083"
    depends_on:
      - mysql
      - eureka-server

volumes:
  mysql_data:
```
