package com.example.petcareproject.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.Set;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    private String email;
    private String password;

    @Column(name = "fullName", columnDefinition = "NVARCHAR(255)")
    private String fullName;
    private String phone;
    private Date registrationDate;
    private double totalSpent;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "userId"),
            inverseJoinColumns = @JoinColumn(name = "roleId")
    )
    private Set<Role> userRoles; // Hoặc List<Role>

    // Constructor mặc định (để JPA có thể sử dụng)
    public User() {
    }

    // Constructor mới cho việc tạo người dùng từ Facebook
    public User(String email, String fullName) {
        this.email = email;
        this.fullName = fullName;
        this.password = ""; // Hoặc để trống
    }
}
