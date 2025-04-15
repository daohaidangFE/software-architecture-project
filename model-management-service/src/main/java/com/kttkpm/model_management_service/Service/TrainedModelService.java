package com.kttkpm.model_management_service.Service;

import com.kttkpm.model_management_service.Dto.CreateModelRequest;
import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.kttkpm.model_management_service.Dto.UpdateModelRequest;
import com.kttkpm.model_management_service.Entity.TrainedModel;

import java.util.List;

public interface TrainedModelService {
    List<ModelResponse> getAllModels();
    ModelResponse getModelById(Long id); // Trả về DTO, ném exception nếu không tìm thấy
    ModelResponse createModel(CreateModelRequest createRequest);
    ModelResponse updateModel(Long id, UpdateModelRequest updateRequest);
    void deleteModel(Long id); // Ném exception nếu không tìm thấy
}