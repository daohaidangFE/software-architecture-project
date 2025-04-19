package com.kttkpm.employee_management_service.Controller;

import com.kttkpm.employee_management_service.Entity.Employee;
import com.kttkpm.employee_management_service.Service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees") // Base path cho API nhân viên
@RequiredArgsConstructor
// Cho phép request từ statistic-service (chạy trên cổng 8081) và frontend (ví dụ 5500)
//@CrossOrigin(origins = {"http://localhost:8081", "http://127.0.0.1:8081",
//        "http://localhost:5500", "http://127.0.0.1:5500"})
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * API Endpoint để lấy danh sách tất cả nhân viên.
     * Được sử dụng bởi statistic-service.
     * @return ResponseEntity chứa List<Employee>.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployeesForStatistics() {
        List<Employee> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees); // Trả về 200 OK cùng danh sách nhân viên
    }
}
