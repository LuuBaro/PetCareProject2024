package com.example.petcareproject.Controller;


import com.example.petcareproject.Model.User;
import com.example.petcareproject.Services.EmailService;
import com.example.petcareproject.Services.JwtService;
import com.example.petcareproject.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final EmailService emailService;
    private final UserService userService;


    // Map to store tokens temporarily for validation (In production, you should use a database or Redis)
    private Map<String, String> resetTokens = new HashMap<>();

    public PasswordResetController(EmailService emailService, UserService userService) {
        this.emailService = emailService;
        this.userService = userService;
    }

    // Endpoint to send reset password email
    @PostMapping("/sendemail-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");

        // Check if the email exists in the system
        if (!emailService.checkIfEmailExists(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with this email");
        }

        try {
            // Generate reset token
            String resetToken = UUID.randomUUID().toString();
            resetTokens.put(resetToken, email); // Store the token temporarily

            // Generate reset link
            String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

            // Send email with the reset link
            emailService.sendEmail(
                    email,
                    "Reset Your Password",
                    "<p>Hello,</p>" +
                            "<p>Click the link below to reset your password:</p>" +
                            "<a href='" + resetLink + "'>Reset Password</a>"
            );

            return ResponseEntity.ok("Reset password link sent to your email");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email");
        }
    }

    // Endpoint to reset the password
    @PostMapping("/reset-sendmailpassword")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> requestBody) {
        String token = requestBody.get("token");
        String newPassword = requestBody.get("newPassword");

        // Validate token
        String email = resetTokens.get(token);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
        }

        // Find user by email
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        // Update the password
        try {
            userService.changePassword(user.getUserId(), newPassword);
            // Remove the token after successful password reset
            resetTokens.remove(token);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reset password");
        }
    }

}