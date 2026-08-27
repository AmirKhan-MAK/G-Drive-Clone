# Spring Cloud Microservices Configuration Guide (Step-by-Step)

Is guide me hum dekhenge ki **Microservices Architecture** ko configure kaise kiya jata hai (`Eureka Server`, `API Gateway`, `File-Service`, `Folder-Service`). Ye step-by-step guide beginner-friendly Hinglish/English me banayi gayi hai taaki aapko har ek component ka purpose aur setup clear ho sake.

---

## 1. High-Level Architecture Overview

Microservices me har business functionality ka apna ek alag independent service hota hai:

```text
                                  +-----------------------+
                                  | React.js Frontend UI  |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |  Spring Cloud Gateway |  (Port: 8080)
                                  |     (API Gateway)     |
                                  +-----------+-----------+
                                              |
                    +-------------------------+-------------------------+
                    |                                                   |
                    v                                                   v
        +-----------------------+                           +-----------------------+
        |     Eureka Server     | (Port: 8761)              |     Eureka Server     |
        |  (Service Registry)   | <------------------------ |  (Service Registry)   |
        +-----------------------+                           +-----------------------+
                    ^                                                   ^
                    | (Registers)                                       | (Registers)
        +-----------+-----------+                           +-----------+-----------+
        |      File Service     | (Port: 8082)              |     Folder Service    | (Port: 8083)
        |     (FILE-SERVICE)    |                           |    (FOLDER-SERVICE)   |
        +-----------------------+                           +-----------------------+
```

### Key Components:
1. **Eureka Server (Port: 8761):** Service Registry. Sabhi microservices start hokar iske paas apna naam aur IP/Port register karwate hain.
2. **API Gateway (Port: 8080):** Frontend/Client ke liye single entry point. Ye Eureka se poochhta hai ki konsi service kahan chal rahi hai aur request ko routing karta hai.
3. **File Service (Port: 8082):** Files upload, download, metadata save karne ki service.
4. **Folder Service (Port: 8083):** Folder structure, tree navigation, parent-child folder management.

---

## 2. Step 1: Setting up Eureka Server (`eureka-server`)

Eureka Server hamara central registry system hai. Sabse pehle ise set karenge.

### 2.1 Dependencies (`pom.xml`)
Eureka Server project me Spring Cloud dependencies add karein:

```xml
<dependencies>
    <!-- Eureka Server Dependency -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2023.0.0</version> <!-- Use active Spring Cloud Version -->
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2.2 Main Application Class
Application class ke upar `@EnableEurekaServer` annotation lagayein:

```java
package com.drive.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer  // Enables Eureka Registry Server
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

### 2.3 Configuration (`application.yml`)
`src/main/resources/application.yml` me server port aur settings add karein:

```yaml
server:
  port: 8761

spring:
  application:
    name: eureka-server

eureka:
  client:
    # Eureka server khud ko register nahi karega
    register-with-eureka: false
    # Eureka server ko kisi dusre registry se fetch karne ki jarurat nahi hai
    fetch-registry: false
  server:
    wait-time-in-ms-when-sync-empty: 0
```

> **Kyun `false` set kiya?** Eureka Server ek registry hai, isko khud ko kisi aur Eureka server me register nahi karna hai (single node setup me).

---

## 3. Step 2: Setting up API Gateway (`api-gateway`)

API Gateway Client requests ko intercept karke sahi Microservice tak route karta hai using `Eureka Server` lookup.

### 3.1 Dependencies (`pom.xml`)

```xml
<dependencies>
    <!-- Spring Cloud Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>

    <!-- Eureka Client for Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

> ⚠️ **Important Note:** `api-gateway` me `spring-boot-starter-web` (Spring MVC) include **Nahi** karna, kyunki Spring Cloud Gateway **Spring WebFlux (Reactive)** use karta hai.

### 3.2 Main Application Class

```java
package com.drive.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

