package com.kttkpm.statistic_service.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDataDTO {
    private Long id;
    private String name;
    private String department;
    private EmployeeStatus status;
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
}
