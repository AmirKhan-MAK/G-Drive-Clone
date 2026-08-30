package com.clone.drive.service;

import com.clone.drive.dto.response.FileResponse;
import com.clone.drive.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {

    List<FileResponse> uploadFiles(MultipartFile[] files, Long folderId, UserPrincipal currentUser);
}
