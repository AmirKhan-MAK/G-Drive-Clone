# system design.md

# Google Drive Clone --- System Design

## 1. System Design Objective

Design a secure, modular, and extensible file-storage application using
Java Spring Boot microservices and React.js.

The first version is optimized for local development and learning:

``` text
React.js
Spring Boot
Spring Cloud Gateway
Eureka
Spring Security
JWT
MySQL
Local File System
```

------------------------------------------------------------------------

# 2. System Context

``` text
                         ┌───────────────────┐
                         │      Browser      │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     React.js      │
                         └─────────┬─────────┘
                                   │ HTTPS
                                   ▼
                         ┌───────────────────┐
                         │   API Gateway     │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
                 Auth           File           Folder
                Service        Service         Service
                    │              │              │
                    ▼              ▼              ▼
                 MySQL          MySQL           MySQL
                                   │
                                   ▼
                            Local File System
```

------------------------------------------------------------------------

# 3. Service Boundaries

## Auth Service

Owns:

``` text
User identity
Authentication
JWT
Refresh tokens
Roles
```

## File Service

Owns:

``` text
File metadata
File lifecycle
Physical file storage operations
Favorites
Pins
Recent files
File statistics
Storage calculations
MVP search/filter
```

## Folder Service

Owns:

``` text
Folder hierarchy
Parent-child relationships
Folder lifecycle
Folder navigation
```

## Share Service

Future ownership:

``` text
Sharing
Permissions
Public links
Access control
```

------------------------------------------------------------------------

# 4. File Lifecycle

``` text
             ┌──────────────┐
             │   UPLOADED   │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │    ACTIVE    │
             └──────┬───────┘
                    │
                 DELETE
                    │
                    ▼
             ┌──────────────┐
             │    TRASH     │
             └──────┬───────┘
                    │
             ┌──────┴───────┐
             │              │
          RESTORE       PERMANENT DELETE
             │              │
             ▼              ▼
          ACTIVE        DESTROYED
```

------------------------------------------------------------------------

# 5. File Upload Sequence

``` text
User
 │
 │ Select file
 ▼
React
 │
 │ POST /api/files/upload
 ▼
API Gateway
 │
 │ Forward request
 ▼
File Service
 │
 ├── Authenticate user
 │
 ├── Validate file
 │
 ├── Generate UUID storage name
 │
 ├── Write file to local storage
 │
 └── Save metadata to MySQL
 │
 ▼
Response
 │
 ▼
React
```

Important consistency rule:

``` text
Physical file write succeeds
        ↓
Metadata insert succeeds
```

If metadata insertion fails after the physical write, the service should
attempt cleanup of the orphan physical file.

------------------------------------------------------------------------

# 6. File Download Sequence

``` text
React
 │
 │ GET /api/files/download/{id}
 ▼
Gateway
 │
 ▼
File Service
 │
 ├── Authenticate
 ├── Find metadata
 ├── Verify ownership/access
 ├── Resolve storage path
 └── Stream file
        │
        ▼
   Local Storage
        │
        ▼
      Browser
```

The API must never expose arbitrary filesystem paths.

------------------------------------------------------------------------

# 7. Preview Sequence

``` text
React
 │
 │ GET /api/files/view/{id}
 ▼
Gateway
 │
 ▼
File Service
 │
 ├── Validate access
 ├── Read file
 └── Stream with correct Content-Type
        │
        ▼
     Browser
```

Examples:

``` text
application/pdf
image/jpeg
image/png
text/plain
video/mp4
```

Preview support depends on browser compatibility and file type.

------------------------------------------------------------------------

# 8. Delete Sequence

## Soft Delete

``` text
React
 │
 │ DELETE /api/files/{id}
 ▼
File Service
 │
 ├── Validate owner/access
 └── UPDATE files
       SET is_deleted = true
```

The physical file remains on disk.

## Restore

``` text
PUT /api/files/restore/{id}

is_deleted = false
deleted_at = null
```

## Permanent Delete

``` text
DELETE /api/files/permanent/{id}

1. Verify user
2. Find metadata
3. Delete physical file
4. Delete metadata
```

