import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { escapeHtml } from '@/lib/html';
import { SITE_URL } from '@/lib/site';

// Même règle que la table (supabase/migrations/004_harden_comments.sql)
const LETTER_ID = /^semaine-\d{2}(-\d{2})?$/;

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
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!webhookSecret || !token || !sameSecret(token, webhookSecret)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
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
    !payload?.record ||
    !LETTER_ID.test(String(payload.record.letter_id))
  ) {
    return NextResponse.json(
      { error: 'Invalid webhook payload' },
      { status: 400 }
    );
  }

  const { record } = payload;
  const letterId = record.letter_id;
  const letterUrl = `${SITE_URL}/letters/${letterId}/`;
  const letterTitle = getLetterTitle(letterId);

  const isReply = !!record.parent_id;
  const subject = isReply
    ? `Réponse sur « ${letterTitle} » — Carnets d'Addis-Abeba`
    : `Nouveau message sur « ${letterTitle} » — Carnets d'Addis-Abeba`;

  const contentEscaped = escapeHtml(record.content).replace(/\n/g, '<br>');

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
    — ${new Date(record.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
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

/** Title from the letter's frontmatter, falling back to its id. */
function getLetterTitle(letterId: string): string {
  const file = path.join(process.cwd(), 'content', 'letters', `${letterId}.md`);
  if (!fs.existsSync(file)) return letterId;
  const { title } = matter(fs.readFileSync(file, 'utf8')).data as { title?: string };
  return title || letterId;
}

/** Comparaison en temps constant : la durée ne révèle rien du secret. */
function sameSecret(a: string, b: string): boolean {
  const digest = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}
