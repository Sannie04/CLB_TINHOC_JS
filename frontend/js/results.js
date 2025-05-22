function layKetQua() {
  const maSV = document.getElementById("maSinhVienInput").value.trim();
  if (!maSV) return alert("Vui lòng nhập mã sinh viên");

  fetch('/api/ketqua')
    .then(res => res.json())
    .then(data => {
      const ketQuaSV = data.filter(kq => kq.maSinhVien === maSV);

      const table = document.getElementById("bangKetQua");
      const tbody = document.getElementById("bodyKetQua");
      const khongCoDuLieu = document.getElementById("khongCoDuLieu");

      if (ketQuaSV.length === 0) {
        table.classList.add("d-none");
        khongCoDuLieu.classList.remove("d-none");
        tbody.innerHTML = "";
      } else {
        khongCoDuLieu.classList.add("d-none");
        table.classList.remove("d-none");

        tbody.innerHTML = ketQuaSV.map(kq => `
          <tr>
            <td>${kq.maMon}</td>
            <td>${kq.tenMon || ''}</td>
            <td>${kq.diem}</td>
          </tr>
        `).join('');
      }
    })
    .catch(err => {
      alert("Lỗi khi tải dữ liệu: " + err);
      console.error(err);
    });
}
