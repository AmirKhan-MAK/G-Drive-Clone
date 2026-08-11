# PRD.md

# Google Drive Clone --- Product Requirements Document

## 1. Product Name

**DriveClone**

A web-based personal cloud-drive style application inspired by the core
functionality of Google Drive.

------------------------------------------------------------------------

# 2. Product Vision

Build a secure and user-friendly file management platform where users
can store, organize, preview, search, download, and manage their files
through a modern web interface.

The project is primarily designed as a serious Java/Spring Boot backend
and microservices portfolio project with a React.js frontend.

------------------------------------------------------------------------

# 3. Problem Statement

Users need a simple place to organize digital files into folders and
manage them through common operations such as:

-   Upload
-   Download
-   Preview
-   Rename
-   Delete
-   Restore
-   Search
-   Favorite
-   Pin

Traditional beginner file-upload applications usually stop at CRUD
operations. DriveClone extends this into a realistic file-management
system with authentication, storage management, recycle-bin behavior,
and microservice architecture.

------------------------------------------------------------------------

# 4. Goals

## Primary Goals

1.  Provide secure user authentication.
2.  Allow users to upload one or more files.
3.  Store actual file contents on local storage for the MVP.
4.  Store metadata in MySQL.
5.  Organize files into folders.
6.  Support preview and download.
7.  Implement Recycle Bin with restore.
8.  Support permanent deletion.
9.  Support favorites and pinned files.
10. Provide search and type filtering.
11. Provide recent-file and storage statistics.
12. Use Spring Boot microservices.
13. Provide a React.js user interface.

------------------------------------------------------------------------

# 5. Non-Goals for MVP

The MVP will not require:

-   Paid cloud storage
-   AWS S3
-   Google Cloud Storage
-   Kubernetes
-   Elasticsearch
-   Kafka
-   Distributed file storage
-   Advanced AI search
-   Collaborative real-time editing
-   Google Docs-like document editing

These can be future enhancements.

------------------------------------------------------------------------

# 6. Target Users

## User

A registered user who wants to:

-   Store files
-   Organize files
-   Search files
-   Download files
-   Preview files
-   Manage deleted files
-   Mark important files

## Future Admin

A future administrative role may manage:

-   Users
-   Quotas
-   System metrics
-   Audit information

Admin functionality is not required for the initial MVP.

------------------------------------------------------------------------

# 7. User Stories

## Authentication

### US-01

As a user, I want to register so that I can create my Drive account.

### US-02

As a user, I want to log in so that I can access my files.

### US-03

As a user, I want my session to be protected by JWT so that unauthorized
users cannot access my data.

------------------------------------------------------------------------

## File Management

### US-04

As a user, I want to upload one or more files so that I can store them.

### US-05

As a user, I want to see file metadata so that I know the file size,
type, and creation information.

### US-06

As a user, I want to preview supported files without downloading them.

### US-07

As a user, I want to download files.

### US-08

As a user, I want to rename files.

### US-09

As a user, I want to delete files without immediately losing them
permanently.

### US-10

As a user, I want to restore files from Recycle Bin.

### US-11

As a user, I want to permanently delete files.

------------------------------------------------------------------------

## Organization

### US-12

As a user, I want to create folders.

### US-13

As a user, I want to move files into folders.

### US-14

As a user, I want to search by file name.

### US-15

As a user, I want to filter files by type.

### US-16

As a user, I want to favorite important files.

### US-17

As a user, I want to pin important files.

------------------------------------------------------------------------

## Dashboard

### US-18

As a user, I want to see recently uploaded files.

### US-19

As a user, I want to see file counts by type.

### US-20

As a user, I want to see used storage and quota.

------------------------------------------------------------------------

# 8. Functional Requirements

## FR-01 Authentication

The system shall allow user registration and login.

## FR-02 Authorization

The system shall ensure that users can access only their own files
unless sharing permissions are implemented.

## FR-03 Upload

The system shall support one or more files in a single upload request.

## FR-04 Metadata

The system shall store metadata separately from the physical file.

## FR-05 Local Storage

The MVP shall store actual file bytes on the configured local
filesystem.

## FR-06 Download

The system shall allow authenticated users to download accessible files.

## FR-07 Preview

The system shall stream supported file types inline.

## FR-08 Soft Delete

Deleting a file shall mark it deleted rather than immediately removing
its physical content.

## FR-09 Restore

Users shall be able to restore soft-deleted files.

