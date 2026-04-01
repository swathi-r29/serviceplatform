// backend/controllers/workerEarningsController.js

const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// Get detailed earnings data
exports.getDetailedEarnings = async (req, res) => {
  try {
    const workerId = req.user._id;
    
    console.log('Fetching detailed earnings for worker:', workerId);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get this year's date range
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    // TODAY'S EARNINGS
    const todayBookings = await Booking.find({
      worker: workerId,
      status: 'completed',
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('service');

    let todayTotal = 0;
    let todayBasePay = 0;
    let todayTips = 0;
    let todayBonuses = 0;

    todayBookings.forEach(booking => {
      const baseAmount = booking.totalAmount || 0;
      const tips = booking.tips || 0;
      const bonus = booking.bonus || 0;

      todayBasePay += baseAmount;
      todayTips += tips;
      todayBonuses += bonus;
      todayTotal += (baseAmount + tips + bonus);
    });

    // WEEKLY EARNINGS (Last 7 days)
    const weeklyEarnings = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - (6 - i));
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dayBookings = await Booking.find({
        worker: workerId,
        status: 'completed',
        scheduledDate: {
          $gte: dayStart,
          $lt: dayEnd
        }
      });

      const dayTotal = dayBookings.reduce((sum, booking) => {
        return sum + (booking.totalAmount || 0) + (booking.tips || 0) + (booking.bonus || 0);
      }, 0);

      weeklyEarnings.push(dayTotal);
    }

    // MONTHLY EARNINGS (Last 12 months)
    const monthlyEarnings = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthBookings = await Booking.find({
        worker: workerId,
        status: 'completed',
        scheduledDate: {
          $gte: monthStart,
          $lte: monthEnd
        }
      });

      const monthTotal = monthBookings.reduce((sum, booking) => {
        return sum + (booking.totalAmount || 0) + (booking.tips || 0) + (booking.bonus || 0);
      }, 0);

      monthlyEarnings.push(monthTotal);
    }

    // PENDING VS RECEIVED PAYMENTS
    const completedBookings = await Booking.find({
      worker: workerId,
      status: 'completed'
    });

    let pendingAmount = 0;
    let receivedAmount = 0;

    completedBookings.forEach(booking => {
      const totalAmount = (booking.totalAmount || 0) + (booking.tips || 0) + (booking.bonus || 0);
      
      if (booking.paymentStatus === 'paid' && booking.workerPayoutStatus === 'completed') {
        receivedAmount += totalAmount;
      } else {
        pendingAmount += totalAmount;
      }
    });

    // NEXT PAYOUT DATE (Every Friday at 12:00 PM)
    const nextPayout = new Date(today);
    const currentDay = today.getDay(); // 0 = Sunday, 5 = Friday
    const daysUntilFriday = (5 - currentDay + 7) % 7 || 7; // If today is Friday, next Friday is 7 days away
    nextPayout.setDate(today.getDate() + daysUntilFriday);
    nextPayout.setHours(12, 0, 0, 0);

    // Prepare response
    const earningsData = {
      today: {
        total: todayTotal,
        basePay: todayBasePay,
        tips: todayTips,
        bonuses: todayBonuses,
        jobs: todayBookings.length
      },
      weekly: weeklyEarnings,
      monthly: monthlyEarnings,
      pending: pendingAmount,
      received: receivedAmount,
      nextPayout: nextPayout.toISOString()
    };

    console.log('Earnings data:', earningsData);

    res.json(earningsData);

  } catch (error) {
    console.error('Error fetching detailed earnings:', error);
    res.status(500).json({
      message: 'Error fetching earnings data',
      error: error.message
    });
  }
};

// Get earnings summary (existing endpoint)
exports.getEarningsSummary = async (req, res) => {
  try {
    const workerId = req.user._id;

    const completedBookings = await Booking.find({
      worker: workerId,
      status: 'completed'
    });

    const totalEarnings = completedBookings.reduce((sum, booking) => {
      return sum + (booking.totalAmount || 0) + (booking.tips || 0) + (booking.bonus || 0);
    }, 0);

    const completedCount = completedBookings.length;

    // Calculate average rating
    const bookingsWithRatings = completedBookings.filter(b => b.rating);
    const averageRating = bookingsWithRatings.length > 0
      ? bookingsWithRatings.reduce((sum, b) => sum + b.rating, 0) / bookingsWithRatings.length
      : 0;

    res.json({
      totalEarnings,
      completedBookings: completedCount,
      rating: averageRating
    });

  } catch (error) {
    console.error('Error fetching earnings summary:', error);
    res.status(500).json({
      message: 'Error fetching earnings',
      error: error.message
    });
  }
};

// Get payout history
exports.getPayoutHistory = async (req, res) => {
  try {
    const workerId = req.user._id;

    // Get all completed payouts
    const payouts = await Booking.aggregate([
      {
        $match: {
          worker: mongoose.Types.ObjectId(workerId),
          status: 'completed',
          workerPayoutStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$workerPayoutDate' },
            month: { $month: '$workerPayoutDate' },
            week: { $week: '$workerPayoutDate' }
          },
          amount: {
            $sum: {
              $add: [
                { $ifNull: ['$totalAmount', 0] },
                { $ifNull: ['$tips', 0] },
                { $ifNull: ['$bonus', 0] }
              ]
            }
          },
          date: { $first: '$workerPayoutDate' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.json(payouts);

  } catch (error) {
    console.error('Error fetching payout history:', error);
    res.status(500).json({
      message: 'Error fetching payout history',
      error: error.message
    });
  }
};

// Update worker payout status (admin function)
exports.processWorkerPayout = async (req, res) => {
  try {
    const { bookingIds } = req.body;

    const result = await Booking.updateMany(
      {
        _id: { $in: bookingIds },
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        $set: {
          workerPayoutStatus: 'completed',
          workerPayoutDate: new Date()
        }
      }
    );

    res.json({
      message: 'Payouts processed successfully',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error processing payouts:', error);
    res.status(500).json({
      message: 'Error processing payouts',
      error: error.message
    });
  }
};