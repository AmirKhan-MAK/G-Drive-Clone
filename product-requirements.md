# DriveClone Product Requirements Document (PRD)

---

## 1. Product Identification & Vision

- **Product Name:** DriveClone
- **Product Tagline:** Self-Hosted Personal Cloud Storage System
- **Product Vision:** Build a secure, user-friendly, high-performance web application that enables users to store, organize, preview, search, download, and manage their personal digital files through a modern web interface.
- **Architectural Purpose:** DriveClone serves as a production-ready portfolio application demonstrating microservice architecture (Spring Boot, Spring Cloud Gateway, Eureka), JWT security, local-to-cloud storage abstractions, and React.js frontend design.

---

## 2. Problem Statement & Target User Personas

### 2.1 Problem Statement
Users require an intuitive, reliable interface to centralize their personal digital files (documents, images, videos, audio, archives) into hierarchical folders. Existing simple upload scripts lack critical real-world cloud storage features such as:
- Secure JWT-based authentication and user isolation.
- File preview capabilities without downloading.
- Non-destructive soft deletion with Recycle Bin recovery.
- Permanent file purges with physical disk cleanup.
- Categorized storage usage and quota tracking.

### 2.2 User Personas
- **End User:** An authenticated user who uploads, organizes, previews, searches, favorites, pins, and manages files and folders.
- **Future System Administrator:** An administrative persona managing user accounts, adjusting storage quotas, viewing system telemetry, and auditing file activity.

---

## 3. Goals & Non-Goals

### 3.1 Primary Product Goals
1. Provide secure user authentication via email/password and JWT.
2. Enable single and multi-file uploads storing physical bytes on local storage (MVP) and metadata in MySQL.
3. Support hierarchical folder creation and file movement between folders.
4. Support inline preview streaming for PDF, images, text, and video.
5. Implement soft deletion with a Recycle Bin and file restoration.
6. Support permanent deletion removing MySQL metadata and physical files.
7. Support starring (favorites) and pinning files for rapid access.
8. Provide filename search and file type filtering (`IMAGE`, `VIDEO`, `PDF`, etc.).
9. Provide storage quota calculations (`usedBytes` vs `quotaBytes`) and file statistics.
10. Ensure microservice architecture separation using Spring Cloud Gateway and Eureka.

### 3.2 Product Non-Goals (MVP Release)
- Cloud-hosted paid object storage (AWS S3 / GCP) for the first working version.
- Collaborative real-time document editing (Google Docs style).
- Resumable/chunked multi-gigabyte upload protocols (TUS).
- Full-text document content indexing using search engines.
- Automated background trash purging cron jobs.

---

## 4. Functional Requirements (FR)

### FR-01: User Authentication
The system shall allow users to register with a name, email, and password, and log in to obtain a JWT access token.

### FR-02: User Authorization & Isolation
The system shall strictly validate ownership on every protected request. Users must be barred from accessing or modifying another user's files/folders.

### FR-03: Multi-File Upload
The system shall support uploading one or multiple files in a single HTTP request to either the root directory or a specific folder.

### FR-04: Metadata Management
The system shall store file metadata (original name, storage UUID name, file size, MIME type, file category, timestamps, flags) in MySQL separately from physical file bytes.

### FR-05: Local Storage Persistence
The MVP system shall write raw physical file bytes to host local disk (`D:/GoogleDriveClone/storage/users/user-{id}`).

### FR-06: File Downloading
The system shall allow authenticated file owners to stream and download full files, automatically incrementing the download counter.

### FR-07: Inline File Previewing
The system shall stream raw bytes with proper HTTP `Content-Type` headers to allow inline browser previewing for supported MIME types (PDF, images, plain text, MP4).

### FR-08: Soft Deletion
Deleting an item shall set `is_deleted = true` and `deleted_at = timestamp` without removing physical disk content.

