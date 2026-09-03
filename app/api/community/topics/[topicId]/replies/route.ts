import { NextResponse } from 'next/server';
import { CommunityAuthError, identityFromRequest } from '@/lib/community/auth';
import {
  CommunityWriteError,
  createCommunityReply,
  listPublishedCommunityReplies,
} from '@/lib/community/repository';
import { normalizePlainText, validateNickname, validateReplyBody } from '@/lib/community/text';

type RouteContext = { params: Promise<{ topicId: string }> };

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: RouteContext) {
  const { topicId } = await params;
  const cursor = new URL(request.url).searchParams.get('cursor');
  const { replies, nextCursor } = await listPublishedCommunityReplies(
    topicId,
    cursor,
  );
  return NextResponse.json({ replies, nextCursor });
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { topicId } = await params;
    const identity = await identityFromRequest(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const body = normalizePlainText(payload.body);
    const nickname = normalizePlainText(payload.nickname);
    const bodyError = validateReplyBody(body);
    if (bodyError) return NextResponse.json({ error: bodyError }, { status: 400 });
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json({ error: nicknameError }, { status: 400 });
    }
    const reply = await createCommunityReply({
      identity,
      topicId,
      body,
      nickname,
    });
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof CommunityAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof CommunityWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Yanıt gönderilemedi. Lütfen tekrar dene.' },
      { status: 500 },
    );
  }
}
