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
        <div class="card h-100 text-center">
          <img src="/images/${s.hinhAnh || 'default.jpg'}" class="card-img-top mx-auto mt-3" alt="Ảnh Support" style="width: 100px; height: 100px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${s.hoTen}</h5>
            <p class="card-text"><strong>Mã:</strong> ${s._id}</p>
            <p class="card-text"><strong>Lớp:</strong> ${s.lopSinhHoat}</p>
            <p class="card-text"><strong>SĐT:</strong> ${s.soDienThoai}</p>
            <p class="card-text"><strong>Email:</strong> ${s.email}</p>
          </div>
          <div class="card-footer d-flex justify-content-center gap-2">
            <button class="btn btn-primary btn-sm edit-btn" data-id="${s._id}">Sửa</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${s._id}">Xóa</button>
          </div>
        </div>
      </div>
    `).join('');
    attachEventListeners();
  }

  // Cập nhật select lọc lớp
  function populateClassFilter(data) {
    const classes = Array.from(new Set(data.map(s => s.lopSinhHoat))).filter(Boolean);
    const options = ['<option value="">Tất cả lớp học</option>']
      .concat(classes.map(c => `<option value="${c}">${c}</option>`))
      .join('');
    classFilter.innerHTML = options;
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

  const formData = new FormData();

  formData.append('maSupport', supportForm.maSupport.value);
  formData.append('hoTen', supportForm.hoTen.value);
  formData.append('lopSinhHoat', supportForm.lopSinhHoat.value);
  formData.append('soDienThoai', supportForm.soDienThoai.value);
  formData.append('email', supportForm.email.value);
  formData.append('hinhAnh', supportForm.hinhAnh.files[0]);

  fetch('/api/supports', {
    method: 'POST',
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('Lỗi thêm: ' + res.status);
      const modalEl = document.getElementById('addSupportModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance.hide();
      location.reload();
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
