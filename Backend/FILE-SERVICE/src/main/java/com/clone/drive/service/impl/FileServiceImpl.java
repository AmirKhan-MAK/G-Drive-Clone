package com.clone.drive.service.impl;

import com.clone.drive.dto.response.FileResponse;
import com.clone.drive.entity.FileEntity;
import com.clone.drive.entity.FileType;
import com.clone.drive.exception.BadRequestException;
import com.clone.drive.repository.FileRepository;
import com.clone.drive.security.UserPrincipal;
import com.clone.drive.service.FileService;
import com.clone.drive.service.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class FileServiceImpl implements FileService {

	private final FileRepository fileRepository;
	private final StorageService storageService;

	public FileServiceImpl(FileRepository fileRepository, StorageService storageService) {
		this.fileRepository = fileRepository;
		this.storageService = storageService;
	}

	@Override
	@Transactional
	public List<FileResponse> uploadFiles(MultipartFile[] files, Long folderId, UserPrincipal currentUser) {
		if (currentUser == null || currentUser.getUserId() == null) {
			throw new BadRequestException("User authentication details missing.");
		}

		if (files == null || files.length == 0) {
			throw new BadRequestException("Please select at least one file to upload.");
		}

		Long userId = currentUser.getUserId();

		List<FileResponse> responses = new ArrayList<>();

		for (MultipartFile file : files) {
			if (file == null || file.isEmpty()) {
				continue;
			}

			String originalName = StringUtils
					.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");

			String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

			long fileSize = file.getSize();

			StorageService.StorageDetail storageDetail = storageService.storeFile(file, userId);

			FileType fileType = determineFileType(contentType, originalName);

			FileEntity fileEntity = new FileEntity(userId, folderId, originalName, storageDetail.getStorageName(),
					storageDetail.getStoragePath(), contentType, fileType, fileSize);

			FileEntity savedEntity = fileRepository.save(fileEntity);
			responses.add(FileResponse.fromEntity(savedEntity));
		}

		if (responses.isEmpty()) {
			throw new BadRequestException("No valid non-empty files were provided for upload.");
		}

		return responses;
	}

	private FileType determineFileType(String contentType, String originalName) {
		if (contentType != null) {
			String lowerType = contentType.toLowerCase();
			if (lowerType.contains("image"))
				return FileType.IMAGE;
			
			if (lowerType.contains("video"))
				return FileType.VIDEO;
			
			if (lowerType.contains("audio"))
				return FileType.AUDIO;
			
			if (lowerType.contains("pdf"))
				return FileType.PDF;
			
			if (lowerType.contains("zip") || lowerType.contains("tar") || lowerType.contains("rar")
					|| lowerType.contains("7z") || lowerType.contains("gzip"))
				return FileType.ARCHIVE;
			
			if (lowerType.contains("text") || lowerType.contains("json") || lowerType.contains("xml"))
				return FileType.TEXT;
			
			if (lowerType.contains("msword") || lowerType.contains("officedocument") || lowerType.contains("excel")
					|| lowerType.contains("powerpoint"))
				return FileType.DOCUMENT;
		}

		if (originalName != null) {
			String lowerName = originalName.toLowerCase();
			if (lowerName.endsWith(".pdf"))
				return FileType.PDF;
			
			if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png")
					|| lowerName.endsWith(".gif") || lowerName.endsWith(".webp") || lowerName.endsWith(".svg"))
				return FileType.IMAGE;
			
			if (lowerName.endsWith(".mp4") || lowerName.endsWith(".mkv") || lowerName.endsWith(".avi")
					|| lowerName.endsWith(".mov"))
				return FileType.VIDEO;
			
			if (lowerName.endsWith(".mp3") || lowerName.endsWith(".wav") || lowerName.endsWith(".flac")
					|| lowerName.endsWith(".ogg"))
				return FileType.AUDIO;
			
			if (lowerName.endsWith(".zip") || lowerName.endsWith(".rar") || lowerName.endsWith(".7z")
					|| lowerName.endsWith(".tar") || lowerName.endsWith(".gz"))
				return FileType.ARCHIVE;
			
			if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx") || lowerName.endsWith(".xls")
					|| lowerName.endsWith(".xlsx") || lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx"))
				return FileType.DOCUMENT;
			
			if (lowerName.endsWith(".txt") || lowerName.endsWith(".csv") || lowerName.endsWith(".json")
					|| lowerName.endsWith(".md"))
				return FileType.TEXT;
		
		}

		return FileType.OTHER;
	}
}
