package com.clone.drive.dto.response;

import java.util.List;

public class FolderDetailsResponse {

    private FolderResponse folder;
    private List<FolderBreadcrumbResponse> breadcrumbs;

    public FolderDetailsResponse() {
    }

    public FolderDetailsResponse(FolderResponse folder, List<FolderBreadcrumbResponse> breadcrumbs) {
        this.folder = folder;
        this.breadcrumbs = breadcrumbs;
    }

    public FolderResponse getFolder() {
        return folder;
    }

    public void setFolder(FolderResponse folder) {
        this.folder = folder;
    }

    public List<FolderBreadcrumbResponse> getBreadcrumbs() {
        return breadcrumbs;
    }

    public void setBreadcrumbs(List<FolderBreadcrumbResponse> breadcrumbs) {
        this.breadcrumbs = breadcrumbs;
    }
}
