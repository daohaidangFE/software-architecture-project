package com.kttkpm.employee_management_service.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employees") // Chỉ định tên bảng
@Data // Lombok: getters, setters, toString,...
@NoArgsConstructor
@AllArgsConstructor
@Builder // Lombok: Builder pattern
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID tự tăng
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String department;

    @Enumerated(EnumType.STRING) // Lưu enum dạng String
    @Column(nullable = false, length = 20)
    private EmployeeStatus status;

    @CreationTimestamp // Tự động gán khi tạo mới
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Tự động gán khi cập nhật
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}