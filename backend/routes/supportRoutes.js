const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getAllSupports, addSupport, deleteSupport, updateSupport } = require('../controllers/supportController');

// Tạo thư mục nếu chưa tồn tại
const imageDir = path.join(__dirname, '../../frontend/images');
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

// Khởi tạo multer, dùng tên ảnh là maSupport
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    // Lấy phần mở rộng của ảnh
    const ext = path.extname(file.originalname);
    const maSupport = req.body.maSupport || 'unknown';
    cb(null, `${maSupport}${ext}`);
  }
});

const upload = multer({ storage });

router.get('/', getAllSupports);
router.post('/', upload.single('hinhAnh'), addSupport);
router.delete('/:id', deleteSupport);
router.put('/:id', upload.single('hinhAnh'), updateSupport);

module.exports = router;
