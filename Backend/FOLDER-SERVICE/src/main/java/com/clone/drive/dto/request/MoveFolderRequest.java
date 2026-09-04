package com.clone.drive.dto.request;

public class MoveFolderRequest {

    private Long targetParentFolderId;

    public MoveFolderRequest() {
    }

    public MoveFolderRequest(Long targetParentFolderId) {
        this.targetParentFolderId = targetParentFolderId;
    }

    public Long getTargetParentFolderId() {
        return targetParentFolderId;
    }

    public void setTargetParentFolderId(Long targetParentFolderId) {
        this.targetParentFolderId = targetParentFolderId;
    }
}
