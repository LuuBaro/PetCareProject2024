package com.example.petcareproject.Services;


import com.example.petcareproject.dto.RegisterRequestDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Map<String, RegisterRequestDTO> registrationRequests = new HashMap<>();
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> otpExpiryStorage = new ConcurrentHashMap<>();
    private final int OTP_EXPIRATION_MINUTES = 1;

    @Autowired
    private EmailService emailService;

    @Async
    public void generateOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(899999) + 100000); // Tạo OTP ngẫu nhiên 6 chữ số
        otpStorage.put(email, otp);
        otpExpiryStorage.put(email, LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));

        // Gửi OTP qua email
        sendOtpEmail(email, otp);
    }
    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            return false;
        }

        LocalDateTime expiryTime = otpExpiryStorage.get(email);
        if (expiryTime != null && LocalDateTime.now().isAfter(expiryTime)) {
            clearOtp(email);
            return false;
        }
        return true;
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
        otpExpiryStorage.remove(email);
    }

    public void saveRegistrationRequest(RegisterRequestDTO request) {
        registrationRequests.put(request.getEmail(), request);
    }

    public RegisterRequestDTO getRegistrationRequest(String email) {
        return registrationRequests.get(email);
    }

    public void removeRegistrationRequest(String email) {
        registrationRequests.remove(email);
    }

//    private void sendOtpEmail(String email, String otp) {
//        String subject = "Your OTP Code - PetCare";
//        String message = buildOtpEmailContent(otp);
//        emailService.sendEmail(email, subject, message);
//    }

    public void sendOtpEmail(String email, String otp) {
        MimeMessage message = emailService.createMimeMessage();
        MimeMessageHelper helper;

        try {
            helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Mã Xác Thực OTP từ PetCare");

            // Tạo URL chứa mã OTP
            String otpLink = "http://localhost:5173/otp-verification?email=" + email + "&otp=" + otp;

            // Nội dung email
            String emailBody = """
            <div style='background-color: #f4f4f4; padding: 20px;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; 
                            border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);'>
                    <div style='background-color: #00b7c0; padding: 15px; text-align: center;'>
                        <h1 style='color: #ffffff; font-family: Arial, sans-serif;'>PetCare</h1>
                    </div>
                    <div style='padding: 20px; font-family: Arial, sans-serif;'>
                        <h2>Xin chào,</h2>
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của <strong>PetCare</strong>.</p>
                        <p>Mã OTP của bạn là:</p>
                        <div style='text-align: center; margin: 20px 0;'>
                            <a href='%s' style='font-size: 24px; font-weight: bold; color: #00b7c0;'>%s</a>
                        </div>
                        <p>Mã OTP có giá trị trong <strong>%d phút</strong>.</p>
                        <p>Trân trọng cảm ơn,<br>PetCare</p>
                    </div>
                </div>
            </div>
        """.formatted(otpLink, otp, OTP_EXPIRATION_MINUTES);

            helper.setText(emailBody, true);
            emailService.send(message);
        } catch (MessagingException e) {
            System.err.println("Error sending OTP email: " + e.getMessage());
        }
    }





}

