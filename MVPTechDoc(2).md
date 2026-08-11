# MVPTechDoc.md

# Google Drive Clone --- MVP Technical Document

## 1. MVP Objective

Build a functional Google Drive--style file management application where
an authenticated user can:

-   Register
-   Login
-   Upload one or multiple files
-   View file metadata
-   Preview supported files
-   Download files
-   Rename files
-   Delete files
-   Restore deleted files
-   Permanently delete files
-   Browse Recycle Bin
-   Search files
-   Filter files by type
-   Mark files as favorite
-   Pin files
-   View recent files
-   View file statistics
-   View storage usage
-   Create and manage folders

The MVP uses:

``` text
React.js
Java
Spring Boot
Spring Security
JWT
Spring Cloud Gateway
Eureka
MySQL
Spring Data JPA
Hibernate
Local File System
```

------------------------------------------------------------------------

# 2. MVP Scope

## In Scope

### Authentication

-   Registration
-   Login
-   JWT authentication
-   Password hashing
-   Protected APIs

### File Management

-   Single/multiple upload
-   Metadata
-   Preview
-   Download
-   Rename
-   Soft delete
-   Restore
-   Permanent delete
-   Recycle Bin
-   Favorite
-   Pin
-   Recent files
-   Search
-   Filter
-   Statistics
-   Storage usage

### Folder Management

-   Create folder
-   Rename folder
-   Delete folder
-   Navigate folder hierarchy
-   Move files between folders

------------------------------------------------------------------------

# 3. Post-MVP Scope

The following features should be implemented after the core MVP:

-   File sharing
-   Folder sharing
-   Viewer/editor permissions
-   Public links
-   File versioning
-   Chunked/resumable uploads
-   Advanced full-text search
-   Notifications
-   Activity/audit history
-   Trash auto-cleanup
-   Redis caching
-   Kafka events
-   MinIO
-   AWS S3
-   Docker deployment
-   CI/CD
-   Kubernetes

------------------------------------------------------------------------

# 4. Recommended Project Modules

A practical project structure:

``` text
google-drive-clone/

├── frontend/
│   └── react-drive/
│
├── backend/
│   ├── eureka-server/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── file-service/
│   ├── folder-service/
│   └── share-service/
│
└── docker/
    └── docker-compose.yml
```

For the first implementation, Share Service can remain a later module.

------------------------------------------------------------------------

# 5. File Service APIs

All responses follow:

``` json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

## Upload

``` http
POST /api/files/upload
Content-Type: multipart/form-data
```

Field:

``` text
files
```

Supports one or more files.

------------------------------------------------------------------------

## List active files

``` http
GET /api/files
```

Returns non-deleted files accessible to the current user.

------------------------------------------------------------------------

## File metadata

``` http
GET /api/files/{id}
```

------------------------------------------------------------------------

## Preview

``` http
GET /api/files/view/{id}
```

Streams raw bytes inline for supported previews.

------------------------------------------------------------------------

## Download

``` http
GET /api/files/download/{id}
```

Downloads the file.

The service may increment a download counter.

------------------------------------------------------------------------

## Soft delete

``` http
DELETE /api/files/{id}
```

The file is moved logically to Recycle Bin.

Do not immediately remove the physical file.

------------------------------------------------------------------------

## Restore

``` http
PUT /api/files/restore/{id}
```

Changes the file back to active state.

------------------------------------------------------------------------

## Permanent delete

``` http
DELETE /api/files/permanent/{id}
```

Removes:

1.  File metadata from MySQL
2.  Physical file from local storage

------------------------------------------------------------------------

## Recycle Bin

``` http
GET /api/files/recycle-bin
```

Returns soft-deleted files.

------------------------------------------------------------------------

## Rename

``` http
PUT /api/files/rename/{id}
```

Request:

``` json
{
  "newName": "updated-resume.pdf"
}
```

------------------------------------------------------------------------

## Search

``` http
GET /api/files/search?q=resume
```

MVP implementation uses MySQL.

------------------------------------------------------------------------

## Filter

``` http
GET /api/files/filter?type=IMAGE
```

Supported types:

``` text
IMAGE
VIDEO
PDF
DOCUMENT
TEXT
AUDIO
ARCHIVE
OTHER
ALL
```

------------------------------------------------------------------------

## Statistics

``` http
GET /api/files/statistics
```

Returns counts by file type and other dashboard information.

------------------------------------------------------------------------

## Storage

``` http
GET /api/files/storage
```

Returns:

``` text
usedBytes
quotaBytes
percentage
```

------------------------------------------------------------------------

## Recent

``` http
GET /api/files/recent
```

Returns the last 10 relevant uploaded/accessed files.

------------------------------------------------------------------------

## Favorites

``` http
GET /api/files/favorites
```

------------------------------------------------------------------------

## Toggle favorite

``` http
PUT /api/files/favorite/{id}
```

------------------------------------------------------------------------

## Toggle pin

``` http
PUT /api/files/pin/{id}
```

------------------------------------------------------------------------

# 6. Folder APIs

Suggested endpoints:

``` http
POST   /api/folders
GET    /api/folders
GET    /api/folders/{id}
PUT    /api/folders/{id}
DELETE /api/folders/{id}
PUT    /api/folders/{id}/move
GET    /api/folders/{id}/contents
```

Create request:

``` json
{
  "name": "Java Notes",
  "parentFolderId": null
}
```

------------------------------------------------------------------------

# 7. Authentication APIs

``` http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

