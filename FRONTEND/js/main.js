// js/main.js
import { fetchModels, createModel, updateModel, deleteModelApi, getModelDownloadUrl, getCsvExportUrl } from './api.js';
import { renderModelCardsPage, updatePaginationControlsUI, updateStatsUI, showFeedbackUI } from './ui.js';
import { populateDetailsModal, openAddFormModal, openEditFormModal, closeFormModal, closeDetailsModal } from './modals.js';
import { debounce } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References (Keep here) ---
    const modelContainer = document.getElementById('model-card-container');
    const detailsModal = document.getElementById('modelDetailsModal');
    const closeDetailsModalButton = document.getElementById('closeModal');
    const modelFormModal = document.getElementById('modelFormModal');
    const closeFormModalButton = document.getElementById('closeFormModal'); // Check ID
    const cancelFormModalButton = document.getElementById('cancelFormModal');
    const modelForm = document.getElementById('model-form');
    const modalFormTitle = document.getElementById('modal-form-title');
    const modelIdInput = document.getElementById('model-id');
    const modelNameInput = document.getElementById('model-name');
    const modelVersionInput = document.getElementById('model-version');
    const modelTypeInput = document.getElementById('model-type');
    const modelDescriptionInput = document.getElementById('model-description');
    const modelTrainedAtInput = document.getElementById('model-trained-at');
    const saveModelButton = document.getElementById('saveModelButton');
    const addModelButton = document.getElementById('add-model-button');
    const importModelButton = document.getElementById('import-model-button');
    const exportAllButton = document.getElementById('export-all-button'); // Ensure ID exists
    const addModelCardTemplate = document.getElementById('add-model-card');
    const sortSelect = document.getElementById('sort-select');
    const feedbackMessage = document.getElementById('feedback-message');
    const searchInput = document.getElementById('search-input');
    const fileInput = document.getElementById('model-file-input');
    const fileRequiredIndicator = document.getElementById('file-required-indicator');
    const fileOptionalIndicator = document.getElementById('file-optional-indicator');
    const currentFileInfo = document.getElementById('current-file-info');
    const paginationControls = document.getElementById('pagination-controls');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');


    // --- State Variables (Keep here) ---
    let modelsData = []; // Dữ liệu gốc từ API
    let filteredAndSortedData = []; // Dữ liệu đã xử lý
    let currentFormMode = 'add';
    let currentEditModelId = null;
    let currentSortCriteria = 'newest';
    let currentSearchTerm = '';
    let currentPage = 1;
    const itemsPerPage = 6;
    let totalPages = 1;

    // --- Core Logic Functions (Orchestration) ---

    function sortData(data, criteria) {
        if (!Array.isArray(data)) return [];
        const dataToSort = [...data];
        switch (criteria) {
            case 'name': return dataToSort.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'newest': default: return dataToSort.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
        }
    }

    function filterData(data, term) {
         if (!term) return [...data]; // Trả về bản sao nếu không có search term
         const lowerTerm = term.toLowerCase();
         return data.filter(model =>
            (model.name && model.name.toLowerCase().includes(lowerTerm)) ||
            (model.description && model.description.toLowerCase().includes(lowerTerm))
         );
    }

    function processAndRender() {
         console.log(`Processing: Search='${currentSearchTerm}', Sort='${currentSortCriteria}'`);
         filteredAndSortedData = filterData(modelsData, currentSearchTerm);
         filteredAndSortedData = sortData(filteredAndSortedData, currentSortCriteria);
         console.log(`Processed: ${filteredAndSortedData.length} items.`);
         currentPage = 1; // Reset page khi lọc/sort
         renderPage(); // Gọi hàm render trang
         updatePagination(); // Cập nhật phân trang
    }

    function renderPage() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const modelsForPage = filteredAndSortedData.slice(startIndex, endIndex);
        renderModelCardsPage(modelContainer, addModelCardTemplate, modelsForPage, currentSearchTerm); // Gọi hàm UI
    }

    function updatePagination() {
        totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage) || 1;
        updatePaginationControlsUI(paginationControls, prevButton, nextButton, pageInfo, currentPage, totalPages); // Gọi hàm UI
    }

    async function handleAddModel(event) {
        event.preventDefault();
        if (!modelForm || !saveModelButton || !fileInput) return;
        const file = fileInput.files[0];
        if (!file) { showFeedbackUI(feedbackMessage, "Error: Model file is required.", true); return; }

        saveModelButton.disabled = true; saveModelButton.textContent = 'Saving...';
        const formData = new FormData(); // Không truyền form vào đây
        formData.append('file', file);
        formData.append('name', modelNameInput.value);
        formData.append('version', modelVersionInput.value);
        formData.append('type', modelTypeInput.value);
        formData.append('description', modelDescriptionInput.value);
        if (modelTrainedAtInput.value) formData.append('trainedAt', modelTrainedAtInput.value);

        try {
            await createModel(formData); // Gọi hàm API
            showFeedbackUI(feedbackMessage, 'Model added successfully!');
            closeFormModal(modelFormModal, fileInput, currentFileInfo);
            await loadInitialData(); // Tải lại toàn bộ data
        } catch (error) {
            console.error("Error adding model:", error);
            showFeedbackUI(feedbackMessage, `Error adding model: ${error.message}`, true);
        } finally {
             if (saveModelButton) { saveModelButton.disabled = false; saveModelButton.textContent = 'Save Model'; }
        }
    }

    async function handleEditModel(event) {
        event.preventDefault();
        if (!modelForm || !saveModelButton || !fileInput || !currentEditModelId) return;

        saveModelButton.disabled = true; saveModelButton.textContent = 'Saving...';
        const file = fileInput.files[0]; // File có thể có hoặc không
        const formData = new FormData();
        if (file) formData.append('file', file); // Chỉ thêm nếu có file mới
        formData.append('name', modelNameInput.value);
        formData.append('version', modelVersionInput.value);
        formData.append('type', modelTypeInput.value);
        formData.append('description', modelDescriptionInput.value);
        if (modelTrainedAtInput.value) formData.append('trainedAt', modelTrainedAtInput.value);

        try {
            await updateModel(currentEditModelId, formData); // Gọi hàm API
            showFeedbackUI(feedbackMessage, 'Model updated successfully!');
            closeFormModal(modelFormModal, fileInput, currentFileInfo);
            await loadInitialData(); // Tải lại toàn bộ data
        } catch (error) {
            console.error("Error updating model:", error);
            showFeedbackUI(feedbackMessage, `Error updating model: ${error.message}`, true);
        } finally {
             if (saveModelButton) { saveModelButton.disabled = false; saveModelButton.textContent = 'Save Model'; }
        }
    }

    async function handleDelete(modelId) {
         if (!modelId) return;
         const modelToDelete = modelsData.find(m => m && m.id == modelId);
         const modelName = modelToDelete ? modelToDelete.name : `ID ${modelId}`;
         if (!confirm(`Are you sure you want to delete model "${modelName}"?`)) return;

         if (detailsModal && !detailsModal.classList.contains('hidden')) {
             const modalEditBtn = detailsModal.querySelector('#modal-edit-button');
             if (modalEditBtn && modalEditBtn.dataset.modelId == modelId) {
                 closeDetailsModal(detailsModal);
             }
         }

         try {
             await deleteModelApi(modelId); // Gọi hàm API
             showFeedbackUI(feedbackMessage, `Model "${modelName}" deleted successfully!`);
             await loadInitialData(); // Tải lại toàn bộ data
         } catch (error) {
             console.error("Error deleting model:", error);
             showFeedbackUI(feedbackMessage, `Error deleting model: ${error.message}`, true);
         }
    }

    function handleSearchInput() {
        currentSearchTerm = searchInput.value; // Cập nhật search term trực tiếp
        processAndRender(); // Lọc và render lại
    }

    async function loadInitialData() {
        if (!modelContainer || !addModelCardTemplate) return;
        console.log("Initial data loading...");
        modelContainer.innerHTML = ''; // Clear
        const loadingIndicator = document.createElement('p');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'text-center text-gray-500 col-span-full py-10';
        loadingIndicator.textContent = 'Loading all models...';
        modelContainer.appendChild(loadingIndicator);
        modelContainer.appendChild(addModelCardTemplate.cloneNode(true));

        try {
            modelsData = await fetchModels(); // Gọi hàm API
            console.log(`Loaded ${modelsData.length} total models.`);
            processAndRender(); // Xử lý và hiển thị trang đầu
            updateStatsUI(modelsData); // Update stats với data gốc
        } catch (error) {
            console.error('Error fetching models:', error);
            showFeedbackUI(feedbackMessage, `Error loading models: ${error.message}`, true);
            updateStatsUI([]);
            totalPages = 1; filteredAndSortedData = []; updatePagination();
             // Hiển thị lỗi trong container
             const errorP = document.createElement('p');
             errorP.className = 'text-center text-red-500 col-span-full py-10';
             errorP.textContent = `Error loading models: ${error.message}`;
             const currentAddNewCard = modelContainer.querySelector('#add-model-card');
             if(currentAddNewCard) { modelContainer.insertBefore(errorP, currentAddNewCard); }
             else { modelContainer.appendChild(errorP); }

        } finally {
            const loadingEl = document.getElementById('loading-indicator');
            if(loadingEl) loadingEl.remove();
        }
    }


    // --- Event Listeners Initialization ---
    if (!addModelButton || !closeFormModalButton || !cancelFormModalButton || !modelForm || !sortSelect || !searchInput || !detailsModal || !closeDetailsModalButton || !modelContainer || !prevButton || !nextButton || !importModelButton) {
         console.error("One or more essential DOM elements are missing. Aborting script initialization.");
         return; // Dừng nếu thiếu element quan trọng
    }


    addModelButton.addEventListener('click', () => openAddFormModal(modelFormModal, modelForm, modalFormTitle, modelIdInput, fileInput, fileRequiredIndicator, fileOptionalIndicator, currentFileInfo));
    importModelButton.addEventListener('click', () => openAddFormModal(modelFormModal, modelForm, modalFormTitle, modelIdInput, fileInput, fileRequiredIndicator, fileOptionalIndicator, currentFileInfo)); // Import mở cùng modal Add
    closeFormModalButton.addEventListener('click', () => closeFormModal(modelFormModal, fileInput, currentFileInfo));
    cancelFormModalButton.addEventListener('click', () => closeFormModal(modelFormModal, fileInput, currentFileInfo));
    modelForm.addEventListener('submit', (event) => {
         if (currentFormMode === 'add') {
             handleAddModel(event);
         } else {
             handleEditModel(event);
         }
    });

    sortSelect.addEventListener('change', (event) => {
        currentSortCriteria = event.target.value;
        processAndRender();
    });

    searchInput.addEventListener('input', debounce(handleSearchInput, 300));

    closeDetailsModalButton.addEventListener('click', () => closeDetailsModal(detailsModal));
    detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeDetailsModal(detailsModal); });

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderPage(); updatePagination(); }
    });
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) { currentPage++; renderPage(); updatePagination(); }
    });

    if (exportAllButton) {
         exportAllButton.addEventListener('click', () => { window.location.href = getCsvExportUrl(); });
    }

    // Delegation for Details Modal buttons
    detailsModal.addEventListener('click', function(event) {
        const editButton = event.target.closest('#modal-edit-button');
        const deleteButton = event.target.closest('#modal-delete-button');
        const exportButton = event.target.closest('#modal-export-button');
        const deployButton = event.target.closest('#modal-deploy-button');

        const modelId = event.target.closest('button')?.dataset.modelId; // Lấy ID từ nút được click

        if (!modelId) return; // Thoát nếu không có model ID

        if (editButton) { openEditFormModal(modelFormModal, modelForm, modalFormTitle, modelIdInput, fileInput, fileRequiredIndicator, fileOptionalIndicator, currentFileInfo, modelsData.find(m=>m.id==modelId), modelNameInput, modelVersionInput, modelTypeInput, modelDescriptionInput, modelTrainedAtInput); }
        else if (deleteButton) { handleDelete(modelId); }
        else if (exportButton) { window.location.href = getModelDownloadUrl(modelId); }
        else if (deployButton) { alert(`Deploying model ${modelId}... (logic not implemented)`); }
    });

   // Delegation for Model Card container
   modelContainer.addEventListener('click', function(event) {
        const addCardTarget = event.target.closest('#add-model-card');
        if (addCardTarget) { openAddFormModal(modelFormModal, modelForm, modalFormTitle, modelIdInput, fileInput, fileRequiredIndicator, fileOptionalIndicator, currentFileInfo); return; }

        const detailsButton = event.target.closest('button[data-action="details"]');
        const primaryButton = event.target.closest('button[data-action]');
        const targetCard = event.target.closest('.model-card[data-model-id]');

        if (detailsButton) {
            const modelId = detailsButton.dataset.modelId;
            if(modelId) { populateDetailsModal(detailsModal, modelsData.find(m=>m.id==modelId)); }
            event.stopPropagation();
        } else if (primaryButton && primaryButton.dataset.action !== 'details') {
             const modelId = primaryButton.dataset.modelId;
             const action = primaryButton.dataset.action;
             const actionText = primaryButton.textContent.trim();
             if(modelId) { alert(`${actionText} model ${modelId}... (logic not implemented)`); }
             event.stopPropagation();
        } else if (targetCard && !event.target.closest('button')) {
             const modelId = targetCard.dataset.modelId;
             if(modelId) { populateDetailsModal(detailsModal, modelsData.find(m=>m.id==modelId)); }
        }
    });

    // Initial data load
    loadInitialData();
});