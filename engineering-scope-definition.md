# DriveClone Engineering Scope Definition & Boundary Specification

This document explicitly defines the engineering boundaries, functional feature inclusions, non-goals, technical constraints, and operating assumptions for **DriveClone**.

---

## 1. Project Boundaries & Strategy

DriveClone is built as a portfolio-grade cloud storage application. To balance complexity and delivery speed, the project strictly differentiates between **MVP In-Scope** requirements and **Post-MVP Non-Goals**.

---

## 2. In-Scope MVP Functional Capabilities

### 2.1 Authentication & User Security
- **User Registration:** Signup with full name, unique email, and password.
- **User Authentication:** Password verification against BCrypt hashes and JWT issuance.
- **JWT Authorization:** Stateless bearer token validation on protected microservice endpoints.
- **Session Management:** Refresh token rotation and logout endpoint.

### 2.2 Core File Management
- **Single & Multiple File Upload:** Upload one or multiple files in a single request.
- **Metadata Management:** Database persistence of original name, file size, content type, file category, storage path, creation/modification timestamps.
- **Inline Preview Streaming:** Direct byte streaming for browser-supported MIME types (PDF, JPEG, PNG, Text, MP4).
- **File Download:** Content-Disposition attachment streaming with automated download counter increment.
- **File Renaming:** In-place update of user-facing file name without altering physical storage path.
- **Soft Deletion & Recycle Bin:** Moving items to soft-deleted state (`is_deleted = true`) with recovery options.
- **File Restoration:** Reverting soft-deleted items back to active status in their original folder.
- **Permanent Deletion:** Synchronous purge of MySQL metadata AND physical file bytes from disk.
- **Favorites & Pinning:** Toggle favorite (`is_favorite`) and pinned (`is_pinned`) flags for quick access.
- **Search & Filtering:** Case-insensitive filename search via MySQL and filtering by type (`IMAGE`, `VIDEO`, `PDF`, `DOCUMENT`, `TEXT`, `AUDIO`, `ARCHIVE`, `OTHER`, `ALL`).
- **Dashboard Statistics:** File counts categorized by type and aggregate storage usage vs. quota calculation.

### 2.3 Folder Management
- **Folder Creation:** Creation of nested directory structures.
- **Hierarchy Navigation:** Breadcrumb navigation and nested folder listing.
- **Folder Operations:** Renaming, moving files between folders, and folder deletion.

### 2.4 Technology Stack (MVP)
- **Frontend:** React.js, React Router, Axios.
- **Backend:** Java 17+, Spring Boot, Spring Security, Spring Cloud Gateway, Netflix Eureka, Spring Data JPA, Hibernate.
- **Database:** MySQL 8.0+.
- **File Storage:** Local Filesystem (`D:/GoogleDriveClone/storage`).

---

## 3. Post-MVP Scope & Non-Goals

The following features are **explicitly excluded** from the MVP release to ensure a focused, working foundation:

| Feature Area | Non-Goal Description | Target Phase |
| :--- | :--- | :--- |
| **Cloud Storage** | AWS S3, Google Cloud Storage, or MinIO integration. (MVP uses local disk). | Phase 6 |
| **Resumable Uploads** | Chunked upload protocols (e.g., TUS protocol) for multi-gigabyte uploads. | Post-v1.0 |
| **Collaborative Editing** | Real-time concurrent document editing (Google Docs style). | Out of Scope |
| **Full-Text Search** | Extracting and indexing document text content using Elasticsearch. | Phase 6 |
| **Async Event Bus** | Kafka or RabbitMQ event streaming between microservices. | Phase 6 |
| **Distributed Cache** | Redis caching for recent files or storage stats. | Phase 6 |
| **Containers & K8s** | Docker containerization and Kubernetes orchestration. | Phase 6 |
| **Automated Trash Cleanup** | Scheduled background cron job purging soft-deleted items after 30 days. | Phase 5 |

---

## 4. Technical Constraints & Assumptions

1. **Host Environment:** Windows PC development machine.
2. **Storage Root:** Configurable local filesystem path `D:/GoogleDriveClone/storage`.
3. **Default Storage Quota:** 15 GB (`16,106,127,360` bytes) per user.
4. **Max Single File Size:** Configurable upload limit (default 100 MB per request).
5. **Database Deployment:** Single MySQL Server instance hosting logically separate databases (`auth_db`, `file_db`, `folder_db`).
6. **Path Traversal Protection:** Absolute prohibition of user input in physical filesystem paths. Physical files are assigned random UUID names.
