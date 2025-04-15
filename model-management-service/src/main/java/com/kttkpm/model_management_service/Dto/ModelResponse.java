package com.kttkpm.model_management_service.Dto;

import com.kttkpm.model_management_service.Entity.ModelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// DTO trả về cho client, chỉ chứa các thông tin cần thiết
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Thêm Builder
public class ModelResponse {
    private Long id;
    private String name;
    private String version;
    private ModelType type;
    private String modelPath;
    private String description;
    private LocalDateTime trainedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
