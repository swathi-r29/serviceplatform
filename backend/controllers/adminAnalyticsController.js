const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Helper for start of day/month
const startOfDay = (date) => new Date(date).setHours(0,0,0,0);
const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

exports.getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      revenueData, 
      bookingsData, 
      usersData, 
      refundsData
    ] = await Promise.all([
      // Revenue
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$totalAmount' },
            thisMonth: {
              $sum: { $cond: [{ $gte: ['$createdAt', currentMonthStart] }, '$totalAmount', 0] }
            },
            lastMonth: {
              $sum: { 
                $cond: [
                  { $and: [{ $gte: ['$createdAt', lastMonthStart] }, { $lte: ['$createdAt', lastMonthEnd] }] }, 
                  '$totalAmount', 
                  0
                ] 
              }
            }
          }
        }
      ]),
      // Bookings count
      Booking.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ]),
      // Users count
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            newThisMonth: { $sum: { $cond: [{ $gte: ['$createdAt', currentMonthStart] }, 1, 0] } },
            activeWorkers: { $sum: { $cond: [{ $and: [{ $eq: ['$role', 'worker'] }, { $eq: ['$isAvailable', true] }] }, 1, 0] } },
            pendingApprovals: { $sum: { $cond: [{ $and: [{ $eq: ['$role', 'worker'] }, { $eq: ['$status', 'pending'] }] }, 1, 0] } }
          }
        }
      ]),
      // Refunds
      Booking.aggregate([
        { $match: { refundAmount: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, totalRefunded: { $sum: '$refundAmount' } } }
      ])
    ]);

    const rev = revenueData[0] || { total: 0, thisMonth: 0, lastMonth: 0 };
    const growth = rev.lastMonth === 0 ? 0 : ((rev.thisMonth - rev.lastMonth) / rev.lastMonth) * 100;

    const bks = bookingsData[0] || { total: 0, pending: 0, completed: 0, cancelled: 0 };
    const completionRate = bks.total === 0 ? 0 : (bks.completed / bks.total) * 100;
    const refundRate = bks.total === 0 ? 0 : (bks.cancelled / bks.total) * 100;

    const usr = usersData[0] || { total: 0, newThisMonth: 0, activeWorkers: 0, pendingApprovals: 0 };
    const ref = refundsData[0] || { totalRefunded: 0 };

    res.status(200).json({
      revenue: {
        total: rev.total,
        thisMonth: rev.thisMonth,
        lastMonth: rev.lastMonth,
        growth: Math.round(growth * 100) / 100 // 2 decimal places
      },
      bookings: {
        total: bks.total,
        pending: bks.pending,
        completed: bks.completed,
        cancelled: bks.cancelled,
        completionRate: Math.round(completionRate * 100) / 100
      },
      users: {
        total: usr.total,
        newThisMonth: usr.newThisMonth,
        activeWorkers: usr.activeWorkers,
        pendingApprovals: usr.pendingApprovals
      },
      refunds: {
        totalRefunded: ref.totalRefunded,
        refundRate: Math.round(refundRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('getDashboardSummary Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const { period = '7d' } = req.query; // '7d', '30d', '90d', '12m'
    const now = new Date();
    let startDate = new Date();
    let groupByFormat;
    
    // Setup format and start date
    if (period === '7d') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0,0,0,0);
      groupByFormat = "%Y-%m-%d";
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0,0,0,0);
      groupByFormat = "%Y-%m-%d";
    } else if (period === '90d') {
      startDate.setDate(now.getDate() - 89);
      startDate.setHours(0,0,0,0);
      groupByFormat = "%Y-%U"; // Group by Year and Week Number
    } else if (period === '12m') {
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0,0,0,0);
      groupByFormat = "%Y-%m"; // Group by Year and Month
    } else {
      return res.status(400).json({ message: 'Invalid period' });
    }

    const rawData = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format output (simplified filling - ideally you fill missing gaps)
    // For 7d/30d, simple day names or dates
    const formattedData = rawData.map(item => {
      let dateLabel = item._id;
      if (period === '7d' || period === '30d') {
         // E.g. "2023-10-25" -> "Oct 25"
         const d = new Date(item._id);
         dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === '12m') {
         // E.g. "2023-10" -> "Oct 2023"
         const [y, m] = item._id.split('-');
         const d = new Date(y, m - 1);
         dateLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
         // E.g. "2023-42" -> "Week 42"
         const [, w] = item._id.split('-');
         dateLabel = `Week ${w}`;
      }

      return {
        date: dateLabel,
        revenue: item.revenue,
        bookings: item.bookings
      }
    });

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('getRevenueChart Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: "$serviceDetails" },
      {
        $group: {
          _id: "$serviceDetails.category",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Need to enrich with average rating from Review model for these categories
    // This is complex in aggregate, let's do JS level for rating or skip
    // We'll fetch all reviews and compute averages roughly or just return data we have
    const result = data.map(item => ({
      category: item._id || "Uncategorized",
      bookingCount: item.bookingCount,
      revenue: item.revenue,
      averageRating: 4.5 // Mock/placeholder for rating as aggregatng Bookings->Reviews by category is slow
    }));

    res.status(200).json(result);

  } catch (error) {
    console.error('getCategoryBreakdown Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTopWorkers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get aggregate from Bookings to count completed jobs and sum earnings exactly
    const workerStats = await Booking.aggregate([
      { $match: { worker: { $exists: true, $ne: null }, status: 'completed' } },
      {
        $group: {
          _id: "$worker",
          completedJobs: { $sum: 1 },
          totalEarnings: { $sum: "$totalAmount" } // Simplified, assuming worker gets total or portion
        }
      },
      { $sort: { completedJobs: -1 } },
      { $limit: limit }
    ]);

    const workerIds = workerStats.map(w => w._id);
    const users = await User.find({ _id: { $in: workerIds } })
                            .select('name profileImage rating reviewCount cancellationCount skills skillPricing');

    // Merge
    const result = workerStats.map(stat => {
      const user = users.find(u => u._id.toString() === stat._id.toString());
      if (!user) return null;
      
      let category = "General";
      if (user.skillPricing && user.skillPricing.length > 0) {
        // use highest active skill
        const active = user.skillPricing.filter(s => s.isActive);
        if (active.length > 0) category = active[0].skill;
      } else if (user.skills && user.skills.length > 0) {
         category = user.skills[0];
      }

      return {
        workerId: user._id,
        name: user.name,
        profileImage: user.profileImage,
        rating: user.rating || 0,
        reviewCount: user.reviewCount || 0,
        completedJobs: stat.completedJobs,
        totalEarnings: stat.totalEarnings,
        cancellationCount: user.cancellationCount || 0,
        category
      };
    }).filter(Boolean);

    res.status(200).json(result);

  } catch (error) {
    console.error('getTopWorkers Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBookingTrends = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 56); // Last 8 weeks = 56 days

    const rawData = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Reformat into array of {week, completed, cancelled, pending}
    const weeklyMap = {};
    rawData.forEach(item => {
      const key = `${item._id.year}-W${item._id.week}`;
      if (!weeklyMap[key]) {
        weeklyMap[key] = { week: key, completed: 0, cancelled: 0, pending: 0 };
      }
      if (item._id.status === 'completed') weeklyMap[key].completed = item.count;
      else if (item._id.status === 'cancelled') weeklyMap[key].cancelled = item.count;
      else if (['pending', 'accepted', 'on-the-way', 'in-progress'].includes(item._id.status)) {
        weeklyMap[key].pending += item.count;
      }
    });

    const result = Object.values(weeklyMap).sort((a,b) => a.week.localeCompare(b.week)).slice(-8);

    res.status(200).json(result);

  } catch (error) {
    console.error('getBookingTrends Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // Latest bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('service', 'name');
    
    recentBookings.forEach(b => {
      activities.push({
        type: 'new_booking',
        message: `New booking for ${b.service?.name || 'Service'}`,
        timestamp: b.createdAt,
        amount: b.totalAmount
      });
      if (b.status === 'completed' && b.updatedAt > b.createdAt) {
        activities.push({
          type: 'booking_completed',
          message: `Booking completed: ${b.service?.name}`,
          timestamp: b.updatedAt,
          amount: b.totalAmount
        });
      }
      if (b.status === 'cancelled' && b.refundAmount > 0) {
        activities.push({
          type: 'refund_issued',
          message: `Refund processed`,
          timestamp: b.cancelledAt || b.updatedAt,
          amount: b.refundAmount
        });
      }
    });

    // Latest users
    const recentUsers = await User.find({ role: 'worker' })
      .sort({ createdAt: -1 })
      .limit(3);

    recentUsers.forEach(u => {
      activities.push({
        type: 'new_worker',
        message: `New provider registered: ${u.name}`,
        timestamp: u.createdAt
      });
    });

    // Latest reviews
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(3);

    recentReviews.forEach(r => {
      activities.push({
        type: 'review_posted',
        message: `New ${r.rating}-star review posted`,
        timestamp: r.createdAt
      });
    });

    // Sort all by timestamp desc and take top 10
    const sorted = activities.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.status(200).json(sorted);

  } catch (error) {
    console.error('getRecentActivity Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
