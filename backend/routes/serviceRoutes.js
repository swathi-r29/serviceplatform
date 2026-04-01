const express = require('express');
const {
  getCategories,
  getAllServices,
  getServiceById,
  getServicesByCategory,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const router = express.Router();

console.log('✅ Service routes loaded');

// Public routes
router.get('/categories', getCategories);
router.get('/', getAllServices);

// Import getWorkersByCategory
const { getWorkersByCategory } = require('../controllers/workerController');
router.get('/workers/:category', getWorkersByCategory);

// IMPORTANT: Put this route BEFORE '/:id' route
router.get('/category/:categoryName', getServicesByCategory);

router.get('/:id', getServiceById);

// Protected routes (admin only)
router.use((req, res, next) => {
  console.log('\n========================================');
  console.log('SERVICE ROUTE - Protected Route Hit');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('========================================\n');
  next();
});

router.use(protect);
router.use(checkRole('admin'));

router.post('/', upload.single('image'), createService);
router.put('/:id', upload.single('image'), updateService);
router.delete('/:id', deleteService);

module.exports = router;