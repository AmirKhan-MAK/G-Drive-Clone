# Architecture.md

# Google Drive Clone --- System Architecture

## 1. Project Overview

This project is a Google Drive--style cloud-drive application built as a
learning and portfolio project using:

-   **Frontend:** React.js
-   **Backend:** Java + Spring Boot
-   **Architecture:** Microservices
-   **API Gateway:** Spring Cloud Gateway
-   **Service Discovery:** Eureka
-   **Security:** Spring Security + JWT
-   **Database:** MySQL
-   **File Storage for MVP:** Local filesystem
-   **ORM:** Spring Data JPA + Hibernate
-   **Inter-service communication:** REST/OpenFeign initially
-   **Future asynchronous communication:** Kafka
-   **Future cache:** Redis
-   **Future cloud storage:** AWS S3-compatible storage

The MVP deliberately avoids paid cloud storage. Actual files are stored
on the local machine, while MySQL stores file metadata.

------------------------------------------------------------------------

# 2. Architectural Principles

## 2.1 Business-capability based microservices

Services are split by business responsibility, not by individual API.

### Good boundary

``` text
File Service
 ├── Upload
 ├── Download
 ├── Preview
 ├── Rename
 ├── Delete
 ├── Restore
 ├── Recycle Bin
 ├── Favorite
 ├── Pin
 ├── Search
 ├── Filter
 ├── Recent
 ├── Statistics
 └── Storage usage
```

### Avoid

``` text
Upload Service
Download Service
Favorite Service
Pin Service
Statistics Service
Storage Service
```

The second design creates unnecessary distributed communication and
operational complexity.

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
                         ┌──────────────────────┐
                         │       USER           │
                         │    Web Browser       │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │      React.js        │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │ REST/JSON
                                    ▼
                         ┌──────────────────────┐
                         │   Spring Cloud       │
                         │      Gateway         │
                         └──────────┬───────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                │                │
                   ▼                ▼                ▼
             ┌───────────┐   ┌─────────────┐  ┌──────────────┐
             │   Auth    │   │    File     │  │    Folder    │
             │  Service  │   │   Service   │  │   Service    │
             └─────┬─────┘   └──────┬──────┘  └──────┬───────┘
                   │                │                 │
                   ▼                ▼                 ▼
               auth_db           file_db          folder_db
                MySQL             MySQL             MySQL
                                    │
                                    ▼
                            Local File Storage
