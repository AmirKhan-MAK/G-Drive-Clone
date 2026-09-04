package com.clone.drive.mapper;

import com.clone.drive.dto.request.CreateFolderRequest;
import com.clone.drive.dto.response.FolderBreadcrumbResponse;
import com.clone.drive.dto.response.FolderResponse;
import com.clone.drive.entity.FolderEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class FolderMapper {

    /**
     * Maps CreateFolderRequest DTO & userId to FolderEntity.
     */
    public FolderEntity toEntity(CreateFolderRequest request, Long userId) {
        if (request == null) {
            return null;
        }
        return new FolderEntity(userId, request.getParentFolderId(), request.getName());
    }

    /**
     * Maps FolderEntity to FolderResponse DTO.
     */
    public FolderResponse toResponse(FolderEntity entity) {
        if (entity == null) {
            return null;
        }
        return new FolderResponse(
                entity.getId(),
                entity.getUserId(),
                entity.getParentFolderId(),
                entity.getName(),
                entity.getIsDeleted(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    /**
     * Maps a list of FolderEntity to a list of FolderResponse DTOs.
     */
    public List<FolderResponse> toResponseList(List<FolderEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Maps FolderEntity to FolderBreadcrumbResponse DTO.
     */
    public FolderBreadcrumbResponse toBreadcrumb(FolderEntity entity) {
        if (entity == null) {
            return null;
        }
        return new FolderBreadcrumbResponse(entity.getId(), entity.getName());
    }

    /**
     * Maps a list of FolderEntity to a list of FolderBreadcrumbResponse DTOs.
     */
    public List<FolderBreadcrumbResponse> toBreadcrumbList(List<FolderEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(this::toBreadcrumb)
                .collect(Collectors.toList());
    }
}
