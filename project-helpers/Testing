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
