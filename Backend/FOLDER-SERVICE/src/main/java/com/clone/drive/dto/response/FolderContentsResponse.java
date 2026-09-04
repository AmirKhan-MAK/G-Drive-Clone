package com.clone.drive.dto.response;

import java.util.List;

public class FolderContentsResponse {

    private FolderResponse folder;
    private List<FolderResponse> subfolders;
    private List<FileDto> files;

    public FolderContentsResponse() {
    }

    public FolderContentsResponse(FolderResponse folder, List<FolderResponse> subfolders, List<FileDto> files) {
        this.folder = folder;
        this.subfolders = subfolders;
        this.files = files;
    }

    public FolderResponse getFolder() {
        return folder;
    }

    public void setFolder(FolderResponse folder) {
        this.folder = folder;
    }

    public List<FolderResponse> getSubfolders() {
        return subfolders;
    }

    public void setSubfolders(List<FolderResponse> subfolders) {
        this.subfolders = subfolders;
    }

    public List<FileDto> getFiles() {
        return files;
    }

    public void setFiles(List<FileDto> files) {
        this.files = files;
    }
}
