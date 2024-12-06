package com.example.petcareproject.Services;

import com.example.petcareproject.Model.Role;
import com.example.petcareproject.Model.User;
import com.example.petcareproject.Model.UserRole;
import com.example.petcareproject.Repository.RoleRepository;
import com.example.petcareproject.Repository.UserRepository;
import com.example.petcareproject.Repository.UserRoleRepository;
import com.example.petcareproject.dto.UserUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, UserRoleRepository userRoleRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), new ArrayList<>());
    }

    public void saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Mã hóa mật khẩu trước khi lưu
        user.setStatus(true); // Đặt trạng thái mặc định là true khi tạo
        userRepository.save(user);

        // Gán vai trò mặc định "Người dùng" nếu không có vai trò nào được chỉ định
        Role defaultRole = roleRepository.findByRoleName("Người dùng");
        if (defaultRole != null) {
            assignRoleToUser(user, defaultRole);
        }
    }

    public void save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public User updateUser(Long userId, UserUpdateDTO updateUserRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(updateUserRequest.getFullName());
        user.setPhone(updateUserRequest.getPhone());
        user.setEmail(updateUserRequest.getEmail());
        user.setStatus(updateUserRequest.isStatus());
        user.setImageUrl(updateUserRequest.getImageUrl());


        if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isEmpty()) {
            String encodedPassword = passwordEncoder.encode(updateUserRequest.getPassword());
            user.setPassword(encodedPassword); // Lưu mật khẩu mã hóa
        }

        // Lưu thông tin người dùng đã cập nhật
        return userRepository.save(user);
    }




    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> System.out.println("User: " + user.getFullName() + ", Status: " + user.isStatus()));
        return users;
    }


    public void delete(User user) {
        userRepository.delete(user); // Xóa người dùng
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void assignRoleToUser(User user, Role role) {
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);
    }

    public String getUserRole(User user) {
        UserRole userRole = userRoleRepository.findByUser(user);
        if (userRole != null) {
            return userRole.getRole().getRoleName();
        }
        return null;
    }

    public User findByUserUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null); // Tìm người dùng theo ID
    }

    public boolean checkIfEmailExists(String email) {
        User user = userRepository.findByEmail(email);
        return user != null;  // Kiểm tra nếu user khác null, có nghĩa là email tồn tại
    }


    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword)); // Mã hóa mật khẩu mới
        userRepository.save(user); // Lưu lại thay đổi
    }



}
