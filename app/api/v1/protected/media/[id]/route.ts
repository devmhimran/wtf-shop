import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import imagekit from '@/lib/image-kit';

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

    // Delete the file from ImageKit
    try {
      await imagekit.deleteFile(media.fileId);
    } catch (error) {
      console.error('Error deleting from ImageKit:', error);
      // Continue with database deletion even if ImageKit deletion fails
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
