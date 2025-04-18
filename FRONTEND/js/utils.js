// js/utils.js

export function formatDate(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    try {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateTimeString).toLocaleDateString('vi-VN', options);
    } catch (e) { return dateTimeString; }
}

export function formatDateTimeForInput(isoString) {
    if (!isoString) return '';
    try { return isoString.substring(0, 16); }
    catch (e) { return ''; }
}

export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
    };
}

// Hàm showFeedback nên ở ui.js vì nó thao tác trực tiếp DOM element cụ thể