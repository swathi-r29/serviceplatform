const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const workers = await User.find({ name: { $in: ['sam', 'Mansha'] } });
    console.log('Workers Found:', workers.map(w => ({
      name: w.name,
      location: w.location,
      coordinates: w.coordinates
    })));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
