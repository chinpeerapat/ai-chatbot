import { auth } from '@/app/[locale]/(auth)/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new NextResponse('Missing chatId', { status: 400 });
  }

  try {
    const votes = await getVotesByChatId({ id: chatId });
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Failed to get votes:', error);
    return new NextResponse('Failed to get votes', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { messageId, chatId, type } = await request.json();

    if (!messageId || !chatId || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    await voteMessage({ messageId, chatId, type });
    return new NextResponse('OK');
  } catch (error) {
    console.error('Failed to vote message:', error);
    return new NextResponse('Failed to vote message', { status: 500 });
  }
}
