import { auth } from '@/app/[locale]/(auth)/auth';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return new NextResponse('No file found', { status: 400 });
  }

  try {
    const { url } = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to upload file:', error);
    return new NextResponse('Failed to upload file', { status: 500 });
  }
}
