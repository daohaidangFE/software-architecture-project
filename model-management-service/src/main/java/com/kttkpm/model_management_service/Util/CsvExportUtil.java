package com.kttkpm.model_management_service.Util;

import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.opencsv.CSVWriter;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
// *** THÊM IMPORT CHO MAPPING STRATEGY ***
import com.opencsv.bean.HeaderColumnNameMappingStrategy;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
import java.util.List;

@Component // Giữ lại @Component nếu bạn muốn inject bean này vào Service
public class CsvExportUtil {

    // Giữ phương thức non-static để có thể inject
    public String generateModelResponseCsv(List<ModelResponse> models)
            throws CsvRequiredFieldEmptyException, CsvDataTypeMismatchException { // Giữ throws clause

        StringWriter writer = new StringWriter();
        try {
            // --- SỬ DỤNG MAPPING STRATEGY ---

            // 1. Tạo Mapping Strategy
            HeaderColumnNameMappingStrategy<ModelResponse> strategy = new HeaderColumnNameMappingStrategy<>();
            strategy.setType(ModelResponse.class); // Chỉ định lớp Bean

            // (Tùy chọn) Nếu bạn muốn tên header khác với tên field trong DTO
            // hoặc muốn đảm bảo thứ tự cột, bạn có thể set header ở đây.
            // Nếu không set, nó sẽ tự lấy header từ tên field.
            // Ví dụ đặt header tùy chỉnh:
            // String[] columns = new String[]{"ID", "Model Name", "Version", "Model Type", "File Path", "Description", "Trained Date", "Created Date", "Updated Date"};
            // strategy.setColumnMapping(columns); // Map tên header với vị trí

            // 2. Tạo StatefulBeanToCsv với Strategy đã cấu hình
            StatefulBeanToCsv<ModelResponse> beanToCsv = new StatefulBeanToCsvBuilder<ModelResponse>(writer)
                    .withMappingStrategy(strategy) // *** SỬ DỤNG STRATEGY ***
                    .withQuotechar(CSVWriter.DEFAULT_QUOTE_CHARACTER) // Dùng dấu nháy kép
                    .withSeparator(CSVWriter.DEFAULT_SEPARATOR)       // Dùng dấu phẩy
                    .withApplyQuotesToAll(false) // Chỉ quote khi cần
                    // *** BỎ DÒNG withLineEnd(...) KHÔNG HỢP LỆ ***
                    // Header sẽ được ghi tự động bởi strategy
                    .build();

            // 3. Ghi dữ liệu (bao gồm cả header nếu strategy được cấu hình)
            beanToCsv.write(models);

        } catch (CsvRequiredFieldEmptyException | CsvDataTypeMismatchException e) {
            // Ném lại các exception này để lớp gọi (Service) có thể xử lý
            throw e;
        } catch (Exception e) {
            // Bọc các exception khác thành RuntimeException nếu muốn
            // Hoặc log và xử lý tại đây
            // Ví dụ: throw new RuntimeException("Failed to generate CSV data", e);
            // Để đơn giản, ném lại CsvRequiredFieldEmptyException và CsvDataTypeMismatchException
            // Các lỗi khác có thể cần xử lý cụ thể hơn
            System.err.println("Unexpected error generating CSV: " + e.getMessage()); // Log tạm thời
            throw new RuntimeException("Unexpected error during CSV generation", e); // Ném runtime cho các lỗi khác
        }

        return writer.toString();
    }
}