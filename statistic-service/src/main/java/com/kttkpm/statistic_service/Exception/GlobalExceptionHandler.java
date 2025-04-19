package com.kttkpm.statistic_service.Exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.RestClientException; // Quan trọng
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // Xử lý lỗi khi gọi API service khác
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<ErrorResponse> handleRestClientException(RestClientException ex, WebRequest request) {
        String message = "Không thể kết nối hoặc có lỗi từ dịch vụ quản lý nhân viên.";
        log.error("{}: {}", message, ex.getMessage());
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                message,
                ex.getMessage(), // Có thể chỉ log chi tiết này, không trả về client
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    // Xử lý lỗi chung (nên đặt sau các handler cụ thể hơn)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        String message = "Đã có lỗi xảy ra phía máy chủ thống kê.";
        log.error("{}: {}", message, ex.getMessage(), ex); // Log cả stack trace
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                message,
                "Vui lòng thử lại sau hoặc liên hệ quản trị viên.", // Thông báo chung cho client
                LocalDateTime.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
