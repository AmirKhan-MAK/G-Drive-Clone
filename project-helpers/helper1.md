# Spring Cloud Microservices Configuration Guide (Step-by-Step)

Is guide me hum dekhenge ki **Microservices Architecture** ko kaise configure aur connect kiya jata hai (`Eureka Server`, `API Gateway`, `Auth-Service`, `File-Service`, `Folder-Service`). Ye step-by-step guide beginner-friendly Hinglish/English me banayi gayi hai taaki aapko har ek component ka purpose, configuration aur exact workflow clear ho sake.

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
                                              v
                                  +-----------------------+
                                  |     Eureka Server     |  (Port: 8761)
                                  |  (Service Registry)   |
                                  +-----------+-----------+
                                              |
        +-------------------------------------+-------------------------------------+
        |                                     |                                     |
        v                                     v                                     v
+---------------+                     +---------------+                     +---------------+
| Auth Service  | (Port: 8081)        | File Service  | (Port: 8082)        | Folder Service| (Port: 8083)
| (AUTH-SERVICE)|                     | (FILE-SERVICE)|                     |(FOLDER-SERVICE|
+-------+-------+                     +-------+-------+                     +-------+-------+
        |                                     |                                     |
        v                                     v                                     v
  (auth_db MySQL)                       (file_db MySQL)                       (folder_db MySQL)
```

### Key Components:
1. **Eureka Server (Port: 8761):** Service Registry. Sabhi microservices start hokar iske paas apna naam aur IP/Port register karwate hain.
2. **API Gateway (Port: 8080):** Frontend/Client ke liye single entry point. Route matching, CORS, aur Token Verification karta hai.
3. **Auth Service (Port: 8081):** User registration, login, BCrypt password hashing, aur JWT token generation karta hai.
4. **File Service (Port: 8082):** File upload, download, disk storage, aur metadata manage karta hai.
5. **Folder Service (Port: 8083):** Folder hierarchy, directory creation, aur folder navigation manage karta hai.

---

## 2. Step 1: Setting up Eureka Server (`eureka-server`)

Eureka Server hamara central registry system hai. Sabse pehle ise set karenge.

### 2.1 Dependencies (`pom.xml`)

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

> ⚠️ **Note:** `api-gateway` me `spring-boot-starter-web` (Spring MVC) include **Nahi** karna hai, kyunki Spring Cloud Gateway **Spring WebFlux (Reactive)** rely karta hai.

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
        # Route 1: Auth Service Route
        - id: auth-service-route
          uri: lb://AUTH-SERVICE
          predicates:
            - Path=/api/auth/**

        # Route 2: File Service Route
        - id: file-service-route
          uri: lb://FILE-SERVICE  # 'lb://' means Load Balanced Eureka Service Name
          predicates:
            - Path=/api/files/**

        # Route 3: Folder Service Route
        - id: folder-service-route
          uri: lb://FOLDER-SERVICE
          predicates:
            - Path=/api/folders/**

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

## 4. Step 3: Setting up Auth Service (`auth-service`)

Auth Service User Identity aur Token Security ki microservice hai. Subse pehle authentication endpoints (`/api/auth/register`, `/api/auth/login`) isi me handle hongi.

### 4.1 Dependencies (`pom.xml`)

```xml
<dependencies>
    <!-- Web Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JPA & MySQL -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT Library (JJWT) -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Eureka Client -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

### 4.2 Main Application Class (`AuthServiceApplication.java`)

```java
package com.drive.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
```

### 4.3 Configuration (`application.yml`) for `auth-service`

```yaml
server:
  port: 8081

spring:
  application:
    name: AUTH-SERVICE  # MUST match Gateway route uri: lb://AUTH-SERVICE

  datasource:
    url: jdbc:mysql://localhost:3306/auth_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
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

# Custom JWT Configuration
jwt:
  secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  expiration-ms: 86400000 # 24 Hours in milliseconds

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

---

## 5. Step 4: Configuring Microservices (`file-service` & `folder-service`)

Ab hum hamari core services (`file-service` aur `folder-service`) ko Eureka Client ke roop me configure karenge.

### 5.1 `file-service` Setup (Port 8082)

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

### 5.2 `folder-service` Setup (Port 8083)

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

## 6. Step 5: Inter-Service Communication using OpenFeign

Jab ek Microservice ko doosri Microservice ka data chahiye hota hai (jaise jab Folder delete ho to uske andar ki Files check karne ke liye `folder-service` -> `file-service` ko call kare), to hum **Spring Cloud OpenFeign** use karte hain.

### 6.1 OpenFeign Dependency
Add in `pom.xml` of calling service (e.g. `folder-service`):
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### 6.2 Enable Feign Client
Application main class par `@EnableFeignClients` add karein:
```java
@SpringBootApplication
@EnableFeignClients
public class FolderServiceApplication { ... }
```

### 6.3 Feign Client Interface Example
`folder-service` me ek interface banayein jo `FILE-SERVICE` ko call karega via Eureka:

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

## 7. Step 6: Comprehensive Service Flow (How All Services Connect & Work Together)

Subse zaroori cheez ye samajhna hai ki saari services aapas me kaise connect hoti hain aur request ka flow kya hota hai. Hum ise 4 phases me divide karke dekhenge:

```text
+-----------------------------------------------------------------------------------+
|                         COMPLETE SYSTEM FLOW ARCHITECTURE                         |
+-----------------------------------------------------------------------------------+

[Phase A: Startup & Registration]
 Microservices (Auth, File, Folder, Gateway) ---> Register IP:Port with Eureka (:8761)

[Phase B: Authentication Flow]
 React Client ---> POST /api/auth/login ---> Gateway (:8080) 
                                                |
                                                v (Routes to)
                                          AUTH-SERVICE (:8081)
                                                |
                                                v (Validates DB & generates JWT)
 React Client <--- Returns JWT Token <----------+

[Phase C: Protected Operations Flow (e.g. Upload File)]
 React Client ---> POST /api/files/upload (Header: Authorization: Bearer JWT) ---> Gateway (:8080)
                                                                                      |
                                                                                      v (Validates JWT Token & extracts UserId)
                                                                                FILE-SERVICE (:8082)
                                                                                      |
                                                                                      v (Saves file metadata in file_db & disk)
 React Client <--- Returns Upload Success Envelope <----------------------------------+

[Phase D: Inter-Service Flow (e.g. Delete Folder with Files)]
 Client ---> DELETE /api/folders/15 ---> Gateway (:8080) ---> FOLDER-SERVICE (:8083)
                                                                   |
                                                                   v (OpenFeign Inter-service call)
                                                             FILE-SERVICE (:8082)
```

---

### Detailed Breakdown of Each Phase:

### 🔹 Phase A: Service Discovery & Registration (Startup Time)
1. Sabse pehle **`eureka-server`** Port `8761` par start hota hai.
2. Uske baad **`auth-service`**, **`file-service`**, **`folder-service`**, aur **`api-gateway`** start hote hain.
3. Har client service ke `application.yml` me `eureka.client.service-url.defaultZone: http://localhost:8761/eureka/` likha hota hai.
4. Ye sabhi services start hone ke baad Eureka Server ko HTTP heartbeat bhejti hain aur apna application name (`AUTH-SERVICE`, `FILE-SERVICE`, `FOLDER-SERVICE`, `API-GATEWAY`) aur host IP/Port register karwati hain.
5. **Eureka Server Registry Table Example:**
   | Service Name | Registered Location | Status |
   | :--- | :--- | :--- |
   | `API-GATEWAY` | `http://127.0.0.1:8080` | UP |
   | `AUTH-SERVICE` | `http://127.0.0.1:8081` | UP |
   | `FILE-SERVICE` | `http://127.0.0.1:8082` | UP |
   | `FOLDER-SERVICE` | `http://127.0.0.1:8083` | UP |

---

### 🔹 Phase B: User Login / Authentication Flow
1. **User Request:** React frontend se User email aur password enter karke Login button press karta hai -> `POST http://localhost:8080/api/auth/login`.
2. **Gateway Interception:** API Gateway (`:8080`) request receive karta hai. Predicate check karta hai `/api/auth/**`.
3. **Gateway Lookup:** Gateway Eureka Registry se poochhta hai: *"AUTH-SERVICE kahan hai?"*. Eureka jawab deta hai `127.0.0.1:8081`.
4. **Routing:** Gateway request ko `AUTH-SERVICE` (`:8081`) par forwarding kar deta hai.
5. **DB Verification:** `AUTH-SERVICE` MySQL `auth_db` se user ka record fetch karta hai aur BCrypt password matcher se verify karta hai.
6. **JWT Token Generation:** Verification successful hone par `AUTH-SERVICE` ek **JWT Access Token** create karta hai. Is token payload me:
   - `sub`: User ID (e.g., `42`)
   - `email`: `user@gmail.com`
   - `iat`: Issue Timestamp
   - `exp`: Expiry Timestamp (24 Hours)
7. **Response:** Response Client tak pahunchta hai:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsImVtYWlsIj...",
       "userId": 42,
       "email": "user@gmail.com"
     }
   }
   ```
8. **Client Storage:** React frontend is JWT token ko `localStorage` ya secure state me save kar leta hai.

---

### 🔹 Phase C: Protected Microservice Request Flow (File Upload / Folder Creation)
Jab user logged-in hone ke baad file upload ya folder create karta hai:

1. **Request with Token:** React client file upload request bhejta hai:
   - URL: `POST http://localhost:8080/api/files/upload`
   - Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`
2. **Gateway Interception & Token Validation:**
   - Gateway `/api/files/**` predicate match karta hai.
   - Gateway me laga **JwtAuthenticationFilter** request se Bearer token extract karta hai.
   - Token ki Signature verify karta hai using shared `jwt.secret`.
   - Token se `userId` (e.g. `42`) decode karta hai.
3. **Header Injection (Pass-Through Security):**
   - Gateway downstream request me custom header inject kar sakta hai: `X-User-Id: 42`.
4. **Eureka Discovery & Load Balancing:**
   - Gateway Eureka se `FILE-SERVICE` ki location maangta hai (`http://127.0.0.1:8082`).
5. **Execution in `file-service`:**
   - `file-service` request receive karta hai.
   - Physical file ko local storage disk (`D:/GoogleDriveClone/storage/42/`) me write karta hai.
   - File metadata (file name, size, type, owner `userId=42`) ko `file_db` MySQL database me insert karta hai.
6. **Response Envelope:** Gateway ke zariye Unified JSON Envelope client ko chala jata hai:
   ```json
   {
     "success": true,
     "message": "File uploaded successfully",
     "data": {
       "fileId": 101,
       "name": "resume.pdf",
       "sizeBytes": 1048576,
       "mimeType": "application/pdf",
       "createdAt": "2026-08-29T01:00:00Z"
     }
   }
   ```

---

### 🔹 Phase D: Inter-Service Communication (OpenFeign Flow)
Man lo user ek folder delete kar reha hai jisme 5 files hain:

1. Client bhejta hai: `DELETE http://localhost:8080/api/folders/15`.
2. Gateway is request ko `FOLDER-SERVICE` (`:8083`) tak route kar deta hai.
3. `FOLDER-SERVICE` ko pata karna hai ki kya is Folder (ID: 15) ke andar koi files mojood hain.
4. `FOLDER-SERVICE` apne andar registered Feign Client (`FileServiceClient`) ke dwara direct `FILE-SERVICE` ko call karta hai:
   - Call: `GET http://FILE-SERVICE/api/files/count-by-folder/15`
5. OpenFeign automatically Eureka se `FILE-SERVICE` ka IP (`127.0.0.1:8082`) dhundh ke call executed karata hai.
6. `FILE-SERVICE` response deta hai: `5` files found.
7. `FOLDER-SERVICE` standard rule apply karke soft-delete ya cascade delete handle kar leta hai aur Gateway ke trough Client ko status return kar deta hai.

---

## 8. Step 7: How to Run and Launch Order Checklist

Microservices project ko locally start karte waqt **hamesha sahi sequence** follow karein:

### Execution Order:
1. 🟢 **Start 1st: `eureka-server`** (Port 8761)
   - *Verify:* Browser me `http://localhost:8761` open karein.
2. 🟢 **Start 2nd: `api-gateway`** (Port 8080)
   - *Verify:* Eureka dashboard refresh karein, `API-GATEWAY` status **UP** hona chahiye.
3. 🟢 **Start 3rd: `auth-service`** (Port 8081)
   - *Verify:* Eureka dashboard me `AUTH-SERVICE` status **UP** dikhna chahiye.
4. 🟢 **Start 4th: `file-service` & `folder-service`** (Ports 8082, 8083)
   - *Verify:* Eureka dashboard me `FILE-SERVICE` aur `FOLDER-SERVICE` **UP** dikhne chahiye.

---

## 9. Summary Checklist Before Coding APIs

- [x] **Eureka Server** running on `http://localhost:8761`
- [x] **API Gateway** running on `http://localhost:8080`
- [x] **Auth Service** registered on Eureka (`AUTH-SERVICE`) on port `8081`
- [x] **File Service** registered on Eureka (`FILE-SERVICE`) on port `8082`
- [x] **Folder Service** registered on Eureka (`FOLDER-SERVICE`) on port `8083`
- [x] MySQL databases created (`auth_db`, `file_db`, `folder_db`)
- [x] Routes and CORS configured in Gateway `application.yml`
- [x] Complete End-to-End Request Flow & JWT security understood

Aap ab fully prepared hain **Auth-Service**, **File-Service**, aur **Folder-Service** ke controllers aur services build karne ke liye! 🚀
