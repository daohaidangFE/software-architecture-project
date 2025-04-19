package com.kttkpm.model_management_service.Config;

import com.kttkpm.model_management_service.Entity.ModelStatus;
import com.kttkpm.model_management_service.Entity.ModelType;
import com.kttkpm.model_management_service.Entity.TrainedModel;
import com.kttkpm.model_management_service.Repository.TrainedModelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component // Đánh dấu là một Spring Bean để được quản lý
public class DataInitializer implements CommandLineRunner { // Implement CommandLineRunner

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final TrainedModelRepository modelRepository;

    @Autowired // Tiêm TrainedModelRepository vào
    public DataInitializer(TrainedModelRepository modelRepository) {
        this.modelRepository = modelRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có dữ liệu trong bảng chưa
        if (modelRepository.count() == 0) {
            log.info("No existing models found. Initializing mock data...");
            createMockModels();
            log.info("Mock data initialization complete.");
        } else {
            log.info("Models already exist in the database. Skipping data initialization.");
        }
    }

    private void createMockModels() {
        // Sử dụng Builder để tạo các đối tượng TrainedModel mẫu
        TrainedModel model1 = TrainedModel.builder()
                .name("Fingerprint Detection v4.2")
                .version("4.2.1")
                .type(ModelType.REGION_DETECTOR)
                .modelPath("/models/storage/detect_v4_2_1.h5")
                .description("Fingerprint region identification model based on CNN+ResNet50.")
                .trainedAt(LocalDateTime.of(2023, 6, 15, 10, 30, 0))
                .status(ModelStatus.ACTIVE) // Gán trạng thái cụ thể
                // createdAt và updatedAt sẽ được tự động tạo
                .build();

        TrainedModel model2 = TrainedModel.builder()
                .name("Person Recognition v3.1")
                .version("3.1.5")
                .type(ModelType.FINGERPRINT_CLASSIFIER)
                .modelPath("/models/storage/person_rec_v3_1_5.pb")
                .description("Employee identification model using extracted fingerprint features.")
                .trainedAt(LocalDateTime.of(2023, 5, 22, 14, 0, 0))
                .status(ModelStatus.ERROR)
                .build();

        TrainedModel model3 = TrainedModel.builder()
                .name("Fingerprint Matching v2.8")
                .version("2.8.3")
                .type(ModelType.FINGERPRINT_CLASSIFIER) // Giả sử đây cũng là loại classifier
                .modelPath("/models/storage/fp_match_v2_8_3.onnx")
                .description("Model for 1:1 fingerprint comparison. (Status: Pending Deployment)") // Mô tả có thể chứa trạng thái
                .trainedAt(LocalDateTime.of(2023, 4, 10, 9, 15, 0))
                .status(ModelStatus.INACTIVE)
                .build();

        TrainedModel model4 = TrainedModel.builder()
                .name("Intruder Detection v1.5")
                .version("1.5.2")
                .type(ModelType.REGION_DETECTOR) // Giả sử phát hiện vùng lạ
                .modelPath("/models/storage/intruder_detect_v1_5_2.pt")
                .description("Basic model for detecting unauthorized access attempts. (Status: Inactive)")
                .trainedAt(LocalDateTime.of(2023, 3, 28, 16, 45, 0))
                .status(ModelStatus.TRAINING)
                .build();

        TrainedModel model5 = TrainedModel.builder()
                .name("Multi-Finger Detection v3.0")
                .version("3.0.0")
                .type(ModelType.REGION_DETECTOR)
                .modelPath("/models/storage/multi_finger_v3_0_0.tflite")
                .description("Detects multiple fingerprint regions in a single image frame.")
                .trainedAt(LocalDateTime.of(2023, 7, 5, 11, 0, 0))
                .status(ModelStatus.ACTIVE)
                .build();

        // Lưu danh sách các model vào database
        List<TrainedModel> models = Arrays.asList(model1, model2, model3, model4, model5);
        modelRepository.saveAll(models);
    }
}