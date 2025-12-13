const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text,
    };
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email not sent:", error.response?.body || error);
  }
};

module.exports = sendEmail;
