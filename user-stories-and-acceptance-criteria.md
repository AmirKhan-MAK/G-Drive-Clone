# DriveClone User Stories & Acceptance Criteria Specification

This document details the complete suite of User Stories (US-01 through US-20) and their formal Given-When-Then Acceptance Criteria for **DriveClone**.

---

## 1. Authentication User Stories

### US-01: Account Registration
- **User Story:** As a new user, I want to create a DriveClone account with my name, email, and password so that I can securely store my personal files.
- **Acceptance Criteria:**
  - **Given** I am on the Registration page (`/register`),
  - **When** I fill in a valid name, an unused email address, and matching password strings (`password` == `confirmPassword`), and submit the form,
  - **Then** the Auth Service creates a new record in `auth_db.users` with a BCrypt-hashed password, assigns `ROLE_USER`, and returns HTTP `201 Created` with a success envelope.
  - **Scenario (Duplicate Email):** Given an email already exists in `auth_db.users`, when I submit registration, then the system returns HTTP `409 Conflict` with message `"Email address is already registered"`.

### US-02: User Authentication & Login
- **User Story:** As a registered user, I want to log in with my email and password so that I can obtain access to my private cloud files.
- **Acceptance Criteria:**
  - **Given** I am on the Login page (`/login`),
  - **When** I submit valid email and password credentials,
  - **Then** Auth Service returns HTTP `200 OK` containing a JWT access token, refresh token, and user profile data, redirecting me to `/drive`.
  - **Scenario (Invalid Password):** Given incorrect credentials, when submitted, the system returns HTTP `401 Unauthorized` with message `"Invalid email or password"`.

### US-03: JWT Session Protection
- **User Story:** As a security-conscious user, I want my active session protected by JWT tokens so that unauthorized users cannot view my private files.
- **Acceptance Criteria:**
  - **Given** an unauthenticated client request to any `/api/files/**` or `/api/folders/**` endpoint,
  - **When** no valid `Authorization: Bearer <JWT>` header is present,
  - **Then** the Gateway / Resource Server rejects the request with HTTP `401 Unauthorized`.

---

## 2. File Lifecycle Management User Stories

### US-04: Single & Multi-File Upload
- **User Story:** As a user, I want to upload single or multiple files from my local device into My Drive or a specific folder so that they are stored in the cloud.
- **Acceptance Criteria:**
  - **Given** I am authenticated and viewing My Drive,
  - **When** I select one or multiple files and submit the upload request,
  - **Then** File Service verifies my storage quota, saves physical files to `D:/GoogleDriveClone/storage/users/user-{id}/` using generated UUID names, inserts metadata records into `file_db.files`, and returns HTTP `201 Created` with file details.
  - **Scenario (Quota Exceeded):** Given my remaining storage is smaller than the upload size, when I attempt upload, then the system returns HTTP `413 Payload Too Large` and aborts file storage.

### US-05: View File Metadata
- **User Story:** As a user, I want to inspect file metadata so that I know the original filename, exact size, file type, and upload date.
- **Acceptance Criteria:**
  - **Given** I own a file (ID: 501),
  - **When** I select "File Details" or request `GET /api/files/501`,
  - **Then** the system returns HTTP `200 OK` containing `originalName`, `fileSize`, `contentType`, `fileType`, `createdAt`, and `downloadCount`.

### US-06: Inline File Preview
- **User Story:** As a user, I want to preview supported files (PDF, images, plain text, video) in my browser without downloading them to my disk.
- **Acceptance Criteria:**
  - **Given** an active file with a previewable MIME type (`application/pdf`, `image/jpeg`, etc.),
  - **When** I click on the file card to trigger preview,
  - **Then** File Service streams raw bytes via `GET /api/files/view/{id}` with the appropriate HTTP `Content-Type` header, rendering the file inline inside the Preview Modal.

### US-07: File Download
- **User Story:** As a user, I want to download my stored files back to my device.
- **Acceptance Criteria:**
  - **Given** I own an active file,
  - **When** I click "Download" or request `GET /api/files/download/{id}`,
  - **Then** the service streams the file with header `Content-Disposition: attachment; filename="original_name.pdf"`, and increments `download_count` by 1 in MySQL.

### US-08: File Renaming
- **User Story:** As a user, I want to rename a file so that I can keep my files organized.
- **Acceptance Criteria:**
  - **Given** an active file,
  - **When** I submit a new name via `PUT /api/files/rename/{id}`,
  - **Then** the database `original_name` field is updated, `updated_at` is refreshed, physical disk files remain untouched, and HTTP `200 OK` is returned.

