package com.example.petcareproject.Controller;

import com.example.petcareproject.Model.User;
import com.example.petcareproject.dto.AuthRequestDTO;
import com.example.petcareproject.dto.FacebookUserDTO;
import com.example.petcareproject.dto.JwtResponseDTO;
import com.example.petcareproject.Services.JwtService;
import com.example.petcareproject.Services.UserService;
import com.example.petcareproject.dto.RegisterRequestDTO;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.gson.JsonObject;
import com.restfb.DefaultFacebookClient;
import com.restfb.FacebookClient;
import com.restfb.Version;
import com.restfb.exception.FacebookOAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    private static final JacksonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final String GOOGLE_CLIENT_ID = "854614351620-s8cmgi8ticqj4p2jlqedf4drbis3s7oj.apps.googleusercontent.com"; // Thay bằng client ID của bạn


    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequestDTO registerRequest) {
        try {
            User newUser = new User();
            newUser.setEmail(registerRequest.getEmail());
            newUser.setPassword(registerRequest.getPassword()); // Ensure to hash the password
            newUser.setFullName(registerRequest.getFullName());

            userService.saveUser(newUser);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    // AuthController.java
    @PostMapping("/login")
    public JwtResponseDTO login(@RequestBody AuthRequestDTO authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userService.findByEmail(authRequest.getEmail());
        String jwt = jwtService.generateToken(userService.loadUserByUsername(authRequest.getEmail()), user.getUserId());

        return JwtResponseDTO.builder()
                .accessToken(jwt)
                .userId(user.getUserId()) // Chuyển đổi userId từ long sang String
                .fullName(String.valueOf(user.getFullName())) // Ép kiểu fullName về String
                .roleName(userService.getUserRole(user))
                .phone(user.getPhone())
                .email(user.getEmail())
                .build();

    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> requestBody) {
        try {
            // Lấy token từ JSON body
            String token = requestBody.get("token");
            System.out.println("Received token: " + token); // Ghi log token nhận được

            // Khởi tạo GoogleIdTokenVerifier
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JSON_FACTORY)
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID)) // Thay bằng client ID của bạn
                    .build();

            // Xác thực và parse token
            GoogleIdToken googleIdToken = verifier.verify(token);
            if (googleIdToken != null) {
                GoogleIdToken.Payload payload = googleIdToken.getPayload();

                String email = payload.getEmail();
                String fullName = (String) payload.get("name"); // Lấy fullName từ payload
                String picture = (String) payload.get("picture"); // Lấy avatar từ Google, nếu cần

                // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
                User user = userService.findByEmail(email);

                if (user == null) {
                    // Nếu người dùng chưa tồn tại, tạo một tài khoản mới
                    user = new User();
                    user.setEmail(email);
                    user.setFullName(fullName); // Cập nhật với thông tin từ Google
//                    user.setAvatarUrl(picture); // Nếu bạn muốn lưu ảnh đại diện từ Google
                    user.setPassword("");
                    userService.saveUser(user); // Lưu thông tin người dùng mới vào database
                }


                // Tạo đối tượng Authentication mà không cần password
                Authentication authentication = new PreAuthenticatedAuthenticationToken(
                        userService.loadUserByUsername(email), // principal
                        null // không cần mật khẩu
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Tạo JWT token
                String jwt = jwtService.generateToken(userService.loadUserByUsername(email), user.getUserId());

                JwtResponseDTO response = JwtResponseDTO.builder()
                        .accessToken(jwt)
                        .userId(user.getUserId()) // Chuyển đổi userId từ long sang String
                        .fullName(user.getFullName())
                        .roleName(userService.getUserRole(user)) // Lấy vai trò của user, nếu có
                        .email(user.getEmail())
                        .build();

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid ID token. Token could not be verified.");
            }
        } catch (Exception e) {
            e.printStackTrace(); // Ghi log lỗi
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/facebook-login")
    public ResponseEntity<?> facebookLogin(@RequestBody FacebookUserDTO facebookUserDTO) {
        // Lấy accessToken từ yêu cầu
        String accessToken = facebookUserDTO.getAccessToken();

        // Log thông tin người dùng để kiểm tra
        System.out.println("Facebook User DTO: " + facebookUserDTO);

        try {
            // Kiểm tra nếu accessToken là null hoặc rỗng
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Access token cannot be null or empty."));
            }

            // Khởi tạo FacebookClient để xác thực token
            FacebookClient facebookClient = new DefaultFacebookClient(accessToken, Version.LATEST);

            // Không cần gọi lại, đã có thông tin trong facebookUserDTO
            String email = facebookUserDTO.getEmail();
            String fullName = facebookUserDTO.getName();

            // Log thông tin người dùng
            System.out.println("Facebook User: " + facebookUserDTO);

            // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
            User user = userService.findByEmail(email);

            if (user == null) {
                // Nếu người dùng chưa tồn tại, tạo một tài khoản mới
                user = new User();
                user.setEmail(email); // Có thể để trống nếu không có email
                user.setFullName(fullName);
                user.setPassword(""); // Không cần mật khẩu cho Facebook
                userService.saveUser(user); // Lưu thông tin người dùng mới vào database

            }

            // Tạo JWT token
            String jwt = jwtService.generateToken(userService.loadUserByUsername(user.getEmail()), user.getUserId());

            JwtResponseDTO response = JwtResponseDTO.builder()
                    .accessToken(jwt)
                    .userId(user.getUserId())
                    .fullName(user.getFullName())
                    .roleName(userService.getUserRole(user))
                    .email(user.getEmail())
                    .build();

            return ResponseEntity.ok(response);

        } catch (FacebookOAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid access token."));
        } catch (Exception e) {
            e.printStackTrace(); // In chi tiết lỗi ra console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }


}