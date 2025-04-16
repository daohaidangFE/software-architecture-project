package com.kttkpm.model_management_service.Service.Impl;

import com.kttkpm.model_management_service.Dto.CreateModelRequest;
import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.kttkpm.model_management_service.Dto.UpdateModelRequest;
import com.kttkpm.model_management_service.Entity.TrainedModel;
import com.kttkpm.model_management_service.Exception.ResourceNotFoundException;
import com.kttkpm.model_management_service.Repository.TrainedModelRepository;
import com.kttkpm.model_management_service.Service.TrainedModelService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Đảm bảo đã import

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainedModelServiceImpl implements TrainedModelService {

    private static final Logger log = LoggerFactory.getLogger(TrainedModelServiceImpl.class);
    private final TrainedModelRepository modelRepository;
    private static final String RESOURCE_NAME = "TrainedModel";

    @Autowired
    public TrainedModelServiceImpl(TrainedModelRepository modelRepository) {
        this.modelRepository = modelRepository;
    }

    @Override
    @Transactional(readOnly = true) // Thêm readOnly=true cho các phương thức chỉ đọc
    public List<ModelResponse> getAllModels() {
        log.info("Fetching all trained models");
        List<TrainedModel> models = modelRepository.findAll();
        return models.stream()
                .map(this::mapEntityToResponse) // Gọi hàm map thống nhất
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // Thêm readOnly=true
    public ModelResponse getModelById(Long id) {
        log.info("Fetching trained model with id: {}", id);
        TrainedModel model = findModelByIdOrThrow(id); // Sử dụng hàm helper
        return mapEntityToResponse(model); // Gọi hàm map thống nhất
    }

    @Override
    @Transactional // Giữ nguyên @Transactional cho các thao tác ghi
    public ModelResponse createModel(CreateModelRequest createRequest) {
        log.info("Attempting to create new trained model with name: {}", createRequest.getName());

        TrainedModel model = TrainedModel.builder()
                .name(createRequest.getName())
                .version(createRequest.getVersion())
                .type(createRequest.getType())
                .modelPath(createRequest.getModelPath())
                .description(createRequest.getDescription())
                .trainedAt(createRequest.getTrainedAt())
                .build();

        TrainedModel savedModel = modelRepository.save(model);
        log.info("Successfully created trained model with id: {}", savedModel.getId());
        return mapEntityToResponse(savedModel); // Gọi hàm map thống nhất
    }

    @Override
    @Transactional // Giữ nguyên @Transactional
    public ModelResponse updateModel(Long id, UpdateModelRequest updateRequest) {
        log.info("Attempting to update trained model with id: {}", id);
        TrainedModel existingModel = findModelByIdOrThrow(id); // Sử dụng hàm helper

        // Cập nhật entity bằng setter (cách này tốt cho JPA)
        existingModel.setName(updateRequest.getName());
        existingModel.setVersion(updateRequest.getVersion());
        existingModel.setType(updateRequest.getType());
        existingModel.setModelPath(updateRequest.getModelPath());
        existingModel.setDescription(updateRequest.getDescription());
        existingModel.setTrainedAt(updateRequest.getTrainedAt());

        TrainedModel updatedModel = modelRepository.save(existingModel);
        log.info("Successfully updated trained model with id: {}", updatedModel.getId());
        return mapEntityToResponse(updatedModel); // Gọi hàm map thống nhất
    }

    @Override
    @Transactional // Giữ nguyên @Transactional
    public void deleteModel(Long id) {
        log.info("Attempting to delete trained model with id: {}", id);
        TrainedModel modelToDelete = findModelByIdOrThrow(id); // Sử dụng hàm helper để kiểm tra tồn tại
        modelRepository.delete(modelToDelete);
        log.info("Successfully deleted trained model with id: {}", id);
    }

    // --- Hàm Helper ---

    /**
     * Tìm TrainedModel theo ID hoặc ném ResourceNotFoundException nếu không tìm thấy.
     * @param id ID của model cần tìm.
     * @return TrainedModel nếu tìm thấy.
     * @throws ResourceNotFoundException nếu không tìm thấy.
     */
    private TrainedModel findModelByIdOrThrow(Long id) {
        return modelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Model not found with id: {}", id);
                    return new ResourceNotFoundException(RESOURCE_NAME, "id", id);
                });
    }

    /**
     * Chuyển đổi TrainedModel Entity sang ModelResponse DTO bằng Builder pattern.
     * @param model Entity cần chuyển đổi.
     * @return ModelResponse DTO hoặc null nếu input là null.
     */
    private ModelResponse mapEntityToResponse(TrainedModel model) {
        if (model == null) {
            return null;
        }
        return ModelResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .version(model.getVersion())
                .type(model.getType())
                .modelPath(model.getModelPath())
                .description(model.getDescription())
                .trainedAt(model.getTrainedAt())
                .createdAt(model.getCreatedAt())
                .updatedAt(model.getUpdatedAt())
                .build();
    }
}