// Global state variables
let currentCourseId = null;
let currentCourse = null; // Store current course details globally
let allCourses = [];
let allStudents = [];
let allSupports = [];

// Helper functions to get DOM elements safely (optional, but good practice)
const getElement = (id) => document.getElementById(id);
const querySelector = (selector) => document.querySelector(selector);

// Functions to update UI - called from global functions
function displayCourses(courses) {
    const coursesGrid = getElement('courses-grid');
    const cardTemplate = getElement('course-card-template');
    if (!coursesGrid || !cardTemplate) return;

    coursesGrid.innerHTML = '';

    courses.forEach(course => {
        const clone = document.importNode(cardTemplate.content, true);

        const setText = (selector, text) => {
            const el = clone.querySelector(selector);
            if (el) el.textContent = text || '';
        };
        const setSrc = (selector, src, alt) => {
            const el = clone.querySelector(selector);
            if (el) { el.src = src || ''; el.alt = alt || ''; }
        };
        const setOnClick = (selector, handler) => {
            const el = clone.querySelector(selector);
            if (el) el.onclick = handler;
        };

        setText('[data-course-name]', course.TenKhoaHoc);
        setText('[data-course-description]', course.MoTa);
        setText('[data-course-start-date]', course.NgayBatDau ? new Date(course.NgayBatDau).toLocaleDateString('vi-VN') : '');
        setText('[data-course-end-date]', course.NgayKetThuc ? new Date(course.NgayKetThuc).toLocaleDateString('vi-VN') : '');
        setSrc('[data-course-image]', course.image ? `/images/${course.image}` : '', course.TenKhoaHoc);

        const detailsButton = clone.querySelector('[data-details-button]');
        detailsButton.onclick = () => {
            window.location.href = `/course-details.html?id=${course._id}`;
        };

        setOnClick('[data-edit-button]', () => openAddCourseModal(course));
        setOnClick('[data-delete-button]', () => deleteCourse(course._id));

        coursesGrid.appendChild(clone);
    });
}

function filterCourses() {
    const searchInput = getElement('search-input');
    if (!searchInput) return;
    const searchValue = searchInput.value.toLowerCase();
    const filteredCourses = allCourses.filter(course =>
        (course.TenKhoaHoc && course.TenKhoaHoc.toLowerCase().includes(searchValue)) ||
        (course.MoTa && course.MoTa.toLowerCase().includes(searchValue))
    );
    displayCourses(filteredCourses);
}

function displayAvailableStudents() {
    const availableStudentsList = getElement('available-students');
    if (!availableStudentsList || !currentCourse) return; // Ensure elements and currentCourse exist

    // Filter students already in the current course using global currentCourse
    const available = allStudents.filter(student =>
        !currentCourse.students.includes(student._id)
    );

    availableStudentsList.innerHTML = available.map(student => `
        <div class="list-item" onclick="addStudentToCourse('${currentCourseId}', '${student._id}')">
            <div class="item-info">
                <span class="item-name">${student.HoTen}</span>
                <span class="item-id">${student._id}</span>
            </div>
        </div>
    `).join('');
}

