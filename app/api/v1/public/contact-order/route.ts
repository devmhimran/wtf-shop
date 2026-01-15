import { catchAsyncNext } from '@/lib/catch-async';
import { NextRequest, NextResponse } from 'next/server';
import { transporter } from '@/lib/mailer';
import imagekit from '@/lib/image-kit';

interface Customization {
  id: string;
  imagePreview: string;
  imageName: string;
  imageSize: number;
  imageType: string;
  note: string;
}

interface ContactOrderItem {
  productId: number;
  title: string;
  slug: string;
  quantity: number;
  image: string;
  color: string;
  size: string;
  printSide: 'one' | 'two';
  customizations: Customization[];
}

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const body = await req.json();
  const { name, email, phone, note, items } = body;

  const subject = `New Custom Order Request from ${name}`;

  // Process items and upload images to ImageKit
  const processedItems: ContactOrderItem[] = await Promise.all(
    (items || []).map(async (item: ContactOrderItem) => {
      if (item.customizations && item.customizations.length > 0) {
        const processedCustomizations = await Promise.all(
          item.customizations.map(async (custom: Customization) => {
            if (
              custom.imagePreview &&
              custom.imagePreview.startsWith('data:')
            ) {
              try {
                const uploadResponse = await imagekit.upload({
                  file: custom.imagePreview,
                  fileName: `custom-${Date.now()}-${Math.floor(
                    Math.random() * 1000
                  )}.png`,
                  folder: 'customizaed-media-library',
                  useUniqueFileName: true,
                });

                return {
                  ...custom,
                  imagePreview: uploadResponse.url,
                };
              } catch (error) {
                console.error('Error uploading to ImageKit:', error);
                return custom;
              }
            }
            return custom;
          })
        );
        return { ...item, customizations: processedCustomizations };
      }
      return item;
    })
  );

  // Construct HTML Email
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Contact Order Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Additional Note:</strong> ${note || 'N/A'}</p>
      
      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
      
      <h3>Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Details</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${(processedItems || [])
            .map((item: ContactOrderItem) => {
              const hasCustomizations =
                item.customizations && item.customizations.length > 0;

              return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: top;">
                <div style="font-weight: bold;">${item.title}</div>
                ${
                  item.image
                    ? `
                    <div>
                      <img src="${item.image}" alt="Product" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-top: 5px;" />
                    </div>`
                    : ''
                }
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: top;">
                <div>Color: <strong>${item.color}</strong></div>
                <div>Size: <strong>${item.size}</strong></div>
                <div>Print Side: <strong style="text-transform: capitalize;">${
                  item.printSide
                }</strong></div>
                
                ${
                  hasCustomizations
                    ? `
                  <div style="margin-top: 10px; font-size: 0.9em; color: #555;">
                    <strong>Customizations:</strong>
                    ${item.customizations
                      .map(
                        (custom: Customization) => `
                      <div style="margin-top: 5px; border-left: 2px solid #ddd; padding-left: 8px;">
                        ${
                          custom.imagePreview
                            ? `
                            <div>
                              <img src="${custom.imagePreview}" alt="Custom" style="width: 40px; height: 40px; object-fit: cover; margin-bottom: 4px; display: block;" />
                              <div style="font-size: 10px; margin-bottom: 4px;">
                                <a href="${custom.imagePreview}" target="_blank" style="color: #007bff; text-decoration: none;">Click to open image</a>
                              </div>
                            </div>`
                            : ''
                        }
                        <div>${custom.note || 'No note'}</div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                `
                    : ''
                }
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: top;">
                ${item.quantity}
              </td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>

      <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
        <p>This email was sent from the What The Funk contact form.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"What The Funk - Contact Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: subject,
    html: htmlContent,
  });

  return NextResponse.json(
    { message: 'Email sent successfully' },
    { status: 200 }
  );
});
