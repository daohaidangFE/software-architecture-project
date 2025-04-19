package com.kttkpm.employee_management_service.Repository;

import com.kttkpm.employee_management_service.Entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Hiện tại chưa cần phương thức tùy chỉnh cho API đơn giản này
}
