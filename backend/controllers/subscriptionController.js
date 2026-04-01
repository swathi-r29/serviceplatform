const { SubscriptionPlan, UserSubscription } = require('../models/Subscription');
const User = require('../models/User');

// Get all available subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscribe to a plan
const subscribeToPlan = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body; // monthly or yearly
    
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Check if user already has active subscription
    const existingSubscription = await UserSubscription.findOne({
      user: req.user._id,
      status: 'active'
    });
    
    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription' });
    }
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    const subscription = await UserSubscription.create({
      user: req.user._id,
      plan: planId,
      billingCycle,
      status: 'active',
      servicesUsed: 0,
      servicesRemaining: plan.benefits.servicesPerMonth,
      startDate,
      endDate,
      nextBillingDate: endDate,
      paymentHistory: [{
        amount: billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly,
        date: new Date(),
        status: 'paid',
        paymentMethod: 'card'
      }]
    });
    
    // Update user subscription info
    const user = await User.findById(req.user._id);
    user.subscription = {
      isActive: true,
      plan: plan.name,
      servicesRemaining: plan.benefits.servicesPerMonth,
      startDate,
      endDate,
      benefits: plan.benefits
    };
    await user.save();
    
    res.status(201).json({
      message: 'Successfully subscribed',
      subscription: await UserSubscription.findById(subscription._id).populate('plan')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's active subscription
const getUserSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user._id,
      status: 'active'
    }).populate('plan');
    
    if (!subscription) {
      return res.json({ hasSubscription: false });
    }
    
    res.json({
      hasSubscription: true,
      subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user._id,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    await subscription.save();
    
    // Update user
    const user = await User.findById(req.user._id);
    user.subscription.isActive = false;
    await user.save();
    
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create subscription plan
const createSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update subscription plan
const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await UserSubscription.find()
      .populate('user', 'name email')
      .populate('plan')
      .sort('-createdAt');
    
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubscriptionPlans,
  subscribeToPlan,
  getUserSubscription,
  cancelSubscription,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getAllSubscriptions
};