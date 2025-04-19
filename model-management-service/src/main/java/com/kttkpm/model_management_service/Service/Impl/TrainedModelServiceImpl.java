package com.kttkpm.model_management_service.Service.Impl;

import com.kttkpm.model_management_service.Dto.CreateModelRequest;
import com.kttkpm.model_management_service.Dto.FileDownloadResponse;
import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.kttkpm.model_management_service.Dto.UpdateModelRequest;
import com.kttkpm.model_management_service.Entity.ModelStatus;
import com.kttkpm.model_management_service.Entity.TrainedModel;
import com.kttkpm.model_management_service.Exception.FileStorageException;
import com.kttkpm.model_management_service.Exception.ResourceNotFoundException;
import com.kttkpm.model_management_service.Repository.TrainedModelRepository;
import com.kttkpm.model_management_service.Service.TrainedModelService;
import com.kttkpm.model_management_service.Util.CsvExportUtil;
import com.opencsv.CSVWriter;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;         // *** THÊM IMPORT ***
import org.springframework.core.io.UrlResource;      // *** THÊM IMPORT ***
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.MalformedURLException;           // *** THÊM IMPORT ***
import java.nio.file.*;
import java.text.Normalizer;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TrainedModelServiceImpl implements TrainedModelService {

    private static final Logger log = LoggerFactory.getLogger(TrainedModelServiceImpl.class);
    private final TrainedModelRepository modelRepository;
    private static final String RESOURCE_NAME = "TrainedModel";
    private final Path fileStorageLocation; // Đường dẫn lưu file

    @Autowired // Inject CsvExportUtil nếu nó là @Component
    private CsvExportUtil csvExportUtil;

    @Autowired
    public TrainedModelServiceImpl(TrainedModelRepository modelRepository,
                                   @Value("${app.model.storage-path}") String uploadPath) {
        this.modelRepository = modelRepository;
        this.fileStorageLocation = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Storage directory initialized at: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create the storage directory: " + this.fileStorageLocation, ex);
        }
    }

    @Override
    @Transactional
    public ModelResponse createModelWithFile(CreateModelRequest createRequest, MultipartFile file) {
        log.info("Attempting to create new model '{}' (version '{}') with file '{}'",
                createRequest.getName(), createRequest.getVersion(), file.getOriginalFilename());

        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Model file is required for creation.");
        }

        // *** TRUYỀN name VÀ version VÀO storeFile ***
        String storedRelativePath = storeFile(file, createRequest.getName(), createRequest.getVersion());
        log.info("File stored with custom relative path: {}", storedRelativePath);

        TrainedModel model = TrainedModel.builder()
                .name(createRequest.getName())
                .version(createRequest.getVersion())
                .type(createRequest.getType())
                .modelPath(storedRelativePath) // Gán đường dẫn đã lưu
                .description(createRequest.getDescription())
                .trainedAt(createRequest.getTrainedAt())
                .status(ModelStatus.PENDING)
                .build();

        TrainedModel savedModel = modelRepository.save(model);
        log.info("Successfully saved model record with id: {}", savedModel.getId());
        return mapEntityToResponse(savedModel);
    }

    @Override
    @Transactional
    public ModelResponse updateModelWithFile(Long id, UpdateModelRequest updateRequest, MultipartFile file) {
        log.info("Attempting to update model id '{}' - file provided: {}", id, (file != null && !file.isEmpty()));
        TrainedModel existingModel = findModelByIdOrThrow(id);
        String oldRelativePath = existingModel.getModelPath();

        if (file != null && !file.isEmpty()) {
            log.info("New file provided for update: {}", file.getOriginalFilename());
            // *** TRUYỀN name VÀ version MỚI VÀO storeFile ***
            String newRelativePath = storeFile(file, updateRequest.getName(), updateRequest.getVersion());
            log.info("New file stored with custom relative path: {}", newRelativePath);
            existingModel.setModelPath(newRelativePath);

            if (oldRelativePath != null && !oldRelativePath.isBlank() && !oldRelativePath.equals(newRelativePath)) {
                deletePhysicalFile(oldRelativePath);
            }
        } else {
            log.info("No new file provided, keeping existing path: {}", oldRelativePath);
            // Cần kiểm tra xem tên/version có thay đổi không để đổi tên file cũ nếu cần?
            // -> Thường thì không nên đổi tên file cũ khi chỉ sửa metadata, trừ khi có yêu cầu rõ ràng.
        }

        // Cập nhật metadata
        existingModel.setName(updateRequest.getName());
        existingModel.setVersion(updateRequest.getVersion());
        existingModel.setType(updateRequest.getType());
        existingModel.setDescription(updateRequest.getDescription());
        existingModel.setTrainedAt(updateRequest.getTrainedAt());

        TrainedModel updatedModel = modelRepository.save(existingModel);
        log.info("Successfully updated model record with id: {}", updatedModel.getId());
        return mapEntityToResponse(updatedModel);
    }

    @Override
    public ModelResponse createModel(CreateModelRequest createRequest) {
        return null;
    }

    @Override
    @Transactional
    public ModelResponse updateModel(Long id, UpdateModelRequest updateRequest) {
        log.warn("Calling updateModel (metadata only) for id: {}. File path will not be changed unless updateModelWithFile is used.", id);
        // Chú ý: phương thức này sẽ KHÔNG thay đổi file vật lý
        // Nó chỉ cập nhật các trường metadata trong DB.
        return this.updateModelWithFile(id, updateRequest, null);
    }


    // --- DELETE (Có xóa file) ---
    @Override
    @Transactional
    public void deleteModel(Long id) {
        log.info("Attempting to delete model with id: {}", id);
        TrainedModel modelToDelete = findModelByIdOrThrow(id);
        String relativePath = modelToDelete.getModelPath();

        // Xóa bản ghi DB trước
        modelRepository.delete(modelToDelete);
        log.info("Successfully deleted model record with id: {}", id);

        // Sau đó xóa file vật lý
        deletePhysicalFile(relativePath); // Gọi hàm helper xóa file
    }

    // --- DOWNLOAD/EXPORT ---
    @Override
    public FileDownloadResponse loadModelFileForDownload(Long id) {
        try {
            TrainedModel model = findModelByIdOrThrow(id);
            String relativeModelPath = model.getModelPath();
            if (relativeModelPath == null || relativeModelPath.isBlank()) {
                throw new ResourceNotFoundException("Model exists but has no associated file path.");
            }

            Path filePath = this.fileStorageLocation.resolve(relativeModelPath).normalize();

            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new FileStorageException("Security Alert: Cannot access file outside storage directory: " + relativeModelPath);
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // *** LOGIC XÁC ĐỊNH TÊN FILE NẰM Ở ĐÂY ***
                String filename = resource.getFilename(); // Thử lấy từ resource trước
                if (filename == null || filename.isBlank()) {
                    // Nếu không được, lấy từ DB path (phần cuối)
                    filename = filePath.getFileName().toString();
                    // Hoặc có thể tạo tên file từ các thông tin khác của model nếu muốn
                    // filename = model.getName() + "_" + model.getVersion() + ".h5"; // Ví dụ
                }
                if (filename == null || filename.isBlank()){
                    filename = "model_" + id + "_download"; // Tên dự phòng cuối cùng
                }

                log.info("Prepared resource and suggested filename '{}' for model id {}", filename, id);
                // Trả về đối tượng wrapper
                return new FileDownloadResponse(resource, filename);
            } else {
                if (!resource.exists()) throw new ResourceNotFoundException("File not found for model " + id + " at path: " + relativeModelPath);
                else throw new FileStorageException("File is not readable for model " + id + " at path: " + relativeModelPath);
            }
        } catch (MalformedURLException ex) {
            throw new FileStorageException("Could not create URL for the file path.", ex);
        } catch (ResourceNotFoundException | FileStorageException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("An unexpected error occurred while preparing the model file for download.", ex);
        }
    }


    // --- GET ALL & GET BY ID (Giữ nguyên) ---
    @Override
    @Transactional(readOnly = true)
    public List<ModelResponse> getAllModels() {
        log.info("Fetching all trained models");
        List<TrainedModel> models = modelRepository.findAll();
        return models.stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ModelResponse getModelById(Long id) {
        log.info("Fetching trained model with id: {}", id);
        TrainedModel model = findModelByIdOrThrow(id);
        return mapEntityToResponse(model);
    }


    // --- Private Helper Methods ---

    // --- SỬA LẠI HÀM storeFile ---
    private String storeFile(MultipartFile file, String modelName, String modelVersion) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Cannot store empty file.");
        }
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFilename.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence " + originalFilename);
        }

        // 1. Lấy phần extension của file gốc
        String fileExtension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot >= 0) {
            fileExtension = originalFilename.substring(lastDot);
        }

        // 2. Tạo tên file cơ sở từ name và version (đã được sanitize)
        String baseFilename = sanitizeFilename(modelName + (modelVersion != null && !modelVersion.isBlank() ? "_v" + modelVersion : ""));
        if (baseFilename.isBlank()) { // Trường hợp tên model toàn ký tự đặc biệt
            baseFilename = "model_" + UUID.randomUUID().toString().substring(0, 8); // Dự phòng
        }

        // 3. Xử lý trùng lặp tên file
        String finalFilename = baseFilename + fileExtension;
        Path targetLocation = this.fileStorageLocation.resolve(finalFilename).normalize();
        int count = 0;
        // Vòng lặp kiểm tra và thêm hậu tố số nếu file đã tồn tại
        while (Files.exists(targetLocation)) {
            count++;
            finalFilename = baseFilename + "_(" + count + ")" + fileExtension;
            targetLocation = this.fileStorageLocation.resolve(finalFilename).normalize();
            // Thêm giới hạn để tránh vòng lặp vô hạn (tùy chọn)
            if (count > 100) {
                log.error("Could not generate a unique filename for base '{}' after {} attempts.", baseFilename, count);
                throw new FileStorageException("Could not generate a unique filename.");
            }
        }
        log.debug("Final filename determined: {}", finalFilename);


        // 4. Lưu file với tên cuối cùng
        try {
            // Kiểm tra lại targetLocation để đảm bảo an toàn
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new FileStorageException("Security Alert: Target path is outside storage directory: " + targetLocation);
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
                log.info("File stored successfully at: {}", targetLocation);
            }
            // 5. Trả về tên file cuối cùng (đường dẫn tương đối)
            return finalFilename;

        } catch (IOException ex) {
            log.error("Could not store file '{}'. Target: {}", originalFilename, targetLocation, ex);
            throw new FileStorageException("Failed to store file " + originalFilename, ex);
        } catch (InvalidPathException ex) {
            log.error("Invalid target path generated: '{}' from base '{}'", targetLocation, baseFilename, ex);
            throw new FileStorageException("Invalid path generated for file storage.", ex);
        }
    }
    // --- HÀM HELPER ĐỂ SANITIZE TÊN FILE ---
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]"); // Regex: ký tự không phải word (a-zA-Z0-9_), gạch ngang
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]"); // Regex: khoảng trắng
    private static final Pattern EDGESDHASHES = Pattern.compile("^-|-$"); // Regex: gạch ngang ở đầu/cuối

    private String sanitizeFilename(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        // 1. Thay khoảng trắng bằng gạch dưới
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("_");
        // 2. Chuẩn hóa Unicode (ví dụ: bỏ dấu tiếng Việt) về dạng gần nhất
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        // 3. Loại bỏ các ký tự không phải ASCII hoặc không phải ký tự word/gạch ngang
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        // 4. Xóa gạch ngang ở đầu/cuối (nếu có)
        slug = EDGESDHASHES.matcher(slug).replaceAll("");
        // 5. Chuyển thành chữ thường (tùy chọn)
        slug = slug.toLowerCase();
        // 6. Giới hạn độ dài (tùy chọn)
        // if (slug.length() > 100) {
        //     slug = slug.substring(0, 100);
        // }
        return slug;
    }

    private void deletePhysicalFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            log.warn("Attempted to delete physical file with null or blank path.");
            return;
        }
        try {
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) { // Kiểm tra an toàn
                boolean deleted = Files.deleteIfExists(filePath); // Dùng deleteIfExists an toàn hơn
                if (deleted) {
                    log.info("Successfully deleted physical file: {}", filePath);
                } else {
                    log.warn("Physical file not found for deletion (already deleted?): {}", filePath);
                }
            } else {
                log.error("Security Alert: Attempted to delete file outside storage directory: {}", filePath);
            }
        } catch (IOException ex) {
            log.error("Could not delete physical file: {}", relativePath, ex);
            // Không ném lỗi để không rollback DB delete
        }
    }

    private TrainedModel findModelByIdOrThrow(Long id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, "id", id));
    }

    private ModelResponse mapEntityToResponse(TrainedModel model) {
        if (model == null) return null;
        return ModelResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .version(model.getVersion())
                .type(model.getType())
                .modelPath(model.getModelPath())
                .description(model.getDescription())
                .trainedAt(model.getTrainedAt())
                .status(model.getStatus())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();
    }

    @Override
    public String getModelsAsCsvString() {
        log.info("Generating CSV data for all models");
        List<ModelResponse> models = this.getAllModels();
        try {
            return csvExportUtil.generateModelResponseCsv(models); // Gọi Util
        } catch (Exception e) {
            log.error("Error generating CSV via Util", e);
            throw new RuntimeException("Error generating CSV data.", e);
        }
    }
}