import { prisma } from '@/prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { catchAsyncNext } from '@/lib/catch-async';
import { authenticateRequest } from '@/lib/utils';
import { Prisma } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

export const GET = catchAsyncNext(async (req: NextRequest) => {
  const { error } = await authenticateRequest(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.MediaLibraryWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.MediaLibraryWhereInput = whereConditions.length
    ? { AND: whereConditions }
    : {};

  const [media, totalCount] = await Promise.all([
    prisma.mediaLibrary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.mediaLibrary.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: media,
    meta: {
      count: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

export const POST = catchAsyncNext(async (req: NextRequest) => {
  const { error, payload } = await authenticateRequest(req);
  if (error) return error;

  if (payload.role === 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Unauthorized: Insufficient permissions' },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const title = formData.get('title') as string | null;
  const alt = formData.get('alt') as string | null;
  const createdById = formData.get('createdById') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  // Read file buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // folder path
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExtension = path.extname(file.name);
  const fileNameWithoutExt = path.basename(file.name, fileExtension);
  let existingFileTitle = fileNameWithoutExt;
  let fileName = `${fileNameWithoutExt}${fileExtension}`;
  let filePath = path.join(uploadDir, fileName);
  let counter = 1;

  while (fs.existsSync(filePath)) {
    fileName = `${fileNameWithoutExt}-${counter}${fileExtension}`;
    existingFileTitle = `${fileNameWithoutExt}-${counter}`;
    filePath = path.join(uploadDir, fileName);
    counter++;
  }

  // Write file to server
  fs.writeFileSync(filePath, buffer);

  // Public URL
  const fileUrl = `/uploads/${fileName}`;

  // Save to MediaLibrary
  const media = await prisma.mediaLibrary.create({
    data: {
      title: title || existingFileTitle || null,
      alt: alt || null,
      fileUrl,
      fileName,
      fileType: file.type,
      fileSize: buffer.length,
      createdById: createdById ? Number(createdById) : null,
    },
  });

  return NextResponse.json(
    {
      message: 'File uploaded successfully',
      media,
    },
    { status: 201 }
  );
});
