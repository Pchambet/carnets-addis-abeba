import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  const { count, error } = await createClient(url, key)
    .from('comments')
    .select('id', { count: 'exact', head: true });
  if (error) {
    console.error('Keep-alive Supabase error:', error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true, comments: count });
}
