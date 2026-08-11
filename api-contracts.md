# DriveClone API Contracts & Interface Specification

This document provides the definitive, comprehensive API specification for the **DriveClone** application. All client applications (including the React.js frontend) and microservices must strictly adhere to these contract definitions.

---

## 1. Global API Conventions

### 1.1 Base URLs
- **API Gateway Base URL (Development):** `http://localhost:8080`
- **Auth Service Route Prefix:** `/api/auth`
- **File Service Route Prefix:** `/api/files`
- **Folder Service Route Prefix:** `/api/folders`
- **Share Service Route Prefix (Future):** `/api/shares`

### 1.2 Headers
- **Content-Type:** `application/json` (unless specifying `multipart/form-data` for file uploads or binary streaming)
- **Authorization:** `Bearer <JWT_ACCESS_TOKEN>` (required for all protected endpoints)

### 1.3 Standard Response Envelope
All JSON responses from microservices return a unified envelope structure:

```json
{
  "success": true,
  "message": "Human-readable response message",
  "data": {}
}
```

- `success` (boolean): `true` if the operation completed successfully; `false` on failure.
- `message` (string): Explanatory summary message.
- `data` (object | array | null): The payload returned by the service, or `null` if no data is returned.

### 1.4 Standard Error Response Envelope
```json
{
  "success": false,
  "message": "Detailed error message describing the failure",
  "data": null
}
```

### 1.5 Standard HTTP Status Codes
| Code | Meaning | Description |
| :--- | :--- | :--- |
| **200 OK** | Request Succeeded | Returned for successful synchronous read/update operations. |
| **201 Created** | Resource Created | Returned for successful creation (e.g., file upload, folder creation, user registration). |
| **204 No Content** | Action Completed | Returned when deletion completes with no payload expected. |
| **400 Bad Request** | Validation Failure | Invalid input payload, missing required parameters, or malformed data. |
| **401 Unauthorized** | Missing/Invalid Token | Authentication token is missing, expired, or signature verification failed. |
| **403 Forbidden** | Ownership Violation | Access denied. User does not own the target file/folder or lack permissions. |
| **404 Not Found** | Resource Missing | File, folder, or user ID does not exist in MySQL metadata. |
| **409 Conflict** | Duplication Error | Resource conflict (e.g., registration with an existing email). |
| **413 Payload Too Large** | Quota/Size Exceeded | File size exceeds max upload limit or user storage quota is full. |
| **500 Internal Error** | System Failure | Server error (e.g., local disk I/O failure, unhandled microservice exception). |

---

## 2. Auth Service APIs (`/api/auth`)

### 2.1 Register User
- **Endpoint:** `POST /api/auth/register`
- **Authentication:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 101,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "createdAt": "2026-08-11T10:00:00Z"
  }
}
```

### 2.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Authentication:** Public
- **Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "d9b2a7e1-8c43-4f90...",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 101,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "ROLE_USER"
    }
  }
}
```

### 2.3 Refresh Access Token
- **Endpoint:** `POST /api/auth/refresh`
- **Authentication:** Public
- **Request Body:**
```json
{
  "refreshToken": "d9b2a7e1-8c43-4f90..."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "e4a1c8f2-9d54-5e01...",
    "tokenType": "Bearer",
    "expiresIn": 86400
  }
}
```

