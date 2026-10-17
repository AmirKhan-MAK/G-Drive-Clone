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

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> softDeleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        FileResponse response = fileService.softDeleteFile(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("File moved to Recycle Bin", response));
    }

    @PutMapping("/restore/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> restoreFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        FileResponse response = fileService.restoreFile(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("File restored successfully", response));
    }

    @DeleteMapping("/permanent/{id}")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        fileService.permanentDeleteFile(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("File and metadata permanently deleted", null));
    }

    @GetMapping("/recycle-bin")
    public ResponseEntity<ApiResponse<List<FileResponse>>> getRecycleBinFiles(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<FileResponse> files = fileService.getRecycleBinFiles(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Recycle bin files retrieved", files));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<FileResponse>>> getFavoriteFiles(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<FileResponse> files = fileService.getFavoriteFiles(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Favorite files retrieved", files));
    }

    @PutMapping("/favorite/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> toggleFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        FileResponse response = fileService.toggleFavorite(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Favorite status toggled", response));
    }

    @PutMapping("/pin/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> togglePin(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        FileResponse response = fileService.togglePin(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Pin status toggled", response));
    }
}
