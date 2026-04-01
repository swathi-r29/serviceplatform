const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'gold']
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    monthly: {
      type: Number,
      required: true
    },
    yearly: {
      type: Number,
      required: true
    }
  },
  benefits: {
    servicesPerMonth: {
      type: Number,
      required: true
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    freeCancellation: {
      type: Boolean,
      default: false
    },
    discountPercentage: {
      type: Number,
      default: 0
    },
    emergencyBookingDiscount: {
      type: Number,
      default: 0
    },
    features: [{
      type: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const userSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'paused'],
    default: 'active'
  },
  servicesUsed: {
    type: Number,
    default: 0
  },
  servicesRemaining: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    status: String,
    paymentMethod: String
  }]
}, {
  timestamps: true
});

// Auto-reset services at the start of billing cycle
userSubscriptionSchema.methods.resetMonthlyServices = function(planDetails) {
  if (this.status === 'active') {
    this.servicesUsed = 0;
    this.servicesRemaining = planDetails.benefits.servicesPerMonth;
  }
};

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

module.exports = { SubscriptionPlan, UserSubscription };