import { prisma } from '@/prisma/prisma';

/**
 * Generates a unique order ID with pattern: WF-XXXXX-XXXXX
 * Example: WF-A3F7K-2H9D4
 *
 * Combines timestamp + random chars for better uniqueness
 * Checks database to ensure no duplicates
 */
export async function generateOrderId(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const generateSegment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Maximum retry attempts to avoid infinite loop
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Include timestamp in first segment for better uniqueness
    const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
    const random1 = generateSegment(2);
    const segment1 = timestamp + random1; // 5 chars total

    const segment2 = generateSegment(5);
    const orderId = `WF-${segment1}-${segment2}`;

    // Check if orderId already exists in database
    const existing = await prisma.order.findUnique({
      where: { orderId },
      select: { id: true },
    });

    if (!existing) {
      return orderId;
    }

    // If collision detected, log and retry
    console.warn(`OrderId collision detected: ${orderId}, retrying...`);
  }

  // Fallback: add extra random segment if all retries failed
  const fallbackId = `WF-${generateSegment(5)}-${generateSegment(
    5
  )}-${generateSegment(3)}`;
  console.error('Multiple orderId collisions, using fallback:', fallbackId);
  return fallbackId;
}