### FR-09: File Restoration
The system shall allow users to restore soft-deleted items from the Recycle Bin back to active status in their original folder location.

### FR-10: Permanent Deletion
Permanently deleting an item from the Recycle Bin shall remove both its MySQL database row and its physical file from host disk.

### FR-11: Search Capabilities
The system shall allow searching active files by original filename substring (case-insensitive).

### FR-12: Favorite Management
The system shall allow users to toggle the `is_favorite` status of any file and view all starred files in a dedicated view.

### FR-13: Pinning Management
The system shall allow users to toggle the `is_pinned` status of any file for top-level display priority.

### FR-14: File Statistics
The system shall provide aggregate file counts grouped by type (`IMAGE`, `VIDEO`, `PDF`, `DOCUMENT`, `TEXT`, `AUDIO`, `ARCHIVE`, `OTHER`).

### FR-15: Storage Quota Tracking
The system shall calculate total used bytes for active files, compare against user quota limit (15 GB default), and reject uploads exceeding quota with `413 Payload Too Large`.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance
- Metadata queries (listing files, checking quota) shall respond in `< 100ms` under standard development loads.
- File streaming latency shall be limited only by network bandwidth and local disk I/O throughput.

### 5.2 Reliability & Data Consistency
- **Atomic Upload Consistency:** If MySQL metadata insert fails after physical disk write, the system must execute a compensating cleanup to delete the orphaned physical file.
- **Atomic Deletion:** Database metadata must not be deleted if physical disk purge fails during permanent deletion.

### 5.3 Security
- Passwords MUST be hashed using BCrypt (`strength >= 10`). Plaintext passwords must never be logged or stored.
- Physical storage paths MUST NEVER be exposed to API responses. Client interaction relies strictly on surrogate file IDs.
- Input validation MUST prevent path traversal attacks (`../`). Uploaded files must be renamed to UUIDs on disk.

### 5.4 Scalability & Maintainability
- Physical storage logic MUST be decoupled via a `StorageService` Java interface so that local disk storage can be swapped for S3 object storage without modifying core service logic.

---

## 6. Success Criteria & Definition of Done (DoD)

The product release is complete when an end user can successfully execute the following end-to-end workflow in the React UI:

```text
Register Account
       │
       ▼
Login -> Receive JWT Token
       │
       ▼
Navigate to My Drive Dashboard
       │
       ▼
Create New Folder ("Documents")
       │
       ▼
Upload Files into "Documents"
       │
       ▼
View Metadata & Preview File inline
       │
       ▼
Rename File ("updated-resume.pdf")
       │
       ▼
Star / Favorite File & Pin File
       │
       ▼
Search Files by Name & Filter by Type
       │
       ▼
Soft Delete File -> Verify move to Recycle Bin
       │
       ▼
Restore File -> Verify return to active folder
       │
       ▼
Soft Delete File again -> Permanent Delete from Recycle Bin
       │
       ▼
Verify MySQL row deleted AND physical file purged from host disk
```

---

## 7. Product Release Roadmap

### Version 1.0 (MVP Current Scope)
- Core microservices (Gateway, Eureka, Auth, File, Folder).
- MySQL databases & Local disk storage abstraction.
- Full UI dashboard in React.js.

### Version 1.1 (Sharing & Permissions)
- `share-service` introduction.
- Direct user-to-user file/folder sharing (`VIEWER`, `EDITOR`).
- Public link generation with expiration dates.

### Version 1.2 (Versioning & Audit)
- Multi-version file history (keeping previous uploads).
- Activity history log (who accessed/downloaded files).
- Scheduled background trash purge (30-day auto cleanup).

### Version 2.0 (Cloud & Distributed Scale)
- MinIO / AWS S3 storage integration.
- Kafka asynchronous event streaming.
- Redis caching for recent files & quota calculations.
- Elasticsearch full-text content indexing.
- Docker Compose & Kubernetes deployment scripts.
