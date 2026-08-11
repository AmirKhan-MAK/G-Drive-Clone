# DriveClone Engineering & Development Phasing Plan

This document outlines the step-by-step 6-phase rollout strategy for building, securing, micro-servicing, and scaling the **DriveClone** application.

---

## Phasing Roadmap Overview

```text
Phase 1: Core Foundation (Spring Boot Monolith / MySQL / File Storage)
   │
   ▼
Phase 2: Security Layer (Spring Security / JWT Authentication)
   │
   ▼
Phase 3: Frontend Client (React.js Dashboard / State Management)
   │
   ▼
Phase 4: Microservices Split (Eureka / Spring Cloud Gateway / OpenFeign)
   │
   ▼
Phase 5: Advanced Features (Sharing / Permissions / Notifications)
   │
   ▼
Phase 6: Infrastructure & Cloud Scaling (Docker / Redis / Kafka / S3)
```

---

## Phase 1: Core Storage & Backend Foundation

### 1.1 Objective
Build a working single-service backend prototype managing file metadata in MySQL and raw bytes on the local filesystem.

### 1.2 Tech Stack
- Java 17+, Spring Boot 3.x
- MySQL 8.0+
- Spring Data JPA + Hibernate
- Local Filesystem Storage (`D:/GoogleDriveClone/storage`)

### 1.3 Key Deliverables
1. Setup MySQL database schemas (`file_db`, `folder_db`).
2. Implement `FileEntity`, `FolderEntity`, and JPA Repositories.
3. Implement `LocalStorageService` implementing `StorageService` interface.
4. Implement File REST APIs: Upload, Metadata, Download, View/Preview inline, Soft Delete, Restore, Permanent Delete, Recycle Bin, Rename.
5. Implement Folder REST APIs: Create, List, Move, Delete.
6. Implement path safety checks (UUID storage names) and file validation.

### 1.4 Phase 1 Definition of Done
- Files can be uploaded via HTTP Post, stored physically on disk, and retrieved/downloaded without corruption.
- Metadata is properly stored in MySQL.

---

## Phase 2: Security & Identity Layer

### 2.1 Objective
Incorporate authentication, user management, and JWT-based session protection into the backend.

### 2.2 Tech Stack
- Spring Security
- JSON Web Tokens (jjwt / Spring Security OAuth2 Resource Server)
- BCrypt Password Encoder

### 2.3 Key Deliverables
1. Build Auth Service module with `users`, `roles`, `user_roles`, and `refresh_tokens` tables.
2. Implement `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`.
3. Create JWT authentication filter intercepting all incoming HTTP requests.
4. Bind authenticated `userId` to the Spring Security Context (`SecurityContextHolder`).
5. Enforce authorization checks in File & Folder services (ensure users can only access items matching their `user_id`).

### 2.4 Phase 2 Definition of Done
- Unauthenticated requests receive `401 Unauthorized`.
- Users can log in, receive a JWT token, and access only their own files.

---

## Phase 3: Frontend Client Integration

### 3.1 Objective
Develop a modern, responsive React.js frontend interface interacting with the backend APIs.

### 3.2 Tech Stack
- React.js (Vite / Create React App)
- React Router DOM
- Axios (with Request/Response Interceptors for JWT handling)
- Context API (Auth Context, Drive Context)

### 3.3 Key Deliverables
1. Login & Registration Screens (`/login`, `/register`).
2. Navigation Sidebar (`My Drive`, `Recent`, `Favorites`, `Recycle Bin`).
3. Main View Area (Header with Search, Storage Quota Meter, File/Folder Grid & List toggle).
4. Interactive Modals: Multi-file Drag & Drop Upload, Create Folder, Rename File/Folder, File Previewer (PDF, Images, Text).
5. Axios JWT interceptor automatically attaching `Authorization: Bearer <JWT>` header and handling token refresh on `401`.

### 3.4 Phase 3 Definition of Done
- Complete end-to-end user experience in browser: Register -> Login -> Create Folder -> Upload File -> Preview -> Rename -> Soft Delete -> Recycle Bin -> Restore -> Permanent Delete.

---

## Phase 4: Microservices Architecture & API Gateway

### 4.1 Objective
Decompose the monolithic backend into decoupled business microservices registered with Eureka and routed through Spring Cloud Gateway.

### 4.2 Tech Stack
- Spring Cloud Gateway
- Netflix Eureka Service Discovery
- Spring Cloud OpenFeign (for synchronous inter-service calls)

### 4.3 Key Deliverables
1. **Eureka Server (`eureka-server`):** Running on port `8761`.
2. **API Gateway (`api-gateway`):** Running on port `8080`, routing:
   - `/api/auth/**` -> `AUTH-SERVICE`
   - `/api/files/**` -> `FILE-SERVICE`
   - `/api/folders/**` -> `FOLDER-SERVICE`
3. Decouple backend into standalone Spring Boot services (`auth-service`, `file-service`, `folder-service`).
4. Implement OpenFeign clients for inter-service communication (e.g., File Service calling Folder Service to validate `folderId`).

### 4.4 Phase 4 Definition of Done
- React frontend communicates exclusively through `http://localhost:8080` (API Gateway). Services discover each other dynamically via Eureka.

---

## Phase 5: Sharing & Advanced Functional Enhancements

### 5.1 Objective
Introduce file/folder sharing, permission levels, public share links, and enhanced search.

### 5.2 Key Deliverables
1. Build `share-service` owning `file_shares` and `folder_shares` tables.
2. Define permission levels: `OWNER`, `EDITOR`, `VIEWER`.
3. Implement `POST /api/shares/files/{id}` and `GET /api/shares/shared-with-me`.
4. Update File Service authorization filter to permit access to shared files based on permission level.

---

## Phase 6: Cloud Scaling & Production DevOps

### 6.1 Objective
Transition infrastructure to production-ready containerized, cached, and event-driven architecture.

### 6.2 Tech Stack
- Docker & Docker Compose
- Redis (Caching & Rate Limiting)
- Apache Kafka (Asynchronous Event Streaming)
- MinIO / AWS S3 (Cloud Object Storage)
- Elasticsearch (Full-text Search Engine)

### 6.3 Key Deliverables
1. Implement `S3StorageService` / `MinioStorageService` implementing `StorageService` interface.
2. Integrate Redis for caching recent files and storage statistics.
3. Emit `FileUploaded`, `FileDeleted`, `FileShared` events to Kafka topics.
4. Containerize all microservices with Dockerfiles and orchestrate with `docker-compose.yml`.
