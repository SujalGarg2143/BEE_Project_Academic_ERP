const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey", 
        pass: process.env.SENDGRID_API_KEY
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM, 
      to,
      subject,
      text
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent:", error);
  }
};

module.exports = sendEmail;
