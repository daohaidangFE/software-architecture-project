package com.kttkpm.model_management_service.Repository;


import com.kttkpm.model_management_service.Entity.TrainedModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainedModelRepository extends JpaRepository<TrainedModel, Long> {
    // Spring Data JPA sẽ tự động cung cấp các phương thức CRUD cơ bản
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh ở đây nếu cần
    // Ví dụ: List<TrainedModel> findByType(ModelType type);
}
