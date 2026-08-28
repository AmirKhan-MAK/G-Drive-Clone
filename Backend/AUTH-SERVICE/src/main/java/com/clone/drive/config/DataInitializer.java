package com.clone.drive.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // Role initialization not needed as Role is now a Java Enum (ROLE_USER, ROLE_ADMIN)
    }
}