If physical deletion fails, the database row should not be blindly
removed. The service should handle the failure and report it
appropriately.

------------------------------------------------------------------------

# 9. File Database Design

## files

``` text
files
------------------------------------------------
id                 BIGINT / UUID
user_id            BIGINT
folder_id          BIGINT NULL
original_name      VARCHAR
storage_name       VARCHAR
storage_path       VARCHAR
content_type       VARCHAR
file_type          VARCHAR
file_size          BIGINT
download_count     BIGINT
is_deleted         BOOLEAN
deleted_at         DATETIME NULL
is_favorite        BOOLEAN
is_pinned          BOOLEAN
created_at         DATETIME
updated_at         DATETIME
```

Recommended indexes:

``` text
INDEX(user_id)
INDEX(folder_id)
INDEX(user_id, is_deleted)
INDEX(user_id, is_favorite)
INDEX(user_id, is_pinned)
INDEX(file_type)
```

For name search in the MVP, use an appropriate MySQL index strategy
based on expected dataset size.

------------------------------------------------------------------------

# 10. Folder Database Design

## folders

``` text
folders
------------------------------------------------
id                 BIGINT
user_id            BIGINT
parent_folder_id   BIGINT NULL
name               VARCHAR
is_deleted         BOOLEAN
created_at         DATETIME
updated_at         DATETIME
```

Hierarchy example:

``` text
My Drive
│
├── Documents
│   ├── Java
│   │   ├── Spring.pdf
│   │   └── Hibernate.pdf
│   │
│   └── Resume
│       └── resume.pdf
│
└── Images
    └── photo.jpg
```

------------------------------------------------------------------------

# 11. Relationship Strategy

For the first microservice version, do not create cross-database foreign
keys.

For example:

``` text
file_db.files.user_id
```

contains the user ID from Auth Service.

But:

``` text
file_db
    ❌ FK → auth_db.users
```

is avoided.

The relationship is logical and validated through service boundaries.

Similarly:

``` text
file_db.files.folder_id
```

references a Folder Service entity logically.

------------------------------------------------------------------------

# 12. Authentication Design

``` text
Login Request
     │
     ▼
Auth Service
     │
     ├── Find user
     ├── Verify password
     └── Generate JWT
             │
             ▼
          React
```

Subsequent request:

``` text
React
 │
 │ Authorization: Bearer JWT
 ▼
API Gateway
 │
 ▼
Protected Service
```

JWT claims can include:

``` text
sub = user ID
roles = USER
iat = issued time
exp = expiration time
```

Do not place sensitive information inside JWT claims.

------------------------------------------------------------------------

# 13. Authorization

Authentication answers:

``` text
Who are you?
```

Authorization answers:

``` text
Can you access this file?
```

Example:

``` text
User A
  │
  ├── file-101 → allowed
  └── file-202 → denied
```

File Service should verify ownership/access before:

``` text
download
preview
rename
delete
restore
favorite
pin
```

------------------------------------------------------------------------

# 14. Folder/File Relationship

Conceptually:

``` text
User
 │
 ├── Folder A
 │    ├── File 1
 │    └── File 2
 │
 └── Folder B
      └── File 3
```

The File Service stores the logical folder ID.

The Folder Service owns folder definitions.

For operations requiring cross-service validation:

``` text
File Service
     │
     │ REST/OpenFeign
     ▼
Folder Service
```

------------------------------------------------------------------------

# 15. Search Design

## MVP

Search stays in File Service.

``` text
GET /api/files/search?q=java
```

File Service:

``` text
MySQL
  ↓
LIKE / indexed search
```

## Future

``` text
File Service
     │
     ▼
Kafka
     │
     ▼
Search Service
     │
     ▼
Elasticsearch
```

The Search Service can later support:

``` text
filename
file type
folder
owner
created date
full text
```

------------------------------------------------------------------------

# 16. Statistics Design

MVP:

``` text
File Service
     │
     ▼
MySQL aggregate queries
```

Examples:

