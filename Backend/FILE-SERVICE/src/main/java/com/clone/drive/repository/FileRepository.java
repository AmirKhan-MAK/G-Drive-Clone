package com.clone.drive.repository;

import com.clone.drive.entity.FileEntity;
import com.clone.drive.entity.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    List<FileEntity> findByUserIdAndIsDeletedFalse(Long userId);

    List<FileEntity> findByUserIdAndFolderIdAndIsDeletedFalse(Long userId, Long folderId);

    List<FileEntity> findByUserIdAndFolderIdIsNullAndIsDeletedFalse(Long userId);

    Optional<FileEntity> findByIdAndUserId(Long id, Long userId);

    Optional<FileEntity> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    List<FileEntity> findByUserIdAndFileTypeAndIsDeletedFalse(Long userId, FileType fileType);

    List<FileEntity> findByUserIdAndIsFavoriteTrueAndIsDeletedFalse(Long userId);

    List<FileEntity> findByUserIdAndIsDeletedTrue(Long userId);

    Long countByFolderIdAndIsDeletedFalse(Long folderId);
}
