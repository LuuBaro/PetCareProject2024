package com.example.petcareproject.Services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    @Lazy
    private final UserService userService;

    @Autowired
    public EmailService(JavaMailSender mailSender, UserService userService) {
        this.mailSender = mailSender;
        this.userService = userService;
    }


    public void send(MimeMessage message) throws MessagingException {
        mailSender.send(message);
    }
    public void sendEmail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true); // Nội dung email có thể có HTML

        mailSender.send(message);
    }


   // Kiểm tra email có tồn tại trong hệ thống không
   public boolean checkIfEmailExists(String email) {
        return userService.checkIfEmailExists(email); // Gọi phương thức kiểm tra email từ UserService
    }
    public MimeMessage createMimeMessage() {
        return mailSender.createMimeMessage();
    }


}

