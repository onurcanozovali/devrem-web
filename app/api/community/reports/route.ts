import { NextResponse } from 'next/server';
import { CommunityAuthError, identityFromRequest } from '@/lib/community/auth';
import { isCommunityReportReason } from '@/lib/community/constants';
import {
  CommunityWriteError,
  createCommunityReport,
} from '@/lib/community/repository';
import { normalizePlainText } from '@/lib/community/text';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const identity = await identityFromRequest(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const targetType = payload.targetType === 'reply' ? 'reply' : 'topic';
    const targetId = normalizePlainText(payload.targetId);
    const topicId = normalizePlainText(payload.topicId);
    const reason = normalizePlainText(payload.reason);
    if (!targetId || !topicId || !isCommunityReportReason(reason)) {
      return NextResponse.json(
        { error: 'Bildirim bilgileri eksik veya geçersiz.' },
        { status: 400 },
      );
    }
    const report = await createCommunityReport({
      identity,
      targetType,
      targetId,
      topicId,
      reason,
    });
    return NextResponse.json({ report });
  } catch (error) {
    if (error instanceof CommunityAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof CommunityWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Bildirim gönderilemedi. Lütfen tekrar dene.' },
      { status: 500 },
    );
  }
}
