const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter.
 *
 * Gmail requirements:
 *  - 2-Step Verification must be ON for your Google account.
 *  - Generate an App Password at: https://myaccount.google.com/apppasswords
 *  - Use that 16-char App Password (no spaces) as EMAIL_PASS in .env
 *
 * Your .env should look like:
 *   EMAIL_SERVICE=gmail
 *   EMAIL_USER=you@gmail.com
 *   EMAIL_PASS=abcdabcdabcdabcd   <-- 16-char app password, NO spaces
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      // Strip any spaces from the app password (common copy-paste mistake)
      pass: process.env.EMAIL_PASS.replace(/\s/g, '')
    }
  });
};

/**
 * Generic email sender.
 * Returns the nodemailer info object on success, or null on failure.
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'ServiceHub'}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.email, '| messageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);

    // Common Gmail error hints
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.error(
        '💡 Gmail tip: Make sure 2-Step Verification is ON and you are using a 16-character',
        'App Password (generated at https://myaccount.google.com/apppasswords), NOT your regular password.'
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('--- DEV EMAIL SIMULATION (email was NOT actually sent) ---');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Message:', options.message);
      console.log('----------------------------------------------------------');
    }

    return null;
  }
};

/**
 * Sends the 6-digit OTP to the given email address.
 */
const sendOTP = async (email, otp) => {
  const subject = 'Your Verification Code';
  const message = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;
                border: 1px solid #e0d4c0; border-radius: 10px;">
      <h2 style="color: #c4975d; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #3d3d3d;">Hello,</p>
      <p style="font-size: 16px; color: #3d3d3d;">
        Thank you for registering. Please use the following One-Time Password (OTP) to verify
        your email address. This code is valid for <b>10 minutes</b>.
      </p>
      <div style="background-color: #f5ede2; padding: 20px; text-align: center;
                  border-radius: 8px; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1a1a;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #909090;">
        If you did not request this code, please ignore this email.
      </p>
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
      <p style="font-size: 12px; color: #b0a898; text-align: center;">
        &copy; ${new Date().getFullYear()} ${process.env.EMAIL_FROM_NAME || 'ServiceHub'}. All rights reserved.
      </p>
    </div>
  `;

  return await sendEmail({ email, subject, message, html });
};

/**
 * Notifies the worker of a new booking request.
 */
const sendNewBookingEmail = async (workerEmail, workerName, userName, serviceName, date, time) => {
  const subject = 'New Booking Request - ServiceHub';
  const message = `Hello ${workerName}, you have a new booking request for ${serviceName} from ${userName} on ${date} at ${time}.`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0d4c0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #c4975d; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">New Service Request</h1>
      </div>
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p style="font-size: 16px;">Hello <b>${workerName}</b>,</p>
        <p>Expert matching successful! You have a new booking request from <b>${userName}</b>.</p>
        
        <div style="background-color: #fdfaf5; border-left: 4px solid #c4975d; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #c4975d; border-bottom: 1px solid #f0e6d6; padding-bottom: 10px;">Booking Details</h3>
          <p style="margin: 10px 0;"><strong>Service:</strong> ${serviceName}</p>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 10px 0;"><strong>Time:</strong> ${time}</p>
        </div>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/worker/bookings" 
             style="background-color: #c4975d; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            View Request Details
          </a>
        </p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ServiceHub. All rights reserved.</p>
        <p style="margin: 5px 0;">Empowering professionals, serving homes.</p>
      </div>
    </div>
  `;

  return await sendEmail({ email: workerEmail, subject, message, html });
};

/**
 * Notifies the user that their booking has been accepted.
 */
const sendBookingAcceptedEmail = async (userEmail, userName, workerName, serviceName, bookingId) => {
  const subject = 'Booking Accepted! - ServiceHub';
  const message = `Great news ${userName}! ${workerName} has accepted your booking for ${serviceName}.`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #d4edda; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #28a745; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">Booking Confirmed!</h1>
      </div>
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p style="font-size: 16px;">Hello <b>${userName}</b>,</p>
        <p>Great news! Your service request for <b>${serviceName}</b> has been accepted by our professional.</p>
        
        <div style="background-color: #f4faf6; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0;"><strong>Professional:</strong> ${workerName}</p>
          <p style="margin: 10px 0 0 0;"><strong>Status:</strong> Confirmed & Ready</p>
        </div>

        <p>Please ensure your payment is completed (if not already) to finalize the scheduling.</p>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings/${bookingId}" 
             style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            View Booking Status
          </a>
        </p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ServiceHub. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail({ email: userEmail, subject, message, html });
};

/**
 * Notifies the user that the service is completed and asks for a review.
 */
const sendServiceCompletedEmail = async (userEmail, userName, serviceName, bookingId) => {
  const subject = 'Service Completed - Share your feedback';
  const message = `Hi ${userName}, your ${serviceName} service is now complete. We'd love to hear your feedback!`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e0d4c0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #c4975d; padding: 30px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">Service Completed!</h1>
      </div>
      <div style="padding: 30px; color: #333; text-align: center; line-height: 1.6;">
        <p style="font-size: 18px; margin-bottom: 5px;">How was your experience, <b>${userName}</b>?</p>
        <p>Your <b>${serviceName}</b> service has been successfully completed.</p>
        
        <div style="margin: 30px 0;">
          <p style="font-size: 14px; color: #666;">Please take a moment to rate our professional. Your feedback helps us maintain high service standards.</p>
          <div style="font-size: 30px; margin: 15px 0; color: #ffc107;">
            ★ ★ ★ ★ ★
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings/${bookingId}" 
             style="background-color: #c4975d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Leave a Review
          </a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        <p style="margin: 5px 0;">Thank you for choosing ServiceHub!</p>
        <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ServiceHub. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail({ email: userEmail, subject, message, html });
};

module.exports = { 
  sendOTP, 
  sendEmail, 
  sendNewBookingEmail, 
  sendBookingAcceptedEmail, 
  sendServiceCompletedEmail 
};