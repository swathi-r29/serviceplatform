const Availability = require('../models/Availability');

const getAvailability = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const availability = await Availability.find({
      worker: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setAvailability = async (req, res) => {
  try {
    const { date, timeSlots, isBlocked, note } = req.body;

    let availability = await Availability.findOne({
      worker: req.user._id,
      date: new Date(date)
    });

    if (availability) {
      availability.timeSlots = timeSlots;
      availability.isBlocked = isBlocked;
      availability.note = note;
      await availability.save();
    } else {
      availability = await Availability.create({
        worker: req.user._id,
        date: new Date(date),
        timeSlots,
        isBlocked,
        note
      });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockDate = async (req, res) => {
  try {
    const { date, note } = req.body;

    let availability = await Availability.findOne({
      worker: req.user._id,
      date: new Date(date)
    });

    if (availability) {
      availability.isBlocked = true;
      availability.note = note;
      await availability.save();
    } else {
      availability = await Availability.create({
        worker: req.user._id,
        date: new Date(date),
        timeSlots: [],
        isBlocked: true,
        note
      });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkWorkerAvailability = async (req, res) => {
  try {
    const { workerId, date, time } = req.query;

    const availability = await Availability.findOne({
      worker: workerId,
      date: new Date(date)
    });

    if (!availability || availability.isBlocked) {
      return res.json({ available: false });
    }

    const timeSlot = availability.timeSlots.find(slot => 
      slot.startTime <= time && slot.endTime >= time
    );

    res.json({ available: timeSlot ? timeSlot.isAvailable : false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailability,
  setAvailability,
  blockDate,
  checkWorkerAvailability
};