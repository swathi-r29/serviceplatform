const adminController = require('./controllers/adminController');
console.log('Keys in adminController:', Object.keys(adminController));
console.log('approveWorker type:', typeof adminController.approveWorker);
if (typeof adminController.approveWorker !== 'function') {
    console.error('ERROR: approveWorker is not a function!');
} else {
    console.log('SUCCESS: approveWorker is a function.');
}
