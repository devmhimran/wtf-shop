import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';

type RouteParams = {
  id: string;
};

export const DELETE = catchAsyncNext(
  async (req: NextRequest, context?: { params: Promise<RouteParams> }) => {
    if (!context?.params) throw new Error('Missing params');
    const { id } = await context.params;

    const { error, payload } = await authenticateRequest(req);
    if (error) return error;

    if (payload.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    // Find the media file
    const media = await prisma.mediaLibrary.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete the physical file from server
    const filePath = path.join(process.cwd(), 'public', media.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.mediaLibrary.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });
  }
);
