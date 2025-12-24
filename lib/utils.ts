import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAccessToken } from './jwt';
import { authApi } from './api-helper';
import { CommonApiResponseError, ErrorItem } from '@/types/common.types';
import { ZodError } from 'zod';
import { toast } from 'sonner';
import { OrderEmailType } from '@/types';

export const USER_COUNT_PER_PAGE = 10;

export const productTypeConvert = {
  STANDARD: 'Standard',
  CUSTOM: 'Custom',
};

export const productSortBy = {
  LOW_TO_HIGH: 'Low to High',
  HIGH_TO_LOW: 'High to Low',
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown) => {
  let message;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }

  return message;
};

export const getErrorResponse = (error: unknown) => {
  const apiError = error as CommonApiResponseError;

  const backendErrors: ErrorItem[] = apiError?.response?.data?.error ?? [];
  if (backendErrors.length > 0 && Array.isArray(backendErrors)) {
    return backendErrors.map((e) => e.message).join(', ');
  } else if (backendErrors.length > 0 && typeof backendErrors === 'string') {
    return backendErrors;
  }

  // fallback
  return apiError?.message || 'Something went wrong';
};

export async function authenticateRequest(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized: No access token' },
        { status: 401 }
      ),
      payload: null,
    };
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired access token' },
        { status: 401 }
      ),
      payload: null,
    };
  }

  return {
    error: null,
    payload,
  };
}

export const catchError = (error: unknown) => {
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Something went wrong',
  };
};

export function generateQueryString(params: Record<string, string>) {
  const isEmpty = Object.values(params).every((value) => value === '');

  if (isEmpty) {
    return '';
  }

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          value as unknown as string
        )}`
    )
    .join('&');

  return `?${queryString}`;
}

export const roleConvert = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  CUSTOMER: 'Customer',
};

export const userStatusConvert = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const shippingRegionConvert = {
  INSIDE_AU: 'Inside Australia',
  OUTSIDE_AU: 'Outside Australia',
};

export const shippingFreeChargeConvert = {
  FREE_SHIPPING: 'Free Shipping',
  PAID_SHIPPING: 'Paid Shipping',
};

export const orderStatusConvert = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export const paymentStatusConvert = {
  INCOMPLETE: 'Incomplete',
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const deliveryMethodConvert = {
  PICKUP: 'Pickup',
  SHIPPING: 'Shipping',
};

export const authLogout = async () => {
  await authApi.logout();

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;

    if (pathname === '/signin') {
      window.location.href = '/signin';
    } else {
      window.location.href = `/signin?callbackUrl=${encodeURIComponent(
        pathname
      )}`;
    }
  }
};

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const formatZodErrors = (zodError: ZodError) => {
  const formatted: Record<string, string> = {};

  zodError.issues.forEach((issue) => {
    const field = issue.path.join('.');
    formatted[field] = issue.message;
  });

  const combinedMessage = Object.values(formatted).join('; ');

  return {
    formatted,
    combinedMessage,
  };
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const handleCopyUrl = (imageUrl: string) => {
  const fullUrl = `${imageUrl}`;
  navigator.clipboard.writeText(fullUrl);
  toast.success('URL copied to clipboard!');
};

export const handleDownload = async (imageUrl: string, imageName: string) => {
  try {
    const url = imageUrl || '/assets/img/placeholder-image.png';
    const fileName = imageName || 'customized-image.png';

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);

    toast.success('Download started!');
  } catch (error) {
    console.error('Download failed:', error);
    toast.error(
      'Failed to download image. Please try opening in a new tab and saving manually.'
    );
  }
};

export const handleOpenInNewTab = (imageUrl: string) => {
  window.open(imageUrl, '_blank');
};

export const orderEmailTemplate = (order: OrderEmailType) => {
  const itemsHtml = order.items
    ?.map(
      (item) => `
      <tr>
        <td>${item.product?.title ?? 'Product'}</td>
        <td>${item.color} / ${item.size}</td>
        <td>${item.quantity}</td>
        <td>AU$${item.price.toFixed(2)}</td>
        <td>AU$${item.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
  <div style="font-family: Arial; background:#f6f6f6; padding:20px">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;padding:20px">
      <h2 style="color:#111">Order Confirmation</h2>
      <p>Thank you for your order! We’ve received your order and it’s being processed.</p>

      <h3>Order Details</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Status:</strong> ${order.status}</p>

      <h3>Customer Info</h3>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone ?? 'N/A'}</p>

      ${
        order.deliveryMethod === 'SHIPPING'
          ? `
      <h3>Shipping Address</h3>
      <p>
        ${order.address ?? ''} <br/>
        ${order.state ?? ''} <br/>
        ${order.country ?? ''}
      </p>`
          : ''
      }

      <h3>Order Items</h3>
      <table width="100%" border="1" cellspacing="0" cellpadding="8">
        <thead>
          <tr>
            <th>Product</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <h3>Payment Summary</h3>
      <p>Subtotal: AU$${order.subtotal.toFixed(2)}</p>
      <p>Shipping: AU$${order.shippingCost.toFixed(2)}</p>
      <p style="font-size:18px"><strong>Total:</strong> AU$${order.total.toFixed(
        2
      )}</p>

      <p style="margin-top:20px">We’ll notify you once it ships.</p>
      <p>Thanks,<br/>What The Funk Team</p>
    </div>
  </div>
`;
};

export const orderAdminEmailTemplate = (order: OrderEmailType) => {
  const itemsHtml = order.items
    ?.map(
      (item) => `
      <tr>
        <td>${item.product?.title ?? 'Product'}</td>
        <td>${item.color} / ${item.size}</td>
        <td>${item.quantity}</td>
        <td>AU$${item.price.toFixed(2)}</td>
        <td>AU$${item.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
  <div style="font-family: Arial; background:#f6f6f6; padding:20px">
    <div style="max-width:650px;margin:auto;background:#fff;border-radius:8px;padding:20px">
      
      <h2 style="color:#111">🛒 New Order Received</h2>
      <p>A new order has been placed on your store.</p>

      <h3>Order Summary</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      <p><strong>Delivery Method:</strong> ${order.deliveryMethod}</p>

      <h3>Customer Info</h3>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone ?? 'N/A'}</p>

      ${
        order.deliveryMethod === 'SHIPPING'
          ? `
      <h3>Shipping Address</h3>
      <p>
        ${order.address ?? ''} <br/>
        ${order.state ?? ''}<br/>
        ${order.country ?? ''}
      </p>`
          : `<p><strong>Pickup Order</strong></p>`
      }

      <h3>Order Items</h3>
      <table width="100%" border="1" cellspacing="0" cellpadding="8">
        <thead>
          <tr>
            <th>Product</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <h3>Payment Summary</h3>
      <p>Subtotal: AU$${order.subtotal.toFixed(2)}</p>
      <p>Shipping: AU$${order.shippingCost.toFixed(2)}</p>
      <p style="font-size:18px"><strong>Total:</strong> AU$${order.total.toFixed(
        2
      )}</p>

      <p style="margin-top:20px">
        Login to the dashboard to process this order.
      </p>

      <p>Regards,<br/>What The Funk System</p>
    </div>
  </div>
`;
};

export const generateUnique6DigitCode = (() => {
  const used = new Set<number>();

  return () => {
    if (used.size >= 900000) throw new Error('All codes used');

    while (true) {
      const code = Math.floor(100000 + Math.random() * 900000);
      if (!used.has(code)) {
        used.add(code);
        return code;
      }
    }
  };
})();
