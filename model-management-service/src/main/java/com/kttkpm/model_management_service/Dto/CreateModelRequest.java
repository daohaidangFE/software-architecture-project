package com.kttkpm.model_management_service.Dto;

import com.kttkpm.model_management_service.Entity.ModelType;
import jakarta.validation.constraints.NotBlank; // Sử dụng jakarta validation
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// DTO nhận vào khi tạo mới model
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Thêm Builder
public class CreateModelRequest {

    @NotBlank(message = "Model name cannot be blank")
    @Size(max = 100, message = "Model name must be less than or equal to 100 characters")
    private String name;

    @Size(max = 50, message = "Model version must be less than or equal to 50 characters")
    private String version;

    @NotNull(message = "Model type cannot be null")
    private ModelType type;

    @NotBlank(message = "Model path cannot be blank")
    @Size(max = 255, message = "Model path must be less than or equal to 255 characters")
    private String modelPath;

    private String description;

    private LocalDateTime trainedAt;
}
