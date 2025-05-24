// Global state variables
let currentCourseId = null;
let currentCourse = null; // Store current course details globally
let allStudents = []; // List of all students for adding modal
let allSupports = []; // List of all supports for adding modal

// Helper function to get DOM elements safely
const getElement = (id) => document.getElementById(id);

// Functions to update UI elements
function displayCourseDetails(course, students, supports) {
    const courseDetailsName = getElement('course-details-name');
    const studentsList = getElement('students-list');
    const supportsList = getElement('supports-list');

    if (courseDetailsName) courseDetailsName.textContent = course.TenKhoaHoc || '';

    // Display students
    if (studentsList) {
        studentsList.innerHTML = students.map(student => `
            <div class="list-item">
                <div class="item-info">
                    <span class="item-name">${student.HoTen || 'N/A'}</span>
                    <span class="item-id">${student._id || 'N/A'}</span>
                </div>
                <div class="item-actions">
                    <button class="remove-button" onclick="removeStudentFromCourse('${currentCourseId}', '${student._id}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="result-button" onclick="openResultModal('${student._id}', '${student.HoTen || 'N/A'}')">
                        <i class="fas fa-clipboard"></i> Kết quả
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Display supports
    if (supportsList) {
        supportsList.innerHTML = supports.map(support => `
            <div class="list-item">
                <div class="item-info">
                    <span class="item-name">${support.hoTen || 'N/A'}</span>
                    <span class="item-id">${support._id || 'N/A'}</span>
                </div>
                <button class="remove-button" onclick="removeSupportFromCourse('${currentCourseId}', '${support._id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

function displayAvailableStudents() {
    const availableStudentsList = getElement('available-students');
    if (!availableStudentsList || !currentCourse) return; // Ensure elements and currentCourse exist

    const studentSearch = getElement('student-search');
    const searchValue = studentSearch ? studentSearch.value.toLowerCase() : '';

    // Filter students already in the current course using global currentCourse
    const available = allStudents.filter(student =>
        currentCourse && !currentCourse.students.includes(student._id) &&
        ((student.HoTen && student.HoTen.toLowerCase().includes(searchValue)) || (student._id && student._id.toLowerCase().includes(searchValue)))
    );

    availableStudentsList.innerHTML = available.map(student => `
        <div class="list-item" onclick="addStudentToCourse('${currentCourseId}', '${student._id}')">
            <div class="item-info">
                <span class="item-name">${student.HoTen || 'N/A'}</span>
                <span class="item-id">${student._id || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function displayAvailableSupports() {
    const availableSupportsList = getElement('available-supports');
    if (!availableSupportsList || !currentCourse) return; // Ensure elements and currentCourse exist

    const supportSearch = getElement('support-search');
    const searchValue = supportSearch ? supportSearch.value.toLowerCase() : '';

    // Filter supports already in the current course using global currentCourse
    const available = allSupports.filter(support =>
        currentCourse && !currentCourse.supports.includes(support._id) &&
        ((support.hoTen && support.hoTen.toLowerCase().includes(searchValue)) || (support._id && support._id.toLowerCase().includes(searchValue)))
    );

    availableSupportsList.innerHTML = available.map(support => `
        <div class="list-item" onclick="addSupportToCourse('${currentCourseId}', '${support._id}')">
            <div class="item-info">
                <span class="item-name">${support.hoTen || 'N/A'}</span>
                <span class="item-id">${support._id || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function showError(message) {
    const errorElement = getElement('error');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.backgroundColor = '#f8d7da'; // Light red background
    errorElement.style.color = '#721c24'; // Dark red text
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorElement = getElement('error');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.backgroundColor = '#d4edda'; // Light green background
    errorElement.style.color = '#155724'; // Dark green text
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// API Interaction Functions
async function fetchCourseDetails(courseId) {
    try {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'flex';

        const response = await fetch(`/api/courses/${courseId}/details`);
        const data = await response.json();

        if (data.success) {
            currentCourse = data.data.course; // Store the fetched course data globally
            displayCourseDetails(data.data.course, data.data.students, data.data.supports);
        } else {
            console.error('Error fetching course details:', data.message);
            showError(data.message || 'Không thể tải chi tiết khóa học.');
        }
    } catch (error) {
        console.error('Error fetching course details:', error);
        showError('Lỗi khi tải thông tin khóa học');
    } finally {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

async function fetchStudents() {
    try {
        const response = await fetch('/api/students');
        const data = await response.json();
        if (data.success) {
            allStudents = data.data; // Update global state
            displayAvailableStudents(); // Update UI
        } else {
            console.error('Error fetching students:', data.message);
            alert('Lỗi khi tải danh sách học viên: ' + (data.message || ''));
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Lỗi khi tải danh sách học viên');
    }
}

async function fetchSupports() {
    try {
        const response = await fetch('/api/supports');
        const data = await response.json();
        if (data.success) {
            allSupports = data.data; // Update global state
            displayAvailableSupports(); // Update UI
        } else {
            console.error('Error fetching supports:', data.message);
            alert('Lỗi khi tải danh sách support: ' + (data.message || ''));
        }
    } catch (error) {
        console.error('Error fetching supports:', error);
        alert('Lỗi khi tải danh sách support');
    }
}

async function addStudentToCourse(courseId, studentId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId })
        });
        const data = await response.json();

        if (data.success) {
            showSuccess(data.message || 'Thêm học viên thành công!');
            closeAddStudentModal();
            fetchCourseDetails(courseId); // Refresh details
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể thêm học viên.'));
        }
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Lỗi khi thêm học viên');
    }
}

async function addSupportToCourse(courseId, supportId) {
    try {
        const response = await fetch(`/api/courses/${courseId}/supports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ supportId })
        });
        const data = await response.json();

        if (data.success) {
            showSuccess(data.message || 'Thêm support thành công!');
            closeAddSupportModal();
            fetchCourseDetails(courseId); // Refresh details
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể thêm support.'));
        }
    } catch (error) {
        console.error('Error adding support:', error);
        alert('Lỗi khi thêm support');
    }
}

async function removeStudentFromCourse(courseId, studentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa học viên này khỏi khóa học?')) return;
    try {
        const response = await fetch(`/api/courses/${courseId}/students/${studentId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            showSuccess(data.message || 'Xóa học viên thành công!');
            fetchCourseDetails(courseId); // Refresh details
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể xóa học viên.'));
        }
    } catch (error) {
        console.error('Error removing student:', error);
        alert('Lỗi khi xóa học viên');
    }
}

async function removeSupportFromCourse(courseId, supportId) {
    if (!confirm('Bạn có chắc chắn muốn xóa support này khỏi khóa học?')) return;
    try {
        const response = await fetch(`/api/courses/${courseId}/supports/${supportId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            showSuccess(data.message || 'Xóa support thành công!');
            fetchCourseDetails(courseId); // Refresh details
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể xóa support.'));
        }
    } catch (error) {
        console.error('Error removing support:', error);
        alert('Lỗi khi xóa support');
    }
}

// Add fetch/save result functions - Ensure studentId and courseId are ObjectIds here
async function fetchResult(studentId, courseId) {
    try {
        // Use ObjectId for studentId and courseId in the API call
        const response = await fetch(`/api/results/${courseId}/${studentId}`);
        const data = await response.json();
        if (data.success) {
            return data.data.score; // Return the score or null if not found
        } else {
            console.error('Error fetching result:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching result:', error);
        return null;
    }
}

async function saveResult() {
    try {
        // Get ObjectId values from hidden inputs
        const studentId = getElement('result-student-id').value;
        const courseId = getElement('result-course-id').value;
        const scoreInput = getElement('student-score');
        const score = parseFloat(scoreInput.value);

        // Add console logs to check values
        console.log('Saving result:');
        console.log('Student ID:', studentId);
        console.log('Course ID:', courseId);
        console.log('Score:', score);

        if (!studentId || !courseId || isNaN(score)) {
            showError('Dữ liệu kết quả không hợp lệ.');
            return;
        }

        if (score < 0 || score > 10) {
            showError('Điểm phải nằm trong khoảng từ 0 đến 10.');
            return;
        }

        // Send ObjectId values in the request body
        const response = await fetch('/api/results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId: courseId, studentId: studentId, score: score })
        });
        const data = await response.json();

        if (data.success) {
            showSuccess(data.message || 'Lưu kết quả thành công!');
            closeResultModal();
            fetchCourseDetails(currentCourseId); // Refresh details
        } else {
            showError(data.message || 'Lỗi khi lưu kết quả.');
        }
    } catch (error) {
        console.error('Error saving result:', error);
        showError('Lỗi khi lưu kết quả.');
    }
}

// Modal Functions
function openAddStudentModal() {
    const modal = getElement('add-student-modal');
    if (modal) modal.classList.add('active');
    fetchStudents(); // Fetch all students and update display
}

function closeAddStudentModal() {
    const modal = getElement('add-student-modal');
    const studentSearch = getElement('student-search');
    const availableStudentsList = getElement('available-students');
    if (modal) modal.classList.remove('active');
    if (studentSearch) studentSearch.value = '';
    if (availableStudentsList) availableStudentsList.innerHTML = '';
}

function openAddSupportModal() {
    const modal = getElement('add-support-modal');
    if (modal) modal.classList.add('active');
    fetchSupports(); // Fetch all supports and update display
}

function closeAddSupportModal() {
    const modal = getElement('add-support-modal');
    const supportSearch = getElement('support-search');
    const availableSupportsList = getElement('available-supports');
    if (modal) modal.classList.remove('active');
    if (supportSearch) supportSearch.value = '';
    if (availableSupportsList) availableSupportsList.innerHTML = '';
}

// Modified openResultModal to store and use ObjectId
async function openResultModal(studentId, studentName) {
    if (!currentCourse || !currentCourseId) {
        showError('Vui lòng chọn một khóa học hợp lệ.');
        return;
    }

    const modal = getElement('result-modal');
    const studentNameElement = getElement('result-student-name');
    const courseNameElement = getElement('result-course-name');
    const studentScoreInput = getElement('student-score');
    const resultStudentIdInput = getElement('result-student-id');
    const resultCourseIdInput = getElement('result-course-id');

    if (!modal || !studentNameElement || !courseNameElement || !studentScoreInput || !resultStudentIdInput || !resultCourseIdInput) {
        console.error('Result modal elements not found.');
        showError('Lỗi: Không tìm thấy các phần tử modal kết quả.');
        return;
    }

    // Set modal content - studentId here is the ObjectId
    studentNameElement.textContent = studentName;
    courseNameElement.textContent = currentCourse.TenKhoaHoc || 'N/A';
    resultStudentIdInput.value = studentId; // Store ObjectId
    resultCourseIdInput.value = currentCourseId; // Store ObjectId

    // Fetch and display existing score using ObjectId
    const existingScore = await fetchResult(studentId, currentCourseId);
    studentScoreInput.value = existingScore !== null && existingScore !== undefined ? existingScore : '';

    modal.classList.add('active'); // Show modal
}

function closeResultModal() {
    const modal = getElement('result-modal');
    const studentScoreInput = getElement('student-score');
    if (modal) modal.classList.remove('active');
    if (studentScoreInput) studentScoreInput.value = '';
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (courseId) {
        currentCourseId = courseId; // Set global state
        fetchCourseDetails(courseId);

        // Add event listeners for search inputs in modals
        const studentSearch = getElement('student-search');
        if (studentSearch) {
            studentSearch.addEventListener('input', displayAvailableStudents);
        }

        const supportSearch = getElement('support-search');
        if (supportSearch) {
            supportSearch.addEventListener('input', displayAvailableSupports);
        }

    } else {
        showError('Không tìm thấy ID khóa học trong URL.');
    }
});

// Expose functions to global scope for HTML onclick attributes
window.openAddStudentModal = openAddStudentModal;
window.closeAddStudentModal = closeAddStudentModal;
window.openAddSupportModal = openAddSupportModal;
window.closeAddSupportModal = closeAddSupportModal;
window.addStudentToCourse = addStudentToCourse;
window.addSupportToCourse = addSupportToCourse;
window.removeStudentFromCourse = removeStudentFromCourse;
window.removeSupportFromCourse = removeSupportFromCourse;
window.openResultModal = openResultModal;
window.closeResultModal = closeResultModal;
window.saveResult = saveResult; 