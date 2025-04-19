import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import os
import numpy as np # Import numpy để tạo dữ liệu giả

print(f"TensorFlow version: {tf.__version__}")
print(f"Keras version: {keras.__version__}")

# 1. Định nghĩa một mô hình Keras cực kỳ đơn giản
# Mô hình này nhận đầu vào có 10 đặc trưng (shape=(10,))
# và đưa ra một đầu ra duy nhất (ví dụ: dự đoán một con số)
model = keras.Sequential(
    [
        layers.Input(shape=(10,), name="input_layer"), # Định nghĩa lớp Input rõ ràng
        layers.Dense(8, activation="relu", name="hidden_layer_1"), # Một lớp ẩn đơn giản
        layers.Dense(1, name="output_layer") # Lớp đầu ra với 1 neuron
    ],
    name="simple_dummy_model"
)

# 2. Compile mô hình (cần thiết trước khi lưu hoặc huấn luyện)
# Chúng ta dùng optimizer và loss đơn giản, không quan trọng lắm cho việc test import
model.compile(optimizer='adam', loss='mean_squared_error')

# (Tùy chọn) In cấu trúc mô hình ra màn hình để xem
print("\nModel Summary:")
model.summary()

# (Tùy chọn) Tạo một ít dữ liệu giả và huấn luyện vài epoch cho có trọng số khác mặc định
# Điều này không bắt buộc để tạo file .h5, nhưng làm cho file thực tế hơn một chút
print("\n(Optional) Training for 1 epoch with dummy data...")
dummy_x = np.random.rand(5, 10) # 5 mẫu, 10 đặc trưng
dummy_y = np.random.rand(5, 1)  # 5 nhãn tương ứng
model.fit(dummy_x, dummy_y, epochs=1, verbose=0) # verbose=0 để không in log huấn luyện
print("Dummy training finished.")


# 3. Đặt tên file lưu trữ
filename = 'simple_dummy_model.h5'

# 4. Lưu mô hình ra file .h5
try:
    model.save(filename)
    print(f"\nSuccessfully saved dummy model to: {os.path.abspath(filename)}")
    print(f"You can now use this '{filename}' file to test your import function.")
except Exception as e:
    print(f"\nError saving model: {e}")