### 3.3 Configuration (`application.yml`)

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        # Route 1: File Service Route
        - id: file-service-route
          uri: lb://FILE-SERVICE  # 'lb://' means Load Balanced Eureka Service Name
          predicates:
            - Path=/api/files/**

        # Route 2: Folder Service Route
        - id: folder-service-route
          uri: lb://FOLDER-SERVICE
          predicates:
            - Path=/api/folders/**

        # Route 3: Auth Service Route
        - id: auth-service-route
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/auth/**

      # Global CORS Configuration for React Frontend
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins:
              - "http://localhost:5173"
              - "http://localhost:3000"
            allowedMethods:
              - GET
              - POST
              - PUT
              - PATCH
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

---

## 4. Step 3: Configuring Microservices (`file-service` & `folder-service`)

Ab hum hamari core services (`file-service` aur `folder-service`) ko Eureka Client ke roop me configure karenge.

### 4.1 `file-service` Setup (Port 8082)

#### Dependencies (`pom.xml`)
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    <!-- Eureka Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

#### Application Class (`FileServiceApplication.java`)
```java
package com.drive.file;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FileServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FileServiceApplication.class, args);
    }
}
```

#### `application.yml` for `file-service`
```yaml
server:
  port: 8082

spring:
  application:
    name: FILE-SERVICE  # MUST match Gateway route uri: lb://FILE-SERVICE

  datasource:
    url: jdbc:mysql://localhost:3306/file_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: your_mysql_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

---

### 4.2 `folder-service` Setup (Port 8083)

#### Application Class (`FolderServiceApplication.java`)
```java
package com.drive.folder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FolderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FolderServiceApplication.class, args);
    }
}
```

#### `application.yml` for `folder-service`
```yaml
server:
  port: 8083

spring:
  application:
    name: FOLDER-SERVICE # MUST match Gateway route uri: lb://FOLDER-SERVICE

  datasource:
    url: jdbc:mysql://localhost:3306/folder_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: your_mysql_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

---

## 5. Step 4: Inter-Service Communication using OpenFeign

Agar ek Microservice ko dusri Microservice se communicate karna ho (jaise jab Folder delete ho to uske andar ki Files check karne ke liye `folder-service` -> `file-service` ko call kare), to hum **Spring Cloud OpenFeign** use karte hain.

### 5.1 OpenFeign Dependency
Add in `pom.xml` of calling service:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### 5.2 Enable Feign Client
Application main class par `@EnableFeignClients` add karein:
```java
@SpringBootApplication
@EnableFeignClients
public class FolderServiceApplication { ... }
```

### 5.3 Feign Client Interface Example
`folder-service` me ek interface banayein jo `FILE-SERVICE` ko call karega:

```java
package com.drive.folder.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "FILE-SERVICE") // Eureka me registered service ka naam
public interface FileServiceClient {

    @GetMapping("/api/files/count-by-folder/{folderId}")
    Long getFileCountByFolderId(@PathVariable("folderId") Long folderId);
}
```

---

## 6. Step 5: How to Run and Test Step-by-Step

Aapko services **sahi order** me launch karni hongi:

### Startup Sequence:
1. **Start 1st: `eureka-server`**
   - Command / Run in IDE: `EurekaServerApplication`
   - Open browser: `http://localhost:8761`
   - **Verification:** Eureka Dashboard screen open honi chahiye. Abhi "Instances currently registered with Eureka" list empty hogi.

2. **Start 2nd: `api-gateway`**
   - Run: `ApiGatewayApplication`
   - **Verification:** Refresh `http://localhost:8761`. Dashboard par `API-GATEWAY` status **UP** dikhna chahiye.

3. **Start 3rd: `file-service` & `folder-service`**
   - Run: `FileServiceApplication`
   - Run: `FolderServiceApplication`
   - **Verification:** Refresh `http://localhost:8761`. Dashboard par ab `FILE-SERVICE` aur `FOLDER-SERVICE` dono **UP** dikhne chahiye.

---

## 7. How Requests Flow in Action (Example Test)

When Frontend sends request to create a folder or upload a file:

1. Request sent to Gateway: `POST http://localhost:8080/api/files/upload`
2. Gateway inspects path `/api/files/**`.
3. Gateway asks Eureka: *"Bhai, `FILE-SERVICE` kaha chal reha hai?"*
4. Eureka replies: *"File Service IP `127.0.0.1:8082` par UP hai."*
5. Gateway routes request directly to `http://localhost:8082/api/files/upload`.
6. Response comes back to Gateway -> Frontend envelope wrapper format:
   ```json
   {
     "success": true,
     "message": "File uploaded successfully",
     "data": {
       "fileId": 101,
       "name": "document.pdf",
       "size": 2048
     }
   }
   ```

---

## 8. Summary Checklist Before Coding APIs

- [x] **Eureka Server** running on `http://localhost:8761`
- [x] **API Gateway** running on `http://localhost:8080`
- [x] **File Service** registered on Eureka (`FILE-SERVICE`) on port `8082`
- [x] **Folder Service** registered on Eureka (`FOLDER-SERVICE`) on port `8083`
- [x] MySQL database created (`file_db` & `folder_db`)
- [x] API routes configured in `api-gateway` `application.yml`

Aap ab fully tayar hain **File-Service** aur **Folder-Service** ki API controllers aur business logic build karne ke liye! 🚀
