const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/mailHelper');
const crypto = require('crypto');

// Generate JWT Token with debugging
const generateToken = (id) => {
  try {
    console.log('🔑 Generating token...');
    console.log('   User ID:', id);
    console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✅ Token generated successfully');
    return token;
  } catch (error) {
    console.error('💥 Token generation error:', error);
    throw error;
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('📝 REGISTRATION ATTEMPT STARTED');
    console.log('========================================');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { name, email, password, phone, role, skills, location, address } = req.body;

    // Step 1: Basic validation
    console.log('\n1️⃣ Checking required fields...');
    if (!name || !email || !password || !phone) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    console.log('✅ All required fields present');

    // Step 2: Email validation
    console.log('\n2️⃣ Validating email format...');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    console.log('✅ Email format valid');

    // Step 3: Phone validation
    console.log('\n3️⃣ Validating phone format...');
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      console.log('❌ Invalid phone format');
      return res.status(400).json({ message: 'Invalid phone number format (10-15 digits)' });
    }
    console.log('✅ Phone format valid');

    // Step 4: Password validation
    console.log('\n4️⃣ Validating password...');
    if (password.length < 6) {
      console.log('❌ Password too short:', password.length, 'characters');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    console.log('✅ Password length valid');

    // Step 5: Prevent admin registration
    console.log('\n5️⃣ Checking role...');
    if (role === 'admin') {
      console.log('❌ Admin registration blocked');
      return res.status(400).json({ message: 'Cannot register as admin' });
    }
    console.log('✅ Role is valid:', role || 'user');

    // Step 6: Check if user exists
    console.log('\n6️⃣ Checking if user exists...');
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.log('❌ User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    console.log('✅ Email is available');

    // Step 7: Prepare user data
    console.log('\n7️⃣ Preparing user data...');
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      role: role || 'user',
      status: (role === 'worker') ? 'pending' : 'approved'
    };

    if (role === 'worker') {
      console.log('   Configuring worker-specific fields...');
      if (skills) {
        let skillsArray = [];
        if (Array.isArray(skills)) {
          skillsArray = skills;
        } else if (typeof skills === 'string') {
          skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
        }
        
        userData.skills = skillsArray.map(s => ({
          name: typeof s === 'object' ? (s.name || 'Unnamed Skill') : s,
          rate: (typeof s === 'object' && s.rate !== undefined) ? Math.max(0, parseFloat(s.rate)) : 0
        })).filter(s => s.name);
      } else {
        userData.skills = [];
      }
      userData.location = location || '';
      userData.locationCoords = req.body.locationCoords || null;
      userData.isAvailable = true;
    } else {
      userData.address = address || '';
    }

    // Step 7.5: Generate OTP
    console.log('   Generating verification OTP...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    userData.otp = otp;
    userData.otpExpires = otpExpires;
    userData.isVerified = false;

    console.log('✅ User data prepared (verification required)');

    // Step 8: Create user
    console.log('\n8️⃣ Creating user in database...');
    const user = await User.create(userData);
    console.log('✅ User created successfully with ID:', user._id);

    // Step 8.5: Send OTP Email
    try {
      console.log('   Sending verification email to:', user.email);
      console.log('\n----------------------------------------');
      console.log(`🔑 OTP FOR ${user.email.toUpperCase()}: ${otp}`);
      console.log('----------------------------------------\n');
      await sendOTP(user.email, otp);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError.message);
      // We still created the user, they can resend OTP later if needed
    }

    // Step 9: Send response
    const response = {
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'Registration successful! Please check your email for the verification code.'
    };

    console.log('✅ SUCCESS! Registration completed');
    console.log('========================================\n');

    return res.status(201).json(response);

  } catch (error) {
    console.error('💥 REGISTRATION ERROR:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('\n🔐 Login Request for:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Step 4: Check if email is verified
    if (!user.isVerified) {
      console.log('❌ Login failed: Email not verified');
      return res.status(401).json({ 
        success: false, 
        notVerified: true, 
        email: user.email, 
        message: 'Please verify your email address before logging in.' 
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    if (user.role === 'worker') {
      if (user.status === 'pending') {
        return res.status(403).json({ success: false, message: 'Your account is awaiting admin approval.' });
      } else if (user.status === 'rejected') {
        return res.status(403).json({ success: false, message: 'Your account application has been rejected.' });
      }
    }

    console.log('✅ Login successful for:', user.email);

    const token = generateToken(user._id);

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      profileImage: user.profileImage,
      ...(user.role === 'worker' && {
        skills: user.skills,
        location: user.location,
        isAvailable: user.isAvailable,
        rating: user.rating,
        reviewCount: user.reviewCount,
        earnings: user.earnings
      }),
      ...(user.role === 'user' && { address: user.address }),
      token
    });
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    console.log('\n👑 Admin Login Request for:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    console.log('✅ Admin login successful');
    const token = generateToken(user._id);

    res.json({ success: true, _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (error) {
    console.error('💥 ADMIN LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error('User not found in request');

    console.log('✅ Google auth successful for:', user.email);

    // Verification redirect bypassed

    if (user.role === 'worker') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (user.status === 'pending') return res.redirect(`${frontendUrl}/login?error=awaiting_approval`);
      if (user.status === 'rejected') return res.redirect(`${frontendUrl}/login?error=not_approved`);
    }

    const token = generateToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userData = { _id: user._id, name: user.name, email: user.email, role: user.role };

    res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (error) {
    console.error('💥 GOOGLE AUTH CALLBACK ERROR:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=authentication_failed`);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.error('💥 GET ME ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (user.role === 'worker') {
      user.skills = req.body.skills || user.skills;
      user.location = req.body.location || user.location;
      if (req.body.isAvailable !== undefined) user.isAvailable = req.body.isAvailable;
    } else {
      user.address = req.body.address || user.address;
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      ...(updatedUser.role === 'worker' && {
        skills: updatedUser.skills,
        location: updatedUser.location,
        isAvailable: updatedUser.isAvailable
      }),
      ...(updatedUser.role === 'user' && { address: updatedUser.address }),
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('💥 UPDATE PROFILE ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Check for missing data
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'CRITICAL: Email or OTP missing in request body.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // 2. Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: `No account found for: ${email}` });
    }

    // 3. Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account is already verified. Please go to the login page.' });
    }

    // 4. Strict OTP Matching
    console.log(`🧐 Verification Attempt: ${email} | Entered: ${otp} | Database: ${user.otp}`);

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'The verification code is incorrect. Please check your email again.' });
    }

    // 5. Expiration Check
    if (!user.otpExpires || user.otpExpires < new Date()) {
      console.log('⏰ code expired for:', email);
      return res.status(400).json({ success: false, message: 'This code has expired. Please click "Resend" to get a new one.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('💥 VERIFY OTP ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Please provide email' });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'User is already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendOTP(user.email, otp);
    if (!emailResult) {
      console.warn('⚠️ OTP resend: email delivery may have failed — check .env credentials');
    }

    res.status(200).json({ success: true, message: 'OTP resent successfully! Please check your email.' });
  } catch (error) {
    console.error('💥 RESEND OTP ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error during resending OTP' });
  }
};

module.exports = { register, login, adminLogin, googleAuthCallback, getMe, updateProfile, verifyOTP, resendOTP };