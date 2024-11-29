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
            String emailContent = generateForgotPasswordEmailContent(email, resetLink);
            emailService.sendEmail(email, "Yêu Cầu Đặt Lại Mật Khẩu từ PetCare", emailContent);

            return ResponseEntity.ok("Reset password link sent to your email");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email");
        }
    }

    private String generateForgotPasswordEmailContent(String userName, String resetLink) {
        return new StringBuilder()
                .append("<div style='background-color: #f4f4f4; padding: 20px;'>")
                .append("<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);'>")
                .append("<div style='background-color: #00b7c0; padding: 15px; text-align: center;'>")
                .append("<h1 style='color: #ffffff; font-family: Arial, sans-serif;'>PetCare</h1>")
                .append("</div>")
                .append("<div style='padding: 20px; font-family: Arial, sans-serif;'>")
                .append("<h2>Kính gửi Quý khách ").append(userName).append(",</h2>")
                .append("<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ tài khoản của Quý khách.</p>")
                .append("<p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>")
                .append("<a href='").append(resetLink).append("' style='display: inline-block; background-color: #00b7c0; color: #ffffff; padding: 10px 20px; border-radius: 5px; text-decoration: none;'>Đặt lại mật khẩu</a>")
                .append("<p>Nếu liên kết trên không hoạt động, vui lòng sao chép và dán URL sau vào trình duyệt:</p>")
                .append("<p>").append(resetLink).append("</p>")
                .append("<p>Nếu Quý khách không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>")
                .append("<p>Trân trọng,<br>PetCare<br>Thành phố Cần Thơ<br>Hotline: 0987654321</p>")
                .append("</div>")
                .append("</div>")
                .append("</div>")
                .toString();
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