### 2.4 Logout
- **Endpoint:** `POST /api/auth/logout`
- **Authentication:** Required (`Bearer <JWT>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### 2.5 Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Authentication:** Required (`Bearer <JWT>`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 101,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "roles": ["ROLE_USER"],
    "createdAt": "2026-08-11T10:00:00Z"
  }
}
```

---

## 3. File Service APIs (`/api/files`)

### 3.1 Upload File(s)
- **Endpoint:** `POST /api/files/upload`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Form Parameters:**
  - `files` (File[], required): One or multiple binary files.
  - `folderId` (Long, optional): Target folder ID. `null` if uploading to root My Drive.
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "id": 501,
      "userId": 101,
      "folderId": null,
      "originalName": "resume.pdf",
      "contentType": "application/pdf",
      "fileType": "PDF",
      "fileSize": 2048576,
      "downloadCount": 0,
      "isDeleted": false,
      "isFavorite": false,
      "isPinned": false,
      "createdAt": "2026-08-11T10:15:00Z",
      "updatedAt": "2026-08-11T10:15:00Z"
    }
  ]
}
```

### 3.2 List Active Files
- **Endpoint:** `GET /api/files`
- **Authentication:** Required
- **Query Parameters:**
  - `folderId` (Long, optional): List files within specific folder. Defaults to root if not provided.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Active files retrieved successfully",
  "data": [
    {
      "id": 501,
      "originalName": "resume.pdf",
      "contentType": "application/pdf",
      "fileType": "PDF",
      "fileSize": 2048576,
      "isFavorite": false,
      "isPinned": true,
      "createdAt": "2026-08-11T10:15:00Z"
    }
  ]
}
```

### 3.3 Get File Metadata
- **Endpoint:** `GET /api/files/{id}`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "File metadata retrieved",
  "data": {
    "id": 501,
    "userId": 101,
    "folderId": null,
    "originalName": "resume.pdf",
    "contentType": "application/pdf",
    "fileType": "PDF",
    "fileSize": 2048576,
    "downloadCount": 3,
    "isDeleted": false,
    "deletedAt": null,
    "isFavorite": true,
    "isPinned": false,
    "createdAt": "2026-08-11T10:15:00Z",
    "updatedAt": "2026-08-11T11:00:00Z"
  }
}
```

### 3.4 Preview File (Inline Stream)
- **Endpoint:** `GET /api/files/view/{id}`
- **Authentication:** Required
- **Response Header:** `Content-Type: application/pdf` (or `image/jpeg`, `text/plain`, etc.)
- **Response Body:** Binary byte stream rendered directly in browser preview window.

### 3.5 Download File
- **Endpoint:** `GET /api/files/download/{id}`
- **Authentication:** Required
- **Response Header:** `Content-Disposition: attachment; filename="resume.pdf"`
- **Behavior:** Increments `download_count` by 1 in `file_db` upon streaming start.

### 3.6 Soft Delete File
- **Endpoint:** `DELETE /api/files/{id}`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "File moved to Recycle Bin",
  "data": {
    "id": 501,
    "isDeleted": true,
    "deletedAt": "2026-08-11T11:30:00Z"
  }
}
```

### 3.7 Restore File from Recycle Bin
- **Endpoint:** `PUT /api/files/restore/{id}`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "File restored successfully",
  "data": {
    "id": 501,
    "isDeleted": false,
    "deletedAt": null
  }
}
```

### 3.8 Permanent Delete File
- **Endpoint:** `DELETE /api/files/permanent/{id}`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "File and metadata permanently deleted",
  "data": null
}
```

### 3.9 Get Recycle Bin Files
- **Endpoint:** `GET /api/files/recycle-bin`
- **Authentication:** Required
- **Response (200 OK):** Returns all soft-deleted files (`is_deleted = true`) belonging to current user.

### 3.10 Rename File
- **Endpoint:** `PUT /api/files/rename/{id}`
- **Authentication:** Required
- **Request Body:**
```json
{
  "newName": "updated-resume-2026.pdf"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "File renamed successfully",
  "data": {
    "id": 501,
    "originalName": "updated-resume-2026.pdf",
    "updatedAt": "2026-08-11T11:45:00Z"
  }
}
```

### 3.11 Search Files
- **Endpoint:** `GET /api/files/search?q={query}`
- **Authentication:** Required
- **Example:** `GET /api/files/search?q=resume`
- **Response (200 OK):** List of non-deleted files where `original_name` matches query string.

### 3.12 Filter Files by Type
- **Endpoint:** `GET /api/files/filter?type={fileType}`
- **Authentication:** Required
- **Supported Types:** `IMAGE`, `VIDEO`, `PDF`, `DOCUMENT`, `TEXT`, `AUDIO`, `ARCHIVE`, `OTHER`, `ALL`
- **Response (200 OK):** Filtered list of files matching specified category.

