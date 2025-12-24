import { catchAsyncNext } from '@/lib/catch-async';
import { transporter } from '@/lib/mailer';
import { generateUnique6DigitCode } from '@/lib/utils';
import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const body = await req.json();
  const { email } = body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new Error('No account found with this email address');
  }

  const code = generateUnique6DigitCode();

  await prisma.forgotPassword.create({
    data: {
      code: code.toString(),
      is_valid: true,
      createdAt: new Date(),
      email,
    },
  });

  try {
    await transporter.sendMail({
      from: `What The Funk <${
        process.env.EMAIL_FROM_ADDRESS || 'notifications@zentechventure.com'
      } >`,
      to: email,
      subject: 'Password Reset Code - What The Funk',
      html: `
          <!doctype html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>Password Reset</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f4f6f8;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:20px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="background:#FF8804;padding:20px 24px;text-align:left;color:#ffffff;font-weight:700;">
                          What The Funk
                        </td>
                        <td style="background:#FF8804;padding:20px 24px;text-align:right;color:#ffffff;font-weight:700;">Password Reset</td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td colspan="2" style="padding:28px 32px 8px 32px;color:#13303a;">
                          <h1 style="margin:0 0 12px 0;font-size:20px;color:#0f1724;font-weight:600;">Reset your What The Funk password</h1>
                          <p style="margin:0 0 18px 0;color:#334155;font-size:15px;">Hi <strong style="color:#FF8804">${
                            user.name
                          }</strong>, we received a request to reset your password. Use the code below to continue. This code expires in 3 minutes.</p>
                        </td>
                      </tr>

                      <!-- Code Box -->
                      <tr>
                        <td colspan="2" align="center" style="padding:10px 32px 24px 32px;">
                          <div style="display:inline-block;background:#fff;border:1px solid #e6e9ee;padding:18px 26px;border-radius:10px;box-shadow:0 6px 20px rgba(17,24,39,0.06);">
                            <p style="margin:0;font-size:13px;color:#64748b;text-align:center;letter-spacing:1px;text-transform:uppercase;">Your verification code</p>
                            <p style="margin:10px 0 0 0;background:#FF8804;color:#ffffff;padding:14px 22px;border-radius:8px;font-size:28px;font-weight:700;letter-spacing:6px;text-align:center;display:inline-block;min-width:220px;">${code}</p>
                          </div>
                        </td>
                      </tr>

                      <!-- CTA and Support -->
                      <tr>
                        <td colspan="2" style="padding:0 32px 22px 32px;color:#334155;font-size:14px;">
                          <p style="margin:0 0 12px 0;">If you did not request a password reset, you can safely ignore this email or <a href="mailto:whatthefunk.au@gmail.com" style="color:#FF8804;text-decoration:none;">contact support</a>.</p>
                          <p style="margin:0;color:#94a3b8;font-size:13px;">For security, do not share this code with anyone.</p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td colspan="2" style="background:#f8fafc;padding:18px 32px;border-top:1px solid #eef2f6;color:#64748b;font-size:13px;text-align:center;">
                          <div style="margin-bottom:8px;">Best regards, <strong style="color:#FF8804">What The Funk Team</strong></div>
                          <div style="font-size:12px;color:#9aa4ad;">Need help? <a href="mailto:whatthefunk.au@gmail.com" style="color:#FF8804;text-decoration:none;">whatthefunk.au@gmail.com</a></div>
                        </td>
                      </tr>
                    </table>
                    <div style="max-width:600px;margin-top:14px;color:#94a3b8;font-size:12px;text-align:center;">© ${new Date().getFullYear()} What The Funk. All rights reserved.</div>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
    });
  } catch {
    throw new Error('Failed to send reset email. Please try again.');
  }

  return NextResponse.json({
    success: true,
    message: 'Password reset code has been sent to your email address',
  });
});
