import os
import shutil

# Đường dẫn tới file gốc (sử dụng raw string hoặc dấu /)
source_file = r"D:\hoctapreal\Nam4\ki2\kttkpm\BTL\FRONTEND\Demo import model\simple_dummy_model.h5"
output_dir = r"D:\hoctapreal\Nam4\ki2\kttkpm\BTL\FRONTEND\Demo import model\simple_dummy_models"

# Kiểm tra xem file gốc có tồn tại không
if not os.path.exists(source_file):
    print(f"Lỗi: File gốc '{source_file}' không tồn tại. Vui lòng kiểm tra đường dẫn file.")
    exit(1)

# Tạo thư mục đầu ra nếu chưa tồn tại
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Hàm tạo tên phiên bản
def generate_version_name(index):
    major = 1
    minor = index // 10
    patch = index % 10
    return f"v{major}.{minor}.{patch}"

# Tạo 100 file
for i in range(100):
    version = generate_version_name(i)
    output_file = os.path.join(output_dir, f"simple_dummy_model-{version}.h5")
    shutil.copyfile(source_file, output_file)
    print(f"Đã tạo: {output_file}")