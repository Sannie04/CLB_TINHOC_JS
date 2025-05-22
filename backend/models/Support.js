const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  _id: {
    type: String, // Mã support do người dùng nhập, không dùng ObjectId tự động
    required: true
  },
  hoTen: { type: String, required: true },
  lopSinhHoat: { type: String, required: true },
  soDienThoai: { type: String, required: true },
  email: { type: String, required: true },
  hinhAnh: { type: String } // tên file ảnh lưu trong /frontend/images
});

module.exports = mongoose.model('Support', supportSchema);
