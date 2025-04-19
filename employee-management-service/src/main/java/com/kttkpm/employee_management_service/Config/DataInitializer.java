package com.kttkpm.employee_management_service.Config;

import com.kttkpm.employee_management_service.Entity.Employee;
import com.kttkpm.employee_management_service.Entity.EmployeeStatus;
import com.kttkpm.employee_management_service.Repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() == 0) {
            log.info("Không tìm thấy nhân viên nào. Đang khởi tạo dữ liệu mẫu...");
            createSampleEmployees();
            log.info("Đã khởi tạo dữ liệu nhân viên mẫu.");
        } else {
            log.info("Đã có dữ liệu nhân viên. Bỏ qua khởi tạo.");
        }
    }

    private void createSampleEmployees() {
        List<String> departments = Arrays.asList("IT", "HR", "Sales", "Marketing", "Finance", "Operations");
        List<String> firstNames = Arrays.asList("An", "Bình", "Cường", "Dũng", "Hà", "Hoa", "Lan", "Minh", "Nam", "Ngọc");
        List<String> lastNames = Arrays.asList("Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Phan", "Đặng", "Bùi", "Đỗ");

        List<Employee> employees = new java.util.ArrayList<>();
        for (int i = 0; i < 25; i++) { // Tạo 25 nhân viên mẫu
            String firstName = firstNames.get(random.nextInt(firstNames.size()));
            String lastName = lastNames.get(random.nextInt(lastNames.size()));
            String department = departments.get(random.nextInt(departments.size()));
            EmployeeStatus status = random.nextBoolean() ? EmployeeStatus.ALLOWED : EmployeeStatus.DISALLOWED; // Trạng thái ngẫu nhiên

            employees.add(Employee.builder()
                    .name(firstName + " " + lastName)
                    .department(department)
                    .status(status)
                    // createdAt và updatedAt được tự động gán
                    .build());
        }
        employeeRepository.saveAll(employees);
    }
}
