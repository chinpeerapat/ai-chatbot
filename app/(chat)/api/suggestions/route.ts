import { auth } from '@/app/(auth)/auth';
import { getSuggestionsByDocumentId } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new NextResponse('Missing documentId', { status: 400 });
  }

  try {
    const suggestions = await getSuggestionsByDocumentId({ documentId });
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return new NextResponse('Failed to get suggestions', { status: 500 });
  }
}