## FR-10 Permanent Delete

Users shall be able to permanently delete the metadata and physical
file.

## FR-11 Search

Users shall be able to search by file name and type.

## FR-12 Favorites

Users shall be able to toggle favorite status.

## FR-13 Pin

Users shall be able to toggle pinned status.

## FR-14 Statistics

The system shall provide counts by file type.

## FR-15 Storage

The system shall provide used bytes, quota, and usage percentage.

------------------------------------------------------------------------

# 9. API Requirements

## File APIs

``` text
POST   /api/files/upload
GET    /api/files
GET    /api/files/{id}
GET    /api/files/view/{id}
GET    /api/files/download/{id}
DELETE /api/files/{id}
PUT    /api/files/restore/{id}
DELETE /api/files/permanent/{id}
GET    /api/files/recycle-bin
PUT    /api/files/rename/{id}
GET    /api/files/search?q=
GET    /api/files/filter?type=
GET    /api/files/statistics
GET    /api/files/storage
GET    /api/files/recent
GET    /api/files/favorites
PUT    /api/files/favorite/{id}
PUT    /api/files/pin/{id}
```

## Folder APIs

``` text
POST   /api/folders
GET    /api/folders
GET    /api/folders/{id}
PUT    /api/folders/{id}
DELETE /api/folders/{id}
PUT    /api/folders/{id}/move
GET    /api/folders/{id}/contents
```

## Authentication APIs

``` text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

------------------------------------------------------------------------

# 10. UI Requirements

## Login

Fields:

``` text
Email
Password
Login
```

## Registration

Fields:

``` text
Name
Email
Password
Confirm Password
```

## Dashboard

Should contain:

``` text
Sidebar
 ├── My Drive
 ├── Recent
 ├── Favorites
 ├── Pinned
 └── Recycle Bin

Main Area
 ├── Search
 ├── Upload
 ├── New Folder
 ├── File grid/list
 └── Storage information
```

------------------------------------------------------------------------

# 11. Recycle Bin Rules

When a user deletes a file:

``` text
ACTIVE
  ↓
SOFT DELETE
  ↓
RECYCLE BIN
```

Restore:

``` text
RECYCLE BIN
  ↓
RESTORE
  ↓
ACTIVE
```

Permanent delete:

``` text
RECYCLE BIN
  ↓
PERMANENT DELETE
  ↓
MySQL metadata removed
+
physical file removed
```

------------------------------------------------------------------------

# 12. Security Requirements

-   Passwords must never be stored as plain text.
-   Use a strong password hashing algorithm supported by Spring
    Security.
-   JWT must protect private APIs.
-   Validate file ownership.
-   Prevent path traversal.
-   Validate MIME type and extension.
-   Apply upload-size limits.
-   Do not expose physical storage paths to clients.
-   Do not trust user-provided IDs for authorization.
-   Use HTTPS in production.

------------------------------------------------------------------------

# 13. Non-Functional Requirements

## Performance

Common metadata operations should be fast under normal local development
loads.

## Reliability

A failed file upload must not leave inconsistent metadata.

The system should avoid creating a MySQL record if physical file storage
fails.

## Security

Unauthorized users must not access another user's private files.

## Maintainability

Services should have clear responsibilities.

## Scalability

The architecture should allow future migration:

``` text
Local Storage → MinIO/S3
MySQL search → Elasticsearch
REST events → Kafka
Single instance → Multiple service instances
```

------------------------------------------------------------------------

# 14. Success Criteria

The product is considered successful when:

-   A user can register and login.
-   A user can upload files.
-   Uploaded files persist on local storage.
-   Metadata persists in MySQL.
-   Files can be previewed/downloaded.
-   Files can be renamed.
-   Files can be soft-deleted.
-   Files can be restored.
-   Files can be permanently deleted.
-   Search and filters work.
-   Favorites and pinning work.
-   Folder management works.
-   Storage statistics are displayed.
-   APIs are protected by authentication.
-   React frontend successfully communicates through the API Gateway.

------------------------------------------------------------------------

# 15. Future Product Roadmap

## Version 1.1

``` text
File sharing
Permissions
Public links
```

## Version 1.2

``` text
File versions
Activity history
Notifications
```

## Version 2.0

``` text
MinIO/S3
Kafka
Redis
Elasticsearch
Docker
```

## Version 3.0

``` text
Kubernetes
Cloud deployment
Resumable/chunk uploads
Advanced observability
```
