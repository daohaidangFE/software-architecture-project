package com.kttkpm.model_management_service.Controller;

import com.kttkpm.model_management_service.Dto.CreateModelRequest;
import com.kttkpm.model_management_service.Dto.FileDownloadResponse;
import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.kttkpm.model_management_service.Dto.UpdateModelRequest;
// Bỏ import TrainedModel không dùng ở Controller
// import com.kttkpm.model_management_service.Entity.TrainedModel;
import com.kttkpm.model_management_service.Exception.FileStorageException;
import com.kttkpm.model_management_service.Exception.ResourceNotFoundException;
import com.kttkpm.model_management_service.Service.TrainedModelService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // *** THÊM IMPORT ***
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // *** THÊM IMPORT ***
import org.springframework.http.HttpHeaders;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/v1/models")
@CrossOrigin(origins = "*") // Quan trọng: Đảm bảo CORS cho phép các method này
public class TrainedModelController {

    private static final Logger log = LoggerFactory.getLogger(TrainedModelController.class);

    private final TrainedModelService modelService;

    @Autowired
    public TrainedModelController(TrainedModelService modelService) {
        this.modelService = modelService;
    }

    @GetMapping
    public ResponseEntity<List<ModelResponse>> getAllModels() {
        List<ModelResponse> models = modelService.getAllModels();
        return ResponseEntity.ok(models);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModelResponse> getModelById(@PathVariable Long id) {
        ModelResponse model = modelService.getModelById(id);
        return ResponseEntity.ok(model);
    }

    // --- SỬA ĐỔI POST ĐỂ DÙNG @ModelAttribute VÀ NHẬN FILE ---
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE }) // Chỉ định nhận multipart
    public ResponseEntity<ModelResponse> createModelWithFile(
            // Dùng @ModelAttribute để binding các trường form data vào DTO
            // @Valid vẫn dùng để validate các trường trong DTO
            @Valid @ModelAttribute CreateModelRequest createRequest,
            // File được nhận riêng bằng @RequestParam
            @RequestParam("file") MultipartFile file) {

        // Gọi phương thức service xử lý cả metadata và file
        // Bạn cần đảm bảo TrainedModelService có phương thức này
        ModelResponse savedModel = modelService.createModelWithFile(createRequest, file);
        return new ResponseEntity<>(savedModel, HttpStatus.CREATED);
    }


    // --- SỬA ĐỔI PUT (NẾU MUỐN HỖ TRỢ UPLOAD FILE KHI EDIT) ---
    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE }) // Sửa consumes
    public ResponseEntity<ModelResponse> updateModelWithFile(
            @PathVariable Long id,
            // Dùng @ModelAttribute cho DTO update
            @Valid @ModelAttribute UpdateModelRequest updateRequest,
            // File là optional khi update
            @RequestParam(value = "file", required = false) MultipartFile file) {

        // Gọi phương thức service xử lý update có thể kèm file
        // Bạn cần đảm bảo TrainedModelService có phương thức này
        ModelResponse updatedModel = modelService.updateModelWithFile(id, updateRequest, file);
        return ResponseEntity.ok(updatedModel);
    }
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportModelsToCsv() {
//        log.info("Request received to export models to CSV");
        try {
            String csvData = modelService.getModelsAsCsvString(); // Gọi Service

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"models_export.csv\"");
            headers.add(HttpHeaders.CONTENT_TYPE, "text/csv; charset=utf-8");

//            log.info("Returning CSV file download response.");
            return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
        } catch (Exception e) {
            // Lỗi từ Service sẽ được bắt ở đây hoặc bởi GlobalExceptionHandler
//            log.error("Failed to generate CSV export", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate CSV report.");
        }
    }

    // --- DELETE (Giữ nguyên) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
        modelService.deleteModel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadModelFile(@PathVariable Long id) {
        log.info("Request received to download model file for id: {}", id);
        try {
            // Gọi service để lấy cả resource và tên file gợi ý
            FileDownloadResponse downloadData = modelService.loadModelFileForDownload(id);

            Resource resource = downloadData.getResource();
            String suggestedFilename = downloadData.getSuggestedFilename();

            log.info("Serving file download with suggested filename: {}", suggestedFilename);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + suggestedFilename + "\"")
                    .body(resource);

        } catch (ResourceNotFoundException ex) {
            log.error("Download failed: Resource not found for id {}. {}", id, ex.getMessage());
            return ResponseEntity.notFound().build();
        } catch (FileStorageException ex) {
            log.error("Download failed: File storage error for id {}. {}", id, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception ex) {
            log.error("Unexpected error during download for id {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}