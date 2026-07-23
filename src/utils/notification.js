const nodemailer = require('nodemailer');

async function sendEmailOTP({userEmail, otp}) {
  // 1. Generate secure 6-digit OTP
  // 2. Configure your email server settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Works for Gmail, Outlook, Yahoo, etc.
    auth: {
      user: 'mothilal.vs@gmail.com',
      pass: process.env.GMAIL_PASSWORD
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
  } catch (error) {
    console.error('Email failed to send:', error);
  }
}


async function sendConnectionAcceptedEmail({ to, accepterName }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mothilal.vs@gmail.com',
      pass: process.env.GMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: '"Tinder Notifications" mothilal.vs@gmail.com',
    to,
    subject: 'Your connection request was accepted',
    text: `${accepterName} accepted your connection request.`,
    html: `<p><b>${accepterName}</b> accepted your connection request.</p>`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmailOTP, 
  sendConnectionAcceptedEmail
};
