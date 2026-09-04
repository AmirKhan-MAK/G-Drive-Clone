package com.clone.drive.client;

import com.clone.drive.dto.response.ApiResponse;
import com.clone.drive.dto.response.FileDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "FILE-SERVICE")
public interface FileClient {

    @GetMapping("/api/files")
    ApiResponse<List<FileDto>> getFilesByFolderId(
            @RequestParam("folderId") Long folderId,
            @RequestHeader("Authorization") String token
    );
}
