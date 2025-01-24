// implement testing with jest
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { simpleParser } = require("mailparser");
const fs = require("fs");

dotenv.config();

const emailFileName = "tests/emails/freefood_text_img_attachment.eml";

// const API_PORT = process.env.API_PORT || 3000;
const SMTP_PORT = process.env.SMTP_PORT || 587;

const emailContent = fs.readFileSync(emailFileName, "utf-8");

const transporter = nodemailer.createTransport({
  host: "listflow.tigerapps.org",
  port: SMTP_PORT,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

(async () => {
  const parsedEmail = await simpleParser(emailContent);

  const mailOptions = {
    from: '"Sender Name" <sender@example.com>',
    to: parsedEmail.to.text,
    subject: parsedEmail.subject,
    text: parsedEmail.text,
    html: parsedEmail.html,
    attachments: parsedEmail.attachments,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
})();
