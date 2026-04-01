try {
    const adminRoutes = require('./routes/adminRoutes');
    console.log('SUCCESS: adminRoutes loaded without error.');
} catch (error) {
    console.error('ERROR during adminRoutes load:', error);
}
