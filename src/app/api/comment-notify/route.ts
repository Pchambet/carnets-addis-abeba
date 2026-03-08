import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSortedLettersData } from '@/lib/letters';

type SupabaseInsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: {
    id: string;
    letter_id: string;
    parent_id: string | null;
    author: string;
    email: string | null;
    content: string;
    is_claire: boolean;
    approved: boolean;
    created_at: string;
  };
  old_record: null;
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.COMMENT_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (token !== webhookSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  if (!process.env.RESEND_API_KEY || !process.env.CLAIRE_EMAIL) {
    console.error('Comment notify: RESEND_API_KEY or CLAIRE_EMAIL not configured');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  let payload: SupabaseInsertPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  if (
    payload?.type !== 'INSERT' ||
    payload?.table !== 'comments' ||
    !payload?.record
  ) {
    return NextResponse.json(
      { error: 'Invalid webhook payload' },
      { status: 400 }
    );
  }

  const { record } = payload;
  const letterId = record.letter_id;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://carnets-addis-abeba.vercel.app';
  const letterUrl = `${siteUrl}/letters/${letterId}`;

  let letterTitle = letterId;
  try {
    const letters = getSortedLettersData();
    const letter = letters.find((l) => l.id === letterId);
    if (letter?.title) letterTitle = letter.title;
  } catch {
    // ignore
  }

  const isReply = !!record.parent_id;
  const subject = isReply
    ? `Réponse sur « ${letterTitle} » — Carnets d'Addis-Abeba`
    : `Nouveau message sur « ${letterTitle} » — Carnets d'Addis-Abeba`;

  const contentEscaped = record.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #333; }
    .meta { font-size: 14px; color: #666; margin-bottom: 16px; }
    .content { font-size: 16px; line-height: 1.6; margin: 20px 0; }
    .btn { display: inline-block; padding: 10px 20px; background: #9a7b4f; color: white !important; text-decoration: none; border-radius: 4px; margin-top: 16px; }
    .footer { font-size: 12px; color: #888; margin-top: 32px; }
  </style>
</head>
<body>
  <p class="meta">
    ${isReply ? 'Réponse de' : 'Message de'} <strong>${escapeHtml(record.author)}</strong>
    ${record.email ? ` (${escapeHtml(record.email)})` : ''}
    — ${new Date(record.created_at).toLocaleString('fr-FR')}
  </p>
  <p class="content">${contentEscaped}</p>
  <a href="${letterUrl}" class="btn">Voir la lettre et répondre</a>
  <p class="footer">Carnets d'Addis-Abeba — notification automatique</p>
</body>
</html>
`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || 'Carnets Addis-Abeba <onboarding@resend.dev>',
    to: process.env.CLAIRE_EMAIL,
    subject,
    html,
  });

  if (error) {
    console.error('Comment notify Resend error:', error);
    return NextResponse.json(
      { error: 'Email send failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
