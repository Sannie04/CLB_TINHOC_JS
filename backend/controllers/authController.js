const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { studentId, name, email, phone, dateOfBirth, password } = req.body;

    // Kiểm tra tồn tại
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc Mã sinh viên đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      studentId,
      name,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(400).json({ message: 'Mã sinh viên hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mã sinh viên hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign({ userId: user._id, studentId: user.studentId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { register, login };
