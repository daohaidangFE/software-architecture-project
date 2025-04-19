package com.kttkpm.employee_management_service.Service.Impl;

import com.kttkpm.employee_management_service.Entity.Employee;
import com.kttkpm.employee_management_service.Repository.EmployeeRepository;
import com.kttkpm.employee_management_service.Service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import nếu dùng

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true) // Đánh dấu transaction chỉ đọc
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll(); // Sử dụng phương thức có sẵn của JpaRepository
    }
}
