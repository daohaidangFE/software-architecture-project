package com.kttkpm.model_management_service.Controller;

import com.kttkpm.model_management_service.Dto.CreateModelRequest;
import com.kttkpm.model_management_service.Dto.ModelResponse;
import com.kttkpm.model_management_service.Dto.UpdateModelRequest;
import com.kttkpm.model_management_service.Entity.TrainedModel;
import com.kttkpm.model_management_service.Service.TrainedModelService;
import jakarta.validation.Valid; // Import @Valid
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/models")
@CrossOrigin(origins = "*")
public class TrainedModelController {

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
        // Service sẽ ném ResourceNotFoundException nếu không tìm thấy
        ModelResponse model = modelService.getModelById(id);
        return ResponseEntity.ok(model);
    }

    @PostMapping
    public ResponseEntity<ModelResponse> createModel(@Valid @RequestBody CreateModelRequest createRequest) {
        // @Valid sẽ kích hoạt validation trên DTO
        // GlobalExceptionHandler sẽ bắt MethodArgumentNotValidException nếu validation fail
        ModelResponse savedModel = modelService.createModel(createRequest);
        return new ResponseEntity<>(savedModel, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModelResponse> updateModel(@PathVariable Long id, @Valid @RequestBody UpdateModelRequest updateRequest) {
        // @Valid cũng áp dụng cho update
        // Service sẽ ném ResourceNotFoundException nếu không tìm thấy id
        ModelResponse updatedModel = modelService.updateModel(id, updateRequest);
        return ResponseEntity.ok(updatedModel);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
        // Service sẽ ném ResourceNotFoundException nếu không tìm thấy id
        modelService.deleteModel(id);
        return ResponseEntity.noContent().build();
    }
}