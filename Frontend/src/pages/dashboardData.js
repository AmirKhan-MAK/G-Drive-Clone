/**
 * Dashboard mock data — separated from UI for easy replacement with API data.
 * Replace individual arrays/objects with API responses when backend is ready.
 */

/* ── Navigation Items ── */
export const NAV_ITEMS = [
  { id: 'drive',     label: 'My Drive',       iconKey: 'drive' },
  { id: 'starred',   label: 'Starred',        iconKey: 'starred' },
  { id: 'trash',     label: 'Trash',          iconKey: 'trash' },
];

/* ── Spaces ── */
export const SPACES = [
  { id: 1, name: 'Personal',  color: '#3b82f6' },
  { id: 2, name: 'Projects',  color: '#8b5cf6' },
  { id: 3, name: 'College',   color: '#10b981' },
  { id: 4, name: 'Important', color: '#f59e0b' },
  { id: 5, name: 'Work',      color: '#6366f1' },
];

/* ── Quick Actions ── */
export const QUICK_ACTIONS = [
  { id: 'folder',       title: 'New Folder',            desc: 'Organize your files',  color: '#fef3c7', iconColor: '#f59e0b' },
  { id: 'upload',       title: 'Upload Files',          desc: 'From your device',     color: '#dbeafe', iconColor: '#3b82f6' },
  { id: 'document',     title: 'Create Document',       desc: 'Start writing',        color: '#d1fae5', iconColor: '#10b981' },
  { id: 'spreadsheet',  title: 'Create Spreadsheet',    desc: 'Work with data',       color: '#ede9fe', iconColor: '#8b5cf6' },
  { id: 'presentation', title: 'Create Presentation',   desc: 'Build slides',         color: '#fce7f3', iconColor: '#ec4899' },
];

/* ── Filter Tabs ── */
export const FILTER_TABS = [
  'All Files', 'Folders', 'Documents', 'Images', 'Videos', 'PDFs', 'Others',
];

/* ── Folders ── */
export const FOLDERS = [
  { id: 1, name: 'Projects',  items: 12, color: '#8b5cf6' },
  { id: 2, name: 'College',   items: 8,  color: '#10b981' },
  { id: 3, name: 'Personal',  items: 24, color: '#3b82f6' },
  { id: 4, name: 'Important', items: 6,  color: '#f59e0b' },
  { id: 5, name: 'Work',      items: 15, color: '#6366f1' },
];

/* ── File Type Config ── */
export const FILE_TYPES = {
  jpg:  { label: 'Image',        color: '#ec4899', bg: '#fce7f3', abbr: 'IMG' },
  png:  { label: 'Image',        color: '#ec4899', bg: '#fce7f3', abbr: 'IMG' },
  docx: { label: 'Document',     color: '#3b82f6', bg: '#dbeafe', abbr: 'W' },
  xlsx: { label: 'Spreadsheet',  color: '#10b981', bg: '#d1fae5', abbr: 'X' },
  pdf:  { label: 'PDF',          color: '#ef4444', bg: '#fee2e2', abbr: 'PDF' },
  mp4:  { label: 'Video',        color: '#8b5cf6', bg: '#ede9fe', abbr: '▶' },
  fig:  { label: 'Design',       color: '#f97316', bg: '#ffedd5', abbr: 'FIG' },
  pptx: { label: 'Presentation', color: '#ef4444', bg: '#fee2e2', abbr: 'P' },
  txt:  { label: 'Text',         color: '#6b7280', bg: '#f3f4f6', abbr: 'TXT' },
};

/* ── Files ── */
export const FILES = [
  { id: 1,  name: 'mountains.jpg',        size: '2.4 MB',  modified: '2 hours ago',  ext: 'jpg',  previewBg: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #34d399 100%)' },
  { id: 2,  name: 'Project Report.docx',   size: '1.2 MB',  modified: '5 hours ago',  ext: 'docx', previewBg: '#dbeafe' },
  { id: 3,  name: 'Budget 2026.xlsx',      size: '450 KB',  modified: '1 day ago',    ext: 'xlsx', previewBg: '#d1fae5' },
  { id: 4,  name: 'Resume.pdf',            size: '320 KB',  modified: '2 days ago',   ext: 'pdf',  previewBg: '#fee2e2' },
  { id: 5,  name: 'Trip Video.mp4',        size: '12.8 MB', modified: '3 days ago',   ext: 'mp4',  previewBg: '#ede9fe' },
  { id: 6,  name: 'Design Mockup.fig',     size: '5.1 MB',  modified: '4 days ago',   ext: 'fig',  previewBg: '#ffedd5' },
  { id: 7,  name: 'Presentation.pptx',     size: '2.1 MB',  modified: '5 days ago',   ext: 'pptx', previewBg: '#fce7f3' },
  { id: 8,  name: 'Notes.txt',             size: '12 KB',   modified: '6 days ago',   ext: 'txt',  previewBg: '#f3f4f6' },
  { id: 9,  name: 'AI_Research.pdf',       size: '850 KB',  modified: '1 week ago',   ext: 'pdf',  previewBg: '#fee2e2' },
  { id: 10, name: 'Profile Photo.jpg',     size: '420 KB',  modified: '1 week ago',   ext: 'jpg',  previewBg: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)' },
];

/* ── Storage ── */
export const STORAGE = {
  used: 12.4,
  total: 100,
  breakdown: [
    { label: 'Documents', size: '4.1 GB', color: '#3b82f6' },
    { label: 'Images',    size: '3.2 GB', color: '#ec4899' },
    { label: 'Videos',    size: '2.8 GB', color: '#8b5cf6' },
    { label: 'Others',    size: '2.3 GB', color: '#9ca3af' },
  ],
};

/* ── Recently Shared ── */
export const RECENTLY_SHARED = [
  { id: 1, name: 'Project Plan.docx',  detail: 'Shared with 5 people · 2h ago',  color: '#3b82f6', abbr: 'W'  },
  { id: 2, name: 'Design Assets',       detail: 'Shared with team · 1d ago',      color: '#8b5cf6', abbr: 'DA' },
  { id: 3, name: 'Budget 2026.xlsx',   detail: 'Shared with 3 people · 2d ago',  color: '#10b981', abbr: 'X'  },
];

/* ── Quick Access ── */
export const QUICK_ACCESS = [
  { id: 'starred',  label: 'Starred Files',   count: '12 files', iconKey: 'star' },
  { id: 'recent',   label: 'Recent Files',    count: '43 files', iconKey: 'clock' },
  { id: 'shared',   label: 'Shared with me',  count: '28 files', iconKey: 'users' },
];
