// js/ui.js
import { formatDate } from './utils.js'; // Đảm bảo import formatDate

export function createModelCard(model) {
    let statusText = 'Unknown'; // Đổi tên biến để rõ ràng hơn
    let statusColor = 'gray';
    let buttonText = 'Details';
    let buttonIcon = 'fa-ellipsis-v';
    let primaryAction = 'details'; // Hành động mặc định

    // *** ĐỌC TRỰC TIẾP TỪ model.status ***
    const modelStatus = model?.status; // Sử dụng optional chaining đề phòng model null/undefined

    switch (modelStatus) {
        case 'ACTIVE':
            statusText = 'Active';
            statusColor = 'green';
            buttonText = 'Deploy'; // Hoặc logic khác nếu cần
            buttonIcon = 'fa-play';
            primaryAction = 'deploy';
            break;
        case 'INACTIVE':
            statusText = 'Inactive';
            statusColor = 'red';
            buttonText = 'Activate';
            buttonIcon = 'fa-power-off';
            primaryAction = 'activate';
            break;
        case 'PENDING':
            statusText = 'Pending';
            statusColor = 'yellow';
            buttonText = 'Review';
            buttonIcon = 'fa-pause';
            primaryAction = 'review';
            break;
        case 'TRAINING':
            statusText = 'Training';
            statusColor = 'blue';
            buttonText = 'View Logs';
            buttonIcon = 'fa-spinner fa-spin';
            primaryAction = 'view_logs';
            break;
         case 'ERROR':
            statusText = 'Error';
            statusColor = 'red';
            buttonText = 'View Error';
            buttonIcon = 'fa-exclamation-triangle';
            primaryAction = 'view_error';
            break;
        // Không cần default vì đã có giá trị ban đầu
    }

    const statusColors = {
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800',
        blue: 'bg-blue-100 text-blue-800' // Thêm màu cho training
    };
    const description = model.description ? model.description.substring(0, 60) + (model.description.length > 60 ? '...' : '') : 'No description';
    const createdAtDate = model.createdAt ? formatDate(model.createdAt).split(',')[0] : 'N/A';
    const trainedAtDate = formatDate(model.trainedAt);
    const updatedAtDate = formatDate(model.updatedAt);

    return `
        <div class="model-card bg-white rounded-lg shadow overflow-hidden transition duration-300 cursor-pointer flex flex-col h-full" data-model-id="${model.id || ''}">
            <div class="p-4 border-b">
                <div class="flex justify-between items-start">
                    <div class="flex-grow pr-2">
                        <h3 class="font-bold text-lg mb-1 truncate" title="${model.name || ''}">${model.name || 'N/A'}</h3>
                        <p class="text-gray-500 text-sm h-10 overflow-hidden">${description}</p>
                    </div>
                    <span class="px-2 py-1 ${statusColors[statusColor] || statusColors.gray} text-xs rounded-full flex-shrink-0 ml-2">${statusText}</span>
                </div>
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <div class="flex justify-between mb-3">
                    <div><p class="text-gray-500 text-sm">Type</p><p class="font-bold text-sm truncate">${model.type || 'N/A'}</p></div>
                    <div><p class="text-gray-500 text-sm">Version</p><p class="font-bold text-sm truncate">${model.version || 'N/A'}</p></div>
                    <div><p class="text-gray-500 text-sm">Created</p><p class="font-bold text-sm">${createdAtDate}</p></div>
                </div>
                <div class="flex-grow flex flex-col justify-end">
                    <div class="flex justify-between text-sm text-gray-500 mb-4 mt-auto">
                        <span>Trained: ${trainedAtDate}</span>
                        <span>Updated: ${updatedAtDate}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button data-action="${primaryAction}" data-model-id="${model.id || ''}" class="flex-1 py-2 ${statusColor === 'yellow' || statusColor === 'red' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded text-sm">
                            <i class="fas ${buttonIcon} mr-1"></i> ${buttonText}
                        </button>
                        <button data-action="details" data-model-id="${model.id || ''}" class="p-2 border rounded hover:bg-gray-50 model-details-button">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Hàm render danh sách card cho trang hiện tại (không thay đổi)
export function renderModelCardsPage(containerElement, addCardTemplateElement, modelsForPage, searchTerm = '') {
    if (!containerElement || !addCardTemplateElement) return;
    containerElement.innerHTML = '';

    if (modelsForPage.length > 0) {
        modelsForPage.forEach(model => containerElement.insertAdjacentHTML('beforeend', createModelCard(model)));
    } else {
        const message = searchTerm ? `No models found matching "${searchTerm}".` : 'No models found.';
        containerElement.insertAdjacentHTML('beforeend', `<p class="text-center text-gray-500 col-span-full py-10">${message}</p>`);
    }
    containerElement.appendChild(addCardTemplateElement.cloneNode(true));
}

// Hàm cập nhật các nút điều khiển phân trang (không thay đổi)
export function updatePaginationControlsUI(controlsElement, prevBtnElement, nextBtnElement, infoElement, currentPage, totalPages) {
    if (!controlsElement || !prevBtnElement || !nextBtnElement || !infoElement) return;

    if (totalPages > 1) {
        controlsElement.classList.remove('hidden');
        infoElement.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtnElement.disabled = (currentPage === 1);
        nextBtnElement.disabled = (currentPage >= totalPages);
    } else {
        controlsElement.classList.add('hidden');
    }
}

// *** SỬA HÀM CẬP NHẬT STATS ĐỂ ĐỌC STATUS TỪ API ***
export function updateStatsUI(data) { // Nhận toàn bộ dữ liệu gốc modelsData
    if (!Array.isArray(data)) data = [];
    const totalModels = data.length;

    // Tính toán số lượng theo Status
    const activeModels = data.filter(m => m?.status === 'ACTIVE').length;
    const pendingModels = data.filter(m => m?.status === 'PENDING').length;
    const inactiveModels = data.filter(m => m?.status === 'INACTIVE').length;
    const trainingModels = data.filter(m => m?.status === 'TRAINING').length;
    const errorModels = data.filter(m => m?.status === 'ERROR').length;
    const detectionModels = data.filter(m => m?.type === 'REGION_DETECTOR').length;
    const classifierModels = data.filter(m => m?.type === 'FINGERPRINT_CLASSIFIER').length;

    const totalEl = document.getElementById('total-models-stat');
    const activeEl = document.getElementById('active-models-stat');
    const pendingEl = document.getElementById('pending-models-stat');
    const inactiveEl = document.getElementById('inactive-models-stat');
    const trainingEl = document.getElementById('training-models-stat');
    const errorEl = document.getElementById('error-models-stat');
    const detectionEl = document.getElementById('detection-models-stat'); // Lấy element Detection
    const classifierEl = document.getElementById('classifier-models-stat'); // Lấy element 

    // Cập nhật textContent cho tất cả elements
    if(totalEl) totalEl.textContent = totalModels;
    if(activeEl) activeEl.textContent = activeModels;
    if(pendingEl) pendingEl.textContent = pendingModels;
    if(inactiveEl) inactiveEl.textContent = inactiveModels;
    if(trainingEl) trainingEl.textContent = trainingModels;
    if(errorEl) errorEl.textContent = errorModels;
    if(detectionEl) detectionEl.textContent = detectionModels;     // Cập nhật Detection
    if(classifierEl) classifierEl.textContent = classifierModels; 

     console.log(`Stats updated: Total=${totalModels}, Active=${activeModels},
Pending=${pendingModels}, Inactive=${inactiveModels}, Training=${trainingModels}, 
Error=${errorModels}, Detection=${detectionModels}, Classifier=${classifierModels}`);
}

// Hàm hiển thị feedback (không thay đổi)
export function showFeedbackUI(feedbackElement, message, isError = false) {
    if (!feedbackElement) return;
    feedbackElement.textContent = message;
    feedbackElement.className = `mb-4 p-3 rounded text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    feedbackElement.classList.remove('hidden');
    setTimeout(() => {
        if (feedbackElement) {
            feedbackElement.classList.add('hidden');
            feedbackElement.textContent = '';
            feedbackElement.className = 'mb-4 hidden';
        }
    }, 5000);
}