package com.clone.drive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class FolderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FolderServiceApplication.class, args);
	}

}