```

------------------------------------------------------------------------

# 4. Main Components

## 4.1 React.js Frontend

Responsibilities:

-   Registration and login UI
-   JWT handling
-   My Drive dashboard
-   Folder navigation
-   File upload
-   File preview
-   File download
-   Rename
-   Delete
-   Restore
-   Recycle Bin
-   Favorite
-   Pin
-   Search
-   Type filtering
-   Recent files
-   Storage statistics
-   Sharing UI

The frontend communicates only with the API Gateway.

``` text
React → API Gateway → Microservice
```

It should not call internal microservices directly.

------------------------------------------------------------------------

# 5. API Gateway

Technology:

-   Spring Cloud Gateway

Responsibilities:

-   Single entry point
-   Request routing
-   CORS
-   Authentication/JWT filtering
-   Rate limiting in future
-   Correlation/request ID in future
-   Centralized API policies

Example routes:

``` text
/api/auth/**      → Auth Service
/api/files/**     → File Service
/api/folders/**   → Folder Service
/api/shares/**    → Share Service
```

------------------------------------------------------------------------

# 6. Auth Service

Responsibilities:

-   User registration
-   Login
-   Password hashing
-   JWT access token generation
-   Refresh token management
-   User identity
-   Roles/authorities

Database:

``` text
auth_db
```

Core tables:

``` text
users
roles
user_roles
refresh_tokens
```

------------------------------------------------------------------------

# 7. File Service

The File Service is the main Drive-item management service.

Responsibilities:

-   Upload
-   Download
-   Preview
-   Metadata
-   Rename
-   Soft delete
-   Restore
-   Permanent delete
-   Recycle Bin
-   Search by name/type for MVP
-   File type filtering
-   Recent files
-   Favorites
-   Pin
-   Statistics
-   Storage usage

Database:

``` text
file_db
```

Actual file contents:

``` text
Local filesystem
```

------------------------------------------------------------------------

# 8. Folder Service

Responsibilities:

-   Create folder
-   Rename folder
-   Delete folder
-   Move folder
-   List folder contents
-   Parent-child hierarchy

Database:

``` text
folder_db
```

The Folder Service owns folder data.

------------------------------------------------------------------------

# 9. Share Service

This service can be added after the core MVP.

Responsibilities:

-   Share file
-   Share folder
-   Grant permissions
-   Remove access
-   Public links
-   Permission validation

Suggested permissions:

``` text
OWNER
EDITOR
VIEWER
```

Database:

``` text
share_db
```

------------------------------------------------------------------------

# 10. Search Service

For the MVP, search remains inside File Service using MySQL.

Example:

``` sql
SELECT *
FROM files
WHERE file_name LIKE '%resume%';
```

At larger scale, Search can become an independent service:

``` text
File Service
      │
      │ FileUploaded event
      ▼
    Kafka
      │
      ▼
Search Service
      │
      ▼
Elasticsearch
```

This is a future scalability improvement, not an MVP requirement.

------------------------------------------------------------------------

# 11. Notification Service

Future service.

Responsibilities:

-   File shared notification
-   Access granted notification
-   Email notification
-   System notifications

Possible communication:

``` text
File/Share Service
       │
       ▼
     Kafka
       │
       ▼
Notification Service
```

------------------------------------------------------------------------

# 12. Service Discovery

Use Eureka.

``` text
                    ┌───────────────┐
                    │ Eureka Server │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Auth Service        File Service       Folder Service
```

Services register themselves with Eureka.

Gateway can discover service instances through Eureka.

------------------------------------------------------------------------

# 13. Database Architecture

Microservices should own their data.

``` text
Auth Service
     │
     ▼
 auth_db (MySQL)

File Service
     │
     ▼
 file_db (MySQL)

Folder Service
     │
     ▼
 folder_db (MySQL)

Share Service
     │
     ▼
 share_db (MySQL)
```

The important rule is:

``` text
File Service ❌ → direct access to Auth DB
File Service ✅ → Auth Service API
```

The same MySQL technology can be used for multiple services. Separate
ownership is more important than using a different database product for
every service.

For local development, these databases can still run inside one MySQL
server instance while using separate databases/schemas.

------------------------------------------------------------------------

# 14. Local File Storage Architecture

MVP does not require AWS S3.

Example:

``` text
D:/GoogleDriveClone/storage/

├── users/
│   ├── user-101/
│   │   ├── resume.pdf
│   │   └── java-notes.pdf
│   └── user-102/
│       └── project.zip
└── temp/
```

MySQL stores:

``` text
file_id
user_id
file_name
file_size
content_type
storage_path
folder_id
is_deleted
is_favorite
is_pinned
created_at
updated_at
```

Actual bytes remain in the filesystem.

------------------------------------------------------------------------

# 15. Storage Abstraction

The backend should not tightly couple business logic to the local
filesystem.

``` text
              File Service
                   │
                   ▼
           StorageService
             /          \
            /            \
           ▼              ▼
 LocalStorageService   S3StorageService
       │                    │
       ▼                    ▼
 Local Disk              AWS S3
```

MVP implementation:

``` text
LocalStorageService
```

Future implementation:

``` text
S3StorageService
```

This allows migration to cloud storage without rewriting the File
Service business logic.

------------------------------------------------------------------------

# 16. Future Infrastructure

After the MVP:

``` text
Redis
 └── caching / rate limiting

Kafka
 └── asynchronous events

Elasticsearch
 └── advanced search

MinIO
 └── local S3-compatible object storage

AWS S3
 └── production cloud storage

Docker
 └── containerization

Kubernetes
 └── future orchestration
```

These are extensions, not mandatory requirements for the first working
version.
