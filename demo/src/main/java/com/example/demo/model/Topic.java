package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "topics")
@Data
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Mã chủ đề dùng trong code (ví dụ: BEAUTY, NATURE, ART)
     */
    @Column(nullable = false, unique = true)
    private String code;

    /**
     * Tên hiển thị cho người dùng (ví dụ: "Sắc đẹp", "Thiên nhiên", "Nghệ thuật")
     */
    @Column(nullable = false)
    private String name;

    /**
     * Chỉ số màu (1-7) dùng cho frontend
     */
    @Column(nullable = false)
    private Integer badge = 1;
}
