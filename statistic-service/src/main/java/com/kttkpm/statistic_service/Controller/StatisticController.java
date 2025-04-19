package com.kttkpm.statistic_service.Controller;

import com.kttkpm.statistic_service.Dto.EmployeeStatisticResponse;
import com.kttkpm.statistic_service.Service.StatisticService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
@Slf4j
// Cho phép frontend (ví dụ 5500) và có thể cả các service khác gọi tới
//@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500"})
public class StatisticController {

    private final StatisticService statisticService;

    @GetMapping("/employees")
    public ResponseEntity<EmployeeStatisticResponse> getEmployeeStats() {
        log.info("Nhận được yêu cầu lấy thống kê nhân viên tại /api/v1/statistics/employees");
        EmployeeStatisticResponse stats = statisticService.getEmployeeStatistics();
        return ResponseEntity.ok(stats);
    }
}
