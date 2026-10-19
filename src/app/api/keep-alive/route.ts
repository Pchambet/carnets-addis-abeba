import { NextResponse } from 'next/server';

/**
 * Appelé chaque jour par le cron Vercel (vercel.json) : une lecture légère
 * suffit à empêcher la mise en pause du projet Supabase gratuit pour inactivité.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  const res = await fetch(`${url}/rest/v1/comments?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('Keep-alive Supabase error:', res.status, await res.text());
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
