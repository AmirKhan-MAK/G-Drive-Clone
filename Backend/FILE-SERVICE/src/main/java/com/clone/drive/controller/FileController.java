package com.clone.drive.controller;

import com.clone.drive.dto.response.ApiResponse;
import com.clone.drive.dto.response.FileResponse;
import com.clone.drive.entity.FileEntity;
import com.clone.drive.security.UserPrincipal;
import com.clone.drive.service.FileService;
import com.clone.drive.service.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
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
    private final StorageService storageService;

    public FileController(FileService fileService, StorageService storageService) {
        this.fileService = fileService;
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<FileResponse>>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<FileResponse> uploadedFiles = fileService.uploadFiles(files, folderId, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Files uploaded successfully", uploadedFiles));
    }
    
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<FileResponse>>> getAllFiles(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<FileResponse> files = fileService.getAllFiles(currentUser);
        
        return ResponseEntity.ok(ApiResponse.success("Files retrieved successfully", files));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FileEntity fileEntity = fileService.getFileForDownload(id, currentUser);
        Resource resource = storageService.loadFileAsResource(fileEntity.getStorageName(), currentUser.getUserId());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileEntity.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getOriginalName() + "\"")
                .body(resource);
    }
}
