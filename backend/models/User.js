const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },
  address: { type: String },
  profileImage: { type: String, default: '' },
  skillRates: [
    {
      skillName: { type: String, required: true },
      rate: { type: Number, required: true, min: 0 },
      estimatedTime: { type: Number, default: 1, min: 0.1 }, // in hours
      pricingType: { type: String, enum: ["hourly", "fixed"], default: "hourly" }
    }
  ],
  // --- Per-Skill Pricing (new authoritative system) ---
  skillPricing: [
    {
      skill: {
        type: String,
        required: true,
        trim: true
      },
      rate: {
        type: Number,
        required: true,
        min: 0,
        default: 0
      },
      rateType: {
        type: String,
        enum: ['fixed', 'hourly'],
        default: 'fixed'
      },
      estimatedDuration: {
        type: Number, // in minutes
        default: 60,
        min: 15
      },
      isActive: {
        type: Boolean,
        default: false
      }
    }
  ],
  location: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  earnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true },
  cancellationCount: { type: Number, default: 0 },
  // --- Deprecated global rates (kept as fallback) ---
  hourlyRate: { type: Number, min: 0, default: 0 },
  serviceCharge: { type: Number, min: 0, default: 0 },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

// Pre-save: hash password only when modified
userSchema.pre('save', async function () {
  try {
    if (!this.isModified('password')) return;
    if (!this.password) return;
    // Skip if already hashed
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('   ✅ Password hashed successfully');
  } catch (error) {
    console.error('   ❌ Error in pre-save hook:', error);
    throw error;
  }
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

/**
 * Returns the skillPricing entry for a given skill name.
 * Falls back to the deprecated global rates if no active per-skill entry found.
 * @param {string} skillName
 * @returns {{ rate: number, rateType: string, estimatedDuration: number, isActive: boolean }}
 */
userSchema.methods.getPricingForSkill = function (skillName) {
  const entry = this.skillPricing?.find(
    sp => sp.skill.toLowerCase() === skillName.toLowerCase() && sp.isActive
  );
  if (entry) return entry;

  // Fallback to deprecated global rates
  const fallbackRate = this.serviceCharge || this.hourlyRate || 0;
  return {
    skill: skillName,
    rate: fallbackRate,
    rateType: 'fixed',
    estimatedDuration: 60,
    isActive: false
  };
};

module.exports = mongoose.model('User', userSchema);