import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport(
  new SMTPTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT as string),
    connectionTimeout: 5000,
  })
);

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is: ${code}. Please use this code to verify your account.`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
