# Auth Service Complete Testing Guide (Run to Stop)

**Date & Time:** 2026-08-29 02:05:54 IST  
**Type of Work:** End-to-End Manual & API Testing Procedure for Auth Service (`AUTH-SERVICE`)

---

## 1. Environment & Prerequisites Checklist

Before running tests, ensure the following components are available on your system:
- **Java JDK:** Version 21 installed and configured on `PATH`.
- **MySQL Database Server:** Running locally on port `3306`.
- **Database:** MySQL root credentials (`username: root`, `password: root`).

---

## 2. Step 1: Database Setup

Ensure the database `auth_db` is created (Spring Boot will auto-create tables on startup via JPA `ddl-auto: update`):

```sql
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 3. Step 2: Start Microservices (Run Sequence)

### A. Start Service Registry (Eureka Server)
Navigate to the `Service-Registry` folder and start the Eureka server (Port `8761`):

```powershell
cd d:\projects\G-Drive-Clone\Backend\Service-Registry
mvn spring-boot:run
```
*Verify Eureka dashboard is live at:* `http://localhost:8761`

### B. Start Auth Service
Open a new terminal, navigate to `AUTH-SERVICE`, and start the Auth microservice (Port `8081`):

```powershell
cd d:\projects\G-Drive-Clone\Backend\AUTH-SERVICE
mvn spring-boot:run
```
*Verify output log:* Look for `Started AuthServiceApplication in ... seconds` and registration with Eureka as `AUTH-SERVICE`.

---

## 4. Step 3: API Endpoint Testing Sequence

### Test 3.1: Register New User
- **Endpoint:** `POST http://localhost:8081/api/auth/register`
- **Headers:** `Content-Type: application/json`

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "createdAt": "2026-08-29T02:05:54"
  }
}
```

---

### Test 3.2: User Login
- **Endpoint:** `POST http://localhost:8081/api/auth/login`
- **Headers:** `Content-Type: application/json`

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "ROLE_USER"
    }
  }
}
```
*(Copy the `accessToken` and `refreshToken` values from the response for subsequent tests).*

---

### Test 3.3: Get Current User Profile (Protected Route)
- **Endpoint:** `GET http://localhost:8081/api/auth/me`
- **Headers:** `Authorization: Bearer <accessToken>`

**cURL Command:**
```bash
curl -X GET http://localhost:8081/api/auth/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "roles": [
      "ROLE_USER"
    ],
    "createdAt": "2026-08-29T02:05:54"
  }
}
```

---

### Test 3.4: Refresh Access Token
- **Endpoint:** `POST http://localhost:8081/api/auth/refresh`
- **Headers:** `Content-Type: application/json`

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN_HERE>"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.new.token.here...",
    "refreshToken": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    "tokenType": "Bearer",
    "expiresIn": 86400,
    "user": null
  }
}
```

---

### Test 3.5: Logout User
- **Endpoint:** `POST http://localhost:8081/api/auth/logout`
- **Headers:** `Authorization: Bearer <accessToken>`

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/auth/logout \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### Test 3.6: Negative & Edge Case Validations

1. **Duplicate Registration Check:**
   - Run Test 3.1 again with `jane.doe@example.com`.
   - **Expected Status:** `409 Conflict`
   - **Body:** `{ "success": false, "message": "User already exists with email: jane.doe@example.com", "data": null }`

2. **Invalid Password Login Check:**
   - Attempt login with incorrect password.
   - **Expected Status:** `401 Unauthorized`
   - **Body:** `{ "success": false, "message": "Invalid email or password", "data": null }`

3. **Unauthorized Profile Access Check:**
   - Call `GET /api/auth/me` without `Authorization` header.
   - **Expected Status:** `401 Unauthorized`
   - **Body:** `{ "success": false, "message": "Unauthorized access: ...", "data": null }`

---

## 5. Step 4: Stop Microservices (Stop Sequence)

To cleanly terminate services after testing:

