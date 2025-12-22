import { catchAsyncNext } from '@/lib/catch-async';
import { transporter } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const body = await req.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { success: false, message: 'All fields are required' },
      { status: 400 }
    );
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, message: 'Invalid email address' },
      { status: 400 }
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF8804; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { margin-top: 5px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>This email was sent from your website contact form</p>
              <p>Received at: ${new Date().toLocaleString('en-AU', {
                timeZone: 'Australia/Sydney',
              })}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"What The Funk - Contact Form" <${process.env.GMAIL_USER}>`,
    to: 'mahmudhimran10@gmail.com',
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: htmlContent,
  });

  return NextResponse.json({
    success: true,
    message: 'Email sent successfully',
  });
});
