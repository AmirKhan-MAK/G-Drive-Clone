package com.clone.drive.dto.response;

import com.clone.drive.entity.FileEntity;
import com.clone.drive.entity.FileType;

import java.time.LocalDateTime;

public class FileResponse {

    private Long id;
    private Long userId;
    private Long folderId;
    private String originalName;
    private String contentType;
    private FileType fileType;
    private Long fileSize;
    private Long downloadCount;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private Boolean isFavorite;
    private Boolean isPinned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FileResponse() {
    }

    public static FileResponse fromEntity(FileEntity entity) {
        FileResponse response = new FileResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUserId());
        response.setFolderId(entity.getFolderId());
        response.setOriginalName(entity.getOriginalName());
        response.setContentType(entity.getContentType());
        response.setFileType(entity.getFileType());
        response.setFileSize(entity.getFileSize());
        response.setDownloadCount(entity.getDownloadCount());
        response.setIsDeleted(entity.getIsDeleted());
        response.setDeletedAt(entity.getDeletedAt());
        response.setIsFavorite(entity.getIsFavorite());
        response.setIsPinned(entity.getIsPinned());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Long downloadCount) {
        this.downloadCount = downloadCount;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Boolean getIsFavorite() {
        return isFavorite;
    }

    public void setIsFavorite(Boolean favorite) {
        isFavorite = favorite;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean pinned) {
        isPinned = pinned;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
