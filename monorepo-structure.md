# DriveClone Repository & Package Architecture Structure

This document details the file tree structure, Java package hierarchy, and module breakdown for **DriveClone**.

---

## 1. Repository Monorepo Layout

```text
google-drive-clone/
│
├── docs/                                # Technical specifications & documentation
│   ├── api-contracts.md
│   ├── database-schema.md
│   ├── development-phases.md
│   ├── engineering-scope-definition.md
│   ├── environment-and-devops.md
│   ├── information-architecture.md
│   ├── monorepo-structure.md
│   ├── product-requirements.md
│   ├── scoring-engine-spec.md
│   ├── system-architecture.md
│   ├── testing-strategy.md
│   └── user-stories-and-acceptance-criteria.md
│
├── docker/                              # Container orchestration configs
│   ├── docker-compose.yml
│   └── mysql/
│       └── init.sql                     # SQL schema initialization scripts
│
├── frontend/
│   └── react-drive/                     # React.js SPA Client Project
│       ├── public/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
│
└── backend/                             # Java Spring Boot Microservices
    ├── eureka-server/                   # Service Registry (Port 8761)
    ├── api-gateway/                     # Spring Cloud Gateway (Port 8080)
    ├── auth-service/                    # Authentication Service (Port 8081)
    ├── file-service/                    # File Management Service (Port 8082)
    ├── folder-service/                  # Folder Management Service (Port 8083)
    └── share-service/                   # Sharing Service (Port 8084 - Future)
```

---

## 2. File Service Java Package Architecture (`com.drive.file`)

```text
backend/file-service/src/main/java/com/drive/file/
│
├── FileServiceApplication.java          # Spring Boot Main Entry Point
│
├── controller/
│   └── FileController.java              # REST endpoints (/api/files/*)
│
├── service/
│   ├── FileService.java                 # Business logic interface
│   ├── impl/
│   │   └── FileServiceImpl.java         # File management logic implementation
│   └── StorageService.java              # Storage abstraction interface
│
├── storage/
│   ├── impl/
│   │   ├── LocalStorageService.java     # Local disk storage implementation
│   │   └── S3StorageService.java        # Future AWS S3 storage implementation
│   └── StorageProperties.java           # Property mapper (@ConfigurationProperties)
│
├── repository/
│   └── FileRepository.java              # Spring Data JPA Repository interface
│
├── entity/
│   └── FileEntity.java                  # JPA Entity mapping `files` MySQL table
│
├── dto/
│   ├── request/
│   │   ├── RenameFileRequest.java       # DTO for file rename request
│   │   └── MoveFileRequest.java         # DTO for moving file to folder
│   └── response/
│       ├── FileResponse.java            # Unified file DTO returned to client
│       ├── StorageResponse.java         # Storage quota usage DTO
│       ├── FileStatisticsResponse.java  # Categorized count DTO
│       └── ApiResponse.java             # Standard envelope wrapper {success, message, data}
│
├── exception/
│   ├── FileNotFoundException.java       # Resource missing exception
│   ├── StorageException.java            # Local IO / Storage failure exception
│   ├── QuotaExceededException.java      # User quota limit exception
│   ├── OwnershipViolationException.java # Security unauthorized access exception
│   └── GlobalExceptionHandler.java      # ControllerAdvice exception interceptor
│
└── config/
    ├── SecurityConfig.java              # Resource Server JWT Security configuration
    └── OpenFeignConfig.java             # Inter-service Feign Client config
```

---

## 3. Auth Service Java Package Architecture (`com.drive.auth`)

```text
backend/auth-service/src/main/java/com/drive/auth/
│
├── AuthServiceApplication.java          # Spring Boot Main Entry Point
│
├── controller/
│   └── AuthController.java              # REST endpoints (/api/auth/*)
│
├── service/
│   ├── AuthService.java                 # Authentication business logic interface
│   ├── impl/
│   │   └── AuthServiceImpl.java         # Auth service implementation
│   └── JwtService.java                  # Token generation, parsing, validation logic
│
├── mapper/
│   └── UserMapper.java                  # DTO <-> Entity mapping component
│
├── repository/
│   ├── UserRepository.java              # JPA Repo for `users` table
│   └── RefreshTokenRepository.java      # JPA Repo for `refresh_tokens` table
│
├── entity/
│   ├── User.java                        # User JPA Entity
│   ├── Role.java                        # Role Enum (ROLE_USER, ROLE_ADMIN)
│   └── RefreshToken.java                # Refresh Token JPA Entity
│
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java         # Signup payload
│   │   ├── LoginRequest.java            # Login payload
│   │   └── RefreshTokenRequest.java     # Token refresh payload
│   └── response/
│       ├── RegisterResponse.java        # User registration response payload DTO
│       ├── JwtResponse.java             # Token response payload
│       └── UserProfileResponse.java     # User profile metadata payload
│
└── security/
    ├── JwtAuthenticationFilter.java     # Security filter interceptor
    ├── UserDetailsServiceImpl.java      # Spring Security UserDetailsService implementation
    └── SecurityConfig.java              # WebSecurityConfigurerAdapter / SecurityFilterChain
```

---

## 4. Folder Service Java Package Architecture (`com.drive.folder`)

```text
backend/folder-service/src/main/java/com/drive/folder/
│
├── FolderServiceApplication.java
│
├── controller/
│   └── FolderController.java            # REST endpoints (/api/folders/*)
│
├── service/
│   ├── FolderService.java
│   └── impl/
│       └── FolderServiceImpl.java
│
├── repository/
│   └── FolderRepository.java
│
├── entity/
│   └── FolderEntity.java
│
└── dto/
    ├── CreateFolderRequest.java
    ├── FolderResponse.java
    └── FolderContentsResponse.java
```

---

## 5. Frontend React Project Architecture (`frontend/react-drive/src`)

```text
frontend/react-drive/src/
├── main.jsx                             # React Application entry point
├── App.jsx                              # Route definitions & global context providers
├── index.css                            # Global CSS reset & typography styles
│
├── context/
│   ├── AuthContext.jsx                  # JWT Token & User state manager
│   └── DriveContext.jsx                 # Active files/folders state manager
│
├── services/
│   ├── api.js                           # Base Axios instance with Gateway Interceptor
│   ├── authApi.js                       # Auth API network calls
│   ├── fileApi.js                       # File API network calls
│   └── folderApi.js                     # Folder API network calls
│
├── pages/
│   ├── Login.jsx                        # User login view
│   ├── Register.jsx                     # User signup view
│   ├── Dashboard.jsx                    # Main drive folder view
│   ├── RecentPage.jsx                   # Recent files view
│   ├── FavoritesPage.jsx                # Starred favorites view
│   └── RecycleBinPage.jsx               # Soft-deleted trash view
│
├── components/
│   ├── Navbar.jsx                       # Top header search & user profile menu
│   ├── Sidebar.jsx                      # Left navigation menu & storage quota widget
│   ├── FileCard.jsx                     # Grid card element for files
│   ├── FileTable.jsx                    # List view table for files
│   ├── UploadModal.jsx                  # File drag-and-drop upload modal
│   ├── CreateFolderModal.jsx            # Folder creation modal
│   ├── PreviewModal.jsx                 # File inline preview streamer overlay
│   └── StorageMeter.jsx                 # Storage usage percentage progress bar
│
└── utils/
    ├── formatters.js                    # Bytes-to-MB formatters, date formatters
    └── constants.js                     # File type icons, MIME type mappings
```
