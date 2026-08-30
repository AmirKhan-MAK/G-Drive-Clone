package com.clone.drive.controller;

import com.clone.drive.dto.response.ApiResponse;
import com.clone.drive.dto.response.FileResponse;
import com.clone.drive.security.UserPrincipal;
import com.clone.drive.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<FileResponse>>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<FileResponse> uploadedFiles = fileService.uploadFiles(files, folderId, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Files uploaded successfully", uploadedFiles));
    }
}
