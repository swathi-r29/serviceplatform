/**
 * Run this from your backend folder:
 *   node testMail.js
 *
 * It will tell you exactly what is wrong.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = (process.env.EMAIL_PASS || '').replace(/\s/g, '');

console.log('\n========== EMAIL DIAGNOSTIC ==========');
console.log('EMAIL_USER   :', EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASS   :', EMAIL_PASS ? `✅ SET (${EMAIL_PASS.length} chars)` : '❌ NOT SET');

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('\n❌ EMAIL_USER or EMAIL_PASS is missing in .env. Aborting.\n');
  process.exit(1);
}

if (EMAIL_PASS.length !== 16) {
  console.warn(
    `\n⚠️  App Password is ${EMAIL_PASS.length} characters. Gmail App Passwords are always 16 chars.` +
    '\n   Go to https://myaccount.google.com/apppasswords and generate a fresh one.\n'
  );
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

console.log('\nVerifying SMTP credentials...');
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ SMTP VERIFY FAILED:', error.message);

    if (error.message.includes('Username and Password not accepted') || error.message.includes('Invalid login')) {
      console.error('\n💡 FIX STEPS:');
      console.error('   1. Go to https://myaccount.google.com/security');
      console.error('   2. Make sure "2-Step Verification" is ON');
      console.error('   3. Go to https://myaccount.google.com/apppasswords');
      console.error('   4. Create a new App Password → App: Mail, Device: Other (name it "nodejs")');
      console.error('   5. Copy the 16-char password into .env as EMAIL_PASS=xxxxxxxxxxxxxxxxxxxx (no spaces)');
      console.error('   6. Restart your server\n');
    }

    if (error.message.includes('Less secure')) {
      console.error('\n💡 FIX: "Less secure apps" is deprecated. Use App Passwords instead (see above).\n');
    }

    process.exit(1);
  }

  console.log('\n✅ SMTP credentials are valid! Sending test email...\n');

  transporter.sendMail({
    from: `"Test" <${EMAIL_USER}>`,
    to: EMAIL_USER,                // sends to yourself as a quick test
    subject: 'OTP Test — working!',
    text: 'Your test OTP is: 123456',
    html: '<h2>Your test OTP is: <b>123456</b></h2><p>If you see this, email is working ✅</p>'
  }, (err, info) => {
    if (err) {
      console.error('❌ Send failed:', err.message);
      process.exit(1);
    }
    console.log('✅ Email sent! MessageId:', info.messageId);
    console.log('   Check your inbox at:', EMAIL_USER);
    console.log('\n======================================\n');
    process.exit(0);
  });
});