const User = require('../models/User');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
    const { studentId, name, email, phone, dateOfBirth, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc Mã sinh viên đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      studentId,
      name,
      email,
      phone,
      dateOfBirth,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Lỗi register:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;
    console.log('Đăng nhập với:', studentId, password);

    const user = await User.findOne({ studentId });
    if (!user) {
      console.log('Không tìm thấy user');
      return res.status(400).json({ message: 'Mã sinh viên không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Sai mật khẩu');
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    // Nếu đúng
    req.session.userId = user._id;
    res.json({ message: 'Đăng nhập thành công', user });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    console.error('Lỗi getProfile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;

    await user.save();

    res.json({
      message: 'Cập nhật thành công',
      user: {
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi updateProfile:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
