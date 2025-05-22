document.addEventListener("DOMContentLoaded", () => {
  const supportListEl = document.getElementById("supportList");
  const supportForm = document.getElementById("supportForm");

  // Load header nếu có
  fetch('./header.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById("header-container").innerHTML = html;
    })
    .catch(console.error);

  // Lấy danh sách support
  fetch("/api/supports")
    .then(res => {
      if (!res.ok) throw new Error('Lỗi lấy dữ liệu: ' + res.status);
      return res.json();
    })
    .then(data => renderSupports(data))
    .catch(err => {
      console.error(err);
      supportListEl.innerHTML = `<div class="col-12 text-center"><p>Dữ liệu không được tải</p></div>`;
    });

  // Hàm hiển thị danh sách support
  function renderSupports(supports) {
    if (!supports.length) {
      supportListEl.innerHTML = `<div class="col-12 text-center"><p>Không có dữ liệu</p></div>`;
      return;
    }

    supportListEl.innerHTML = supports.map(s => `
      <div class="col-md-4 mb-4">
        <div class="support-card text-center border rounded p-3">
          <div class="image-container mb-3">
            <img src="/images/${s.hinhAnh || 'default.jpg'}" alt="Hình ảnh" width="100" height="100" />
          </div>
          <h5>${s.hoTen}</h5>
          <p><strong>Mã Support:</strong> ${ s._id}</p>

          <p><strong>Lớp:</strong> ${s.lopSinhHoat}</p>
          <p><strong>SĐT:</strong> ${s.soDienThoai}</p>
          <p><strong>Email:</strong> ${s.email}</p>
          <div class="mt-3">
            <button data-id="${s._id}" class="btn btn-primary btn-sm edit-btn">Sửa</button>
            <button data-id="${s._id}" class="btn btn-danger btn-sm delete-btn">Xóa</button>
          </div>
        </div>
      </div>
    `).join("");

    // Xử lý nút xóa
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Bạn có chắc muốn xóa?')) return;
        const id = btn.getAttribute('data-id');
        fetch(`/api/supports/${encodeURIComponent(id)}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error('Lỗi xóa: ' + res.status);
            location.reload();
          })
          .catch(err => alert("Lỗi khi xóa: " + err));
      });
    });

    // Xử lý nút sửa
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        // Chuyển sang trang editSupport.html truyền id qua query string
        window.location.href = `editSupport.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  // Xử lý form thêm mới support
  if (supportForm) {
    supportForm.addEventListener('submit', e => {
      e.preventDefault();
      const formData = new FormData(supportForm);

      // Gửi POST lên API
      fetch('/api/supports', {
        method: 'POST',
        body: formData
      })
        .then(res => {
          if (!res.ok) throw new Error('Lỗi thêm: ' + res.status);
          // Đóng modal bootstrap (giả sử đã khởi tạo modal đúng)
          const modalEl = document.getElementById('addSupportModal');
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          modalInstance.hide();
          location.reload();
        })
        .catch(err => alert("Lỗi khi thêm: " + err));
    });
  }
});
