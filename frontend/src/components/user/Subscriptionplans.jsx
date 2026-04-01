import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/subscriptions/plans');
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data } = await axios.get('/subscriptions/my-subscription');
      if (data.hasSubscription) {
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan);
    setSubscribing(true);

    try {
      const { data } = await axios.post('/subscriptions/subscribe', {
        planId: plan._id,
        billingCycle
      });

      alert('Successfully subscribed to ' + plan.displayName);
      setCurrentSubscription(data.subscription);
      navigate('/user/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await axios.post('/subscriptions/cancel');
      alert('Subscription cancelled successfully');
      setCurrentSubscription(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const getPlanColor = (planName) => {
    const colors = {
      basic: 'from-blue-500 to-blue-600',
      premium: 'from-purple-500 to-purple-600',
      gold: 'from-yellow-500 to-yellow-600'
    };
    return colors[planName] || 'from-gray-500 to-gray-600';
  };

  const getPlanIcon = (planName) => {
    const icons = {
      basic: '🌟',
      premium: '💎',
      gold: '👑'
    };
    return icons[planName] || '📦';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Save money and get priority service with our membership plans</p>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <div className={`bg-gradient-to-r ${getPlanColor(currentSubscription.plan.name)} rounded-2xl shadow-lg p-6 mb-8 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getPlanIcon(currentSubscription.plan.name)}</span>
                  <div>
                    <h3 className="text-2xl font-bold">Current Plan: {currentSubscription.plan.displayName}</h3>
                    <p className="text-white/90">
                      {currentSubscription.servicesRemaining} services remaining • 
                      Renews on {new Date(currentSubscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancelSubscription}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel Plan
              </button>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-md inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
            const isCurrentPlan = currentSubscription?.plan._id === plan._id;
            const isPremium = plan.name === 'premium';

            return (
              <div
                key={plan._id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  isPremium ? 'ring-4 ring-purple-500' : ''
                }`}
              >
                {/* Most Popular Badge */}
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Plan Header */}
                <div className={`bg-gradient-to-r ${getPlanColor(plan.name)} text-white p-8`}>
                  <div className="text-center">
                    <div className="text-5xl mb-4">{getPlanIcon(plan.name)}</div>
                    <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>
                    <p className="text-white/90 text-sm mb-6">{plan.description}</p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold">₹{price}</span>
                      <span className="text-white/90">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-white/80">₹{Math.round(price / 12)}/month billed annually</p>
                    )}
                  </div>
                </div>

                {/* Plan Features */}
                <div className="p-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {plan.benefits.servicesPerMonth} Services per Month
                        </p>
                        <p className="text-sm text-gray-600">Book any service</p>
                      </div>
                    </div>

                    {plan.benefits.discountPercentage > 0 && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {plan.benefits.discountPercentage}% Discount
                          </p>
                          <p className="text-sm text-gray-600">On all additional services</p>
                        </div>
                      </div>
                    )}

                    {plan.benefits.prioritySupport && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Priority Support</p>
                          <p className="text-sm text-gray-600">24/7 dedicated support</p>
                        </div>
                      </div>
                    )}

                    {plan.benefits.freeCancellation && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Free Cancellation</p>
                          <p className="text-sm text-gray-600">No charges for cancelling</p>
                        </div>
                      </div>
                    )}

                    {plan.benefits.emergencyBookingDiscount > 0 && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {plan.benefits.emergencyBookingDiscount}% Off Emergency
                          </p>
                          <p className="text-sm text-gray-600">Reduced emergency charges</p>
                        </div>
                      </div>
                    )}

                    {/* Additional Features */}
                    {plan.benefits.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-gray-900">{feature}</p>
                      </div>
                    ))}
                  </div>

                  {/* Subscribe Button */}
                  {isCurrentPlan ? (
                    <div className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-3 rounded-lg text-center font-semibold">
                      ✓ Current Plan
                    </div>
                  ) : currentSubscription ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Cancel current plan to switch
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribing && selectedPlan?._id === plan._id}
                      className={`w-full bg-gradient-to-r ${getPlanColor(plan.name)} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50`}
                    >
                      {subscribing && selectedPlan?._id === plan._id ? 'Processing...' : 'Subscribe Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Subscribe?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">Up to 30% savings on services</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Priority Service</h3>
              <p className="text-sm text-gray-600">Get faster response times</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexibility</h3>
              <p className="text-sm text-gray-600">Free cancellation included</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">Round the clock assistance</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg font-semibold text-gray-900">
                Can I cancel my subscription anytime?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="p-4 text-gray-600">
                Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your current billing period.
              </p>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg font-semibold text-gray-900">
                What happens to unused services?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="p-4 text-gray-600">
                Unused services reset at the start of each billing cycle. We recommend using all your included services each month for maximum value.
              </p>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg font-semibold text-gray-900">
                Can I upgrade or downgrade my plan?
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="p-4 text-gray-600">
                Currently, you need to cancel your existing plan and subscribe to a new one. We're working on seamless plan switching.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;