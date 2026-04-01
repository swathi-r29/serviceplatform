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

module.exports = { sendOTP, sendEmail };