const Support = require('../models/Support');

exports.getAllSupports = async (req, res) => {
  try {
    const supports = await Support.find();
    res.json(supports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSupport = async (req, res) => {
  try {
    const {
      maSupport,
      hoTen,
      lopSinhHoat,
      soDienThoai,
      email
    } = req.body;

    // Tên ảnh là theo maSupport đã được lưu đúng tên ở multer
    const hinhAnh = req.file?.filename;

    const newSupport = new Support({
      _id: maSupport,
      hoTen,
      lopSinhHoat,
      soDienThoai,
      email,
      hinhAnh
    });

    await newSupport.save();
    res.status(201).json(newSupport);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi thêm support: ' + err.message });
  }
};



exports.deleteSupport = async (req, res) => {
  try {
    const deleted = await Support.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy support" });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSupport = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.hinhAnh = req.file.filename;

    const updated = await Support.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy support" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
