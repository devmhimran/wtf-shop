import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOrderEmail(
  to: string,
  subject: string,
  html: string
) {
  return transporter.sendMail({
    from: `"What The Funk" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}
