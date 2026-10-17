import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CloudLogo from '../components/CloudLogo';
import {
  HomeIcon, DriveIcon, SharedIcon, RecentIcon, StarIcon, TrashIcon,
  SearchIcon, SunIcon, MoonIcon, BellIcon, HelpIcon, SettingsIcon,
  ChevronDownIcon, MenuIcon, XIcon,
  PlusIcon, UploadIcon, FolderPlusIcon, FolderIcon,
  FileTextIcon, TableIcon, SlidesIcon, ImageIcon, VideoIcon, FileIcon,
  MoreVertIcon, GridIcon, ListIcon, FilterIcon,
  ChevronRightIcon, CrownIcon,
  getNavIcon,
} from '../components/DashboardIcons';
import {
  NAV_ITEMS, SPACES, FILTER_TABS,
  FOLDERS, FILES, FILE_TYPES, STORAGE,
} from './dashboardData';
import FileCard from '../components/FileCard';
import './Dashboard.css';


/* ═══════════════════════════════════════════
   HOME — MAIN DASHBOARD PAGE
   ═══════════════════════════════════════════ */

export default function Dashboard() {
  const navigate = useNavigate();

  /* ── State ── */
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState('All Files');
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Folders state
  const [folders, setFolders] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [fetchFoldersError, setFetchFoldersError] = useState(null);
  
  // Folder Navigation state
  const [folderPath, setFolderPath] = useState([]);
  const currentFolder = folderPath.length > 0 ? folderPath[folderPath.length - 1] : null;
  
  // Folder contents state
  const [folderContents, setFolderContents] = useState({ subfolders: [], files: [] });
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [fetchContentsError, setFetchContentsError] = useState(null);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // New Button and Modal State
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeFolderMenuId, setActiveFolderMenuId] = useState(null);
  const [localStarredIds, setLocalStarredIds] = useState(new Set());
  const [localTrashIds, setLocalTrashIds] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const filesToUpload = e.target.files;
    if (!filesToUpload || filesToUpload.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < filesToUpload.length; i++) {
      formData.append('files', filesToUpload[i]);
    }
    if (currentFolder) {
      formData.append('folderId', currentFolder.id);
    }

    try {
      await api.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      refreshData();
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload files.');
    }
    
    setIsNewMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const payload = { name: newFolderName.trim() };
      if (currentFolder) {
        payload.parentFolderId = currentFolder.id;
      }
      await api.post('/api/folders', payload);
      setNewFolderName('');
      setIsCreateFolderModalOpen(false);
      refreshData();
    } catch (err) {
      console.error('Folder creation failed', err);
      alert('Failed to create folder.');
    }
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchFiles = async () => {
    try {
      setFetchError(null);
      const response = await api.get('/api/files/list');
      setFiles(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
      setFetchError(error.message || "Failed to fetch files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const fetchFolders = async () => {
    try {
      setFetchFoldersError(null);
      const response = await api.get('/api/folders');
      setFolders(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch folders", error);
      setFetchFoldersError(error.message || "Failed to fetch folders");
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const fetchContents = async () => {
    if (!currentFolder) {
      setFolderContents({ subfolders: [], files: [] });
      return;
    }
    setIsLoadingContents(true);
    try {
      setFetchContentsError(null);
      const response = await api.get(`/api/folders/${currentFolder.id}/contents`);
      setFolderContents(response.data.data || { subfolders: [], files: [] });
    } catch (error) {
      console.error("Failed to fetch folder contents", error);
      setFetchContentsError(error.message || "Failed to fetch folder contents");
    } finally {
      setIsLoadingContents(false);
    }
  };

  const refreshData = () => {
    fetchFiles();
    fetchFolders();
    if (currentFolder) {
      fetchContents();
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/auth/me');
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    
    fetchUser();
    fetchFiles();
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchContents();
  }, [currentFolder]);

  const getFolderColor = (id) => {
    const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1'];
    return colors[(id || 0) % colors.length];
  };



  /* ── Sign out (existing logic preserved) ── */
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };



  const pct = Math.round((STORAGE.used / STORAGE.total) * 100);

  const displayFolders = currentFolder ? (folderContents.subfolders || []) : folders;
  let displayFiles = [];
  if (activeNav === 'trash') {
    displayFiles = files.filter(f => localTrashIds.has(f.id));
  } else if (activeNav === 'starred') {
    displayFiles = files.filter(f => localStarredIds.has(f.id) && !localTrashIds.has(f.id));
  } else {
    displayFiles = currentFolder 
      ? files.filter(file => file.folderId === currentFolder.id && !localTrashIds.has(file.id))
      : files.filter(file => file.folderId == null && !localTrashIds.has(file.id));
  }
  
  const isFoldersLoading = currentFolder ? isLoadingContents : isLoadingFolders;
  const foldersError = currentFolder ? fetchContentsError : fetchFoldersError;
  const isFilesLoading = currentFolder ? isLoadingContents : isLoadingFiles;
  const filesError = currentFolder ? fetchContentsError : fetchError;

  return (
    <div className="dash">

      {/* ═══ SIDEBAR OVERLAY (mobile) ═══ */}
      <div
        className={`dash-sidebar-overlay ${sidebarOpen ? 'dash-sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'dash-sidebar--open' : ''}`} aria-label="Main navigation">

        {/* Brand */}
        <div className="dash-sidebar__brand">
          <CloudLogo size={28} />
          <span className="dash-sidebar__brand-name">G-Drive-Clone</span>
        </div>

        {/* New Button */}
        <div 
          className="dash-new-btn-wrapper" 
          style={{ position: 'relative', marginBottom: '24px', padding: '0 24px' }}
          onMouseEnter={() => setIsNewMenuOpen(true)}
          onMouseLeave={() => setIsNewMenuOpen(false)}
        >
          <button className="dash-new-btn" aria-label="Create new item" style={{ width: '100%' }}>
            <PlusIcon width={16} height={16} />
            New
            <ChevronDownIcon />
          </button>
          
          {isNewMenuOpen && (
            <div className="dash-new-menu" style={{ 
              position: 'absolute', top: '100%', left: '24px', right: '24px', zIndex: 100, 
              background: theme === 'dark' ? '#1f2937' : '#ffffff', border: '1px solid var(--glass-border)', 
              borderRadius: '8px', padding: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <button 
                onClick={() => { setIsCreateFolderModalOpen(true); setIsNewMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', textAlign: 'left', fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <FolderPlusIcon width={16} height={16} /> Create Folder
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', textAlign: 'left', fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <UploadIcon width={16} height={16} /> Upload File
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            multiple 
          />
        </div>

        {/* Primary Nav */}
        <nav>
          <ul className="dash-nav" role="list">
            {NAV_ITEMS.map((item) => {
              const Icon = getNavIcon(item.iconKey);
              return (
                <li key={item.id}>
                  <button
                    className={`dash-nav__item ${activeNav === item.id ? 'dash-nav__item--active' : ''}`}
                    onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                    aria-current={activeNav === item.id ? 'page' : undefined}
                  >
                    <span className="dash-nav__icon"><Icon /></span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>


        <div className="dash-storage">
          <p className="dash-storage__title">Storage</p>
          <p className="dash-storage__text">{STORAGE.used} GB of {STORAGE.total} GB used</p>
          <div className="dash-storage__bar">
            <div className="dash-storage__fill" style={{ width: `${pct}%` }} />
          </div>
          <button className="dash-storage__upgrade" aria-label="Upgrade storage">
            <CrownIcon width={14} height={14} />
            Upgrade Storage
          </button>
        </div>
      </aside>


      {/* ═══ BODY (header + content) ═══ */}
      <div className="dash-body">

        {/* ── Top Header ── */}
        <header className="dash-header">
          {/* Mobile menu */}
          <button
            className="dash-header__menu-btn"
            onClick={() => setSidebarOpen((p) => !p)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <XIcon /> : <MenuIcon />}
          </button>

          {/* Search */}
          <div className="dash-search">
            <span className="dash-search__icon"><SearchIcon /></span>
            <input
              type="search"
              className="dash-search__input"
              placeholder="Search files, folders, or anything..."
              aria-label="Search files"
            />
            <span className="dash-search__kbd">
              <kbd>Ctrl</kbd><kbd>K</kbd>
            </span>
          </div>

          {/* Right icons */}
          <div className="dash-header__right">
            <button className="dash-header__icon-btn" aria-label="Toggle Theme" title="Toggle Theme" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Profile */}
            <div 
              className="dash-profile-wrapper" 
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsProfileMenuOpen(true)}
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <div className="dash-profile" tabIndex={0} role="button" aria-label="User menu">
                <div className="dash-profile__avatar" aria-hidden="true">
                  {user && user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="dash-profile__info">
                  <span className="dash-profile__name">{user ? user.name : 'Loading...'}</span>
                  <span className="dash-profile__email">{user ? user.email : ''}</span>
                </div>
                <ChevronDownIcon />
              </div>
              
              {isProfileMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, zIndex: 100,
                  background: theme === 'dark' ? '#1f2937' : '#ffffff', border: '1px solid var(--glass-border)',
                  borderRadius: '8px', padding: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                  marginTop: '4px', minWidth: '150px'
                }}>
                  <button 
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '4px', textAlign: 'left', fontWeight: 600, width: '100%' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* ── Content + Right sidebar ── */}
        <div className="dash-content-wrap">

          {/* ═══ MAIN CONTENT ═══ */}
          <main className="dash-main">

            {activeNav === 'starred' && (
              <div style={{ padding: '20px 0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Starred Items</h2>
                {displayFiles.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <StarIcon width={48} height={48} stroke="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No starred files yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Add stars to files that you want to find easily later.</p>
                  </div>
                )}
              </div>
            )}

            {activeNav === 'trash' && (
              <div style={{ padding: '20px 0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Trash</h2>
                {displayFiles.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <TrashIcon width={48} height={48} stroke="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Trash is empty</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Items in trash are deleted forever after 30 days.</p>
                  </div>
                )}
              </div>
            )}

            {activeNav !== 'starred' && activeNav !== 'trash' && (
              <>
                {/* ── Breadcrumb (Shows when inside a folder) ── */}
                {folderPath.length > 0 && (
                  <div className="dash-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '1rem', fontWeight: 600, flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setFolderPath(folderPath.slice(0, -1))}
                      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '4px 8px', color: 'var(--gd-gray-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
                      title="Go back"
                    >
                      &larr; Back
                    </button>
                    <button onClick={() => setFolderPath([])} style={{ background: 'none', border: 'none', color: 'var(--gd-gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                      My Drive
                    </button>
                    {folderPath.map((f, index) => (
                      <span key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronRightIcon width={16} height={16} style={{ color: 'var(--gd-gray-400)' }} />
                        <button 
                          onClick={() => setFolderPath(folderPath.slice(0, index + 1))}
                          style={{ background: 'none', border: 'none', color: index === folderPath.length - 1 ? 'var(--text-primary)' : 'var(--gd-gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}
                        >
                          {f.name}
                        </button>
                      </span>
                    ))}
                  </div>
                )}

            {/* ── File Toolbar ── */}
            <div className="dash-toolbar">
              <div className="dash-tabs" role="tablist">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`dash-tab ${activeTab === tab ? 'dash-tab--active' : ''}`}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="dash-toolbar__right">
                <div className="dash-view-toggle">
                  <button
                    className={`dash-view-btn ${viewMode === 'list' ? 'dash-view-btn--active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <ListIcon width={15} height={15} />
                  </button>
                  <button
                    className={`dash-view-btn ${viewMode === 'grid' ? 'dash-view-btn--active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <GridIcon width={15} height={15} />
                  </button>
                </div>
                <button className="dash-toolbar__btn">
                  Last modified <ChevronDownIcon />
                </button>
                <button className="dash-toolbar__btn" aria-label="Filter">
                  <FilterIcon width={14} height={14} />
                </button>
              </div>
            </div>

            {/* ── Folders ── */}
            <section>
              <div className="dash-section-header">
                <h3>Folders</h3>
                <button>View all</button>
              </div>
              <div className="dash-folders">
                {isFoldersLoading ? (
                  <p style={{ padding: '10px 0', color: '#6b7280' }}>Loading folders...</p>
                ) : foldersError ? (
                  <p style={{ padding: '10px 0', color: '#ef4444' }}>Error: {foldersError}</p>
                ) : displayFolders.length === 0 ? (
                  <p style={{ padding: '10px 0', color: '#6b7280' }}>No folders found.</p>
                ) : (
                  displayFolders.map((f) => {
                    const color = getFolderColor(f.id);
                    return (
                      <div className="dash-folder" key={f.id} tabIndex={0} role="button" aria-label={`${f.name} folder`} onClick={() => setFolderPath([...folderPath, f])}>
                        <div className="dash-folder__icon">
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                              fill={color} opacity=".15" stroke={color} strokeWidth="1.5" />
                          </svg>
                        </div>
                        <div className="dash-folder__info">
                          <p className="dash-folder__name">{f.name}</p>
                          <p className="dash-folder__count">-- items</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button 
                            className="dash-folder__more" 
                            aria-label={`More options for ${f.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFolderMenuId(activeFolderMenuId === f.id ? null : f.id);
                            }}
                          >
                            <MoreVertIcon width={16} height={16} />
                          </button>
                          
                          {activeFolderMenuId === f.id && (
                            <div className="dash-file__dropdown" style={{
                              position: 'absolute', right: 0, top: '100%',
                              background: theme === 'dark' ? '#1f2937' : '#ffffff',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px', padding: '4px',
                              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)',
                              zIndex: 100, minWidth: '120px'
                            }}>
                              <button style={{ display: 'block', width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }} onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'} onMouseLeave={(e) => e.target.style.background = 'none'} onClick={(e) => { e.stopPropagation(); setActiveFolderMenuId(null); }}>Rename</button>
                              <button style={{ display: 'block', width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem' }} onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'} onMouseLeave={(e) => e.target.style.background = 'none'} onClick={(e) => { e.stopPropagation(); setActiveFolderMenuId(null); }}>Download</button>
                              <button style={{ display: 'block', width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }} onMouseEnter={(e) => e.target.style.background = 'var(--bg-secondary)'} onMouseLeave={(e) => e.target.style.background = 'none'} onClick={(e) => { e.stopPropagation(); setActiveFolderMenuId(null); }}>Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* ── Files ── */}
            {(displayFiles.length > 0 || (activeNav !== 'starred' && activeNav !== 'trash')) && (
              <section>
                <div className="dash-section-header">
                  <h3>Files</h3>
                  {activeNav !== 'starred' && activeNav !== 'trash' && (
                    <button>
                      <PlusIcon width={14} height={14} />
                    </button>
                  )}
                </div>
                <div className="dash-files">
                  {isFilesLoading ? (
                    <p style={{ padding: '20px', color: '#6b7280' }}>Loading files...</p>
                  ) : filesError ? (
                    <p style={{ padding: '20px', color: '#ef4444' }}>Error: {filesError}</p>
                  ) : displayFiles.length === 0 ? (
                    <p style={{ padding: '20px', color: '#6b7280' }}>No files found.</p>
                  ) : (
                    displayFiles.map((file) => (
                      <FileCard 
                        key={file.id} 
                        file={file} 
                        theme={theme} 
                        isStarred={localStarredIds.has(file.id)}
                        onToggleStar={() => {
                          setLocalStarredIds(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(file.id)) newSet.delete(file.id);
                            else newSet.add(file.id);
                            return newSet;
                          });
                        }}
                        onDeleteMock={() => {
                          setLocalTrashIds(prev => {
                            const newSet = new Set(prev);
                            newSet.add(file.id);
                            return newSet;
                          });
                        }}
                        onFileAction={() => {
                          // Re-fetch files when an action like rename occurs
                          api.get('/api/files/list').then(res => setFiles(res.data.data || []));
                          if (currentFolder) {
                            api.get(`/api/folders/${currentFolder.id}/contents`).then(res => 
                              setFolderContents(res.data.data || { subfolders: [], files: [] })
                            );
                          }
                        }} 
                      />
                    ))
                  )}
                </div>
              </section>
            )}
            </>
            )}
          </main>



        </div>
      </div>
      
      {/* Create Folder Modal */}
      {isCreateFolderModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--text-primary)' }}>New Folder</h3>
            <form onSubmit={submitCreateFolder}>
              <input 
                autoFocus
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Untitled folder"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--gd-blue-500)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginBottom: '24px', outline: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ background: 'var(--gd-blue-600)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
