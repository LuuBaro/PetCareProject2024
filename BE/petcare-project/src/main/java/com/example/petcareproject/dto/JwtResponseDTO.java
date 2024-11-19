package com.example.petcareproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtResponseDTO {
    private String accessToken;
    private Long userId;
    private String fullName; // Add this field
    private String roleName;
    private String errorMessage; // Trường mới để chứa thông tin lỗi
    private String phone;
    private String email;
}