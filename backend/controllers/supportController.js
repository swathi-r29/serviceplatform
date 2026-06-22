const Support = require('../models/Support');

// @desc    Submit a contact form message
// @route   POST /api/support/submit
// @access  Public
const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation (though Mongoose will also validate)
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, subject, message).'
      });
    }

    const newMessage = await Support.create({
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully. We will get back to you soon!',
      data: newMessage
    });
  } catch (error) {
    console.error('Support Submission Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Get all support messages (Admin only)
// @route   GET /api/support/messages
// @access  Private/Admin
const getAllMessages = async (req, res) => {
  try {
    const messages = await Support.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// @desc    Update support message status
// @route   PATCH /api/support/:id/status
// @access  Private/Admin
const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const message = await Support.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: message
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a support message
// @route   DELETE /api/support/:id
// @access  Private/Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Support.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitMessage,
  getAllMessages,
  updateMessageStatus,
  deleteMessage
};
