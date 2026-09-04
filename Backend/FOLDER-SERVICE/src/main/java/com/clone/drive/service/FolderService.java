package com.clone.drive.service;

import com.clone.drive.dto.request.CreateFolderRequest;
import com.clone.drive.dto.request.MoveFolderRequest;
import com.clone.drive.dto.request.RenameFolderRequest;
import com.clone.drive.dto.response.FolderContentsResponse;
import com.clone.drive.dto.response.FolderDetailsResponse;
import com.clone.drive.dto.response.FolderResponse;
import com.clone.drive.security.UserPrincipal;

import java.util.List;

public interface FolderService {

    FolderResponse createFolder(CreateFolderRequest request, UserPrincipal currentUser);

    List<FolderResponse> getRootFolders(UserPrincipal currentUser);

    FolderDetailsResponse getFolderDetails(Long folderId, UserPrincipal currentUser);

    FolderResponse renameFolder(Long folderId, RenameFolderRequest request, UserPrincipal currentUser);

    FolderResponse deleteFolder(Long folderId, UserPrincipal currentUser);

    FolderResponse moveFolder(Long folderId, MoveFolderRequest request, UserPrincipal currentUser);

    FolderContentsResponse getFolderContents(Long folderId, UserPrincipal currentUser, String token);
}
