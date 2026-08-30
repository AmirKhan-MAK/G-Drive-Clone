package com.clone.drive.service.impl;

import com.clone.drive.exception.BadRequestException;
import com.clone.drive.exception.StorageException;
import com.clone.drive.service.StorageService;
import com.clone.drive.storage.StorageProperties;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public LocalStorageServiceImpl(StorageProperties properties) {
        if (!StringUtils.hasText(properties.getUploadDir())) {
            throw new StorageException("File upload location cannot be empty.");
        }
        this.rootLocation = Paths.get(properties.getUploadDir()).toAbsolutePath().normalize();
    }

    @Override
    public StorageDetail storeFile(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        if (userId == null) {
            throw new BadRequestException("User ID is required for storing file.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file"
        );

        if (originalFilename.contains("..")) {
            throw new BadRequestException("Cannot store file with relative path outside current directory " + originalFilename);
        }

        String storageName = UUID.randomUUID().toString() + "_" + originalFilename;

        try {
            Path userLocation = this.rootLocation.resolve(String.valueOf(userId)).normalize();
            if (!Files.exists(userLocation)) {
                Files.createDirectories(userLocation);
            }

            Path destinationFile = userLocation.resolve(storageName).normalize();

            if (!destinationFile.getParent().equals(userLocation)) {
                throw new StorageException("Cannot store file outside user storage directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return new StorageDetail(storageName, destinationFile.toString());
        } catch (IOException e) {
            throw new StorageException("Failed to store file " + originalFilename, e);
        }
    }
}
