document.addEventListener("DOMContentLoaded", () => {
  const supportListEl = document.getElementById("supportList");
  const supportForm = document.getElementById("supportForm");
  const searchInput = document.getElementById("search-input");
  const classFilter = document.getElementById("class-filter");
   
  // Load danh sách Support từ server với filter
  function loadSupports(hoTen = '', lopSinhHoat = '') {
    const params = new URLSearchParams();
    if (hoTen) params.append('hoTen', hoTen.trim());
    if (lopSinhHoat) params.append('lopSinhHoat', lopSinhHoat.trim());

    fetch(`/api/supports?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Lỗi lấy dữ liệu: ${res.status}`);
        return res.json();
      })
      .then(data => {
        renderSupports(data);
        populateClassFilter(data);
      })
      .catch(err => {
        supportListEl.innerHTML = `<p class="text-center text-danger">Lỗi tải dữ liệu: ${err.message}</p>`;
      });
  }

  // Hiển thị Support ra giao diện
  function renderSupports(supports) {
    if (!supports.length) {
      supportListEl.innerHTML = '<p class="text-center">Không có dữ liệu support</p>';
      return;
    }
    supportListEl.innerHTML = supports.map(s => `

  <div class="col-md-4 mb-4">
    <div class="card h-100 text-center support-card">
      <div class="image-container mx-auto mt-3">
        <img src="/images/${s.hinhAnh || 'default.jpg'}" alt="Ảnh Support" />
      </div>
      <h5 class="card-title">${s.hoTen}</h5>
      <p class="card-text"><strong>Mã:</strong> ${s._id}</p>
      <p class="card-text"><strong>Lớp:</strong> ${s.lopSinhHoat}</p>
      <p class="card-text"><strong>SĐT:</strong> ${s.soDienThoai}</p>
      <p class="card-text"><strong>Email:</strong> ${s.email}</p>
      <div class="card-footer d-flex justify-content-center gap-2">
        <button class="btn btn-primary btn-sm edit-btn" data-id="${s._id}">Sửa</button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${s._id}">Xóa</button>
      </div>
    </div>
  </div>
`).join('');

    attachEventListeners();
  }

  // Cập nhật select lọc lớp, giữ giá trị đang chọn
  function populateClassFilter(data) {
    const currentValue = classFilter.value;
    const classes = Array.from(new Set(data.map(s => s.lopSinhHoat))).filter(Boolean);
    const options = ['<option value="">Tất cả lớp học</option>']
      .concat(classes.map(c => `<option value="${c}">${c}</option>`))
      .join('');
    classFilter.innerHTML = options;

    // Giữ lại giá trị đã chọn (nếu có)
    if (currentValue && [...classFilter.options].some(opt => opt.value === currentValue)) {
      classFilter.value = currentValue;
    } else {
      classFilter.value = '';
    }
  }

  // Gán sự kiện xóa và sửa
  function attachEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('Bạn chắc chắn muốn xóa support này?')) {
          const id = btn.getAttribute('data-id');
          fetch(`/api/supports/${encodeURIComponent(id)}`, { method: 'DELETE' })
            .then(res => {
              if (!res.ok) throw new Error(`Lỗi xóa: ${res.status}`);
              loadSupports(searchInput.value, classFilter.value);
            })
            .catch(err => alert(err.message));
        }
      };
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        window.location.href = `editSupport.html?id=${encodeURIComponent(id)}`;
      };
    });
  }

  // Xử lý submit form thêm Support
  if (supportForm) {
    supportForm.addEventListener('submit', e => {
      e.preventDefault();

      const formData = new FormData(supportForm);

      fetch("/api/supports", {
        method: "POST",
        body: formData,
      })
      .then(res => {
        if (!res.ok) throw new Error("Lỗi thêm: " + res.status);
        return res.json();
      })
      .then(() => {
        const modalEl = document.getElementById("addSupportModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();

        // Load lại danh sách mà không reload trang
        loadSupports(searchInput.value, classFilter.value);
      })
      .catch(err => alert("Lỗi khi thêm: " + err));
    });
  }

  // Lắng nghe input tìm kiếm và lọc lớp
  searchInput.addEventListener('input', () => loadSupports(searchInput.value, classFilter.value));
  classFilter.addEventListener('change', () => loadSupports(searchInput.value, classFilter.value));

  // Load ban đầu
  loadSupports();
});
