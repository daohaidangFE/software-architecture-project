package com.kttkpm.model_management_service.Service;

import com.kttkpm.model_management_service.Dto.CreateModelRequest;
import com.kttkpm.model_management_service.Dto.FileDownloadResponse;
import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.kttkpm.model_management_service.Dto.UpdateModelRequest;
import com.kttkpm.model_management_service.Entity.TrainedModel;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface TrainedModelService {

    List<ModelResponse> getAllModels();
    ModelResponse getModelById(Long id); // Trả về DTO, ném exception nếu không tìm thấy
    // --- PHƯƠNG THỨC MỚI CHO CREATE VỚI FILE ---
    ModelResponse createModelWithFile(CreateModelRequest createRequest, MultipartFile file);

    // --- PHƯƠNG THỨC MỚI CHO UPDATE VỚI FILE (Optional File) ---
    ModelResponse updateModelWithFile(Long id, UpdateModelRequest updateRequest, MultipartFile file);    ModelResponse createModel(CreateModelRequest createRequest);
    ModelResponse updateModel(Long id, UpdateModelRequest updateRequest);
    void deleteModel(Long id); // Ném exception nếu không tìm thấy
    String getModelsAsCsvString();
    FileDownloadResponse loadModelFileForDownload(Long id); // Trả về wrapper
}