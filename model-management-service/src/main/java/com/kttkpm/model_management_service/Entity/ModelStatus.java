package com.kttkpm.model_management_service.Entity;

public enum ModelStatus {
    ACTIVE,     // Đang hoạt động, có thể đang được deploy
    INACTIVE,   // Không hoạt động, chưa deploy hoặc đã bị disable
    PENDING,    // Đang chờ xử lý (ví dụ: mới import, chờ duyệt)
    TRAINING,   // Đang trong quá trình huấn luyện (nếu có)
    ERROR       // Có lỗi xảy ra (ví dụ: huấn luyện lỗi, file hỏng)
}
