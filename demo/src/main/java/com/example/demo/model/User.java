package com.example.demo.model;

import java.time.LocalDate;
import java.time.Period;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Size(min = 5, max = 20, message = "Username must be between 5 and 20 characters")
    @Pattern(regexp = "^[a-z0-9.]+$", message = "Username must contain only lowercase letters, numbers, and dots")
    private String username;

    @Column(nullable = false)
    @Size(min = 3, max = 30, message = "Nickname must be between 3 and 30 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_ ]+$", message = "Nickname must contain only letters, numbers, spaces, and underscores")
    private String nickname;

    @Column(nullable = false)
    @NotNull(message = "Birthdate is required")
    @Past(message = "Birthdate must be in the past")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    @Column(nullable = false)
    @Size(min = 6, message = "Password must be at least 6 characters")
    // @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).*$",
    // message = "Password must contain at least one uppercase letter, one lowercase
    // letter, one number, and one special character")
    private String password;

    @jakarta.persistence.Transient
    private String confirmPassword;

    private String avatar;

    @AssertTrue(message = "User must be at least 18 years old")
    public boolean isAdult() {
        if (birthDate == null)
            return true;
        return Period.between(birthDate, LocalDate.now()).getYears() >= 18;
    }

    @AssertTrue(message = "Password cannot contain the username")
    public boolean isPasswordSafe() {
        if (username == null || password == null)
            return true;
        return !password.contains(username);
    }

    @Column(nullable = false)
    private String role;

    @Column(name = "created_at", updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private java.time.LocalDateTime createdAt;

    @Column(name = "last_login_time")
    private java.time.LocalDateTime lastLoginTime;

    @Column(name = "last_logout_time")
    private java.time.LocalDateTime lastLogoutTime;
}
