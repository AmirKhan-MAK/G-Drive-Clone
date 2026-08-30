package com.clone.drive.mapper;

import com.clone.drive.dto.request.RegisterRequest;
import com.clone.drive.dto.response.RegisterResponse;
import com.clone.drive.dto.response.UserDto;
import com.clone.drive.dto.response.UserProfileResponse;
import com.clone.drive.entity.Role;
import com.clone.drive.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request, String encodedPassword) {
        if (request == null) {
            return null;
        }
        return new User(
                request.getName(),
                request.getEmail(),
                encodedPassword,
                Role.ROLE_USER
        );
    }

    public RegisterResponse toRegisterResponse(User user) {
        if (user == null) {
            return null;
        }
        return new RegisterResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    public UserDto toUserDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : Role.ROLE_USER.name()
        );
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? Collections.singletonList(user.getRole().name()) : Collections.singletonList(Role.ROLE_USER.name()),
                user.getCreatedAt()
        );
    }
}