1. **Stop AUTH-SERVICE:** Press `Ctrl + C` in the terminal window running `AUTH-SERVICE`.
2. **Stop Service Registry:** Press `Ctrl + C` in the terminal window running `Service-Registry`.
3. Verify ports `8081` and `8761` are released using PowerShell:
   ```powershell
   Get-NetTCPConnection -LocalPort 8081, 8761 -ErrorAction SilentlyContinue
   ```

---

# File Service Upload API Complete Testing Guide

**Date & Time:** 2026-08-30 08:00:00 IST  
**Type of Work:** End-to-End Manual & API Testing Procedure for File Upload API in File Service (`FILE-SERVICE`)

---

## 6. Environment & Prerequisites Checklist for File Upload

Before running tests, ensure the following components are available on your system:
- **Java JDK:** Version 21 installed and configured on `PATH`.
- **MySQL Database Server:** Running locally on port `3306`.
- **Database:** MySQL `file_db` database created (Spring Boot auto-creates tables via JPA `ddl-auto: update`):
  ```sql
  CREATE DATABASE IF NOT EXISTS file_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- **Local Storage Directory:** Folder `D:\GoogleDriveClone\storage` (auto-created per user directory e.g., `D:\GoogleDriveClone\storage\{userId}\`).

---

## 7. Step 1: Start Microservices (Run Sequence)

### A. Start Service Registry (Eureka Server)
Navigate to `Service-Registry` and start Eureka (Port `8761`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\Service-Registry
mvn spring-boot:run
```
*Verify Eureka dashboard is live at:* `http://localhost:8761`

