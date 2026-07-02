const nodemailer = require('nodemailer');
const crypto = require('crypto');

async function sendEmailOTP(userEmail) {
  // 1. Generate secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000);

  // 2. Configure your email server settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Works for Gmail, Outlook, Yahoo, etc.
    auth: {
      user: 'mothilal.vs@gmail.com',
      pass: 'tusf rhfh xzxn phij'
    }
  });

  // 3. Define the email content
  const mailOptions = {
    from: '"Your App Security" mothilal.vs@gmail.com',
    to: userEmail,
    subject: 'Your 6-Digit Verification Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your verification code is: <b>${otp}</b></p><p>It expires in 5 minutes.</p>`
  };

  // 4. Send it
  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${userEmail}`);
    return otp; // Return this to save in your database/cache for verification
  } catch (error) {
    console.error('Email failed to send:', error);
  }
}

module.exports = sendEmailOTP;