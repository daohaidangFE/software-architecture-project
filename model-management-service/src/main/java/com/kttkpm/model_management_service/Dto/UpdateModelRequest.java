package com.kttkpm.model_management_service.Dto;

import lombok.Data;
import lombok.EqualsAndHashCode; // Dùng để chỉ định sử dụng equals/hashcode của lớp cha
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true) // Gọi equals/hashcode của lớp cha (CreateModelRequest)
@NoArgsConstructor
public class UpdateModelRequest extends CreateModelRequest {
}
