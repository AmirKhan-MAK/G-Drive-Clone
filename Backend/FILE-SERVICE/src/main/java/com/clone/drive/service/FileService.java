package com.clone.drive.service;

import com.clone.drive.dto.response.FileResponse;
import com.clone.drive.entity.FileEntity;
import com.clone.drive.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {

    List<FileResponse> uploadFiles(MultipartFile[] files, Long folderId, UserPrincipal currentUser);
    
    List<FileResponse> getAllFiles(UserPrincipal currentUser);
    
    FileEntity getFileForDownload(Long fileId, UserPrincipal currentUser);
}
