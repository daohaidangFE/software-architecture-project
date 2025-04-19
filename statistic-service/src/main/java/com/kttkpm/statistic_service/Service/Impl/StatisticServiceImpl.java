package com.kttkpm.statistic_service.Service.Impl;

import com.kttkpm.statistic_service.Dto.EmployeeDataDTO;
import com.kttkpm.statistic_service.Dto.EmployeeStatisticResponse;
import com.kttkpm.statistic_service.Dto.EmployeeStatus;
import com.kttkpm.statistic_service.Service.StatisticService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticServiceImpl implements StatisticService {

    private final RestTemplate restTemplate;

    @Value("${employee.service.base-url}")
    private String employeeApiBaseUrl;

    private static final String GET_ALL_EMPLOYEES_PATH = "/employees/all"; // Đường dẫn API employee

    @Override
    public EmployeeStatisticResponse getEmployeeStatistics() {
        log.info("Bắt đầu lấy và tính toán thống kê nhân viên.");
        List<EmployeeDataDTO> employees = fetchAllEmployees();

        if (employees.isEmpty()) {
            log.warn("Không nhận được dữ liệu nhân viên hoặc danh sách rỗng. Trả về thống kê mặc định.");
            return EmployeeStatisticResponse.builder()
                    .totalEmployees(0)
                    .allowedEmployees(0)
                    .disallowedEmployees(0)
                    .countByDepartment(Collections.emptyMap())
                    .build();
        }

        long totalEmployees = employees.size();
        log.debug("Tổng số nhân viên nhận được: {}", totalEmployees);

        long allowedEmployees = employees.stream()
                .filter(emp -> emp.getStatus() == EmployeeStatus.ALLOWED)
                .count();
        log.debug("Số nhân viên được phép (ALLOWED): {}", allowedEmployees);

        long disallowedEmployees = totalEmployees - allowedEmployees;
        log.debug("Số nhân viên không được phép (DISALLOWED): {}", disallowedEmployees);

        Map<String, Long> countByDepartment = employees.stream()
                .collect(Collectors.groupingBy(
                        EmployeeDataDTO::getDepartment,
                        Collectors.counting()
                ));
        log.debug("Thống kê theo phòng ban: {}", countByDepartment);

        EmployeeStatisticResponse response = EmployeeStatisticResponse.builder()
                .totalEmployees(totalEmployees)
                .allowedEmployees(allowedEmployees)
                .disallowedEmployees(disallowedEmployees)
                .countByDepartment(countByDepartment)
                .build();
        log.info("Hoàn thành tính toán thống kê nhân viên.");
        return response;
    }

    private List<EmployeeDataDTO> fetchAllEmployees() {
        String url = employeeApiBaseUrl + GET_ALL_EMPLOYEES_PATH;
        log.info("Đang gọi API lấy danh sách nhân viên từ: {}", url);
        try {
            ResponseEntity<List<EmployeeDataDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<EmployeeDataDTO>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Gọi API thành công, nhận được {} nhân viên.", response.getBody().size());
                return response.getBody();
            } else {
                log.error("Gọi API lấy nhân viên không thành công. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
                return Collections.emptyList();
            }
        } catch (RestClientException e) {
            log.error("Lỗi RestClientException khi gọi API {}: {}", url, e.getMessage());
            // Không ném lỗi ra ngoài để service vẫn có thể trả về kết quả rỗng/mặc định
            return Collections.emptyList();
        } catch (Exception e) {
            // Bắt các lỗi không mong muốn khác
            log.error("Lỗi không mong muốn khi gọi API {}: {}", url, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
