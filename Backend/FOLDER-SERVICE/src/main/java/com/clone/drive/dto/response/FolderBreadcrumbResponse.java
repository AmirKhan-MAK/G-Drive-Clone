package com.clone.drive.dto.response;

public class FolderBreadcrumbResponse {

    private Long id;
    private String name;

    public FolderBreadcrumbResponse() {
    }

    public FolderBreadcrumbResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
