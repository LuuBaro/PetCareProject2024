package com.example.petcareproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserUpdateDTO {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private Date registrationDate;
    private double totalSpent;
    private boolean status;
    private String imageUrl;
}