### 3.13 Get File Statistics
- **Endpoint:** `GET /api/files/statistics`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "totalFiles": 42,
    "countsByType": {
      "IMAGE": 15,
      "PDF": 10,
      "DOCUMENT": 8,
      "VIDEO": 4,
      "AUDIO": 2,
      "ARCHIVE": 1,
      "TEXT": 2,
      "OTHER": 0
    }
  }
}
```

### 3.14 Get Storage Usage
- **Endpoint:** `GET /api/files/storage`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Storage usage retrieved",
  "data": {
    "usedBytes": 3221225472,
    "quotaBytes": 16106127360,
    "percentage": 20.0
  }
}
```

### 3.15 Get Recent Files
- **Endpoint:** `GET /api/files/recent`
- **Authentication:** Required
- **Response (200 OK):** Returns last 10 uploaded or updated active files sorted by `updated_at DESC`.

### 3.16 Get Favorites
- **Endpoint:** `GET /api/files/favorites`
- **Authentication:** Required
- **Response (200 OK):** Returns all active files with `is_favorite = true`.

### 3.17 Toggle Favorite Status
- **Endpoint:** `PUT /api/files/favorite/{id}`
- **Authentication:** Required
- **Response (200 OK):** Returns updated file entity with toggled `isFavorite` state.

### 3.18 Toggle Pin Status
- **Endpoint:** `PUT /api/files/pin/{id}`
- **Authentication:** Required
- **Response (200 OK):** Returns updated file entity with toggled `isPinned` state.

---

## 4. Folder Service APIs (`/api/folders`)

### 4.1 Create Folder
- **Endpoint:** `POST /api/folders`
- **Authentication:** Required
- **Request Body:**
```json
{
  "name": "Java Notes",
  "parentFolderId": null
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "id": 201,
    "userId": 101,
    "parentFolderId": null,
    "name": "Java Notes",
    "isDeleted": false,
    "createdAt": "2026-08-11T12:00:00Z",
    "updatedAt": "2026-08-11T12:00:00Z"
  }
}
```

### 4.2 List Root Folders
- **Endpoint:** `GET /api/folders`
- **Authentication:** Required
- **Response (200 OK):** List of top-level non-deleted folders for user (`parent_folder_id IS NULL`).

### 4.3 Get Folder Details
- **Endpoint:** `GET /api/folders/{id}`
- **Authentication:** Required
- **Response (200 OK):** Folder metadata and breadcrumbs hierarchy.

### 4.4 Rename Folder
- **Endpoint:** `PUT /api/folders/{id}`
- **Authentication:** Required
- **Request Body:**
```json
{
  "name": "Advanced Java Notes"
}
```
- **Response (200 OK):** Updated folder entity.

### 4.5 Delete Folder
- **Endpoint:** `DELETE /api/folders/{id}`
- **Authentication:** Required
- **Response (200 OK):** Soft deletes folder and recursively marks child folders/files as deleted.

### 4.6 Move Folder / Change Parent
- **Endpoint:** `PUT /api/folders/{id}/move`
- **Authentication:** Required
- **Request Body:**
```json
{
  "targetParentFolderId": 105
}
```
- **Response (200 OK):** Updated folder with new `parentFolderId`.

### 4.7 Get Folder Contents
- **Endpoint:** `GET /api/folders/{id}/contents`
- **Authentication:** Required
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder contents retrieved",
  "data": {
    "folder": {
      "id": 201,
      "name": "Java Notes",
      "parentFolderId": null
    },
    "subfolders": [
      { "id": 202, "name": "Spring Boot", "isDeleted": false }
    ],
    "files": [
      { "id": 501, "originalName": "resume.pdf", "fileType": "PDF", "fileSize": 2048576 }
    ]
  }
}
```

---

## 5. Post-MVP Share Service APIs (`/api/shares`)

### 5.1 Share File
- **Endpoint:** `POST /api/shares/files/{id}`
- **Request Body:**
```json
{
  "recipientEmail": "collaborator@example.com",
  "permission": "VIEWER"
}
```

### 5.2 Shared With Me
- **Endpoint:** `GET /api/shares/shared-with-me`
- **Response (200 OK):** Returns items shared with authenticated user by others.
