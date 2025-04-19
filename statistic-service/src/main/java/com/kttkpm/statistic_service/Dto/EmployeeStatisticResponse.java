package com.kttkpm.statistic_service.Dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class EmployeeStatisticResponse {
    private long totalEmployees;
    private long allowedEmployees;
    private long disallowedEmployees;
    private Map<String, Long> countByDepartment;
}