``` sql
SELECT file_type, COUNT(*)
FROM files
WHERE user_id = ?
  AND is_deleted = false
GROUP BY file_type;
```

Storage:

``` sql
SELECT COALESCE(SUM(file_size), 0)
FROM files
WHERE user_id = ?
  AND is_deleted = false;
```

Usage:

``` text
percentage =
(usedBytes / quotaBytes) * 100
```

------------------------------------------------------------------------

# 17. Storage Design

## MVP

``` text
storage.base-path
        │
        ▼
D:/GoogleDriveClone/storage
```

Example:

``` text
storage/
└── users/
    ├── 101/
    │   ├── 550e8400.pdf
    │   └── 1b2c3d4e.jpg
    └── 102/
        └── 9f8e7d6c.zip
```

Use generated storage names.

Store original names separately.

------------------------------------------------------------------------

# 18. Storage Abstraction

``` java
public interface StorageService {

    String store(MultipartFile file, Long userId);

    Resource load(String storageName);

    void delete(String storageName);

    boolean exists(String storageName);
}
```

MVP:

``` text
StorageService
      │
      ▼
LocalStorageService
```

Future:

``` text
StorageService
      │
      ├── LocalStorageService
      ├── MinioStorageService
      └── S3StorageService
```

------------------------------------------------------------------------

# 19. API Gateway Routing

Example:

``` text
/api/auth/**      → auth-service
/api/files/**     → file-service
/api/folders/**   → folder-service
/api/shares/**    → share-service
```

Gateway should not contain business logic.

------------------------------------------------------------------------

# 20. Eureka Design

``` text
                 Eureka Server
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Gateway       Auth         File
                    │             │
                    └─────┬───────┘
                          ▼
                       Eureka
```

Service registration:

``` text
AUTH-SERVICE
FILE-SERVICE
FOLDER-SERVICE
SHARE-SERVICE
API-GATEWAY
```

------------------------------------------------------------------------

# 21. Inter-Service Communication

For the first version:

``` text
REST
OpenFeign
```

Example:

``` text
File Service
     │
     │ OpenFeign
     ▼
Folder Service
```

Use synchronous communication only where the result is immediately
required.

------------------------------------------------------------------------

# 22. Future Event-Driven Design

Later:

``` text
                  File Service
                       │
                       │ FileUploaded
                       ▼
                     Kafka
                ┌──────┼──────┐
                ▼      ▼      ▼
             Search  Notify  Analytics
             Service Service Service
```

Possible events:

``` text
UserRegistered
FileUploaded
FileDownloaded
FileDeleted
FileRestored
FileShared
FileRenamed
```

------------------------------------------------------------------------

# 23. Caching

Redis is not required for MVP.

Later it can cache:

``` text
recent files
file statistics
storage statistics
folder listings
```

Example:

``` text
React
  ↓
File Service
  ↓
Redis
  │
  └── cache hit → return
  │
  └── cache miss → MySQL → cache → return
```

------------------------------------------------------------------------

# 24. Concurrency Considerations

Potential race conditions:

``` text
Two rename requests
Two delete requests
Delete + restore simultaneously
Favorite + unfavorite simultaneously
```

Use transactional boundaries and appropriate update conditions.

For example, permanent deletion should verify the latest metadata state
before deleting.

------------------------------------------------------------------------

# 25. File Upload Consistency

A file upload has two resources:

``` text
1. Physical file
2. MySQL metadata
```

The system cannot rely on a normal database transaction to roll back a
filesystem write.

Therefore:

``` text
Write physical file
        ↓
Save metadata
        ↓
If DB fails:
    delete physical file
```

This is a local compensation strategy.

------------------------------------------------------------------------

# 26. File Naming and Path Safety

Never use raw user input as a filesystem path.

Bad:

``` text
../../some-other-folder/file.txt
```

Safe strategy:

``` text
User filename:
../../resume.pdf

Generated storage name:
UUID.pdf
```

The original filename is stored only as metadata.

------------------------------------------------------------------------

# 27. Quota Design

MVP quota can be configured:

``` properties
storage.quota-bytes=16106127360
```

Before upload:

