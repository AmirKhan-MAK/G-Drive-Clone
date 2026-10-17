import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { FILE_TYPES } from '../pages/dashboardData';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  FileIcon, ImageIcon, VideoIcon, FileTextIcon, TableIcon, SlidesIcon, MoreVertIcon, StarIcon
} from './DashboardIcons';

export default function FileCard({ file, theme, onFileAction, isStarred, onToggleStar, onDeleteMock }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.originalName);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const ext = file.originalName ? file.originalName.split('.').pop().toLowerCase() : 'unknown';
  const t = FILE_TYPES[ext] || { color: '#6b7280', bg: '#f3f4f6', abbr: 'F' };

  const fileTypeIcon = (ext) => {
    switch (ext) {
      case 'jpg': case 'png': return <ImageIcon />;
      case 'mp4': return <VideoIcon />;
      case 'docx': case 'txt': return <FileTextIcon />;
      case 'xlsx': return <TableIcon />;
      case 'pptx': return <SlidesIcon />;
      case 'pdf': return <FileIcon />;
      default: return <FileIcon />;
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    try {
      const response = await api.get(`/api/files/download/${file.id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (onFileAction) onFileAction();
    } catch (err) {
      alert("Failed to download file");
    }
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsRenaming(true);
    setNewName(file.originalName);
  };

  const submitRename = async () => {
    if (newName && newName !== file.originalName) {
      try {
        await api.put(`/api/files/rename/${file.id}`, { newName });
        if (onFileAction) onFileAction();
      } catch (err) {
        alert("Failed to rename file");
        setNewName(file.originalName);
      }
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(file.originalName);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm("Are you sure you want to move this file to trash?")) {
      if (onDeleteMock) {
        onDeleteMock();
      } else {
        try {
          await api.delete(`/api/files/${file.id}`);
          if (onFileAction) onFileAction();
        } catch (err) {
          alert("Failed to delete file");
        }
      }
    }
  };

  return (
    <div className="dash-file" tabIndex={0} role="button" aria-label={`${file.originalName}, ${formatBytes(file.fileSize)}`}>
      {/* Preview */}
      <div className="dash-file__preview" style={{ background: theme === 'dark' ? `${t.color}15` : t.bg, position: 'relative' }}>
        <button 
          onClick={(e) => { e.stopPropagation(); if(onToggleStar) onToggleStar(); }}
          style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          aria-label={isStarred ? "Remove from starred" : "Add to starred"}
          title="Star"
        >
          <StarIcon width={16} height={16} stroke={isStarred ? '#fbbf24' : (theme === 'dark' ? '#ffffff' : '#000000')} fill={isStarred ? '#fbbf24' : 'none'} />
        </button>
        <div className="dash-file__preview-icon" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(8px)' }}>
          <span style={{ color: t.color }}>{fileTypeIcon(ext)}</span>
        </div>
      </div>
      {/* Meta */}
      <div className="dash-file__meta">
        <div className="dash-file__type-icon" style={{ background: theme === 'dark' ? `${t.color}20` : t.bg }}>
          <span style={{ color: t.color, fontSize: '0.625rem', fontWeight: 800 }}>{t.abbr}</span>
        </div>
        <div className="dash-file__info">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={submitRename}
              onKeyDown={handleRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary, #1f2937)',
                background: 'var(--bg-secondary, #f3f4f6)',
                border: '1px solid var(--gd-blue-500)',
                borderRadius: '4px',
                padding: '2px 4px',
                outline: 'none',
                marginBottom: '2px'
              }}
            />
          ) : (
            <p className="dash-file__name">{file.originalName}</p>
          )}
          <p className="dash-file__details">{formatBytes(file.fileSize)} · {formatDate(file.createdAt)}</p>
        </div>
        
        {/* Actions Dropdown */}
        <div className="dash-file__actions" ref={menuRef} style={{ position: 'relative' }}>
          <button 
            className="dash-file__more" 
            aria-label={`More options for ${file.originalName}`}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreVertIcon width={14} height={14} />
          </button>
          
          {menuOpen && (
            <div className="dash-file__dropdown" style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '4px',
              zIndex: 10,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: '120px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <button 
                onClick={handleDownload}
                style={{ textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Download
              </button>
              <button 
                onClick={handleRenameClick}
                style={{ textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Rename
              </button>
              <button 
                onClick={handleDelete}
                style={{ textAlign: 'left', padding: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '4px', fontSize: '0.875rem' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