Example login:

``` json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response contains JWT access token.

------------------------------------------------------------------------

# 8. Security

Use:

``` text
Spring Security
       +
JWT
```

Request:

``` http
Authorization: Bearer <JWT>
```

The authenticated user ID should be available to downstream services.

Important:

-   Never trust a user ID sent by the frontend for authorization.
-   Extract identity from the authenticated security context/JWT.
-   A user can access only files they own or are explicitly permitted to
    access.
-   Validate file metadata and ownership on every protected operation.

------------------------------------------------------------------------

# 9. File Upload Processing

``` text
React
  │
  │ multipart/form-data
  ▼
API Gateway
  │
  ▼
File Service
  │
  ├── Validate JWT
  ├── Validate file
  ├── Generate unique storage name
  ├── Save physical file
  └── Save metadata
          │
          ▼
       MySQL
```

Recommended storage filename:

``` text
UUID + extension
```

Example:

``` text
original:
resume.pdf

stored:
550e8400-e29b-41d4-a716-446655440000.pdf
```

Keep the original filename in MySQL.

------------------------------------------------------------------------

# 10. File Validation

At minimum validate:

-   File is present
-   File size
-   MIME/content type
-   File extension
-   Maximum upload size
-   Filename normalization
-   Path traversal protection

Never directly concatenate a user-provided filename into a filesystem
path.

Bad:

``` java
Paths.get(basePath + fileName);
```

Prefer generated safe storage names.

------------------------------------------------------------------------

# 11. MySQL Databases

## auth_db

``` text
users
roles
user_roles
refresh_tokens
```

## file_db

``` text
files
```

Possible `files` fields:

``` text
id
user_id
folder_id
original_name
storage_name
storage_path
content_type
file_type
file_size
download_count
is_deleted
deleted_at
is_favorite
is_pinned
created_at
updated_at
```

## folder_db

``` text
folders
```

Fields:

``` text
id
user_id
parent_folder_id
name
created_at
updated_at
is_deleted
```

------------------------------------------------------------------------

# 12. Local Storage Configuration

Example configuration:

``` properties
storage.base-path=D:/GoogleDriveClone/storage
storage.quota-bytes=16106127360
```

The actual location should be externalized using
configuration/environment variables.

Do not hard-code it inside service classes.

------------------------------------------------------------------------

# 13. Error Response

Example:

``` json
{
  "success": false,
  "message": "File not found",
  "data": null
}
```

Suggested HTTP statuses:

``` text
200 OK
201 CREATED
204 NO CONTENT
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
409 CONFLICT
413 PAYLOAD TOO LARGE
500 INTERNAL SERVER ERROR
```

------------------------------------------------------------------------

# 14. Implementation Order

## Phase 1

``` text
Spring Boot
MySQL
JPA/Hibernate
REST APIs
```

Build File Service as a working monolith/service first.

## Phase 2

``` text
Spring Security
JWT
```

Secure the application.

## Phase 3

``` text
React.js
```

Build Drive UI.

## Phase 4

``` text
Eureka
API Gateway
Auth Service
File Service
Folder Service
```

Move into the complete microservice architecture.

## Phase 5

Add:

``` text
Share
Permissions
Search improvements
Notifications
```

## Phase 6

Add infrastructure:

``` text
Docker
Redis
Kafka
MinIO
```

------------------------------------------------------------------------

# 15. Definition of Done for MVP

The MVP is complete when a user can:

``` text
Register
   ↓
Login
   ↓
Open My Drive
   ↓
Create Folder
   ↓
Upload File
   ↓
See File
   ↓
Preview / Download
   ↓
Rename
   ↓
Favorite / Pin
   ↓
Search / Filter
   ↓
Delete
   ↓
Recycle Bin
   ↓
Restore
   ↓
Permanent Delete
```

All operations must be authenticated and user-specific.
