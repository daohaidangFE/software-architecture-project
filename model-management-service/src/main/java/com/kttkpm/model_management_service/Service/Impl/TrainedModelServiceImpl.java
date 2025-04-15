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
import org.springframework.transaction.annotation.Transactional;

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
    public List<ModelResponse> getAllModels() {
        log.info("Fetching all trained models");
        List<TrainedModel> models = modelRepository.findAll();
        // Sử dụng stream và builder của ModelResponse để map
        return models.stream()
                .map(model -> ModelResponse.builder() // Sử dụng builder
                        .id(model.getId())
                        .name(model.getName())
                        .version(model.getVersion())
                        .type(model.getType())
                        .modelPath(model.getModelPath())
                        .description(model.getDescription())
                        .trainedAt(model.getTrainedAt())
                        .createdAt(model.getCreatedAt())
                        .updatedAt(model.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ModelResponse getModelById(Long id) {
        log.info("Fetching trained model with id: {}", id);
        TrainedModel model = modelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Model not found with id: {}", id);
                    return new ResourceNotFoundException(RESOURCE_NAME, "id", id);
                });

        // Sử dụng builder của ModelResponse để map
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

    @Override
    @Transactional
    public ModelResponse createModel(CreateModelRequest createRequest) {
        log.info("Creating new trained model with name: {}", createRequest.getName());

        // Sử dụng builder của TrainedModel để tạo entity từ DTO
        TrainedModel model = TrainedModel.builder()
                .name(createRequest.getName())
                .version(createRequest.getVersion())
                .type(createRequest.getType())
                .modelPath(createRequest.getModelPath())
                .description(createRequest.getDescription())
                .trainedAt(createRequest.getTrainedAt())
                // id, createdAt, updatedAt sẽ do JPA/DB quản lý
                .build();

        TrainedModel savedModel = modelRepository.save(model);
        log.info("Successfully created trained model with id: {}", savedModel.getId());

        // Sử dụng builder của ModelResponse để tạo DTO trả về
        return ModelResponse.builder()
                .id(savedModel.getId())
                .name(savedModel.getName())
                .version(savedModel.getVersion())
                .type(savedModel.getType())
                .modelPath(savedModel.getModelPath())
                .description(savedModel.getDescription())
                .trainedAt(savedModel.getTrainedAt())
                .createdAt(savedModel.getCreatedAt())
                .updatedAt(savedModel.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public ModelResponse updateModel(Long id, UpdateModelRequest updateRequest) {
        log.info("Updating trained model with id: {}", id);
        TrainedModel existingModel = modelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Model not found with id: {} during update attempt", id);
                    return new ResourceNotFoundException(RESOURCE_NAME, "id", id);
                });

        // Cập nhật các trường của existingModel từ updateRequest
        // Ở đây không dùng builder để cập nhật, mà dùng setter (do @Data cung cấp)
        // vì nó hiệu quả hơn với JPA khi chỉ thay đổi những gì cần thiết.
        existingModel.setName(updateRequest.getName());
        existingModel.setVersion(updateRequest.getVersion());
        existingModel.setType(updateRequest.getType());
        existingModel.setModelPath(updateRequest.getModelPath());
        existingModel.setDescription(updateRequest.getDescription());
        existingModel.setTrainedAt(updateRequest.getTrainedAt());
        // createdAt không đổi, updatedAt sẽ tự động cập nhật bởi @UpdateTimestamp

        TrainedModel updatedModel = modelRepository.save(existingModel); // Lưu lại thay đổi
        log.info("Successfully updated trained model with id: {}", updatedModel.getId());

        // Sử dụng builder của ModelResponse để tạo DTO trả về
        return ModelResponse.builder()
                .id(updatedModel.getId())
                .name(updatedModel.getName())
                .version(updatedModel.getVersion())
                .type(updatedModel.getType())
                .modelPath(updatedModel.getModelPath())
                .description(updatedModel.getDescription())
                .trainedAt(updatedModel.getTrainedAt())
                .createdAt(updatedModel.getCreatedAt()) // Giữ nguyên createdAt
                .updatedAt(updatedModel.getUpdatedAt()) // Lấy updatedAt mới
                .build();
    }

    @Override
    @Transactional
    public void deleteModel(Long id) {
        log.info("Attempting to delete trained model with id: {}", id);
        // Sử dụng findById thay vì existsById để lấy đối tượng (nếu cần log thông tin trước khi xóa)
        // Hoặc giữ nguyên existsById nếu chỉ cần kiểm tra tồn tại
        TrainedModel modelToDelete = modelRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Model not found with id: {} during delete attempt", id);
                    return new ResourceNotFoundException(RESOURCE_NAME, "id", id);
                });

        // Optional: log thêm thông tin về model sắp xóa
        // log.debug("Deleting model: {}", modelToDelete);

        modelRepository.delete(modelToDelete); // Hoặc deleteById(id)
        log.info("Successfully deleted trained model with id: {}", id);
    }
}