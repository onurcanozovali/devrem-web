import { NextResponse } from 'next/server';
import { CommunityAuthError, identityFromRequest } from '@/lib/community/auth';
import {
  CommunityWriteError,
  toggleCommunityMessageLike,
} from '@/lib/community/repository';

type RouteContext = {
  params: Promise<{ topicId: string; messageId: string }>;
};

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { topicId, messageId } = await params;
    const identity = await identityFromRequest(request);
    const payload = (await request.json().catch(() => ({}))) as {
      messageType?: string;
    };
    if (payload.messageType !== 'topic' && payload.messageType !== 'reply') {
      return NextResponse.json(
        { error: 'Mesaj türü geçersiz.' },
        { status: 400 },
      );
    }
    const result = await toggleCommunityMessageLike({
      identity,
      topicId,
      messageId,
      messageType: payload.messageType,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CommunityAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    if (error instanceof CommunityWriteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: 'Beğeni güncellenemedi. Lütfen tekrar dene.' },
      { status: 500 },
    );
  }
}
