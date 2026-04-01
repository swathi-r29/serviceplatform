const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateEmail, validatePhone, validatePassword } = require('../utils/validators');

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid secret key. Unauthorized admin creation.' });
    }

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists. Only one admin is allowed in the system.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkAdminExists = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    res.json({ 
      adminExists: !!adminExists,
      message: adminExists ? 'Admin already exists' : 'No admin found'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAdmin, checkAdminExists };