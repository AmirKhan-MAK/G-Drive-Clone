# DriveClone Information Architecture & UI/UX Design System

This document specifies the information architecture, user interface navigation hierarchy, React component layout structure, and client-side data flows for **DriveClone**.

---

## 1. User Interface Site Map & Navigation Hierarchy

```text
DriveClone Application Root
├── Public Authentication Routes
│   ├── /login                     # User Sign-In Form (Email, Password)
│   └── /register                  # Account Registration Form (Name, Email, Password)
│
└── Authenticated Application Shell (Dashboard)
    ├── Top Navigation Header
    │   ├── App Branding & Logo
    │   ├── Global Search Bar      # Real-time search query input
    │   └── User Profile Menu      # Profile info, Storage stats summary, Logout button
    │
    ├── Left Sidebar Navigation
    │   ├── Primary Views
    │   │   ├── My Drive (/drive)  # Root folder view and nested folder explorer
    │   │   ├── Recent (/recent)   # Chronologically sorted active files (last 10)
    │   │   ├── Favorites (/favs)  # Starred / Favorite items list
    │   │   └── Trash (/trash)     # Soft-deleted Recycle Bin items
    │   │
    │   └── Storage Meter Widget   # Used bytes / Quota progress bar & usage percentage
    │
    ├── Action Toolbar
    │   ├── + Upload File          # Triggers multi-file drag-and-drop modal
    │   ├── + New Folder           # Triggers folder creation modal
    │   ├── View Switcher          # Toggles between Grid View and Table List View
    │   └── Sort Filter            # Sort by Name, Last Modified, File Size
    │
    └── Main Display Workspace
        ├── Breadcrumb Bar         # Navigation path (e.g., My Drive > Notes > Java)
        ├── Folders Grid / List    # Subfolder cards (Double-click to navigate inside)
        └── Files Grid / List      # File item cards (Context menu for actions)
```

---

## 2. React Component Architecture Structure

```text
src/
├── App.jsx                        # Main Application Router & Theme Provider
├── context/
│   ├── AuthContext.jsx            # Global Auth State (user, token, login, logout)
│   └── DriveContext.jsx           # File & Folder state, selected item, view mode
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx             # Top search bar and user profile dropdown
│   │   ├── Sidebar.jsx            # Left navigation links and Storage Widget
│   │   └── MainLayout.jsx         # Wrapper layout shell
│   │
│   ├── views/
│   │   ├── FileGrid.jsx           # Grid view renderer for files
│   │   ├── FileTable.jsx          # Detailed table view renderer for files
│   │   ├── FileCard.jsx           # Individual file card component
│   │   ├── FolderCard.jsx         # Individual folder card component
│   │   └── Breadcrumb.jsx         # Interactive parent folder navigation path
│   │
│   ├── modals/
│   │   ├── UploadModal.jsx        # Drag-and-drop file upload dialog
│   │   ├── CreateFolderModal.jsx  # New folder name prompt dialog
│   │   ├── RenameModal.jsx        # Rename file/folder dialog
│   │   ├── MoveModal.jsx          # Folder selection target tree for moving files
│   │   ├── PreviewModal.jsx       # Media/PDF preview streamer overlay
│   │   └── StorageMeter.jsx       # Quota progress bar calculation component
│   │
│   └── common/
│       ├── ContextMenu.jsx        # Right-click contextual action menu
│       ├── NotificationToast.jsx  # Success / Error toast notifications
│       └── LoadingSpinner.jsx     # Async action spinner
│
├── pages/
│   ├── Login.jsx                  # Sign-in view
│   ├── Register.jsx               # Signup view
│   ├── Dashboard.jsx              # Main My Drive folder workspace
│   ├── RecentPage.jsx             # Recent files view
│   ├── FavoritesPage.jsx          # Favorites starred view
│   └── RecycleBinPage.jsx         # Soft-deleted trash management view
│
├── services/
│   ├── api.js                     # Axios instance configured with Gateway base URL
│   ├── authApi.js                 # Login, register, token refresh calls
│   ├── fileApi.js                 # Upload, download, preview, delete, favorite calls
│   └── folderApi.js               # Folder CRUD and navigation API calls
```

---

## 3. Client-Side Data Flow & User Interaction Patterns

### 3.1 File Upload & State Mutation Flow
```text
User Drops File in UploadModal
       │
       ▼
UploadModal calls fileApi.uploadFiles(files, currentFolderId)
       │
       ▼
Axios attaches Authorization: Bearer <JWT> header
       │
       ▼
Request routes through API Gateway (8080) -> File Service (8082)
       │
       ▼
File Service verifies quota, writes file to D:/GoogleDriveClone/storage, inserts DB row
       │
       ▼
File Service returns Standard JSON Response { success: true, data: [uploadedFile] }
       │
       ▼
DriveContext receives new file data -> Appends to current file state list
       │
       ▼
UI re-renders FileGrid / FileTable; StorageMeter updates used bytes progress bar
```

### 3.2 File Preview Flow
```text
User Clicks Preview on "document.pdf" (ID: 501)
       │
       ▼
React opens PreviewModal component passing file ID 501
       │
       ▼
PreviewModal sets iframe / object src to "http://localhost:8080/api/files/view/501"
       │
       ▼
API Gateway forwards request to File Service
       │
       ▼
File Service validates JWT & ownership -> Reads physical file from local disk
       │
       ▼
File Service streams binary byte stream with Header Content-Type: application/pdf
       │
       ▼
Browser renders PDF directly inside PreviewModal without download trigger
```
