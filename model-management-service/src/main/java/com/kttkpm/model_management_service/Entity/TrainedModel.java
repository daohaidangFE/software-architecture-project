package com.kttkpm.model_management_service.Entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trained_models")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainedModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String version;

    @Enumerated(EnumType.STRING) // Lưu tên Enum (REGION_DETECTOR, ...) thay vì số thứ tự
    @Column(nullable = false)
    private ModelType type;

    @Column(name = "model_path", nullable = false, length = 255)
    private String modelPath; // Đường dẫn tới file model đã lưu

    @Lob // Cho phép lưu text dài
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "trained_at")
    private LocalDateTime trainedAt; // Thời điểm huấn luyện

    @Enumerated(EnumType.STRING) // Lưu tên Enum vào DB
    @Column(nullable = false, length = 20)
    private ModelStatus status; // Giá trị mặc định là PENDING

    @CreationTimestamp // Tự động gán thời gian tạo
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Tự động gán thời gian cập nhật
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
