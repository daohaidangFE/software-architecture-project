// js/api.js

const API_BASE_URL = 'http://localhost:9000/api/models/'; // URL cơ sở

// Lấy tất cả models (có thể thêm params sau này nếu cần)
export async function fetchModels() {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (fetchModels): ${response.status}. ${errorText.substring(0, 100)}`);
    }
    return await response.json(); // Trả về toàn bộ danh sách
}

// Tạo model mới (nhận FormData)
export async function createModel(formData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData, // Gửi FormData
    });
    if (!response.ok) {
        let errorText = `Status: ${response.status}`;
        try { const errorBody = await response.json(); errorText = errorBody.message || JSON.stringify(errorBody); }
        catch (e) { errorText = await response.text(); }
        throw new Error(`API Error (createModel): ${errorText.substring(0, 150)}`);
    }
    // Có thể trả về kết quả hoặc không tùy vào API POST
     try {
         return await response.json(); // Giả sử API trả về model đã tạo
     } catch (e) {
         return null; // Hoặc null nếu không có body hoặc lỗi parse
     }
}

// Cập nhật model (nhận ID và FormData)
export async function updateModel(id, formData) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: formData, // Gửi FormData
    });
    if (!response.ok) {
        let errorText = `Status: ${response.status}`;
        try { const errorBody = await response.json(); errorText = errorBody.message || JSON.stringify(errorBody); }
        catch (e) { errorText = await response.text(); }
        throw new Error(`API Error (updateModel): ${errorText.substring(0, 150)}`);
    }
     try {
         return await response.json(); // Giả sử API trả về model đã cập nhật
     } catch (e) {
         return null;
     }
}

// Xóa model
export async function deleteModelApi(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        let errorText = `Status: ${response.status}`;
        try { const errorBody = await response.json(); errorText = errorBody.message || JSON.stringify(errorBody); }
        catch (e) { errorText = await response.text(); }
        if (response.status === 404) errorText = `Model with ID ${id} not found.`;
        throw new Error(`API Error (deleteModelApi): ${errorText.substring(0, 150)}`);
    }
    // DELETE thành công thường không có body
}

// Lấy URL download (frontend tự điều hướng)
export function getModelDownloadUrl(id) {
    return `${API_BASE_URL}/${id}/download`;
}

// Lấy URL export CSV (frontend tự điều hướng)
export function getCsvExportUrl() {
    return `${API_BASE_URL}/export/csv`;
}