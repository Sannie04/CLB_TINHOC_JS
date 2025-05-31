// Biến trạng thái toàn cục
let currentCourseId = null;
let allCourses = []; // Danh sách tất cả khóa học

// Hàm tiện ích để lấy phần tử DOM an toàn
const getElement = (id) => document.getElementById(id);

// Hàm lấy token từ localStorage và cấu hình header
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Nếu không có token, chuyển hướng về trang đăng nhập
        window.location.href = 'login.html';
        return null; // Trả về null để hàm gọi fetch dừng lại
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Hàm xử lý phản hồi từ API (bao gồm lỗi 401/403)
async function handleApiResponse(response) {
    if (response.status === 401 || response.status === 403) {
        alert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
        localStorage.clear(); // Xóa token và thông tin user
        window.location.href = 'login.html';
        return null; // Hoặc throw new Error('Unauthorized');
    }
    // Xử lý các lỗi khác hoặc trả về dữ liệu
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// Các hàm cập nhật giao diện
function displayCourses(courses) {
    const coursesGrid = getElement('courses-grid');
    const cardTemplate = getElement('course-card-template');
    if (!coursesGrid || !cardTemplate) return;

    coursesGrid.innerHTML = '';

    // Lấy thông tin user từ localStorage và kiểm tra role
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    courses.forEach(course => {
        const clone = document.importNode(cardTemplate.content, true);

        // Hàm tiện ích để thiết lập text cho các phần tử
        const setText = (selector, text) => {
            const el = clone.querySelector(selector);
            if (el) el.textContent = text || '';
        };
        // Hàm tiện ích để thiết lập src cho các phần tử hình ảnh
        const setSrc = (selector, src, alt) => {
            const el = clone.querySelector(selector);
            if (el) { el.src = src || ''; el.alt = alt || ''; }
        };

        // Điền thông tin khóa học vào template
        setText('[data-course-name]', course.TenKhoaHoc);
        setText('[data-course-description]', course.MoTa);
        setText('[data-course-start-date]', course.NgayBatDau ? new Date(course.NgayBatDau).toLocaleDateString('vi-VN') : '');
        setText('[data-course-end-date]', course.NgayKetThuc ? new Date(course.NgayKetThuc).toLocaleDateString('vi-VN') : '');
        setSrc('[data-course-image]', course.image ? `/images/${course.image}` : '', course.TenKhoaHoc);

        // Thiết lập sự kiện cho nút xem chi tiết
        const detailsButton = clone.querySelector('[data-details-button]');
        detailsButton.onclick = () => {
            window.location.href = `/course-details.html?id=${course._id}`;
        };

        // Thiết lập sự kiện cho các nút chỉnh sửa và xóa
        const editButton = clone.querySelector('[data-edit-button]');
        const deleteButton = clone.querySelector('[data-delete-button]');

        // Chỉ hiển thị nút Sửa và Xóa cho Admin
        if (isAdmin) {
            if (editButton) {
                editButton.onclick = () => openAddCourseModal(course);
                editButton.style.display = 'inline-block';
            }

            if (deleteButton) {
                deleteButton.onclick = () => deleteCourse(course._id);
                deleteButton.style.display = 'inline-block';
            }
        } else {
            // Ẩn nút Sửa và Xóa nếu không phải Admin
            if (editButton) editButton.style.display = 'none';
            if (deleteButton) deleteButton.style.display = 'none';
        }

        coursesGrid.appendChild(clone);
    });
}

// Hàm lọc khóa học theo từ khóa tìm kiếm
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

// Hàm hiển thị thông báo lỗi
function showError(message) {
    const errorElement = getElement('error');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.backgroundColor = '#f8d7da';
    errorElement.style.color = '#721c24';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Hàm hiển thị thông báo thành công
function showSuccess(message) {
    const errorElement = getElement('error');
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.backgroundColor = '#d4edda';
    errorElement.style.color = '#155724';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Các hàm tương tác với API
async function fetchCourses() {
    try {
        const loadingElement = getElement('loading');
        if (loadingElement) loadingElement.style.display = 'flex';

        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch('/api/courses', {
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            allCourses = data.data; // Cập nhật danh sách khóa học toàn cục
            displayCourses(allCourses); // Cập nhật giao diện
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

// Hàm xử lý khi submit form khóa học
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

        // Lấy dữ liệu từ form
        if (courseNameInput) formData.append('TenKhoaHoc', courseNameInput.value);
        if (courseDescriptionInput) formData.append('MoTa', courseDescriptionInput.value);

        // Xử lý ngày bắt đầu
        if (startDateInput && startDateInput.value) {
            formData.append('NgayBatDau', new Date(startDateInput.value).toISOString());
        } else if (!currentCourseId) {
            showError('Vui lòng nhập ngày bắt đầu.');
            return;
        }

        // Xử lý ngày kết thúc
        if (endDateInput && endDateInput.value) {
            formData.append('NgayKetThuc', new Date(endDateInput.value).toISOString());
        } else if (!currentCourseId) {
            showError('Vui lòng nhập ngày kết thúc.');
            return;
        }

        // Xử lý hình ảnh
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

        // Gửi yêu cầu API
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        // Remove Content-Type header if it exists, as FormData sets it automatically
        delete headers['Content-Type'];

        const response = await fetch(url, {
            method,
            headers: headers,
            body: formData
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        // Hiển thị thông báo thành công trước khi đóng modal và load lại
        console.log('currentCourseId =', currentCourseId);
        showSuccess(currentCourseId ? 'Cập nhật khóa học thành công!' : 'Thêm khóa học mới thành công!');
        closeCourseModal();
        fetchCourses(); // Cập nhật lại danh sách khóa học

    } catch (err) {
        console.error('Error saving course:', err);
        showError(`Không thể lưu khóa học: ${err.message}`);
    }
}

// Hàm xóa khóa học
async function deleteCourse(courseId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;

    try {
        const headers = getAuthHeaders();
        if (!headers) return; // Dừng nếu không có token

        const response = await fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: headers
        });

        const data = await handleApiResponse(response);
        if (!data) return; // Dừng nếu có lỗi 401/403 đã được xử lý

        if (data.success) {
            showSuccess('Xóa khóa học thành công!');
            fetchCourses(); // Cập nhật lại danh sách khóa học
        } else {
            showError(data.message || 'Lỗi khi xóa khóa học.');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        showError(error.message || 'Lỗi khi xóa khóa học.');
    }
}

// Hàm mở modal thêm hoặc sửa khóa học
function openAddCourseModal(course = null) {
    const modal = getElement('course-modal');
    const form = getElement('course-form');
    if (!modal || !form) return;

    // Nếu là sửa khóa học thì gán currentCourseId = course._id, còn thêm mới thì null
    if (course) {
        currentCourseId = course._id;
        form['course-name'].value = course.TenKhoaHoc || '';
        form['course-description'].value = course.MoTa || '';
        form['course-start-date'].value = course.NgayBatDau ? new Date(course.NgayBatDau).toISOString().slice(0, 10) : '';
        form['course-end-date'].value = course.NgayKetThuc ? new Date(course.NgayKetThuc).toISOString().slice(0, 10) : '';
        // Không set image input vì input file không cho set giá trị
    } else {
        currentCourseId = null; // Reset khi thêm mới
        form.reset();
    }

    modal.classList.add('active');
}

// Hàm đóng modal thêm/sửa khóa học
function closeCourseModal() {
    const modal = getElement('course-modal');
    const form = getElement('course-form');
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    // Không reset currentCourseId ở đây, để giữ trạng thái trong submit
}

// Hàm đăng xuất
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Đăng ký sự kiện DOM
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra token khi trang được tải
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    // Lấy thông tin user và hiển thị nút thêm khóa học nếu role là admin
    const user = JSON.parse(localStorage.getItem('user'));
    const addCourseBtn = getElement('add-course-btn');
    if (user && user.role === 'admin' && addCourseBtn) {
        addCourseBtn.style.display = 'inline-block';
        addCourseBtn.onclick = () => openAddCourseModal();
    } else if (addCourseBtn) {
        addCourseBtn.style.display = 'none';
    }

    // Đăng ký sự kiện tìm kiếm
    const searchInput = getElement('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterCourses);
    }

    // Đăng ký sự kiện đóng modal
    const closeModalBtn = getElement('close-course-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeCourseModal);
    }

    // Đăng ký sự kiện submit form khóa học
    const courseForm = getElement('course-form');
    if (courseForm) {
        courseForm.addEventListener('submit', handleCourseFormSubmit);
    }

    // Đăng ký sự kiện logout
    const logoutBtn = getElement('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Lấy danh sách khóa học khi trang load
    fetchCourses();
});
