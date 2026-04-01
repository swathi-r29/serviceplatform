const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

const getChartData = async (req, res) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          _id: 0
        }
      }
    ]);

    const topServices = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$service',
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      {
        $project: {
          name: { $arrayElemAt: ['$serviceDetails.name', 0] },
          bookings: 1
        }
      }
    ]);

    const topWorkers = await User.aggregate([
      { $match: { role: 'worker' } },
      { $sort: { earnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'bookings',
          let: { workerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$worker', '$$workerId'] },
                    { $eq: ['$status', 'completed'] }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'jobCount'
        }
      },
      {
        $project: {
          name: 1,
          earnings: 1,
          rating: 1,
          reviews: '$reviewCount',
          completedJobs: { $ifNull: [{ $arrayElemAt: ['$jobCount.count', 0] }, 0] }
        }
      }
    ]);

    res.json({
      dailyRevenue,
      topServices,
      topWorkers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChartData };