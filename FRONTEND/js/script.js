document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element References ---
    const modelContainer = document.getElementById('model-card-container');
    const detailsModal = document.getElementById('modelDetailsModal');
    const closeDetailsModalButton = document.getElementById('closeModal'); // Nút đóng modal chi tiết (X trên modal)

    // Form Modal Elements
    const modelFormModal = document.getElementById('modelFormModal');
    const closeFormModalButton = document.getElementById('closeFormModal'); // Nút X trên form modal
    const cancelFormModalButton = document.getElementById('cancelFormModal'); // Nút Cancel dưới form
    const modelForm = document.getElementById('model-form');
    const modalFormTitle = document.getElementById('modal-form-title');
    const modelIdInput = document.getElementById('model-id'); // Input ẩn
    const modelNameInput = document.getElementById('model-name');
    const modelVersionInput = document.getElementById('model-version');
    const modelTypeInput = document.getElementById('model-type');
    const modelPathInput = document.getElementById('model-path');
    const modelDescriptionInput = document.getElementById('model-description');
    const modelTrainedAtInput = document.getElementById('model-trained-at');
    const saveModelButton = document.getElementById('saveModelButton');

    // Action Elements
    const addModelButton = document.getElementById('add-model-button'); // Nút "Add New Model" trên thanh actions
    const addModelCardTemplate = document.getElementById('add-model-card'); // Card template dashed
    const sortSelect = document.getElementById('sort-select');
    const feedbackMessage = document.getElementById('feedback-message');
    const searchInput = document.getElementById('search-input'); // Biến cho search

    // --- State Variables ---
    const apiUrl = 'http://localhost:8081/api/v1/models';
    let modelsData = []; // Dữ liệu gốc từ API, luôn giữ bản đầy đủ
    let filteredModelsData = []; // Dữ liệu đã được lọc bởi search (nếu có)
    let currentFormMode = 'add';
    let currentEditModelId = null;
    let currentSortCriteria = 'newest';

    // --- Utility Functions ---
    function formatDate(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        try {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
            return new Date(dateTimeString).toLocaleDateString('vi-VN', options);
        } catch (e) {
            // console.error("Error formatting date:", dateTimeString, e);
            return dateTimeString; // Giữ nguyên nếu lỗi
        }
    }

    function formatDateTimeForInput(isoString) {
        if (!isoString) return '';
        try {
            return isoString.substring(0, 16); // YYYY-MM-DDTHH:mm
        } catch (e) {
            // console.error("Error formatting date for input:", isoString, e);
            return '';
        }
    }

    function showFeedback(message, isError = false) {
        if (!feedbackMessage) return;
        feedbackMessage.textContent = message;
        feedbackMessage.className = `mb-4 p-3 rounded text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        feedbackMessage.classList.remove('hidden');
        setTimeout(() => {
            if (feedbackMessage) {
                feedbackMessage.classList.add('hidden');
                feedbackMessage.textContent = '';
                feedbackMessage.className = 'mb-4 hidden';
            }
        }, 5000);
    }

    // Hàm Debounce
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }


    // --- Core Logic Functions ---
    function createModelCard(model) {
        // Logic xác định status, color, button text/icon
        let status = 'Active'; let statusColor = 'green'; let buttonText = 'Deploy'; let buttonIcon = 'fa-play'; let primaryAction = 'deploy';
        const modelNameLower = model.name ? model.name.toLowerCase() : '';
        if (modelNameLower.includes('matching')) { status = 'Pending'; statusColor = 'yellow'; buttonText = 'Review'; buttonIcon = 'fa-pause'; primaryAction = 'review';}
        else if (modelNameLower.includes('intruder')) { status = 'Inactive'; statusColor = 'red'; buttonText = 'Activate'; buttonIcon = 'fa-power-off'; primaryAction = 'activate';}

        const statusColors = { green: 'bg-green-100 text-green-800', yellow: 'bg-yellow-100 text-yellow-800', red: 'bg-red-100 text-red-800', gray: 'bg-gray-100 text-gray-800' };
        const description = model.description ? model.description.substring(0, 50) + (model.description.length > 50 ? '...' : '') : 'No description';
        const createdAtDate = model.createdAt ? formatDate(model.createdAt).split(',')[0] : 'N/A';
        const trainedAtDate = formatDate(model.trainedAt);
        const updatedAtDate = formatDate(model.updatedAt);

        return `
            <div class="model-card bg-white rounded-lg shadow overflow-hidden transition duration-300 cursor-pointer flex flex-col h-full" data-model-id="${model.id || ''}">
                <div class="p-4 border-b">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-bold text-lg mb-1 truncate" title="${model.name || ''}">${model.name || 'N/A'}</h3>
                            <p class="text-gray-500 text-sm h-10 overflow-hidden">${description}</p>
                        </div>
                        <span class="px-2 py-1 ${statusColors[statusColor] || statusColors.gray} text-xs rounded-full flex-shrink-0 ml-2">${status}</span>
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
                            <button data-action="${primaryAction}" data-model-id="${model.id || ''}" class="flex-1 py-2 ${status === 'Pending' || status === 'Inactive' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded text-sm">
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

    function sortModelsData(data, criteria) {
        if (!Array.isArray(data)) return [];
        const dataToSort = [...data];
        switch (criteria) {
            case 'name':
                return dataToSort.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'newest':
            default:
                return dataToSort.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
        }
    }

    function renderModels() {
        if (!modelContainer || !addModelCardTemplate) {
             console.error("Cannot render: Missing container or Add New template");
             return;
        }
        modelContainer.innerHTML = ''; // Xóa hết card cũ

        let dataToRender = [...filteredModelsData]; // Dùng dữ liệu đã lọc
        dataToRender = sortModelsData(dataToRender, currentSortCriteria); // Sắp xếp

        console.log(`Rendering ${dataToRender.length} models after filtering and sorting by ${currentSortCriteria}`);

        if (dataToRender.length > 0) {
            dataToRender.forEach(model => modelContainer.insertAdjacentHTML('beforeend', createModelCard(model)));
        } else {
            const searchTerm = searchInput ? searchInput.value.trim() : '';
            const message = searchTerm ? `No models found matching "${searchTerm}".` : 'No models found.';
            modelContainer.insertAdjacentHTML('beforeend', `<p class="text-center text-gray-500 col-span-full py-10">${message}</p>`);
        }

        modelContainer.appendChild(addModelCardTemplate.cloneNode(true));
    }

    function updateStats(models) { // Tính trên modelsData gốc
        if (!Array.isArray(models)) models = [];
        const totalModels = models.length;
        const activeModels = models.filter(m => m?.name && (m.name.toLowerCase().includes('detection') || m.name.toLowerCase().includes('recognition'))).length;
        const detectionModels = models.filter(m => m?.type === 'REGION_DETECTOR').length;
        const classifierModels = models.filter(m => m?.type === 'FINGERPRINT_CLASSIFIER').length;

        const totalEl = document.getElementById('total-models-stat');
        const activeEl = document.getElementById('active-models-stat');
        const detectionEl = document.getElementById('detection-models-stat');
        const classifierEl = document.getElementById('classifier-models-stat');

        if(totalEl) totalEl.textContent = totalModels;
        if(activeEl) activeEl.textContent = activeModels;
        if(detectionEl) detectionEl.textContent = detectionModels;
        if(classifierEl) classifierEl.textContent = classifierModels;
    }

    function populateModal(modelId) {
        const model = modelsData.find(m => m && m.id == modelId); // Tìm trong data gốc
        if (!model || !detailsModal) return;

        const titleEl = document.getElementById('modal-model-title');
        const nameEl = document.getElementById('modal-model-name');
        const descEl = document.getElementById('modal-model-description');
        const versionEl = document.getElementById('modal-model-version');
        const typeEl = document.getElementById('modal-model-type');
        const pathEl = document.getElementById('modal-model-path');
        const trainedEl = document.getElementById('modal-model-trained-at');
        const createdEl = document.getElementById('modal-model-created-at');
        const updatedEl = document.getElementById('modal-model-updated-at');

        if(titleEl) titleEl.textContent = `Details: ${model.name || 'N/A'}`;
        if(nameEl) nameEl.textContent = model.name || 'N/A';
        if(descEl) descEl.textContent = model.description || 'No description available.';
        if(versionEl) versionEl.textContent = model.version || 'N/A';
        if(typeEl) typeEl.textContent = model.type || 'N/A';
        if(pathEl) pathEl.textContent = model.modelPath || 'N/A';
        if(trainedEl) trainedEl.textContent = formatDate(model.trainedAt);
        if(createdEl) createdEl.textContent = formatDate(model.createdAt);
        if(updatedEl) updatedEl.textContent = formatDate(model.updatedAt);

        const modalEditButton = document.getElementById('modal-edit-button');
        const modalDeleteButton = document.getElementById('modal-delete-button');
        if (modalEditButton) modalEditButton.dataset.modelId = modelId;
        if (modalDeleteButton) modalDeleteButton.dataset.modelId = modelId;

        detailsModal.classList.remove('hidden');
    }

    function openAddModal() {
        currentFormMode = 'add';
        currentEditModelId = null;
        if (!modelFormModal || !modelForm || !modalFormTitle || !modelIdInput) return;
        modalFormTitle.textContent = 'Add New Model';
        modelForm.reset();
        modelIdInput.value = '';
        modelFormModal.classList.remove('hidden');
    }

    function openEditModal(modelId) {
        currentFormMode = 'edit';
        currentEditModelId = modelId;
        const model = modelsData.find(m => m && m.id == modelId); // Tìm trong data gốc

        if (!model || !modelFormModal || !modelForm || !modalFormTitle || !modelIdInput ||
            !modelNameInput || !modelVersionInput || !modelTypeInput || !modelPathInput ||
            !modelDescriptionInput || !modelTrainedAtInput) {
            showFeedback(`Error: Cannot open edit form. Missing data or elements for ID ${modelId}.`, true);
            return;
        }

        if (detailsModal && !detailsModal.classList.contains('hidden')) {
            detailsModal.classList.add('hidden');
        }

        modalFormTitle.textContent = 'Edit Model';
        modelIdInput.value = model.id;
        modelNameInput.value = model.name || '';
        modelVersionInput.value = model.version || '';
        modelTypeInput.value = model.type || '';
        modelPathInput.value = model.modelPath || '';
        modelDescriptionInput.value = model.description || '';
        modelTrainedAtInput.value = formatDateTimeForInput(model.trainedAt);

        modelFormModal.classList.remove('hidden');
    }

    function closeFormModal() {
        if (modelFormModal) modelFormModal.classList.add('hidden');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        if (!modelForm || !saveModelButton) return;

        saveModelButton.disabled = true;
        saveModelButton.textContent = 'Saving...';

        const formData = new FormData(modelForm);
        const data = Object.fromEntries(formData.entries());
        if (currentFormMode === 'add') delete data.id;
        if (!data.trainedAt) delete data.trainedAt;

        try {
            const url = currentFormMode === 'add' ? apiUrl : `${apiUrl}/${currentEditModelId}`;
            const method = currentFormMode === 'add' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                 let errorText = `Status: ${response.status}`;
                 try {
                     const errorBody = await response.json();
                     errorText = errorBody.message || JSON.stringify(errorBody);
                 } catch (e) {
                     errorText = await response.text();
                 }
                throw new Error(`API Error: ${errorText.substring(0, 150)}`);
            }

            const successMessage = currentFormMode === 'add' ? 'Model added successfully!' : 'Model updated successfully!';
            showFeedback(successMessage);
            closeFormModal();
            await loadModels();

        } catch (error) {
            console.error("Error saving model:", error);
            showFeedback(`Error saving model: ${error.message}`, true);
        } finally {
            if (saveModelButton) {
                saveModelButton.disabled = false;
                saveModelButton.textContent = 'Save Model';
            }
        }
    }

    async function handleDeleteModel(modelId) {
        if (!modelId) return;
        const modelToDelete = modelsData.find(m => m && m.id == modelId);
        const modelName = modelToDelete ? modelToDelete.name : `ID ${modelId}`;

        if (!confirm(`Are you sure you want to delete model "${modelName}"?`)) return;

        if (detailsModal && !detailsModal.classList.contains('hidden')) {
            const modalEditBtn = document.getElementById('modal-edit-button');
            if (modalEditBtn && modalEditBtn.dataset.modelId == modelId) {
                detailsModal.classList.add('hidden');
            }
        }

        try {
            const response = await fetch(`${apiUrl}/${modelId}`, { method: 'DELETE' });

            if (!response.ok) {
                let errorText = `Status: ${response.status}`;
                 try {
                     const errorBody = await response.json();
                     errorText = errorBody.message || JSON.stringify(errorBody);
                 } catch (e) {
                     errorText = await response.text();
                 }
                if (response.status === 404) errorText = `Model with ID ${modelId} not found.`;
                throw new Error(`API Error: ${errorText.substring(0,150)}`);
            }

            showFeedback(`Model "${modelName}" deleted successfully!`);
            await loadModels();

        } catch (error) {
            console.error("Error deleting model:", error);
            showFeedback(`Error deleting model: ${error.message}`, true);
        }
    }

    function handleSearch() {
        if (!searchInput) return;
        const searchTerm = searchInput.value.toLowerCase().trim();
        console.log("Filtering models with term:", searchTerm);

        if (searchTerm === '') {
            filteredModelsData = [...modelsData];
        } else {
            filteredModelsData = modelsData.filter(model => {
                const nameMatch = model.name && model.name.toLowerCase().includes(searchTerm);
                const descriptionMatch = model.description && model.description.toLowerCase().includes(searchTerm);
                return nameMatch || descriptionMatch;
            });
        }
        renderModels();
    }


    async function loadModels() {
        if (!modelContainer || !addModelCardTemplate) { return; }

        modelContainer.innerHTML = '';
        const loadingIndicator = document.createElement('p');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'text-center text-gray-500 col-span-full py-10';
        loadingIndicator.textContent = 'Loading models...';
        modelContainer.appendChild(loadingIndicator);
        modelContainer.appendChild(addModelCardTemplate.cloneNode(true));

        try {
            const response = await fetch(apiUrl);
            const loadingEl = document.getElementById('loading-indicator');
            if(loadingEl) loadingEl.remove();

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. ${errorText.substring(0,100)}`);
            }

            modelsData = await response.json();
            filteredModelsData = [...modelsData];
            renderModels();
            updateStats(modelsData);

        } catch (error) {
            console.error('Error fetching models:', error);
            const loadingEl = document.getElementById('loading-indicator');
            if(loadingEl) loadingEl.remove();
            const errorP = document.createElement('p');
            errorP.className = 'text-center text-red-500 col-span-full py-10';
            errorP.textContent = `Error loading models: ${error.message}`;
            const currentAddNewCard = modelContainer.querySelector('#add-model-card');
             if(currentAddNewCard) { modelContainer.insertBefore(errorP, currentAddNewCard); }
             else { modelContainer.appendChild(errorP); }
            updateStats([]);
        }
    }

    // --- Event Listeners Initialization ---
    if (addModelButton) addModelButton.addEventListener('click', openAddModal);
    if (closeFormModalButton) closeFormModalButton.addEventListener('click', closeFormModal);
    if (cancelFormModalButton) cancelFormModalButton.addEventListener('click', closeFormModal);
    if (modelForm) modelForm.addEventListener('submit', handleFormSubmit);

    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            currentSortCriteria = event.target.value;
            renderModels();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    if (closeDetailsModalButton && detailsModal) {
        closeDetailsModalButton.addEventListener('click', () => detailsModal.classList.add('hidden'));
    }
    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) detailsModal.classList.add('hidden');
        });
    }

    if (detailsModal) {
        detailsModal.addEventListener('click', function(event) {
            const editButton = event.target.closest('#modal-edit-button');
            const deleteButton = event.target.closest('#modal-delete-button');
            const deployButton = event.target.closest('#modal-deploy-button');

            if (editButton) {
                const modelId = editButton.dataset.modelId;
                if(modelId) openEditModal(modelId);
            } else if (deleteButton) {
                const modelId = deleteButton.dataset.modelId;
                 if(modelId) handleDeleteModel(modelId);
            } else if (deployButton) {
                 const modelId = deployButton.dataset.modelId;
                 if(modelId) alert(`Deploying model ${modelId}... (logic not implemented)`);
            }
        });
    }

   if (modelContainer) {
        modelContainer.addEventListener('click', function(event) {
            const detailsButton = event.target.closest('button[data-action="details"]');
            const primaryButton = event.target.closest('button[data-action]'); // Bắt mọi nút có data-action
            const targetCard = event.target.closest('.model-card[data-model-id]');
            const addCardTarget = event.target.closest('#add-model-card');

            if (addCardTarget) { // Ưu tiên xử lý card Add New
                 console.log("Add Model Card clicked via delegation");
                 openAddModal();
                 return;
            }

            if (detailsButton) {
                const modelId = detailsButton.dataset.modelId;
                if(modelId) {
                    console.log(`Details button (...) clicked on card for ID: ${modelId}`);
                    populateModal(modelId);
                }
                event.stopPropagation();
            } else if (primaryButton && primaryButton.dataset.action !== 'details') {
                 const modelId = primaryButton.dataset.modelId;
                 const action = primaryButton.dataset.action;
                 const actionText = primaryButton.textContent.trim();
                 if(modelId) {
                    console.log(`Action button (${action}) clicked on card for ID: ${modelId}`);
                    alert(`${actionText} model ${modelId}... (logic not implemented)`);
                 }
                 event.stopPropagation();
            } else if (targetCard && !event.target.closest('button')) {
                 const modelId = targetCard.dataset.modelId;
                 if(modelId) {
                     console.log(`Card clicked (not button): ModelID=${modelId}`);
                    populateModal(modelId);
                 }
            }
        });
    }

    loadModels();
});