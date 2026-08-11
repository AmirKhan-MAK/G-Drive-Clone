# DriveClone System Architecture Specification

This document provides the high-level architecture design, component responsibilities, interaction sequences, security models, storage abstraction patterns, and scalability blueprints for **DriveClone**.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart TD
    Client[React.js Frontend UI] -->|HTTPS / REST| Gateway[Spring Cloud Gateway :8080]
    
    subgraph Service Discovery
        Eureka[Netflix Eureka Server :8761]
    end

    Gateway <-->|Discover Services| Eureka
    
    subgraph Microservices Cluster
        Gateway -->|/api/auth/**| AuthSvc[Auth Service :8081]
        Gateway -->|/api/files/**| FileSvc[File Service :8082]
        Gateway -->|/api/folders/**| FolderSvc[Folder Service :8083]
    end

    subgraph Data Layer
        AuthSvc --> AuthDB[(auth_db - MySQL)]
        FileSvc --> FileDB[(file_db - MySQL)]
        FolderSvc --> FolderDB[(folder_db - MySQL)]
        
        FileSvc --> LocalDisk[Local Filesystem Storage\nD:/GoogleDriveClone/storage]
    end
```

---

## 2. Architectural Principles

### 2.1 Business-Capability Microservice Boundaries
Microservices in DriveClone are split strictly by cohesive business responsibilities rather than technical CRUD endpoints:

```text
File Service (Cohesive Business Boundary)
 ├── File Upload
 ├── File Download
 ├── File Preview Stream
 ├── File Rename
 ├── Soft Delete & Restore
 ├── Permanent Delete
 ├── Recycle Bin Management
 ├── Favorites & Pins
 ├── Filename Search & Type Filtering
 ├── File Statistics & Storage Quotas
 └── Storage Abstraction
```

*Anti-Pattern Avoided:* Creating separate `UploadService`, `DownloadService`, `FavoriteService`, and `TrashService` microservices, which causes operational overhead, distributed transaction lockups, and unnecessary network hops.

---

## 3. Core Component Specifications

### 3.1 React.js Frontend
- Single Page Application (SPA) managing authentication state, JWT storage, routing, and file dashboard views. Communicates exclusively with the API Gateway (`http://localhost:8080`).

### 3.2 Spring Cloud Gateway
- Single entry point for all API requests. Provides CORS management, request routing, and JWT authentication filtering before forwarding requests to internal microservices.

### 3.3 Auth Service (`auth-service`)
- Owns user registration, login, BCrypt password hashing, JWT access token generation (`sub=userId`, `roles=USER`), refresh token management, and identity verification.

### 3.4 File Service (`file-service`)
- Central service managing file metadata in `file_db` and physical file bytes on the host filesystem via the `StorageService` interface.

### 3.5 Folder Service (`folder-service`)
- Owns folder tree hierarchy, parent-child directory structures, folder navigation, and folder deletion in `folder_db`.

### 3.6 Eureka Service Registry (`eureka-server`)
- Dynamic service discovery hub where microservices register themselves at startup, allowing Gateway to route traffic dynamically without hardcoded host IP addresses.

---

## 4. Storage Abstraction Layer

To ensure long-term architectural flexibility, business logic in `FileServiceImpl` interacts exclusively with a `StorageService` Java interface.

```mermaid
classDiagram
    class StorageService {
        <<interface>>
        +String store(MultipartFile file, Long userId)
        +Resource load(String storageName)
        +void delete(String storageName)
        +boolean exists(String storageName)
    }

    class LocalStorageService {
        -String basePath
        +String store(MultipartFile file, Long userId)
        +Resource load(String storageName)
        +void delete(String storageName)
        +boolean exists(String storageName)
    }

    class S3StorageService {
        -S3Client s3Client
        -String bucketName
        +String store(MultipartFile file, Long userId)
        +Resource load(String storageName)
        +void delete(String storageName)
        +boolean exists(String storageName)
    }

    StorageService <|.. LocalStorageService : MVP Implementation
    StorageService <|.. S3StorageService : Future Cloud Implementation
```

---

## 5. Sequence Workflows & Data Consistency

### 5.1 File Upload Sequence & Local Compensation
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React UI
    participant Gateway as API Gateway
    participant FileSvc as File Service
    participant Disk as Local Disk
    participant MySQL as file_db (MySQL)

    User->>React: Select file & click Upload
    React->>Gateway: POST /api/files/upload (multipart/form-data)
    Gateway->>FileSvc: Forward request + JWT Security Context
    FileSvc->>FileSvc: Validate file size & user storage quota
    FileSvc->>FileSvc: Generate UUID storage name (e.g. 550e8400.pdf)
    FileSvc->>Disk: Write bytes to D:/GoogleDriveClone/storage/users/101/
    alt Physical Write Successful
        FileSvc->>MySQL: INSERT INTO files (metadata...)
        alt MySQL Insert Fails
            FileSvc->>Disk: EXECUTE COMPENSATION: Delete physical file (550e8400.pdf)
            FileSvc-->>Gateway: Return 500 Internal Error
            Gateway-->>React: Return Error Envelope { success: false }
        else MySQL Insert Succeeded
            FileSvc-->>Gateway: Return 201 Created + File Response
            Gateway-->>React: Return JSON Response Envelope
            React-->>User: Render new file in grid view
        end
    else Physical Write Fails
        FileSvc-->>Gateway: Return 500 Storage Exception
        Gateway-->>React: Return Error Envelope
    end
```

### 5.2 Permanent Deletion Sequence
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant React as React UI
    participant FileSvc as File Service
    participant Disk as Local Disk
    participant MySQL as file_db (MySQL)

    User->>React: Click Permanent Delete on file ID 501
    React->>FileSvc: DELETE /api/files/permanent/501
    FileSvc->>MySQL: SELECT * FROM files WHERE id=501 AND user_id=101
    FileSvc->>Disk: Delete physical file (D:/GoogleDriveClone/storage/.../550e8400.pdf)
    alt Physical Delete Succeeded
        FileSvc->>MySQL: DELETE FROM files WHERE id=501
        FileSvc-->>React: 200 OK { success: true }
    else Physical Delete Fails
        FileSvc-->>React: 500 Storage Exception (DB Row Retained for Retry)
    end
```

---

## 6. Security & Identity Architecture

```text
React Client             API Gateway               Microservice
    │                         │                         │
    │  Authorization: Bearer  │                         │
    ├────────────────────────>│                         │
    │      <JWT Token>        │ Validate Signature      │
    │                         ├────────────────────────>│ Extract Claims
    │                         │ Pass Request + User ID  │ Validate Ownership
```

- **Authentication:** Spring Security validates JWT signature using secret key.
- **Stateless Identity:** User identity (`userId`, `roles`) is extracted from JWT claims (`sub`). Downstream microservices enforce:
  `WHERE user_id = authenticatedUserId`.

---

## 7. Future Scalability Architecture (Phase 6)

```text
                             Client Applications
                                      │
                                      ▼
                                Load Balancer
                                      │
                                      ▼
                             Spring Cloud Gateway
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
      Auth Service               File Service              Folder Service
           │                          │                          │
           ▼                          ├──────────────┐           ▼
        MySQL DB                      │              │        MySQL DB
                                      ▼              ▼
                                  MinIO / S3       Kafka (Event Bus)
                               (Object Storage)      │
                                            ┌────────┴────────┐
                                            ▼                 ▼
                                     Search Service     Notification
                                     (Elasticsearch)       Service
```