### US-09: Soft Delete File (Recycle Bin)
- **User Story:** As a user, I want to delete a file without immediately losing it permanently so that I can recover it if deleted by mistake.
- **Acceptance Criteria:**
  - **Given** an active file (`is_deleted = false`),
  - **When** I select "Delete" (`DELETE /api/files/{id}`),
  - **Then** the system sets `is_deleted = true` and `deleted_at = NOW()`. The file is hidden from My Drive views and appears in the Recycle Bin (`/trash`). Physical disk files are retained.

### US-10: Restore File from Recycle Bin
- **User Story:** As a user, I want to restore soft-deleted files from the Recycle Bin back to My Drive.
- **Acceptance Criteria:**
  - **Given** a soft-deleted file in the Recycle Bin (`is_deleted = true`),
  - **When** I select "Restore" (`PUT /api/files/restore/{id}`),
  - **Then** `is_deleted` becomes `false`, `deleted_at` becomes `null`, and the file reappears in its original active folder.

### US-11: Permanent File Deletion
- **User Story:** As a user, I want to permanently delete a file from the Recycle Bin to free up system disk space.
- **Acceptance Criteria:**
  - **Given** a file in the Recycle Bin,
  - **When** I select "Delete Permanently" (`DELETE /api/files/permanent/{id}`),
  - **Then** File Service deletes the physical UUID file from local disk (`D:/GoogleDriveClone/storage`), deletes the metadata row from `file_db.files`, and returns HTTP `200 OK`.

---

## 3. Folder & Organization User Stories

### US-12: Create Folder
- **User Story:** As a user, I want to create folders so that I can categorize my files.
- **Acceptance Criteria:**
  - **Given** I am in My Drive or a parent folder,
  - **When** I submit a folder name via `POST /api/folders`,
  - **Then** Folder Service creates a row in `folder_db.folders` with `parent_folder_id` and returns HTTP `201 Created`.

### US-13: Move Files into Folders
- **User Story:** As a user, I want to move files into specific folders to organize my directory structure.
- **Acceptance Criteria:**
  - **Given** an active file and a target folder ID,
  - **When** I submit a move request,
  - **Then** the file's `folder_id` in `file_db.files` is updated to the target folder ID.

### US-14: Filename Search
- **User Story:** As a user, I want to search for files by name so that I can quickly locate specific documents.
- **Acceptance Criteria:**
  - **Given** I type a search query `"resume"` into the header search bar,
  - **When** the query executes (`GET /api/files/search?q=resume`),
  - **Then** the system returns all non-deleted files owned by me where `original_name` contains `"resume"` (case-insensitive).

### US-15: Filter Files by Type
- **User Story:** As a user, I want to filter my files by category (e.g., Images, PDFs, Documents) to narrow down my workspace view.
- **Acceptance Criteria:**
  - **Given** I click the "Images" filter tab,
  - **When** `GET /api/files/filter?type=IMAGE` executes,
  - **Then** the system returns only active files matching `file_type = 'IMAGE'`.

### US-16: Favorite Files (Starring)
- **User Story:** As a user, I want to star/favorite important files so that I can access them from the Favorites sidebar link.
- **Acceptance Criteria:**
  - **Given** an active file,
  - **When** I toggle favorite (`PUT /api/files/favorite/{id}`),
  - **Then** `is_favorite` toggles between `true` and `false`. Stars appear on the UI file card.

### US-17: Pin Files
- **User Story:** As a user, I want to pin critical files so that they remain pinned to the top of my file grid.
- **Acceptance Criteria:**
  - **Given** an active file,
  - **When** I toggle pin (`PUT /api/files/pin/{id}`),
  - **Then** `is_pinned` toggles state, and pinned items render at the top of file list views.

---

## 4. Dashboard & Quota User Stories

### US-18: Recent Files Dashboard
- **User Story:** As a user, I want to view my most recently uploaded or modified files on the dashboard homepage.
- **Acceptance Criteria:**
  - **Given** I navigate to the Recent view (`/recent`),
  - **When** `GET /api/files/recent` executes,
  - **Then** the service returns up to 10 active files sorted by `updated_at DESC`.

### US-19: File Statistics View
- **User Story:** As a user, I want to see a chart/summary of file counts broken down by file category.
- **Acceptance Criteria:**
  - **Given** I view the storage dashboard,
  - **When** `GET /api/files/statistics` executes,
  - **Then** the system returns file counts grouped by type (`IMAGE`, `PDF`, `VIDEO`, etc.).

### US-20: Used Storage & Quota Tracking
- **User Story:** As a user, I want to see my total storage usage and remaining quota so that I know how much disk space I have available.
- **Acceptance Criteria:**
  - **Given** I am logged into the application,
  - **When** `GET /api/files/storage` executes,
  - **Then** the system calculates `usedBytes` (sum of active file sizes), retrieves `quotaBytes` (15 GB default), computes `percentage`, and updates the UI progress bar widget.
