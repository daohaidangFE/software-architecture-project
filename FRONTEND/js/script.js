document.addEventListener('DOMContentLoaded', function() {
    const modelContainer = document.getElementById('model-card-container');
    const modal = document.getElementById('modelDetailsModal');
    const closeModal = document.getElementById('closeModal');
    const addNewModelCard = modelContainer ? modelContainer.querySelector('.border-dashed') : null; // Giữ lại card "Add New"

    // URL của backend API
    const apiUrl = 'http://localhost:8081/api/v1/models'; // Thay đổi nếu backend chạy ở địa chỉ khác

    // Biến để lưu trữ dữ liệu models lấy từ API
    let modelsData = [];

    // --- Hàm định dạng ngày tháng ---
    function formatDate(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        try {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return new Date(dateTimeString).toLocaleDateString('vi-VN', options); // Format VN
        } catch (e) {
            console.error("Error formatting date:", dateTimeString, e);
            return dateTimeString; // Trả về chuỗi gốc nếu lỗi
        }
    }

    // --- Hàm tạo HTML cho một Model Card ---
    function createModelCard(model) {
        // Xác định trạng thái và màu sắc (ví dụ đơn giản dựa trên tên)
        let status = 'Unknown';
        let statusColor = 'gray';
        let buttonText = 'Details';
        let buttonIcon = 'fa-ellipsis-v';
        let buttonAction = 'details'; // Hành động mặc định khi click

        // Ví dụ logic trạng thái đơn giản (bạn cần làm phức tạp hơn dựa trên dữ liệu thực tế)
        if (model.name.toLowerCase().includes('detection')) {
             status = 'Active'; statusColor = 'green'; buttonText = 'Deploy'; buttonIcon = 'fa-play'; buttonAction = 'deploy';
        } else if (model.name.toLowerCase().includes('recognition')) {
             status = 'Active'; statusColor = 'green'; buttonText = 'Deploy'; buttonIcon = 'fa-play'; buttonAction = 'deploy';
        } else if (model.name.toLowerCase().includes('matching')) {
             status = 'Pending'; statusColor = 'yellow'; buttonText = 'Review'; buttonIcon = 'fa-pause'; buttonAction = 'review';
        } else if (model.name.toLowerCase().includes('intruder')) {
             status = 'Inactive'; statusColor = 'red'; buttonText = 'Activate'; buttonIcon = 'fa-power-off'; buttonAction = 'activate';
        }

        // Mapping màu Tailwind
        const statusColors = {
            green: 'bg-green-100 text-green-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            red: 'bg-red-100 text-red-800',
            gray: 'bg-gray-100 text-gray-800'
        };
        const progressBarColors = {
             green: 'bg-green-500',
             blue: 'bg-blue-500', // Dùng cho recognition
             yellow: 'bg-yellow-500',
             red: 'bg-red-500',
             purple: 'bg-purple-500', // Dùng cho matching
             teal: 'bg-teal-500', // Dùng cho multi-finger
             gray: 'bg-gray-400'
        };
        // Chọn màu progress bar dựa trên loại hoặc tên (ví dụ)
        let progressColorClass = progressBarColors.gray;
        if (model.type === 'REGION_DETECTOR') progressColorClass = progressBarColors.blue;
        if (model.type === 'FINGERPRINT_CLASSIFIER') progressColorClass = progressBarColors.purple;
        if (model.name.toLowerCase().includes('multi-finger')) progressColorClass = progressBarColors.teal;


        // Tạo HTML bằng template literal
        return `
            <div class="model-card bg-white rounded-lg shadow overflow-hidden transition duration-300 cursor-pointer" data-model-id="${model.id}">
                <div class="p-4 border-b">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-lg">${model.name || 'N/A'}</h3>
                            <p class="text-gray-500 text-sm">${model.description ? model.description.substring(0, 50) + (model.description.length > 50 ? '...' : '') : 'No description'}</p>
                        </div>
                        <span class="px-2 py-1 ${statusColors[statusColor]} text-xs rounded-full">${status}</span>
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex justify-between mb-3">
                        <div>
                            <p class="text-gray-500 text-sm">Type</p>
                            <p class="font-bold">${model.type || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Version</p>
                            <p class="font-bold">${model.version || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Created</p>
                            <p class="font-bold">${formatDate(model.createdAt).split(',')[0]}</p> <!-- Chỉ lấy ngày -->
                        </div>
                    </div>
                    <!-- Tạm ẩn progress bar vì thiếu accuracy -->
                    <!--
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div class="${progressColorClass} h-2 rounded-full" style="width: 95%"></div>
                    </div>
                    -->
                    <div class="flex justify-between text-sm text-gray-500 mb-4 mt-4"> <!-- Thêm mt-4 nếu bỏ progress bar -->
                        <span>Trained: ${formatDate(model.trainedAt)}</span>
                        <span>Updated: ${formatDate(model.updatedAt)}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button data-action="${buttonAction}" data-model-id="${model.id}" class="flex-1 py-2 ${status === 'Pending' || status === 'Inactive' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded">
                            <i class="fas ${buttonIcon} mr-1"></i> ${buttonText}
                        </button>
                        <button data-action="details" data-model-id="${model.id}" class="p-2 border rounded hover:bg-gray-50 model-details-button">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Hàm cập nhật các ô thống kê ---
    function updateStats(models) {
        const totalModels = models.length;
        // Tính toán các chỉ số khác (ví dụ, cần thêm trường 'status' vào backend hoặc logic phức tạp hơn)
        const activeModels = models.filter(m => m.name.toLowerCase().includes('detection') || m.name.toLowerCase().includes('recognition')).length; // Ví dụ đơn giản
        const detectionModels = models.filter(m => m.type === 'REGION_DETECTOR').length;
        const classifierModels = models.filter(m => m.type === 'FINGERPRINT_CLASSIFIER').length;

        document.getElementById('total-models-stat').textContent = totalModels;
        document.getElementById('active-models-stat').textContent = activeModels; // Cập nhật stat active
        document.getElementById('detection-models-stat').textContent = detectionModels;
        document.getElementById('classifier-models-stat').textContent = classifierModels;
    }

    // --- Hàm hiển thị model trong modal ---
    function populateModal(modelId) {
        const model = modelsData.find(m => m.id == modelId); // Tìm model trong mảng dữ liệu đã lưu
        if (!model || !modal) return;

        document.getElementById('modal-model-title').textContent = `Details: ${model.name || 'N/A'}`;
        document.getElementById('modal-model-name').textContent = model.name || 'N/A';
        document.getElementById('modal-model-description').textContent = model.description || 'No description available.';
        document.getElementById('modal-model-version').textContent = model.version || 'N/A';
        document.getElementById('modal-model-type').textContent = model.type || 'N/A';
        document.getElementById('modal-model-path').textContent = model.modelPath || 'N/A';
        document.getElementById('modal-model-trained-at').textContent = formatDate(model.trainedAt);
        document.getElementById('modal-model-created-at').textContent = formatDate(model.createdAt);
        document.getElementById('modal-model-updated-at').textContent = formatDate(model.updatedAt);

        // (Tùy chọn) Cập nhật các nút action trong modal dựa trên model.id hoặc trạng thái
        // ...

        modal.classList.remove('hidden'); // Hiển thị modal
    }


    // --- Hàm gọi API và render dữ liệu ---
    async function loadModels() {
        if (!modelContainer) {
            console.error("Model container not found!");
            return;
        }
        modelContainer.innerHTML = ''; // Xóa nội dung cũ (trừ card Add New)
        if(addNewModelCard) modelContainer.appendChild(addNewModelCard); // Thêm lại card Add New

        // Hiển thị trạng thái loading (ví dụ)
        const loadingIndicator = document.createElement('p');
        loadingIndicator.textContent = 'Loading models...';
        loadingIndicator.classList.add('text-center', 'text-gray-500', 'col-span-full', 'py-10'); // Đảm bảo chiếm toàn bộ grid
        modelContainer.prepend(loadingIndicator); // Thêm vào đầu

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            modelsData = await response.json(); // Lưu dữ liệu vào biến toàn cục

            // Xóa loading indicator
            loadingIndicator.remove();

            if (modelsData && modelsData.length > 0) {
                 modelsData.forEach(model => {
                    const cardHtml = createModelCard(model);
                    // Chèn card mới vào *trước* card "Add New"
                    if(addNewModelCard) {
                        modelContainer.insertAdjacentHTML('beforeend', cardHtml); // Chèn vào cuối trước khi có card Add New
                    } else {
                        modelContainer.insertAdjacentHTML('beforeend', cardHtml); // Nếu không có card Add New thì cứ chèn vào cuối
                    }
                });
                if(addNewModelCard) modelContainer.appendChild(addNewModelCard); // Đảm bảo Add New luôn ở cuối

            } else {
                modelContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full py-10">No models found.</p>';
                 if(addNewModelCard) modelContainer.appendChild(addNewModelCard);
            }

            // Cập nhật các ô thống kê
            updateStats(modelsData);

        } catch (error) {
             // Xóa loading indicator nếu có lỗi
            loadingIndicator.remove();
            console.error('Error fetching models:', error);
            modelContainer.innerHTML = `<p class="text-center text-red-500 col-span-full py-10">Error loading models: ${error.message}</p>`;
             if(addNewModelCard) modelContainer.appendChild(addNewModelCard);
            // Xóa dữ liệu stats nếu lỗi
            updateStats([]);
        }
    }

    // --- Gắn sự kiện ---

    // Sự kiện click vào nút đóng modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Sự kiện click ra ngoài modal để đóng
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Sử dụng Event Delegation cho các nút trên card (vì card được tạo động)
    if (modelContainer) {
        modelContainer.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button[data-action]'); // Tìm nút cha gần nhất có data-action
            const targetCard = event.target.closest('.model-card[data-model-id]'); // Tìm card cha gần nhất có data-model-id

            if (targetButton) {
                const action = targetButton.dataset.action;
                const modelId = targetButton.dataset.modelId;

                if (action === 'details') {
                    console.log(`Show details for model ID: ${modelId}`);
                    populateModal(modelId);
                } else if (action === 'deploy') {
                    console.log(`Deploy model ID: ${modelId}`);
                    alert(`Deploying model ${modelId}... (logic not implemented)`);
                    // Thêm logic gọi API deploy
                } else if (action === 'activate') {
                     console.log(`Activate model ID: ${modelId}`);
                     alert(`Activating model ${modelId}... (logic not implemented)`);
                     // Thêm logic gọi API activate
                } else if (action === 'review') {
                    console.log(`Review model ID: ${modelId}`);
                     populateModal(modelId); // Có thể mở modal để review
                }
                // Ngăn sự kiện click lan lên card để mở modal (nếu không muốn)
                event.stopPropagation();

            } else if (targetCard && !event.target.closest('button')) {
                // Chỉ mở modal nếu click vào card nhưng không phải là click vào nút bên trong card
                const modelId = targetCard.dataset.modelId;
                 console.log(`Card clicked, show details for model ID: ${modelId}`);
                populateModal(modelId);
            }
        });
    }

    // --- Tải dữ liệu lần đầu ---
    loadModels();

});