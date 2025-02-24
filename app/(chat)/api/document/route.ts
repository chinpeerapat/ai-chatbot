import { auth } from '@/app/(auth)/auth';
import type { ArtifactKind } from '@/components/artifact';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries';
import { NextResponse } from 'next/server';

interface DocumentRequestBody {
  title: string;
  kind: ArtifactKind;
  content: string;
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing id', { status: 400 });
  }

  try {
    const documents = await getDocumentsById({ id });
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to get documents:', error);
    return new NextResponse('Failed to get documents', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('id');

  if (!documentId) {
    return new NextResponse('Missing id', { status: 400 });
  }

  try {
    const { title, kind, content } = (await request.json()) as DocumentRequestBody;

    await saveDocument({
      id: documentId,
      title,
      kind,
      content,
      userId: session.user.id,
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('Failed to save document:', error);
    return new NextResponse('Failed to save document', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!documentId || !timestamp) {
    return new NextResponse('Missing id or timestamp', { status: 400 });
  }

  try {
    await deleteDocumentsByIdAfterTimestamp({
      id: documentId,
      timestamp: new Date(timestamp),
    });

    return new NextResponse('OK');
  } catch (error) {
    console.error('Failed to delete documents:', error);
    return new NextResponse('Failed to delete documents', { status: 500 });
  }
}