``` text
current usage
     +
new file size
     <=
quota
```

If false:

``` text
413 / appropriate business error
```

Do not allow the user to exceed the configured quota.

------------------------------------------------------------------------

# 28. Suggested Package Structure --- File Service

``` text
com.drive.file

├── controller
│   └── FileController
│
├── service
│   ├── FileService
│   ├── FileServiceImpl
│   └── StorageService
│
├── storage
│   └── LocalStorageService
│
├── repository
│   └── FileRepository
│
├── entity
│   └── FileEntity
│
├── dto
│   ├── FileResponse
│   ├── RenameFileRequest
│   └── StorageResponse
│
├── exception
│   ├── FileNotFoundException
│   ├── StorageException
│   └── GlobalExceptionHandler
│
└── config
    └── StorageProperties
```

------------------------------------------------------------------------

# 29. Suggested Package Structure --- Auth Service

``` text
com.drive.auth

├── controller
├── service
├── repository
├── entity
├── dto
├── security
├── jwt
├── exception
└── config
```

------------------------------------------------------------------------

# 30. Suggested React Structure

``` text
src/

├── components/
│   ├── Navbar
│   ├── Sidebar
│   ├── FileCard
│   ├── FileTable
│   ├── UploadModal
│   └── CreateFolderModal
│
├── pages/
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   ├── MyDrive
│   ├── Recent
│   ├── Favorites
│   └── RecycleBin
│
├── services/
│   ├── authApi.js
│   ├── fileApi.js
│   └── folderApi.js
│
├── context/
│   └── AuthContext
│
├── hooks/
├── utils/
└── routes/
```

------------------------------------------------------------------------

# 31. Deployment for Development

A practical local setup:

``` text
Windows PC
│
├── React Dev Server
│
├── Eureka Server
├── API Gateway
├── Auth Service
├── File Service
├── Folder Service
│
├── MySQL
│
└── Local Storage
     └── D:/GoogleDriveClone/storage
```

Docker can be introduced after the services work normally.

------------------------------------------------------------------------

# 32. Future Production Architecture

``` text
                        Internet
                           │
                           ▼
                     Load Balancer
                           │
                           ▼
                     API Gateway
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
     Auth                File                Folder
       │                   │                   │
       ▼                   ▼                   ▼
     MySQL              MySQL              MySQL
                           │
                           ▼
                         S3

File Service
     │
     ▼
   Kafka
 ┌───┼────────┐
 ▼   ▼        ▼
Search Notify Analytics
```

This is a future architecture. The MVP remains local and affordable.

------------------------------------------------------------------------

# 33. Key Design Decisions

  Decision         MVP Choice         Future
  ---------------- ------------------ -------------------------------------
  Frontend         React.js           Same
  Backend          Spring Boot        Same
  Database         MySQL              MySQL can remain
  File storage     Local filesystem   MinIO/S3
  Search           MySQL              Elasticsearch
  Events           REST/OpenFeign     Kafka
  Cache            None initially     Redis
  Discovery        Eureka             Eureka/Kubernetes service discovery
  Deployment       Local machine      Docker/Kubernetes
  Authentication   JWT                JWT/OAuth2 possible
  File metadata    MySQL              MySQL
  File content     Local disk         Object storage

------------------------------------------------------------------------

# 34. Final Architecture Summary

``` text
                           React.js
                              │
                              ▼
                       API Gateway
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
               Auth          File        Folder
              Service       Service       Service
                 │            │            │
                 ▼            ▼            ▼
              auth_db      file_db      folder_db
                MySQL        MySQL         MySQL
                              │
                              ▼
                        Local Storage

                         Eureka
                           │
                    Service Discovery

                  REST / OpenFeign
                    Inter-service

                 Future: Kafka + Redis
                 Future: MinIO / S3
                 Future: Elasticsearch
```

The central architectural rule is:

> **Keep each service responsible for a cohesive business capability,
> keep each service's data owned by that service, store file metadata in
> MySQL, store file bytes on the local filesystem for the MVP, and
> abstract storage so cloud object storage can be introduced later.**
