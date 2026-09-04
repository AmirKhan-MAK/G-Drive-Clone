package com.clone.drive.service.impl;

import com.clone.drive.client.FileClient;
import com.clone.drive.dto.request.CreateFolderRequest;
import com.clone.drive.dto.request.MoveFolderRequest;
import com.clone.drive.dto.request.RenameFolderRequest;
import com.clone.drive.dto.response.*;
import com.clone.drive.entity.FolderEntity;
import com.clone.drive.exception.BadRequestException;
import com.clone.drive.exception.FolderNotFoundException;
import com.clone.drive.exception.OwnershipViolationException;
import com.clone.drive.mapper.FolderMapper;
import com.clone.drive.repository.FolderRepository;
import com.clone.drive.security.UserPrincipal;
import com.clone.drive.service.FolderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class FolderServiceImpl implements FolderService {

    private final FolderRepository folderRepository;
    private final FolderMapper folderMapper;
    private final FileClient fileClient;

    public FolderServiceImpl(FolderRepository folderRepository, FolderMapper folderMapper, FileClient fileClient) {
        this.folderRepository = folderRepository;
        this.folderMapper = folderMapper;
        this.fileClient = fileClient;
    }

    @Override
    @Transactional
    public FolderResponse createFolder(CreateFolderRequest request, UserPrincipal currentUser) {
        validateCurrentUser(currentUser);

        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new BadRequestException("Folder name must not be empty.");
        }

        String folderName = request.getName().trim();
        Long userId = currentUser.getUserId();
        Long parentFolderId = request.getParentFolderId();

        if (parentFolderId != null) {
            FolderEntity parentFolder = folderRepository.findByIdAndIsDeletedFalse(parentFolderId)
                    .orElseThrow(() -> new FolderNotFoundException("Parent folder not found with id: " + parentFolderId));

            if (!parentFolder.getUserId().equals(userId)) {
                throw new OwnershipViolationException("Access denied: You do not own the target parent folder.");
            }
        }

        if (folderRepository.existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(userId, parentFolderId, folderName)) {
            throw new BadRequestException("A folder named '" + folderName + "' already exists in this location.");
        }

        FolderEntity folderEntity = folderMapper.toEntity(request, userId);
        folderEntity.setName(folderName);
        FolderEntity savedEntity = folderRepository.save(folderEntity);

        return folderMapper.toResponse(savedEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getRootFolders(UserPrincipal currentUser) {
        validateCurrentUser(currentUser);
        Long userId = currentUser.getUserId();

        List<FolderEntity> rootFolders = folderRepository.findByUserIdAndParentFolderIdIsNullAndIsDeletedFalse(userId);
        return folderMapper.toResponseList(rootFolders);
    }

    @Override
    @Transactional(readOnly = true)
    public FolderDetailsResponse getFolderDetails(Long folderId, UserPrincipal currentUser) {
        validateCurrentUser(currentUser);
        FolderEntity folder = getFolderAndValidateOwnership(folderId, currentUser.getUserId());

        List<FolderEntity> breadcrumbsList = new ArrayList<>();
        FolderEntity current = folder;
        while (current != null) {
            breadcrumbsList.add(current);
            if (current.getParentFolderId() != null) {
                current = folderRepository.findByIdAndIsDeletedFalse(current.getParentFolderId()).orElse(null);
            } else {
                current = null;
            }
        }
        Collections.reverse(breadcrumbsList);

        FolderResponse folderResponse = folderMapper.toResponse(folder);
        List<FolderBreadcrumbResponse> breadcrumbResponses = folderMapper.toBreadcrumbList(breadcrumbsList);

        return new FolderDetailsResponse(folderResponse, breadcrumbResponses);
    }

    @Override
    @Transactional
    public FolderResponse renameFolder(Long folderId, RenameFolderRequest request, UserPrincipal currentUser) {
        validateCurrentUser(currentUser);

        if (request == null || !StringUtils.hasText(request.getName())) {
            throw new BadRequestException("New folder name must not be empty.");
        }

        FolderEntity folder = getFolderAndValidateOwnership(folderId, currentUser.getUserId());
        String newName = request.getName().trim();

        if (folder.getName().equals(newName)) {
            return folderMapper.toResponse(folder);
        }

        if (folderRepository.existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(
                currentUser.getUserId(), folder.getParentFolderId(), newName)) {
            throw new BadRequestException("A folder named '" + newName + "' already exists in this location.");
        }

        folder.setName(newName);
        FolderEntity updatedFolder = folderRepository.save(folder);

        return folderMapper.toResponse(updatedFolder);
    }

    @Override
    @Transactional
    public FolderResponse deleteFolder(Long folderId, UserPrincipal currentUser) {
        validateCurrentUser(currentUser);
        FolderEntity folder = getFolderAndValidateOwnership(folderId, currentUser.getUserId());

        folder.setIsDeleted(true);
        FolderEntity deletedFolder = folderRepository.save(folder);

        softDeleteSubfoldersRecursively(folderId);

        return folderMapper.toResponse(deletedFolder);
    }

    @Override
    @Transactional
    public FolderResponse moveFolder(Long folderId, MoveFolderRequest request, UserPrincipal currentUser) {
        validateCurrentUser(currentUser);
        FolderEntity folder = getFolderAndValidateOwnership(folderId, currentUser.getUserId());

        Long targetParentFolderId = request != null ? request.getTargetParentFolderId() : null;

        if (folderId.equals(targetParentFolderId)) {
            throw new BadRequestException("Cannot move folder into itself.");
        }

        if (targetParentFolderId != null) {
            FolderEntity targetParent = getFolderAndValidateOwnership(targetParentFolderId, currentUser.getUserId());

            // Cycle check: verify targetParent is not a child/descendant of folder
            FolderEntity checkCurrent = targetParent;
            while (checkCurrent != null) {
                if (folderId.equals(checkCurrent.getId())) {
                    throw new BadRequestException("Cannot move folder into one of its own subdirectories.");
                }
                if (checkCurrent.getParentFolderId() != null) {
                    checkCurrent = folderRepository.findByIdAndIsDeletedFalse(checkCurrent.getParentFolderId()).orElse(null);
                } else {
                    checkCurrent = null;
                }
            }
        }

        if (folderRepository.existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(
                currentUser.getUserId(), targetParentFolderId, folder.getName())) {
            throw new BadRequestException("A folder named '" + folder.getName() + "' already exists in the target destination.");
        }

        folder.setParentFolderId(targetParentFolderId);
        FolderEntity movedFolder = folderRepository.save(folder);

        return folderMapper.toResponse(movedFolder);
    }

    @Override
    @Transactional(readOnly = true)
    public FolderContentsResponse getFolderContents(Long folderId, UserPrincipal currentUser, String token) {
        validateCurrentUser(currentUser);
        FolderEntity currentFolder = getFolderAndValidateOwnership(folderId, currentUser.getUserId());

        List<FolderEntity> subfolders = folderRepository.findByUserIdAndParentFolderIdAndIsDeletedFalse(
                currentUser.getUserId(), folderId);

        List<FileDto> files = Collections.emptyList();
        try {
            ApiResponse<List<FileDto>> response = fileClient.getFilesByFolderId(folderId, token);
            if (response != null && response.isSuccess() && response.getData() != null) {
                files = response.getData();
            }
        } catch (Exception e) {
            // Logging can be added here; fallback to empty files list if file service is temporarily unavailable
            files = Collections.emptyList();
        }

        FolderResponse folderResponse = folderMapper.toResponse(currentFolder);
        List<FolderResponse> subfolderResponses = folderMapper.toResponseList(subfolders);

        return new FolderContentsResponse(folderResponse, subfolderResponses, files);
    }

    private void softDeleteSubfoldersRecursively(Long parentFolderId) {
        List<FolderEntity> childFolders = folderRepository.findByParentFolderIdAndIsDeletedFalse(parentFolderId);
        for (FolderEntity child : childFolders) {
            child.setIsDeleted(true);
            folderRepository.save(child);
            softDeleteSubfoldersRecursively(child.getId());
        }
    }

    private FolderEntity getFolderAndValidateOwnership(Long folderId, Long userId) {
        FolderEntity folder = folderRepository.findByIdAndIsDeletedFalse(folderId)
                .orElseThrow(() -> new FolderNotFoundException("Folder not found with id: " + folderId));

        if (!folder.getUserId().equals(userId)) {
            throw new OwnershipViolationException("Access denied: You do not own this folder.");
        }

        return folder;
    }

    private void validateCurrentUser(UserPrincipal currentUser) {
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new BadRequestException("User authentication details missing.");
        }
    }
}
