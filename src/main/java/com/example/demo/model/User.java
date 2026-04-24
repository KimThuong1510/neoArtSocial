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
    @Size(min = 5, max = 20, message = "Tên đăng nhập phải có độ dài từ 5 đến 20 ký tự.")
    @Pattern(regexp = "^[a-z0-9.]+$", message = "Tên đăng nhập chỉ được phép chứa chữ cái thường, số và dấu chấm.")
    private String username;

    @Column(nullable = false)
    @Size(min = 3, max = 30, message = "Biệt danh phải có độ dài từ 3 đến 30 ký tự.")
    @Pattern(regexp = "^[a-zA-Z0-9_ ]+$", message = "Biệt danh chỉ được phép chứa chữ cái, số, khoảng trắng và dấu gạch dưới.")
    private String nickname;

    @Column(nullable = false)
    @Past(message = "Ngày sinh phải nằm trong quá khứ.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    @Column(nullable = false)
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự.")
    private String password;

    @jakarta.persistence.Transient
    private String confirmPassword;

    private String avatar;

    @AssertTrue(message = "Người dùng phải đủ ít nhất 18 tuổi.")
    public boolean isAdult() {
        if (birthDate == null)
            return true;
        return Period.between(birthDate, LocalDate.now()).getYears() >= 18;
    }

    @AssertTrue(message = "Mật khẩu không được chứa tên đăng nhập.")
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


}
