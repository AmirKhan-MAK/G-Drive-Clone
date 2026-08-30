package com.clone.drive.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StorageDetail storeFile(MultipartFile file, Long userId);

    class StorageDetail {
        private final String storageName;
        private final String storagePath;

        public StorageDetail(String storageName, String storagePath) {
            this.storageName = storageName;
            this.storagePath = storagePath;
        }

        public String getStorageName() {
            return storageName;
        }

        public String getStoragePath() {
            return storagePath;
        }
    }
}