function displayAvailableSupports() {
    const availableSupportsList = getElement('available-supports');
    if (!availableSupportsList || !currentCourse) return; // Ensure elements and currentCourse exist

    // Filter supports already in the current course using global currentCourse
    const available = allSupports.filter(support =>
        !currentCourse.supports.includes(support._id)
    );

    availableSupportsList.innerHTML = available.map(support => `
        <div class="list-item" onclick="addSupportToCourse('${currentCourseId}', '${support._id}')">
            <div class="item-info">
                <span class="item-name">${support.hoTen}</span>
                <span class="item-id">${support._id}</span>
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

// Global functions for API Interactions and Modals (called from HTML onclick/oninput)

async function fetchCourses() {
    try {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'flex';

        const response = await fetch('/api/courses');
        const data = await response.json();

        if (data.success) {
            allCourses = data.data; // Update global state
            displayCourses(allCourses); // Update UI
        } else {
            console.error('Error fetching courses:', data.message);
            showError(data.message || 'Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        showError(error.message || 'Lỗi khi tải danh sách khóa học. Vui lòng thử lại sau.');
    } finally {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

async function fetchCourseDetails(courseId) {
    try {
        currentCourseId = courseId; // Set global state
        const courseDetailsName = getElement('course-details-name');
        const studentsList = getElement('students-list');
        const supportsList = getElement('supports-list');

        const response = await fetch(`/api/courses/${courseId}/details`);
        const data = await response.json();

        if (data.success) {
            currentCourse = data.data.course; // Store the fetched course data globally
            const { course, students, supports } = data.data;
            if (courseDetailsName) courseDetailsName.textContent = course.TenKhoaHoc || '';

            // Display students
            if (studentsList) {
                studentsList.innerHTML = students.map(student => `
                    <div class="list-item">
                        <div class="item-info">
                            <span class="item-name">${student.HoTen || 'N/A'}</span>
                            <span class="item-id">${student._id || 'N/A'}</span>
                        </div>
                        <button class="remove-button" onclick="removeStudentFromCourse('${courseId}', '${student._id}')">
                            <i class="fas fa-times"></i>
                        </button>
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
                        <button class="remove-button" onclick="removeSupportFromCourse('${courseId}', '${support._id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }

        } else {
            alert('Lỗi: ' + (data.message || 'Không thể tải chi tiết khóa học.'));
        }
    } catch (error) {
        console.error('Error fetching course details:', error);
        alert('Lỗi khi tải thông tin khóa học');
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

async function handleCourseFormSubmit(event) {
    event.preventDefault();

    try {
        const url = currentCourseId
            ? `/api/courses/${currentCourseId}`
            : '/api/courses';

        const method = currentCourseId ? 'PUT' : 'POST';

        const formData = new FormData();
        const courseNameInput = getElement('course-name');
        const courseDescriptionInput = getElement('course-description');
        const startDateInput = getElement('course-start-date');
        const endDateInput = getElement('course-end-date');
        const imageInput = getElement('course-image');

        if (courseNameInput) formData.append('TenKhoaHoc', courseNameInput.value);
        if (courseDescriptionInput) formData.append('MoTa', courseDescriptionInput.value);

        if (startDateInput && startDateInput.value) {
            formData.append('NgayBatDau', new Date(startDateInput.value).toISOString());
        } else if (!currentCourseId) {
            showError('Vui lòng nhập ngày bắt đầu.');
            return;
        }

        if (endDateInput && endDateInput.value) {
            formData.append('NgayKetThuc', new Date(endDateInput.value).toISOString());
        } else if (!currentCourseId) {
            showError('Vui lòng nhập ngày kết thúc.');
            return;
        }

        const imageFile = imageInput ? imageInput.files[0] : null;
        const courseName = courseNameInput ? courseNameInput.value : '';

        if (!currentCourseId && !imageFile) {
            showError('Vui lòng thêm hình ảnh cho khóa học mới.');
            return;
        }

        if (imageFile && courseName) {
            const fileExtension = imageFile.name.split('.').pop();
            const newFileName = `${courseName}.${fileExtension}`;
            const renamedFile = new File([imageFile], newFileName, { type: imageFile.type });
            formData.append('image', renamedFile);
        } else if (imageFile && !courseName) {
            showError('Vui lòng nhập Tên khóa học trước khi chọn ảnh.');
            return;
        }

        const response = await fetch(url, {
            method,
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error details:', errorData);
            throw new Error(errorData.message || 'Lỗi khi lưu khóa học');
        }

        closeCourseModal();
        fetchCourses(); // Refresh course list
        showSuccess(currentCourseId ? 'Cập nhật khóa học thành công!' : 'Thêm khóa học mới thành công!');
    } catch (err) {
        console.error('Error saving course:', err);
        showError(`Không thể lưu khóa học: ${err.message}`);
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
            fetchCourseDetails(courseId); // Refresh details
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể xóa support.'));
        }
    } catch (error) {
        console.error('Error removing support:', error);
        alert('Lỗi khi xóa support');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

    try {
        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            fetchCourses(); // Refresh course list
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể xóa khóa học.'));
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        alert('Lỗi khi xóa khóa học');
    }
}

// Global functions to open/close modals
function openAddCourseModal(course = null) {
    const modal = getElement('course-modal');
    const title = modal ? modal.querySelector('#modal-title') : null;
    const form = getElement('course-form');
    const submitButton = modal ? modal.querySelector('button[type="submit"]') : null;
    const courseNameInput = getElement('course-name');
    const courseDescriptionInput = getElement('course-description');
    const startDateInput = getElement('course-start-date');
    const endDateInput = getElement('course-end-date');

    currentCourseId = course ? course._id : null;

    if (title) title.textContent = course ? 'Sửa khóa học' : 'Thêm khóa học mới';

    if (submitButton) {
        submitButton.textContent = course ? 'Cập nhật' : 'Lưu';
    }

    if (course) {
        if (courseNameInput) courseNameInput.value = course.TenKhoaHoc || '';
        if (courseDescriptionInput) courseDescriptionInput.value = course.MoTa || '';
        if (startDateInput) startDateInput.value = course.NgayBatDau ? new Date(course.NgayBatDau).toISOString().split('T')[0] : '';
        if (endDateInput) endDateInput.value = course.NgayKetThuc ? new Date(course.NgayKetThuc).toISOString().split('T')[0] : '';
    } else {
        if (form) form.reset();
    }

    if (modal) modal.classList.add('active');
}

function closeCourseModal() {
    const modal = getElement('course-modal');
    const form = getElement('course-form');
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    currentCourseId = null;
    const submitButton = modal ? modal.querySelector('button[type="submit"]') : null;
    if (submitButton) {
        submitButton.textContent = 'Lưu';
    }
}

function showCourseDetails(courseId) {
    currentCourseId = courseId; // Set global state
    const modal = getElement('course-details-modal');
    if (modal) modal.classList.add('active');
    fetchCourseDetails(courseId); // Call global fetch function
}

function closeCourseDetailsModal() {
    const modal = getElement('course-details-modal');
    const studentsList = getElement('students-list');
    const supportsList = getElement('supports-list');
    if (modal) modal.classList.remove('active');
    currentCourseId = null;
    currentCourse = null; // Clear global state
    if (studentsList) studentsList.innerHTML = '';
    if (supportsList) supportsList.innerHTML = '';
}

async function openAddStudentModal() {
    if (!currentCourse) {
        alert('Vui lòng chọn một khóa học trước.');
        return;
    }
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

async function openAddSupportModal() {
    if (!currentCourse) {
        alert('Vui lòng chọn một khóa học trước.');
        return;
    }
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

// DOMContentLoaded listener for initial setup and event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const searchInput = getElement('search-input');
    const studentSearch = getElement('student-search');
    const supportSearch = getElement('support-search');
    const courseForm = getElement('course-form');

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }

    if (studentSearch) {
        studentSearch.addEventListener('input', () => {
            const searchValue = studentSearch.value.toLowerCase();
            // Filter using global allStudents and update display using global displayAvailableStudents
            const filteredStudents = allStudents.filter(student =>
                (student.HoTen && student.HoTen.toLowerCase().includes(searchValue)) || (student._id && student._id.toLowerCase().includes(searchValue))
            );
            // Update the global allStudents to reflect the filtered list temporarily for display
            // This approach is simpler than passing the filtered list around.
            const originalAllStudents = allStudents; // Store original
            allStudents = filteredStudents; // Temporarily replace
            displayAvailableStudents(); // Display the filtered list
            allStudents = originalAllStudents; // Restore original
        });
    }

    if (supportSearch) {
        supportSearch.addEventListener('input', () => {
            const searchValue = supportSearch.value.toLowerCase();
            // Filter using global allSupports and update display using global displayAvailableSupports
            const filteredSupports = allSupports.filter(support =>
                (support.hoTen && support.hoTen.toLowerCase().includes(searchValue)) || (support._id && support._id.toLowerCase().includes(searchValue))
            );
            // Update the global allSupports to reflect the filtered list temporarily for display
            const originalAllSupports = allSupports; // Store original
            allSupports = filteredSupports; // Temporarily replace
            displayAvailableSupports(); // Display the filtered list
            allSupports = originalAllSupports; // Restore original
        });
    }

    if (courseForm) {
        courseForm.addEventListener('submit', handleCourseFormSubmit);
    }

    // Initial fetch of courses
    fetchCourses();
});