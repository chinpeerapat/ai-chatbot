import { auth } from '@/app/[locale]/(auth)/auth';
import { getChatsByUserId } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  try {
    const chats = await getChatsByUserId({ id: session.user.id ?? '' });
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Failed to get chats:', error);
    return new NextResponse('Failed to get chats', { status: 500 });
  }
}
