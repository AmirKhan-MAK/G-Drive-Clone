package com.clone.drive.repository;

import com.clone.drive.entity.FolderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<FolderEntity, Long> {

    Optional<FolderEntity> findByIdAndIsDeletedFalse(Long id);

    Optional<FolderEntity> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    List<FolderEntity> findByUserIdAndParentFolderIdIsNullAndIsDeletedFalse(Long userId);

    List<FolderEntity> findByUserIdAndParentFolderIdAndIsDeletedFalse(Long userId, Long parentFolderId);

    List<FolderEntity> findByParentFolderIdAndIsDeletedFalse(Long parentFolderId);

    boolean existsByUserIdAndParentFolderIdAndNameAndIsDeletedFalse(Long userId, Long parentFolderId, String name);
}
