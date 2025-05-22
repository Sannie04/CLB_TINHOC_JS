document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const studentsContainer = document.getElementById('students-grid');
    const modal = document.getElementById('add-student-modal');
    const modalTitle = document.querySelector('#add-student-modal h2');
    const studentForm = document.getElementById('add-student-form');
    const addStudentBtn = document.querySelector('.page-header .add-button');
    const closeModalBtn = document.querySelector('#add-student-modal .close-button');
    const cancelModalBtn = document.querySelector('#add-student-modal .cancel-button');
    const classFilter = document.getElementById('class-filter');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const studentClassSelect = document.getElementById('student-class');
    const studentIdInput = document.getElementById('student-id');
    const studentIdGroup = document.querySelector('.student-id-group');

    // Log elements to check if they are found
    console.log('loadingElement:', loadingElement);
    console.log('errorElement:', errorElement);
    console.log('studentsContainer:', studentsContainer);
    console.log('modal:', modal);
    console.log('modalTitle:', modalTitle);
    console.log('studentForm:', studentForm);
    console.log('addStudentBtn:', addStudentBtn);
    console.log('closeModalBtn:', closeModalBtn);
    console.log('cancelModalBtn:', cancelModalBtn);
    console.log('classFilter:', classFilter);
    console.log('statusFilter:', statusFilter);
    console.log('searchInput:', searchInput);
    console.log('studentClassSelect:', studentClassSelect);
    console.log('studentIdInput:', studentIdInput);
    console.log('studentIdGroup:', studentIdGroup);

    // State
    let currentStudentId = null;
    let allStudents = [];

    // Functions
    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Đang học';
            case 'inactive':
                return 'Đã tốt nghiệp';
            default:
                return 'Không xác định';
        }
    };

    const displayStudents = (students) => {
        const studentsContainer = document.getElementById('students-grid');
        const cardTemplate = document.getElementById('student-card-template');
        studentsContainer.innerHTML = ''; // Clear current students

        if (!cardTemplate) {
            console.error('Student card template not found!');
            showError('Lỗi hiển thị: Không tìm thấy mẫu thẻ học viên.');
            return;
        }

        students.forEach(student => {
            const clone = document.importNode(cardTemplate.content, true);

            // Log the student data and the element before attempting to set text
            console.log('Processing student:', student);
            const studentIdElement = clone.querySelector('[data-student-id]');
            console.log('Found student ID element:', studentIdElement);

            // Display student ID (_id field)
            if (studentIdElement) {
                studentIdElement.textContent = student._id || '';
            } else {
                console.error('Student ID element not found for student:', student._id);
            }

            // Fill student data based on the provided JSON structure
            clone.querySelector('[data-student-name]').textContent = student.HoTen || 'N/A';
            clone.querySelector('[data-student-email]').textContent = student.Email || 'N/A';
            clone.querySelector('[data-student-phone]').textContent = student.SoDienThoai || 'N/A';
            // Use LopSinhHoat for class display
            clone.querySelector('[data-student-class]').textContent = student.LopSinhHoat || 'Không xác định';
            // Format and display NgayThamGia
            clone.querySelector('[data-student-join-date]').textContent = student.NgayThamGia ? new Date(student.NgayThamGia).toLocaleDateString('vi-VN') : 'N/A';

            // Set up buttons (Ensure buttons exist in template)
            const editButton = clone.querySelector('[data-edit-button]');
            if (editButton) {
                editButton.onclick = () => window.editStudent(student._id);
            }

            const deleteButton = clone.querySelector('[data-delete-button]');
            if (deleteButton) {
                deleteButton.onclick = () => window.deleteStudent(student._id);
            }

            studentsContainer.appendChild(clone);
        });
    };

    const filterStudents = () => {
        const classFilter = document.getElementById('class-filter');
        const statusFilter = document.getElementById('status-filter');
        const searchInput = document.getElementById('search-input');

        // Use text content for filtering as we don't have class IDs in this data structure
        const classValue = classFilter ? classFilter.value.toLowerCase() : '';
        const statusValue = statusFilter ? statusFilter.value.toLowerCase() : ''; // Keep status filter logic if needed, though data doesn't have status
        const searchValue = searchInput ? searchInput.value.toLowerCase() : '';

        const filteredStudents = allStudents.filter(student => {
            // Filter by LopSinhHoat string
            const matchesClass = !classValue || (student.LopSinhHoat && student.LopSinhHoat.toLowerCase().includes(classValue));
            // Status filter will likely not work with the provided data, but keep the structure
            const matchesStatus = !statusValue || (student.TrangThai && student.TrangThai.toLowerCase()) === statusValue;
            const matchesSearch = !searchValue ||
                (student.HoTen && student.HoTen.toLowerCase().includes(searchValue)) ||
                (student.Email && student.Email.toLowerCase().includes(searchValue)) ||
                (student.SoDienThoai && student.SoDienThoai.includes(searchValue)) ||
                (student.LopSinhHoat && student.LopSinhHoat.toLowerCase().includes(searchValue)) ||
                (student._id && student._id.toLowerCase().includes(searchValue));

            return matchesClass && matchesStatus && matchesSearch;
        });

        displayStudents(filteredStudents);
    };

    const populateClassFilter = (students) => {
        const classFilter = document.getElementById('class-filter');

        // Add null check for the filter element
        if (!classFilter) {
            console.error('Class filter element with ID "class-filter" not found.');
            // Optionally show an error message to the user
            // showError('Không thể hiển thị bộ lọc lớp học.');
            return;
        }

        // Get unique class names from the student data
        const uniqueClasses = [...new Set(students.map(student => student.LopSinhHoat).filter(className => className))];

        classFilter.innerHTML = `
            <option value="">Tất cả lớp học</option>
            ${uniqueClasses.map(className => `
                <option value="${className}">${className}</option>
            `).join('')}
        `;
    };

    // Event Listeners (Moved to be after function definitions)
    const openAddStudentModal = () => openModal();
    const closeAddStudentModal = () => closeModal();

    // Add null checks before attaching event listeners
    if (addStudentBtn) addStudentBtn.addEventListener('click', openAddStudentModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddStudentModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (studentForm) studentForm.addEventListener('submit', handleFormSubmit);

    // These event listeners now reference filterStudents after its definition
    const classFilterElement = document.getElementById('class-filter');
    const statusFilterElement = document.getElementById('status-filter');
    const searchInputElement = document.getElementById('search-input');

    if (classFilterElement) classFilterElement.addEventListener('change', filterStudents);
    if (statusFilterElement) statusFilterElement.addEventListener('change', filterStudents);
    if (searchInputElement) searchInputElement.addEventListener('input', filterStudents);

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Functions
    async function openModal(studentData = null) {
        currentStudentId = studentData ? studentData._id : null;
        modalTitle.textContent = studentData ? 'Sửa học viên' : 'Thêm học viên mới';

        // Thay đổi text của nút submit
        const submitButton = studentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = studentData ? 'Cập nhật' : 'Lưu';
        }

        // Fill form if editing
        if (studentData) {
            studentIdInput.value = studentData._id || '';
            studentIdInput.readOnly = true;
            studentIdGroup.style.display = 'block';
            document.getElementById('student-name').value = studentData.HoTen || '';
            document.getElementById('student-email').value = studentData.Email || '';
            document.getElementById('student-phone').value = studentData.SoDienThoai || '';
            document.getElementById('student-class').value = studentData.LopSinhHoat || '';
        } else {
            studentForm.reset();
            studentIdInput.value = '';
            studentIdInput.readOnly = false;
            studentIdGroup.style.display = 'block';
        }

        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        studentForm.reset();
        currentStudentId = null;
        if (studentIdInput) {
            studentIdInput.readOnly = false;
            studentIdInput.value = '';
        }
        // Reset nút submit về "Lưu"
        const submitButton = studentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Lưu';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        const studentId = studentIdInput.value.trim();

        const formData = {
            _id: studentId,
            HoTen: document.getElementById('student-name').value.trim(),
            Email: document.getElementById('student-email').value.trim(),
            SoDienThoai: document.getElementById('student-phone').value.trim(),
            LopSinhHoat: document.getElementById('student-class').value.trim()
        };

        // Basic validation based on available fields and required _id
        if (!formData._id || !formData.HoTen || !formData.Email || !formData.SoDienThoai || !formData.LopSinhHoat) {
            showError('Vui lòng điền đầy đủ thông tin bắt buộc (ID, Họ tên, Email, SĐT, Lớp).');
            return;
        }

        try {
            const url = currentStudentId
                ? `http://localhost:5005/api/students/${currentStudentId}`
                : 'http://localhost:5005/api/students';

            const method = currentStudentId ? 'PUT' : 'POST';

            console.log('Sending student data:', formData);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Log error details if available
                console.error('API Error details:', errorData);
                throw new Error(errorData.message || 'Lỗi khi lưu học viên');
            }

            closeModal();
            fetchStudents(); // Refresh the list
            showSuccess(currentStudentId ? 'Cập nhật thông tin học viên thành công!' : 'Thêm học viên mới thành công!');
        } catch (err) {
            console.error('Error saving student:', err);
            showError(`Không thể lưu học viên: ${err.message}`);
        }
    }

    async function deleteStudent(studentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa học viên này?')) return;

        try {
            const response = await fetch(`http://localhost:5005/api/students/${studentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Log error details if available
                console.error('API Error details:', errorData);
                throw new Error(errorData.message || 'Lỗi khi xóa học viên');
            }

            fetchStudents(); // Refresh the list
            showSuccess('Xóa học viên thành công!');
        } catch (err) {
            console.error('Error deleting student:', err);
            showError(`Không thể xóa học viên: ${err.message}`);
        }
    }

    const fetchStudents = async () => {
        try {
            loadingElement.style.display = 'flex';
            errorElement.textContent = '';

            console.log('Fetching students from API...');
            const response = await fetch('http://localhost:5005/api/students');

            if (!response.ok) {
                const errorData = await response.json();
                // Log error details if available
                console.error('API Error details:', errorData);
                throw new Error(errorData.message || 'Không thể tải danh sách học viên');
            }

            const result = await response.json();
            console.log('API Response (Students):', result);

            if (result.success && Array.isArray(result.data)) {
                allStudents = result.data; // Store all students for filtering
                displayStudents(allStudents); // Display initially
                populateClassFilter(allStudents); // Populate class filter
            } else {
                throw new Error('Dữ liệu học viên không hợp lệ hoặc trống.');
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            showError(err.message || 'Không thể tải danh sách học viên. Vui lòng thử lại sau.');
        } finally {
            loadingElement.style.display = 'none';
        }
    };

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    function showSuccess(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.backgroundColor = '#4CAF50';
        errorElement.style.color = 'white';
        setTimeout(() => {
            errorElement.style.display = 'none';
            errorElement.style.backgroundColor = '';
            errorElement.style.color = '';
        }, 3000);
    }

    // Global functions for buttons (exposed to window for onclick attributes)
    window.openAddStudentModal = openModal;
    window.closeAddStudentModal = closeModal;

    window.editStudent = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5005/api/students/${studentId}`);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error details:', errorData);
                throw new Error(errorData.message || 'Không thể tải thông tin học viên.');
            }

            const data = await response.json();

            if (data.success && data.data) {
                // Assuming the API returns a single student object directly for /:id
                openModal(data.data);
            } else {
                throw new Error('Dữ liệu học viên không hợp lệ khi tải thông tin.');
            }
        } catch (err) {
            console.error('Error fetching student details:', err);
            showError(`Không thể tải thông tin học viên: ${err.message}`);
        }
    };

    window.deleteStudent = deleteStudent;

    // Initial fetch
    fetchStudents();
}); 