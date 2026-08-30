package com.clone.drive.dto.response;

import java.time.LocalDateTime;

public class RegisterResponse {
    private Long userId;
    private String name;
    private String email;
    private LocalDateTime createdAt;

    public RegisterResponse() {
    }

    public RegisterResponse(Long userId, String name, String email, LocalDateTime createdAt) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
