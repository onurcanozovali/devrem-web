import { NextResponse } from 'next/server';
import { CommunityAuthError, identityFromRequest } from '@/lib/community/auth';
import {
  isCommunityCategoryId,
} from '@/lib/community/constants';
import {
  CommunityWriteError,
  createCommunityTopic,
} from '@/lib/community/repository';
import {
  normalizePlainText,
  validateNickname,
  validateTopicBody,
  validateTopicTitle,
} from '@/lib/community/text';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const identity = await identityFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const title = normalizePlainText(body.title);
    const content = normalizePlainText(body.body);
    const nickname = normalizePlainText(body.nickname);
    const category = normalizePlainText(body.category);
    if (!isCommunityCategoryId(category)) {
      return NextResponse.json(
        { error: 'Geçerli bir kategori seç.' },
        { status: 400 },
      );
    }
    const titleError = validateTopicTitle(title);
    if (titleError) return NextResponse.json({ error: titleError }, { status: 400 });
    const bodyError = validateTopicBody(content);
    if (bodyError) return NextResponse.json({ error: bodyError }, { status: 400 });
    const nicknameError = validateNickname(nickname);
    if (nicknameError) {
      return NextResponse.json({ error: nicknameError }, { status: 400 });
    }
    const topic = await createCommunityTopic({
      identity,
      title,
      body: content,
      category,
      nickname,
    });
    return NextResponse.json({ topic });
  } catch (error) {
    if (error instanceof CommunityAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof CommunityWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Konu açılamadı. Lütfen tekrar dene.' },
      { status: 500 },
    );
  }
}
