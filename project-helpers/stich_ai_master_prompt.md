# Master Prompt for Google Stitch AI: DriveClone React UI & Component Library

Copy and paste the prompt below directly into **Google Stitch AI** (or feed it into Stitch's generation system) to construct the complete, high-fidelity React.js frontend application for **DriveClone** (Google Drive Clone).

---

```text
PROMPT FOR GOOGLE STITCH AI:

You are an expert Principal Frontend Engineer and UI/UX Designer specialized in React.js, Tailwind CSS, and Google Material / Modern Web Design Systems.

BUILD TASK:
Generate a complete, enterprise-grade, modern React.js frontend component suite and page templates for "DriveClone" — a web-based Cloud Drive application inspired by Google Drive.

===============================================================================
1. CORE TECH STACK & DESIGN SYSTEM SPECIFICATIONS
===============================================================================
- Framework: React.js (Vite / Next.js compatible) + React Router v6
- Styling: Tailwind CSS (with dark mode support enabled via `dark:` classes)
- Icons: Lucide-React or Material Design Icons (`lucide-react`)
- State Management: React Context API (`AuthContext`, `DriveContext`)
- API Layer: Axios with Interceptors for JWT authorization & multipart form-data uploads
- Aesthetics: Premium Google Workspace vibe, dynamic micro-interactions, subtle glassmorphism (backdrop-blur), sleek borders, smooth card hover effects, custom scrollbars, and vibrant status colors.

COLOR PALETTE (CSS Variables & Tailwind Config):
- Primary / Brand: Google Blue (`#1a73e8` / `bg-blue-600` / `hover:bg-blue-700`)
- Accent Blue: Light Blue (`#e8f0fe` / `dark:bg-blue-950/40`)
- Surface Light: Neutral Slate (`#f8fafc` / `#ffffff`)
- Surface Dark: Deep Slate (`#0f172a` / `#1e293b`)
- Text Light Mode: Primary (`#1e293b`), Secondary (`#64748b`)
- Text Dark Mode: Primary (`#f8fafc`), Secondary (`#94a3b8`)
- File Type Accents:
  - PDF: Red (`#ef4444`)
  - Images: Violet (`#8b5cf6`)
  - Videos: Indigo (`#6366f1`)
  - Documents/Text: Blue (`#3b82f6`)
  - Audio: Amber (`#f59e0b`)
  - Zip/Archives: Emerald (`#10b981`)
- Storage Bar Warnings:
  - Normal (<70%): Blue (`bg-blue-500`)
  - High (70-90%): Amber (`bg-amber-500`)
  - Critical (>90%): Red (`bg-red-500`)

===============================================================================
2. DETAILED REACT COMPONENT HIERARCHY TO GENERATE
===============================================================================

Generate clean, fully modular, typed (or JSDoc documented) React components structured into the following folder organization:

src/
├── context/
│   ├── AuthContext.jsx             # Auth state, login/logout, JWT token persistence
│   └── DriveContext.jsx            # Current folder, items list, view mode (grid|table), selection, search/filter, storage stats
├── services/
│   ├── api.js                      # Axios instance with BaseURL http://localhost:8080 and Bearer token interceptor
│   ├── authApi.js                  # auth endpoints (/api/auth/login, register, me, refresh)
│   ├── fileApi.js                  # file endpoints (upload, download, view stream, rename, soft-delete, restore, permanent-delete, favorites, pins, storage, search)
│   └── folderApi.js                # folder endpoints (create, list root, move, rename, delete, contents)
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx              # Top header with logo, global search, filter pills, and user avatar dropdown
│   │   ├── Sidebar.jsx             # Left nav (My Drive, Recent, Favorites, Trash) + + New Action Button + StorageMeter
│   │   └── MainLayout.jsx          # Shell layout container with collapsible mobile sidebar and dropzone overlay
│   ├── views/
│   │   ├── ActionToolbar.jsx       # Breadcrumbs, + New button menu, View Switcher toggle, Sort dropdown
│   │   ├── Breadcrumb.jsx          # Clickable path nodes (My Drive > Folder > Subfolder)
│   │   ├── FileGrid.jsx            # Responsive Grid renderer for folders & files
│   │   ├── FileTable.jsx           # Detailed tabular renderer (Name, Owner, Modified Date, Size, Actions)
│   │   ├── FileCard.jsx            # Card with file icon/thumbnail preview, favorite star, pin badge, context menu trigger
│   │   └── FolderCard.jsx          # Card with folder icon, item count, double-click enter handler
│   ├── modals/
│   │   ├── UploadModal.jsx         # Drag-and-drop dropzone, multi-file upload progress bars, cancel/close
│   │   ├── CreateFolderModal.jsx   # New folder input prompt with validation
│   │   ├── RenameModal.jsx         # Rename input prompt with extension lock
│   │   ├── MoveModal.jsx           # Folder destination tree selector
│   │   ├── PreviewModal.jsx        # Inline preview stream modal for PDF, Images, Audio, Video, Text, with action toolbar
│   │   └── DeleteConfirmModal.jsx  # Confirmation dialog for Soft Delete vs Permanent Deletion
│   └── common/
│       ├── ContextMenu.jsx         # Custom right-click menu positioning at cursor (Preview, Download, Star, Rename, Move, Delete)
│       ├── StorageMeter.jsx        # Quota progress bar widget showing used GB / total GB and % filled
│       ├── NotificationToast.jsx   # Toast alerts (Success, Error, Info) with auto-dismiss
│       └── LoadingSkeleton.jsx     # Shimmer skeletons for file grid and list views
└── pages/
    ├── Login.jsx                   # Public Auth Sign-In screen
    ├── Register.jsx                # Public Auth Sign-Up screen
    ├── Dashboard.jsx               # Main My Drive workspace
    ├── RecentPage.jsx              # Recent files view
    ├── FavoritesPage.jsx           # Starred items view
    └── RecycleBinPage.jsx          # Soft-deleted trash items view with Restore & Empty Trash controls

===============================================================================
3. COMPONENT SPECIFICATIONS & INTERACTION REQUIREMENTS
===============================================================================

### A. Authentication Pages (`Login.jsx`, `Register.jsx`)
- Modern centered glassmorphism card over subtle gradient background.
- Brand header with DriveClone logo and tagline ("Your files, accessible anywhere").
- Form inputs:
  - Login: Email, Password, "Remember Me" checkbox, Submit button ("Sign In"), Link to Register.
  - Register: Full Name, Email, Password with interactive strength meter bar, Confirm Password, Submit button ("Create Account"), Link to Login.
- Error alerts banner when API returns error (e.g. invalid credentials or duplicate email).
- Full integration with `AuthContext.login()` and `AuthContext.register()`.

### B. Navbar (`Navbar.jsx`)
- Left section: App logo icon + "DriveClone" bold typography.
- Middle section: Global Search Bar with search icon, input clear button, and quick filter pill dropdown (All, Images, PDFs, Documents, Videos, Archives).
  - Search triggers debounced update to `DriveContext.setSearchQuery(q)`.
- Right section:
  - Dark/Light mode toggle switch icon (Sun/Moon).
  - User profile menu trigger showing user avatar / initials.
  - Dropdown menu displaying: User Name, User Email, Storage Usage Summary bar, Divider, and "Logout" button.

### C. Sidebar (`Sidebar.jsx`)
- Top: Prominent `+ New` button (with colorful Google-style `+` icon or smooth blue button). Clicking opens dropdown:
  - File Upload (opens `UploadModal`)
  - New Folder (opens `CreateFolderModal`)
- Primary Navigation Items (with active highlight pill):
  1. My Drive (`/drive`) - Icon: Folder
  2. Recent (`/recent`) - Icon: Clock
  3. Favorites (`/favorites`) - Icon: Star
  4. Recycle Bin (`/trash`) - Icon: Trash2
- Bottom: `StorageMeter.jsx` widget:
  - Database usage query result: e.g. "3.2 GB of 15 GB used".
  - Color-coded progress bar (Blue for normal, Amber for warning, Red for critical).
  - "Storage Details" link/button.

### D. Main Workspace Layout & Toolbar (`Dashboard.jsx`, `ActionToolbar.jsx`, `Breadcrumb.jsx`)
- Breadcrumb navigation path showing `My Drive > [FolderName]`. Each folder segment is clickable to navigate back up the tree.
- Action Toolbar controls:
  - Grid View / Table View toggle buttons (with active shadow state).
  - Sort By selector dropdown (Name, Date Modified, File Size).
  - Select All checkbox & Bulk action buttons (e.g., Delete Selected, Move Selected) when items are selected.
- Workspace supports Drag-and-Drop file dropping anywhere on the main window area to auto-trigger `UploadModal`.

### E. File & Folder Grid / Table Views (`FileGrid.jsx`, `FileTable.jsx`, `FolderCard.jsx`, `FileCard.jsx`)
- Grid View:
  - Folders section: Compact horizontal cards with folder icon, name, double-click to navigate into folder, right-click trigger.
  - Files section: Visual grid of file cards.
    - Displays thumbnail preview for images, or colored file type badge icon for PDFs/Docs/Videos.
    - Displays original filename, file size (e.g., 2.4 MB), star icon (toggle favorite), pinned badge, and `...` menu button.
    - Single-click selects item. Double-click on file opens `PreviewModal.jsx`.
    - Right-click anywhere on card opens custom `ContextMenu.jsx`.
- Table View:
  - Clean table headers: Name, Type, Owner, Date Modified, File Size, Actions.
  - Alternating hover row highlights, star toggle column, inline action icons (Preview, Download, Delete).

### F. Context Menu (`ContextMenu.jsx`)
- Custom floating menu rendered at absolute `mouseX`, `mouseY` coordinates.
- Actions list depending on item type and location:
  - Active Drive items: Preview, Download, Rename, Move to Folder, Star/Unstar, Pin/Unpin, Move to Trash.
  - Trash items: Restore File, Delete Permanently.
- Clicking outside or selecting an action dismisses the menu smoothly.

### G. File Preview Modal (`PreviewModal.jsx`)
- Fullscreen modal overlay with dark semi-transparent backdrop.
- Modal Header: Filename, File Size, Action Buttons (Download stream, Favorite star toggle, Rename, Close X).
- Modal Body:
  - PDF File: Render embedded iframe / object streaming `/api/files/view/{id}` with scroll controls.
  - Image File: Render image with zoom in/out, rotate, and full view controls.
  - Audio/Video: Render HTML5 media player with playback controls.
  - Text/Code File: Render scrollable syntax container with monospace text.
  - Unsupported types: Clean fallback placeholder icon with "Preview not supported. Download file to view." button.

### H. Upload Modal (`UploadModal.jsx`)
- Centered dialog with drag-and-drop zone ("Drag and drop files here or browse").
- Multi-file selection queue listing each file:
  - File name, file size, status icon (Waiting, Uploading, Completed, Error).
  - Individual upload progress bar (0% -> 100%).
  - Total progress summary & "Upload All" / "Done" action buttons.
- Connects to `fileApi.uploadFiles(files, currentFolderId)`.

### I. Storage Meter (`StorageMeter.jsx`)
- Visual quota widget calculating `usedBytes`, `quotaBytes`, and `percentage`.
- Formats bytes into human-readable strings (`B`, `KB`, `MB`, `GB`).
- Displays percentage text and dynamic bar fill color based on thresholds.

### J. State Management & API Services (`AuthContext`, `DriveContext`, `api.js`)
- `AuthContext`: Manages `user`, `accessToken`, `login(credentials)`, `register(userData)`, `logout()`. Stores JWT in `localStorage`.
- `DriveContext`: Manages `currentFolder`, `breadcrumbs`, `foldersList`, `filesList`, `viewMode` ('grid' | 'table'), `selectedItems`, `searchQuery`, `filterType`, `storageInfo`, `refreshDrive()`.
- `api.js`: Axios instance pointing to `http://localhost:8080` with automatic request interceptor appending `Authorization: Bearer <accessToken>` header, and response interceptor handling token refresh / 401 redirect to login.

===============================================================================
4. OUTPUT REQUIREMENTS
===============================================================================
- Produce production-ready React JSX code for each component with proper default props, state management, and clear Tailwind styling classes.
- Ensure full responsiveness across Mobile (<640px), Tablet (640px - 1024px), and Desktop (>1024px).
- Provide clean animations, smooth modal transitions, accessible focus states, and zero broken links/placeholders.
```

---

## Component Inventory Checklist for DriveClone Frontend

| Component Category | File Name | Description / Responsibilities |
| :--- | :--- | :--- |
| **Context / State** | `AuthContext.jsx` | Global Authentication state, JWT token management, login/logout functions. |
| **Context / State** | `DriveContext.jsx` | Folder hierarchy, file/folder lists, selection state, view mode, storage info. |
| **Services / API** | `api.js` | Axios HTTP client configured with Base URL `http://localhost:8080` and Bearer JWT headers. |
| **Services / API** | `authApi.js` | Login, Register, Refresh Token, and User Profile API calls. |
| **Services / API** | `fileApi.js` | Upload, Metadata, Preview Stream, Download, Soft-Delete, Restore, Rename, Search, Filter, Storage API calls. |
| **Services / API** | `folderApi.js` | Create Folder, List Root Folders, Get Folder Contents, Rename, Move, and Delete Folder API calls. |
| **Layout** | `Navbar.jsx` | Top header with Logo, Global Search Bar with Type Filter, and User Profile Avatar Dropdown. |
| **Layout** | `Sidebar.jsx` | Navigation Links (My Drive, Recent, Favorites, Trash), `+ New` Action Menu, and `StorageMeter`. |
| **Layout** | `MainLayout.jsx` | Master application shell wrapping Top Navbar, Left Sidebar, Main Workspace, and Global Dropzone. |
| **Workspace Views**| `ActionToolbar.jsx` | Action Bar with `+ New` button, Breadcrumbs, View Switcher (Grid/Table), and Sort Dropdown. |
| **Workspace Views**| `Breadcrumb.jsx` | Clickable interactive breadcrumb path navigation (My Drive > Notes > Java). |
| **Workspace Views**| `FileGrid.jsx` | Responsive multi-column grid view renderer for files and folders. |
| **Workspace Views**| `FileTable.jsx` | Tabular view renderer displaying Name, Owner, Last Modified, Size, and Action buttons. |
| **Workspace Views**| `FolderCard.jsx` | Folder card item with double-click enter handler, item count, and context menu trigger. |
| **Workspace Views**| `FileCard.jsx` | File card item with file type icon/thumbnail preview, favorite star, pin badge, and context menu trigger. |
| **Modals / Dialogs**| `UploadModal.jsx` | Drag-and-drop file upload dialog with per-file upload progress bar and status indicator. |
| **Modals / Dialogs**| `CreateFolderModal.jsx` | Prompt dialog for creating new subfolder with name validation. |
| **Modals / Dialogs**| `RenameModal.jsx` | Dialog for renaming file or folder with original name pre-populated. |
| **Modals / Dialogs**| `MoveModal.jsx` | Interactive folder tree modal to select destination parent folder. |
| **Modals / Dialogs**| `PreviewModal.jsx` | Stream viewer for PDF, Image (zoom/rotate), Video, Audio, Code/Text, and fallback download button. |
| **Modals / Dialogs**| `DeleteConfirmModal.jsx` | Confirmation dialog distinguishing soft-delete (Recycle Bin) vs permanent deletion. |
| **Common UI** | `ContextMenu.jsx` | Floating right-click context menu positioned at cursor (Preview, Download, Star, Rename, Move, Delete). |
| **Common UI** | `StorageMeter.jsx` | Storage quota progress bar widget showing used bytes vs total quota and usage %. |
| **Common UI** | `NotificationToast.jsx` | Toast notification alerts (Success, Error, Info) with auto-dismiss progress bar. |
| **Common UI** | `LoadingSkeleton.jsx` | Animated shimmer skeleton loaders for cards and table rows during async data fetching. |
| **Pages** | `Login.jsx` | User authentication sign-in screen with validation and error alerts. |
| **Pages** | `Register.jsx` | Account registration sign-up screen with password strength feedback. |
| **Pages** | `Dashboard.jsx` | Main workspace page displaying root or subfolder contents and drag-and-drop zone. |
| **Pages** | `RecentPage.jsx` | View listing chronologically sorted recent active files (last 10). |
| **Pages** | `FavoritesPage.jsx` | View listing starred / favorite items. |
| **Pages** | `RecycleBinPage.jsx` | Recycle bin management page with Restore, Permanent Delete, and Empty Trash features. |
