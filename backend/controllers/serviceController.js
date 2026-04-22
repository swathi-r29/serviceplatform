const Service = require('../models/Service');
const mongoose = require('mongoose');
const { getStartingPriceForService } = require('../utils/pricingHelper');

// Get all unique categories (Merged with a master list)
exports.getCategories = async (req, res) => {
  try {
    const masterCategories = [
      'Plumbing',
      'Electrical',
      'Cleaning',
      'Carpentry',
      'Painting',
      'Pest Control',
      'Appliance Repair',
      'Salon Services',
      'Packers & Movers',
      'Gardening',
      'Smart Home'
    ];

    let dbCategories = [];
    try {
      // Use a shorter timeout to avoid hanging the entire page if DB is connecting
      dbCategories = await Service.distinct('category').maxTimeMS(5000);
    } catch (dbErr) {
      console.warn('⚠️ MongoDB not ready or unreachable. Falling back to master categories list.');
    }
    
    // Merge, remove duplicates, and ensure 'AC Repair' is removed (merged into Appliance Repair)
    const allCategories = [...new Set([...masterCategories, ...dbCategories])]
      .filter(cat => cat !== 'AC Repair');
    
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    
    // 🚀 Senior Marketplace Logic: Calculate "Starting from" prices for all listings
    const processedServices = services.map(s => {
      const serviceObj = s.toObject();
      
      // 🩹 HEAL LEGACY DATA: If workers is just an array of IDs, convert to new format
      const healedWorkers = (serviceObj.workers || []).map(w => {
        if (w && typeof w === 'object' && (w.worker || w._id)) return w;
        return { worker: w, price: serviceObj.price || 0 };
      });
      serviceObj.workers = healedWorkers;
      
      // Calculate Starting Price
      serviceObj.startingPrice = getStartingPriceForService(serviceObj);
      return serviceObj;
    });

    res.json(processedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    // FIXED: Use categoryName to match route parameter
    const { categoryName } = req.params;

    console.log('Fetching services for category:', categoryName);

    // Case-insensitive search
    const services = await Service.find({
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') }
    }).sort({ createdAt: -1 });

    const processedServices = services.map(s => {
      const serviceObj = s.toObject();
      
      // 🩹 HEAL LEGACY DATA
      const healedWorkers = (serviceObj.workers || []).map(w => {
        if (w && typeof w === 'object' && (w.worker || w._id)) return w;
        return { worker: w, price: serviceObj.price || 0 };
      });
      serviceObj.workers = healedWorkers;
      
      serviceObj.startingPrice = getStartingPriceForService(serviceObj);
      return serviceObj;
    });

    res.json(processedServices);
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// Get single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('workers.worker');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // 🩹 HEAL LEGACY DATA: If workers is just an array of IDs, convert to new format
    let needsHeal = false;
    const healedWorkers = service.workers.map(w => {
      // If it's already an object with a worker ref (populated or ID), it's the new format
      if (w && typeof w === 'object' && (w.worker || w._id)) {
        return w;
      }
      // If it's just an ID or a null, it's legacy
      needsHeal = true;
      return { worker: w, price: service.price || 0 };
    });

    if (needsHeal) {
      console.log(`🩹 HEALING: Service ${service._id} had legacy worker data. Auto-formatting...`);
      service.workers = healedWorkers;
      // We don't necessarily need to save here, but we must return the correct format for the UI
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service', error: error.message });
  }
};

// Create new service (admin only)
exports.createService = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('CREATE SERVICE - START');
    console.log('========================================');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    console.log('Request File:', req.file);
    console.log('Request User:', req.user ? { id: req.user._id, role: req.user.role, name: req.user.name } : 'NO USER');
    console.log('----------------------------------------');

    const { name, category, price, description, duration, workers } = req.body;

    console.log('Extracted fields:');
    console.log('- name:', name);
    console.log('- category:', category);
    console.log('- price:', price);
    console.log('- description:', description?.substring(0, 50) + '...');
    console.log('- duration:', duration);
    console.log('- workers:', workers);

    // Validation
    if (!name || !description || !category || !price || !duration) {
      console.log('❌ VALIDATION FAILED: Missing required fields');
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      console.log('❌ VALIDATION FAILED: Invalid price');
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration <= 0) {
      console.log('❌ VALIDATION FAILED: Invalid duration');
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    const validCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Pest Control', 'Appliance Repair', 'Packers & Movers', 'Salon Services', 'Gardening', 'Smart Home', 'Other'];
    if (!validCategories.includes(category)) {
      console.log('❌ VALIDATION FAILED: Invalid category');
      return res.status(400).json({ message: 'Invalid category' });
    }

    console.log('✅ Basic validation passed');

    let workerIds = [];
    if (workers) {
      let parsedWorkers;
      if (typeof workers === 'string') {
        try {
          parsedWorkers = JSON.parse(workers);
        } catch (e) {
          console.log('❌ VALIDATION FAILED: Invalid workers JSON format');
          return res.status(400).json({ message: 'Invalid workers data format' });
        }
      } else {
        parsedWorkers = workers;
      }

      workerIds = Array.isArray(parsedWorkers) ? parsedWorkers : [parsedWorkers];
      workerIds = workerIds.flat(Infinity);
      console.log('Processing worker IDs:', workerIds);

      workerIds = workerIds.map(w => {
        try {
          const id = typeof w === 'object' ? (w.workerId || w.worker || w._id || w.id) : w;
          const price = typeof w === 'object' ? (w.price || numPrice) : numPrice;
          
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid worker ID: ${id}`);
          }
          return { worker: new mongoose.Types.ObjectId(id), price: Number(price) };
        } catch (error) {
          console.log('❌ VALIDATION FAILED: Invalid worker entry:', w);
          throw new Error(`Invalid worker entry`);
        }
      });
      console.log('✅ Worker IDs and prices validated and converted');
    }

    const serviceData = {
      name,
      category,
      price: numPrice,
      description,
      duration: numDuration,
      workers: workerIds
    };

    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
      console.log('✅ Image added:', serviceData.image);
    } else {
      console.log('ℹ️  No image uploaded');
    }

    console.log('----------------------------------------');
    console.log('Service data to create:', JSON.stringify(serviceData, null, 2));
    console.log('----------------------------------------');
    console.log('Attempting to create service in database...');

    const service = await Service.create(serviceData);

    console.log('✅ SERVICE CREATED SUCCESSFULLY!');
    console.log('Service ID:', service._id);
    console.log('========================================\n');

    res.status(201).json(service);
  } catch (error) {
    console.log('\n========================================');
    console.log('❌ ERROR CREATING SERVICE');
    console.log('========================================');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.log('========================================\n');

    res.status(500).json({ 
      message: 'Error creating service', 
      error: error.message,
      code: error.code // Include system code (e.g. EACCES)
    });
  }
};

// Update service (admin only)
exports.updateService = async (req, res) => {
  try {
    const { name, category, price, description, duration, workers, isActive } = req.body;

    // Validation
    if (!name || !description || !category || !price || !duration) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    const validCategories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Pest Control', 'Appliance Repair', 'Packers & Movers', 'Salon Services', 'Gardening', 'Smart Home', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let workerIds = [];
    if (workers) {
      let parsedWorkers;
      if (typeof workers === 'string') {
        try {
          parsedWorkers = JSON.parse(workers);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid workers data' });
        }
      } else {
        parsedWorkers = workers;
      }
      workerIds = Array.isArray(parsedWorkers) ? parsedWorkers : [parsedWorkers];
      workerIds = workerIds.flat(Infinity);
      workerIds = workerIds.map(w => {
        try {
          const id = typeof w === 'object' ? (w.workerId || w.worker || w._id || w.id) : w;
          const price = typeof w === 'object' ? (w.price || numPrice) : numPrice;
          
          if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            console.warn('⚠️ SKIPPING INVALID WORKER ID:', id);
            return null;
          }
          return { worker: new mongoose.Types.ObjectId(id), price: Number(price) };
        } catch (err) {
          console.error('❌ WORKER MAPPING ERROR:', err.message);
          return null;
        }
      }).filter(Boolean);
    }

    const updateData = {
      name,
      category,
      price: numPrice,
      description,
      duration: numDuration,
      workers: workerIds,
      isActive: isActive === 'true'
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const serviceObj = service.toObject();
    // 🩹 HEAL LEGACY DATA
    const healedWorkers = (serviceObj.workers || []).map(w => {
      if (w && typeof w === 'object' && (w.worker || w._id)) return w;
      return { worker: w, price: serviceObj.price || 0 };
    });
    serviceObj.workers = healedWorkers;
    serviceObj.startingPrice = getStartingPriceForService(serviceObj);

    res.json(serviceObj);
  } catch (error) {
    console.error('❌ ERROR UPDATING SERVICE:');
    console.error(error); // Logs full stack trace and properties
    res.status(500).json({ 
      message: 'Error updating service', 
      error: error.message,
      code: error.code
    });
  }
};

// Delete service (admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};