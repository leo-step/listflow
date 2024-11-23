// implement testing with jest

const nodemailer = require("nodemailer");

// const API_PORT = process.env.API_PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 25;

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: SMTP_PORT,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

const mailOptions = {
  from: '"Sender Name" <sender@example.com>',
  to: "receiver@example.com",
  subject: "Test Email",
  text: "This is a test email sent to a local SMTP server.",
  html: "<b>This is a test email sent to a local SMTP server.</b>",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
