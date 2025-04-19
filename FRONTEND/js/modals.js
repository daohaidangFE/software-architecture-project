// js/modals.js
import { formatDate, formatDateTimeForInput } from './utils.js'; // Import utils

// --- Populate Details Modal ---
export function populateDetailsModal(modalElement, model) {
    if (!model || !modalElement) return false;

    const titleEl = modalElement.querySelector('#modal-model-title');
    const nameEl = modalElement.querySelector('#modal-model-name');
    const descEl = modalElement.querySelector('#modal-model-description');
    const versionEl = modalElement.querySelector('#modal-model-version');
    const typeEl = modalElement.querySelector('#modal-model-type');
    const pathEl = modalElement.querySelector('#modal-model-path');
    const trainedEl = modalElement.querySelector('#modal-model-trained-at');
    const createdEl = modalElement.querySelector('#modal-model-created-at');
    const updatedEl = modalElement.querySelector('#modal-model-updated-at');
    const editBtn = modalElement.querySelector('#modal-edit-button');
    const deleteBtn = modalElement.querySelector('#modal-delete-button');
    const exportBtn = modalElement.querySelector('#modal-export-button');

    if(titleEl) titleEl.textContent = `Details: ${model.name || 'N/A'}`;
    if(nameEl) nameEl.textContent = model.name || 'N/A';
    if(descEl) descEl.textContent = model.description || 'No description available.';
    if(versionEl) versionEl.textContent = model.version || 'N/A';
    if(typeEl) typeEl.textContent = model.type || 'N/A';
    if(pathEl) pathEl.textContent = model.modelPath || 'N/A';
    if(trainedEl) trainedEl.textContent = formatDate(model.trainedAt);
    if(createdEl) createdEl.textContent = formatDate(model.createdAt);
    if(updatedEl) updatedEl.textContent = formatDate(model.updatedAt);

    // Set data-model-id cho các nút
    if (editBtn) editBtn.dataset.modelId = model.id;
    if (deleteBtn) deleteBtn.dataset.modelId = model.id;
    if (exportBtn) {
         exportBtn.dataset.modelId = model.id;
         exportBtn.disabled = false; // Enable export
    }

    modalElement.classList.remove('hidden');
    return true; // Indicate success
}

// --- Open Add Form Modal ---
export function openAddFormModal(modalElement, formElement, titleElement, idInputElement, fileInputElement, reqIndicator, optIndicator, currentFileEl) {
    if (!modalElement || !formElement || !titleElement || !idInputElement || !fileInputElement || !reqIndicator || !optIndicator || !currentFileEl) return false;

    titleElement.textContent = 'Add New Model';
    formElement.reset();
    idInputElement.value = '';

    fileInputElement.required = true;
    reqIndicator.classList.remove('hidden');
    optIndicator.classList.add('hidden');
    currentFileEl.classList.add('hidden');
    currentFileEl.textContent = '';

    modalElement.classList.remove('hidden');
    return true;
}

// --- Open Edit Form Modal ---
export function openEditFormModal(modalElement, formElement, titleElement, idInputElement, fileInputElement, reqIndicator, optIndicator, currentFileEl, model, nameInput, versionInput, typeInput, descriptionInput, trainedAtInput) {
    if (!model || !modalElement || !formElement || !titleElement || !idInputElement || !fileInputElement || !reqIndicator || !optIndicator || !currentFileEl || !nameInput || !versionInput || !typeInput || !descriptionInput || !trainedAtInput) return false;

    titleElement.textContent = 'Edit Model';
    idInputElement.value = model.id;
    nameInput.value = model.name || '';
    versionInput.value = model.version || '';
    typeInput.value = model.type || '';
    descriptionInput.value = model.description || '';
    trainedAtInput.value = formatDateTimeForInput(model.trainedAt);

    fileInputElement.required = false;
    fileInputElement.value = ''; // Clear selected file
    reqIndicator.classList.add('hidden');
    optIndicator.classList.remove('hidden');

    if (model.modelPath) {
        currentFileEl.textContent = `Current file: ${model.modelPath}. Choose a new file to replace it.`;
        currentFileEl.classList.remove('hidden');
    } else {
        currentFileEl.textContent = 'No current file associated.';
        currentFileEl.classList.remove('hidden');
    }

    modalElement.classList.remove('hidden');
    return true;
}

// --- Close Form Modal ---
export function closeFormModal(modalElement, fileInputElement, currentFileEl) {
    if (modalElement) modalElement.classList.add('hidden');
    if (fileInputElement) fileInputElement.value = '';
    if (currentFileEl) currentFileEl.classList.add('hidden');
}

// --- Close Details Modal ---
export function closeDetailsModal(modalElement) {
     if (modalElement) modalElement.classList.add('hidden');
}