import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('memory')
    .select('content, updated_at')
    .eq('id', 1)
    .single();

  if (error) return NextResponse.json({ content: '' });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const { content } = await req.json();
  const { data, error } = await supabase
    .from('memory')
    .upsert({ id: 1, content, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
