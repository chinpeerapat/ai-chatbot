import { auth } from '@/app/[locale]/(auth)/auth';
import { generateTitleFromUserMessage, saveChat } from '@/app/[locale]/(chat)/actions';
import { saveMessages } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import type { Message } from 'ai';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { messages, id } = await request.json();

    if (!messages || !id) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const [firstMessage] = messages as Message[];

    if (messages.length === 1) {
      const title = await generateTitleFromUserMessage({
        message: firstMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    }

    await saveMessages({ messages });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save chat:', error);
    return new NextResponse('Failed to save chat', { status: 500 });
  }
}
