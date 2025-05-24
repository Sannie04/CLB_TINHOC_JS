const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    TenKhoaHoc: {
        type: String,
        required: [true, 'Vui lòng nhập tên khóa học'],
        unique: true,
        trim: true,
        maxlength: [50, 'Tên khóa học không được quá 50 ký tự']
    },
    MoTa: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả'],
        maxlength: [500, 'Mô tả không được quá 500 ký tự']
    },
    NgayBatDau: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày bắt đầu']
    },
    NgayKetThuc: {
        type: Date,
        required: [true, 'Vui lòng nhập ngày kết thúc']
    },
    image: {
        type: String,
        required: [true, 'Vui lòng thêm hình ảnh']
    },
    students: [{
        type: String,
        ref: 'Student'
    }],
    supports: [{
        type: String,
        ref: 'Support'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema); 