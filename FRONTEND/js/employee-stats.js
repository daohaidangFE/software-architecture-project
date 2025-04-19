document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:9000'; // URL của API Gateway
    const STATS_ENDPOINT = '/api/statistics/employees'; // Endpoint đã định nghĩa trong Gateway

    // --- DOM Elements ---
    const totalEmployeesStatEl = document.getElementById('total-employees-stat');
    const allowedEmployeesStatEl = document.getElementById('allowed-employees-stat');
    const disallowedEmployeesStatEl = document.getElementById('disallowed-employees-stat');
    const departmentCountStatEl = document.getElementById('department-count-stat');
    const departmentTableBodyEl = document.getElementById('department-stats-body');
    const noDepartmentDataEl = document.getElementById('no-department-data');
    const feedbackMessageEl = document.getElementById('feedback-message');
    const exportButton = document.getElementById('export-stats-button'); // Lấy nút Export

    // --- State ---
    let currentStatsData = null; // Biến để lưu trữ dữ liệu thống kê mới nhất

    // --- Functions ---

    /**
     * Fetches employee statistics data from the API.
     * @returns {Promise<object>} The statistics data.
     * @throws {Error} If the fetch operation fails or the response is not ok.
     */
    async function fetchEmployeeStatistics() {
        const url = API_BASE_URL + STATS_ENDPOINT;
        console.log(`Fetching employee stats from: ${url}`);
        try {
            const response = await fetch(url);

            if (!response.ok) {
                let errorMsg = `Error fetching stats: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg += ` - ${errorData.message || errorData.error || JSON.stringify(errorData)}`;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            throw new Error(`Network error or API unavailable: ${error.message}`);
        }
    }

    /**
     * Updates the summary statistics cards on the page.
     * @param {object} stats - The statistics data object from the API.
     */
    function updateStatsCards(stats) {
        if (!stats) {
            console.warn('No stats data received to update cards.');
            totalEmployeesStatEl.textContent = 'N/A';
            allowedEmployeesStatEl.textContent = 'N/A';
            disallowedEmployeesStatEl.textContent = 'N/A';
            departmentCountStatEl.textContent = 'N/A';
            return;
        }
        totalEmployeesStatEl.textContent = stats.totalEmployees ?? 0;
        allowedEmployeesStatEl.textContent = stats.allowedEmployees ?? 0;
        disallowedEmployeesStatEl.textContent = stats.disallowedEmployees ?? 0;
        const departmentCount = stats.countByDepartment ? Object.keys(stats.countByDepartment).length : 0;
        departmentCountStatEl.textContent = departmentCount;
    }

    /**
     * Updates the department statistics table.
     * @param {object} departmentStats - The countByDepartment map from the API response.
     */
    function updateDepartmentTable(departmentStats) {
        departmentTableBodyEl.innerHTML = '';
        noDepartmentDataEl.classList.add('hidden');

        if (departmentStats && Object.keys(departmentStats).length > 0) {
            Object.entries(departmentStats).forEach(([departmentName, count]) => {
                const row = departmentTableBodyEl.insertRow();
                const cellName = row.insertCell();
                cellName.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-700';
                cellName.textContent = departmentName;
                const cellCount = row.insertCell();
                cellCount.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                cellCount.textContent = count;
            });
        } else {
            noDepartmentDataEl.classList.remove('hidden');
             const row = departmentTableBodyEl.insertRow();
             const cell = row.insertCell();
             cell.colSpan = 2;
             cell.className = 'text-center py-4 text-gray-500 text-sm';
             cell.textContent = 'No department data available.';
        }
    }

     /**
     * Displays a feedback message (error or success) to the user.
     * @param {string} message - The message to display.
     * @param {'error' | 'success' | 'info'} type - The type of message.
     */
    function showFeedback(message, type = 'info') { // Thêm type 'info'
        feedbackMessageEl.textContent = message;
        feedbackMessageEl.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700', 'bg-blue-100', 'text-blue-700'); // Clear previous classes
        feedbackMessageEl.classList.add('p-4', 'rounded', 'mb-4'); // Add common classes

        if (type === 'error') {
            feedbackMessageEl.classList.add('bg-red-100', 'text-red-700');
        } else if (type === 'success') {
            feedbackMessageEl.classList.add('bg-green-100', 'text-green-700');
        } else { // info
             feedbackMessageEl.classList.add('bg-blue-100', 'text-blue-700');
        }
        feedbackMessageEl.classList.remove('hidden'); // Make sure it's visible

        // Optional: Auto-hide message after some time
        setTimeout(() => {
            feedbackMessageEl.classList.add('hidden');
        }, 5000);
    }


    /**
     * Generates CSV content string from the statistics data.
     * @param {object} statsData - The complete statistics data object.
     * @returns {string} The CSV formatted string.
     */
    function generateCsvContent(statsData) {
        if (!statsData) return ''; // Return empty string if no data

        const rows = [];
        const departmentCount = statsData.countByDepartment ? Object.keys(statsData.countByDepartment).length : 0;

        // Header Row for Summary
        rows.push(['Statistic', 'Value']);
        // Summary Data Rows
        rows.push(['Total Employees', statsData.totalEmployees ?? 0]);
        rows.push(['Allowed Employees', statsData.allowedEmployees ?? 0]);
        rows.push(['Disallowed Employees', statsData.disallowedEmployees ?? 0]);
        rows.push(['Number of Departments', departmentCount]);

        // Separator Row
        rows.push([]); // Add an empty row

        // Header Row for Department Stats
        rows.push(['Department Name', 'Employee Count']);

        // Department Data Rows
        if (statsData.countByDepartment && departmentCount > 0) {
            Object.entries(statsData.countByDepartment).forEach(([deptName, count]) => {
                 // Escape commas within department names if necessary (though unlikely here)
                 const escapedDeptName = `"${deptName.replace(/"/g, '""')}"`;
                rows.push([escapedDeptName, count]);
            });
        } else {
            rows.push(['No department data', '']);
        }

        // Convert array of arrays to CSV string
        return rows.map(row => row.join(',')).join('\n');
    }

    /**
     * Triggers the download of a CSV file.
     * @param {string} csvContent - The CSV content as a string.
     * @param {string} filename - The desired name for the downloaded file.
     */
    function downloadCsv(csvContent, filename) {
         // Add BOM for UTF-8 Excel compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.display = 'none'; // Hide the link

        document.body.appendChild(link); // Add link to DOM to make it clickable
        link.click(); // Simulate click to trigger download
        document.body.removeChild(link); // Remove link from DOM
        URL.revokeObjectURL(url); // Optional: Free up memory
    }


    // --- Initialization ---
    async function initializePage() {
        try {
            totalEmployeesStatEl.textContent = '...';
            allowedEmployeesStatEl.textContent = '...';
            disallowedEmployeesStatEl.textContent = '...';
            departmentCountStatEl.textContent = '...';

            currentStatsData = await fetchEmployeeStatistics(); // Store fetched data
            console.log("Received stats data:", currentStatsData);

            updateStatsCards(currentStatsData);
            updateDepartmentTable(currentStatsData.countByDepartment);

        } catch (error) {
            console.error("Failed to initialize page:", error);
            showFeedback(`Failed to load employee statistics: ${error.message}`, 'error');
            totalEmployeesStatEl.textContent = 'Error';
            allowedEmployeesStatEl.textContent = 'Error';
            disallowedEmployeesStatEl.textContent = 'Error';
            departmentCountStatEl.textContent = 'Error';
             departmentTableBodyEl.innerHTML = '';
             const row = departmentTableBodyEl.insertRow();
             const cell = row.insertCell();
             cell.colSpan = 2;
             cell.className = 'text-center py-4 text-red-500 text-sm';
             cell.textContent = 'Failed to load department data.';
        }
    }

    // --- Event Listeners ---
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            console.log('Export Stats button clicked');
            if (currentStatsData) {
                try {
                    const csvContent = generateCsvContent(currentStatsData);
                    if (csvContent) {
                        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
                        const filename = `employee_statistics_${timestamp}.csv`;
                        downloadCsv(csvContent, filename);
                        showFeedback('Statistics exported successfully.', 'success');
                    } else {
                         showFeedback('No data available to export.', 'info');
                    }
                } catch (error) {
                     console.error("Error generating or downloading CSV:", error);
                     showFeedback('Error during export. Please try again.', 'error');
                }
            } else {
                showFeedback('Statistics data not loaded yet. Please wait or refresh.', 'error');
            }
        });
    } else {
         console.warn("Export button not found.");
    }


    // --- Run Initialization ---
    initializePage();

});