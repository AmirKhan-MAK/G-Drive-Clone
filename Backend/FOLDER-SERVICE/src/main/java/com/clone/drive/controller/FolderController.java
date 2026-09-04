package com.clone.drive.controller;

import com.clone.drive.dto.request.CreateFolderRequest;
import com.clone.drive.dto.request.MoveFolderRequest;
import com.clone.drive.dto.request.RenameFolderRequest;
import com.clone.drive.dto.response.ApiResponse;
import com.clone.drive.dto.response.FolderContentsResponse;
import com.clone.drive.dto.response.FolderDetailsResponse;
import com.clone.drive.dto.response.FolderResponse;
import com.clone.drive.security.UserPrincipal;
import com.clone.drive.service.FolderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FolderResponse>> createFolder(
            @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FolderResponse folder = folderService.createFolder(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Folder created successfully", folder));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getRootFolders(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<FolderResponse> folders = folderService.getRootFolders(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Root folders retrieved successfully", folders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderDetailsResponse>> getFolderDetails(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FolderDetailsResponse details = folderService.getFolderDetails(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Folder details retrieved successfully", details));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderResponse>> renameFolder(
            @PathVariable("id") Long id,
            @RequestBody RenameFolderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FolderResponse folder = folderService.renameFolder(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Folder renamed successfully", folder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<FolderResponse>> deleteFolder(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FolderResponse folder = folderService.deleteFolder(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Folder deleted successfully", folder));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<ApiResponse<FolderResponse>> moveFolder(
            @PathVariable("id") Long id,
            @RequestBody MoveFolderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        FolderResponse folder = folderService.moveFolder(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Folder moved successfully", folder));
    }

    @GetMapping("/{id}/contents")
    public ResponseEntity<ApiResponse<FolderContentsResponse>> getFolderContents(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestHeader("Authorization") String token) {

        FolderContentsResponse contents = folderService.getFolderContents(id, currentUser, token);
        return ResponseEntity.ok(ApiResponse.success("Folder contents retrieved successfully", contents));
    }
}
