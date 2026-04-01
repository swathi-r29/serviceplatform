const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('Admin Email:', existingAdmin.email);
      process.exit(0);
    }

    const adminData = {
      name: 'Admin',
      email: 'admin@servicehub.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin'
    };

    const admin = await User.create(adminData);

    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();