### B. Start Auth Service
Open a new terminal, navigate to `AUTH-SERVICE`, and start Auth Service (Port `8081`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\AUTH-SERVICE
mvn spring-boot:run
```
*Verify registration in Eureka as:* `AUTH-SERVICE`

### C. Start File Service
Open a new terminal, navigate to `FILE-SERVICE`, and start File Service (Port `8082`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\FILE-SERVICE
mvn spring-boot:run
```
*Verify output log:* Look for `Started FileServiceApplication in ... seconds` and registration in Eureka as `FILE-SERVICE`.

---

## 8. Step 2: File Upload API Testing Sequence

First, execute user login via `AUTH-SERVICE` (`POST http://localhost:8081/api/auth/login`) to obtain a fresh JWT `accessToken`.

### Test 8.1: Single File Upload with Authentication
- **Endpoint:** `POST http://localhost:8082/api/files/upload`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Content-Type:** `multipart/form-data`
- **Form Data:** `files=@"C:\path\to\sample.pdf"`

**cURL Command:**
```bash
curl -X POST http://localhost:8082/api/files/upload \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -F "files=@C:/path/to/sample.pdf"
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "folderId": null,
      "originalName": "sample.pdf",
      "contentType": "application/pdf",
      "fileType": "PDF",
      "fileSize": 2048576,
      "downloadCount": 0,
      "isDeleted": false,
      "deletedAt": null,
      "isFavorite": false,
      "isPinned": false,
      "createdAt": "2026-08-30T08:00:00",
      "updatedAt": "2026-08-30T08:00:00"
    }
  ]
}
```

---

### Test 8.2: Multiple Files Upload
- **Endpoint:** `POST http://localhost:8082/api/files/upload`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Form Data:** `files=@"C:\path\to\doc.pdf"`, `files=@"C:\path\to\image.png"`

**cURL Command:**
```bash
curl -X POST http://localhost:8082/api/files/upload \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -F "files=@C:/path/to/doc.pdf" \
  -F "files=@C:/path/to/image.png"
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "id": 2,
      "userId": 1,
      "folderId": null,
      "originalName": "doc.pdf",
      "contentType": "application/pdf",
      "fileType": "PDF",
      "fileSize": 512000,
      "downloadCount": 0,
      "isDeleted": false,
      "isFavorite": false,
      "isPinned": false,
      "createdAt": "2026-08-30T08:01:00",
      "updatedAt": "2026-08-30T08:01:00"
    },
    {
      "id": 3,
      "userId": 1,
      "folderId": null,
      "originalName": "image.png",
      "contentType": "image/png",
      "fileType": "IMAGE",
      "fileSize": 1024000,
      "downloadCount": 0,
      "isDeleted": false,
      "isFavorite": false,
      "isPinned": false,
      "createdAt": "2026-08-30T08:01:00",
      "updatedAt": "2026-08-30T08:01:00"
    }
  ]
}
```

---

### Test 8.3: File Upload into Specific Folder
- **Endpoint:** `POST http://localhost:8082/api/files/upload`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Form Data:** `files=@"C:\path\to\notes.txt"`, `folderId=10`

**cURL Command:**
```bash
curl -X POST http://localhost:8082/api/files/upload \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -F "files=@C:/path/to/notes.txt" \
  -F "folderId=10"
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "id": 4,
      "userId": 1,
      "folderId": 10,
      "originalName": "notes.txt",
      "contentType": "text/plain",
      "fileType": "TEXT",
      "fileSize": 1280,
      "downloadCount": 0,
      "isDeleted": false,
      "isFavorite": false,
      "isPinned": false,
      "createdAt": "2026-08-30T08:02:00",
      "updatedAt": "2026-08-30T08:02:00"
    }
  ]
}
```

---

### Test 8.4: Local Storage Disk & Database Verification

1. **Local Disk Storage Verification:**
   - Open File Explorer and check directory: `D:\GoogleDriveClone\storage\1\`
   - Verify that physical files named like `{UUID}_sample.pdf` exist in this directory.

2. **MySQL Database Verification:**
   - Execute query on `file_db`:
     ```sql
     USE file_db;
     SELECT id, user_id, folder_id, original_name, storage_name, storage_path, file_type, file_size, created_at FROM files;
     ```

---

### Test 8.5: Negative & Security Validation Scenarios

1. **Unauthorized Upload (Missing Token):**
   - Execute upload request without `Authorization` header.
   - **Expected Status:** `401 Unauthorized`

2. **Empty File Upload Attempt:**
   - Attempt to upload a 0-byte file.
   - **Expected Status:** `400 Bad Request`
   - **Body:** `{ "success": false, "message": "Failed to store empty file.", "data": null }`

---

## 9. Step 3: Stop Microservices

To cleanly terminate services after testing:
1. **Stop FILE-SERVICE:** Press `Ctrl + C` in the terminal running `FILE-SERVICE`.
2. **Stop AUTH-SERVICE:** Press `Ctrl + C` in the terminal running `AUTH-SERVICE`.
3. **Stop Service Registry:** Press `Ctrl + C` in the terminal running `Service-Registry`.
4. Verify ports `8082`, `8081`, and `8761` are released using PowerShell:
   ```powershell
   Get-NetTCPConnection -LocalPort 8082, 8081, 8761 -ErrorAction SilentlyContinue
   ```

---

# Folder Service Complete Testing Guide (Run to Stop)

**Date & Time:** 2026-08-30 21:30:00 IST  
**Type of Work:** End-to-End Manual & API Testing Procedure for Folder Service (`FOLDER-SERVICE`)

---

## 10. Environment & Prerequisites Checklist for Folder Service

Before running tests, ensure the following components are available on your system:
- **Java JDK:** Version 21 installed and configured on `PATH`.
- **MySQL Database Server:** Running locally on port `3306`.
- **Database:** MySQL `folder_db` database created (Spring Boot auto-creates tables via JPA `ddl-auto: update`):
  ```sql
  CREATE DATABASE IF NOT EXISTS folder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

---

## 11. Step 1: Start Microservices (Run Sequence)

### A. Start Service Registry (Eureka Server)
Navigate to `Service-Registry` and start Eureka (Port `8761`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\Service-Registry
mvn spring-boot:run
```
*Verify Eureka dashboard is live at:* `http://localhost:8761`

### B. Start Auth Service
Open a new terminal, navigate to `AUTH-SERVICE`, and start Auth Service (Port `8081`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\AUTH-SERVICE
mvn spring-boot:run
```
*Verify registration in Eureka as:* `AUTH-SERVICE`

### C. Start File Service
Open a new terminal, navigate to `FILE-SERVICE`, and start File Service (Port `8082`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\FILE-SERVICE
mvn spring-boot:run
```
*Verify registration in Eureka as:* `FILE-SERVICE`

### D. Start Folder Service
Open a new terminal, navigate to `FOLDER-SERVICE`, and start Folder Service (Port `8083`):
```powershell
cd d:\projects\G-Drive-Clone\Backend\FOLDER-SERVICE
mvn spring-boot:run
```
*Verify output log:* Look for `Started FolderServiceApplication in ... seconds` and registration in Eureka as `FOLDER-SERVICE`.

---

## 12. Step 2: Folder Service API Testing Sequence

First, execute user login via `AUTH-SERVICE` (`POST http://localhost:8081/api/auth/login`) to obtain a fresh JWT `accessToken`.

### Test 12.1: Create Top-Level (Root) Folder
- **Endpoint:** `POST http://localhost:8083/api/folders`
- **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**cURL Command:**
```bash
curl -X POST http://localhost:8083/api/folders \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Java Projects",
    "parentFolderId": null
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "parentFolderId": null,
    "name": "Java Projects",
    "isDeleted": false,
    "createdAt": "2026-08-30T21:30:00",
    "updatedAt": "2026-08-30T21:30:00"
  }
}
```

---

### Test 12.2: Create Subfolder Inside Parent Folder
- **Endpoint:** `POST http://localhost:8083/api/folders`
- **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**cURL Command:**
```bash
curl -X POST http://localhost:8083/api/folders \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring Boot Microservices",
    "parentFolderId": 1
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "id": 2,
    "userId": 1,
    "parentFolderId": 1,
    "name": "Spring Boot Microservices",
    "isDeleted": false,
    "createdAt": "2026-08-30T21:31:00",
    "updatedAt": "2026-08-30T21:31:00"
  }
}
```

---

### Test 12.3: List Root Folders
- **Endpoint:** `GET http://localhost:8083/api/folders`
- **Headers:** `Authorization: Bearer <accessToken>`

**cURL Command:**
```bash
curl -X GET http://localhost:8083/api/folders \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Root folders retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "parentFolderId": null,
      "name": "Java Projects",
      "isDeleted": false,
      "createdAt": "2026-08-30T21:30:00",
      "updatedAt": "2026-08-30T21:30:00"
    }
  ]
}
```

---

### Test 12.4: Get Folder Details & Breadcrumbs
- **Endpoint:** `GET http://localhost:8083/api/folders/2`
- **Headers:** `Authorization: Bearer <accessToken>`

**cURL Command:**
```bash
curl -X GET http://localhost:8083/api/folders/2 \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder details retrieved successfully",
  "data": {
    "folder": {
      "id": 2,
      "userId": 1,
      "parentFolderId": 1,
      "name": "Spring Boot Microservices",
      "isDeleted": false,
      "createdAt": "2026-08-30T21:31:00",
      "updatedAt": "2026-08-30T21:31:00"
    },
    "breadcrumbs": [
      {
        "id": 1,
        "name": "Java Projects"
      },
      {
        "id": 2,
        "name": "Spring Boot Microservices"
      }
    ]
  }
}
```

---

### Test 12.5: Rename Folder
- **Endpoint:** `PUT http://localhost:8083/api/folders/2`
- **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**cURL Command:**
```bash
curl -X PUT http://localhost:8083/api/folders/2 \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Spring Boot Services"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder renamed successfully",
  "data": {
    "id": 2,
    "userId": 1,
    "parentFolderId": 1,
    "name": "Advanced Spring Boot Services",
    "isDeleted": false,
    "createdAt": "2026-08-30T21:31:00",
    "updatedAt": "2026-08-30T21:32:00"
  }
}
```

---

### Test 12.6: Move Folder / Change Parent
- **Endpoint:** `PUT http://localhost:8083/api/folders/2/move`
- **Headers:** `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**cURL Command:**
```bash
curl -X PUT http://localhost:8083/api/folders/2/move \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetParentFolderId": null
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder moved successfully",
  "data": {
    "id": 2,
    "userId": 1,
    "parentFolderId": null,
    "name": "Advanced Spring Boot Services",
    "isDeleted": false,
    "createdAt": "2026-08-30T21:31:00",
    "updatedAt": "2026-08-30T21:33:00"
  }
}
```

---

### Test 12.7: Get Folder Contents (Subfolders + Files via Feign)
- **Endpoint:** `GET http://localhost:8083/api/folders/1/contents`
- **Headers:** `Authorization: Bearer <accessToken>`

**cURL Command:**
```bash
curl -X GET http://localhost:8083/api/folders/1/contents \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder contents retrieved successfully",
  "data": {
    "folder": {
      "id": 1,
      "userId": 1,
      "parentFolderId": null,
      "name": "Java Projects",
      "isDeleted": false,
      "createdAt": "2026-08-30T21:30:00",
      "updatedAt": "2026-08-30T21:30:00"
    },
    "subfolders": [],
    "files": []
  }
}
```

---

### Test 12.8: Soft Delete Folder (Recursive)
- **Endpoint:** `DELETE http://localhost:8083/api/folders/2`
- **Headers:** `Authorization: Bearer <accessToken>`

**cURL Command:**
```bash
curl -X DELETE http://localhost:8083/api/folders/2 \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN_HERE>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Folder deleted successfully",
  "data": {
    "id": 2,
    "userId": 1,
    "parentFolderId": null,
    "name": "Advanced Spring Boot Services",
    "isDeleted": true,
    "createdAt": "2026-08-30T21:31:00",
    "updatedAt": "2026-08-30T21:34:00"
  }
}
```

---

### Test 12.9: Database Verification
- Execute query on `folder_db`:
  ```sql
  USE folder_db;
  SELECT id, user_id, parent_folder_id, name, is_deleted, created_at, updated_at FROM folders;
  ```

---

### Test 12.10: Negative & Edge Case Validation Scenarios

1. **Unauthorized Access (Missing Bearer Token):**
   - Call `GET /api/folders` without `Authorization` header.
   - **Expected Status:** `401 Unauthorized`

2. **Empty Folder Name Creation:**
   - Call `POST /api/folders` with `"name": ""`.
   - **Expected Status:** `400 Bad Request`
   - **Body:** `{ "success": false, "message": "Folder name must not be empty.", "data": null }`

3. **Duplicate Folder Name in Same Location:**
   - Call `POST /api/folders` with `"name": "Java Projects"` under root twice.
   - **Expected Status:** `400 Bad Request`
   - **Body:** `{ "success": false, "message": "A folder named 'Java Projects' already exists in this location.", "data": null }`

4. **Invalid Parent Folder / Folder Not Found:**
   - Call `GET /api/folders/9999`
   - **Expected Status:** `404 Not Found`
   - **Body:** `{ "success": false, "message": "Folder not found with id: 9999", "data": null }`

5. **Cycle Detection (Moving Parent into Child):**
   - Attempt to move parent folder `1` into child folder `2`.
   - **Expected Status:** `400 Bad Request`
   - **Body:** `{ "success": false, "message": "Cannot move folder into one of its own subdirectories.", "data": null }`

---

## 13. Step 3: Stop Microservices (Stop Sequence)

To cleanly terminate all services after testing:
1. **Stop FOLDER-SERVICE:** Press `Ctrl + C` in the terminal running `FOLDER-SERVICE`.
2. **Stop FILE-SERVICE:** Press `Ctrl + C` in the terminal running `FILE-SERVICE`.
3. **Stop AUTH-SERVICE:** Press `Ctrl + C` in the terminal running `AUTH-SERVICE`.
4. **Stop Service Registry:** Press `Ctrl + C` in the terminal running `Service-Registry`.
5. Verify ports `8083`, `8082`, `8081`, and `8761` are released using PowerShell:
   ```powershell
   Get-NetTCPConnection -LocalPort 8083, 8082, 8081, 8761 -ErrorAction SilentlyContinue
   ```


