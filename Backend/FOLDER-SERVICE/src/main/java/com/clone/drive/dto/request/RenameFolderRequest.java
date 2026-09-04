package com.clone.drive.dto.request;

public class RenameFolderRequest {

    private String name;

    public RenameFolderRequest() {
    }

    public RenameFolderRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
