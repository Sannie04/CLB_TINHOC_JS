const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    HoTen: {
        type: String,
        required: [true, 'Vui lòng nhập họ tên'],
        trim: true,
        maxlength: [50, 'Họ tên không được quá 50 ký tự']
    },
    LopSinhHoat: {
        type: String,
        required: [true, 'Vui lòng nhập lớp sinh hoạt']
    },
    Email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Vui lòng nhập email hợp lệ'
        ]
    },
    SoDienThoai: {
        type: String,
        maxlength: [20, 'Số điện thoại không được quá 20 ký tự']
    },
    NgayThamGia: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema); 