import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    env: {
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      MISTRAL_API_KEY: !!process.env.MISTRAL_API_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      APP_PASSWORD: !!process.env.APP_PASSWORD,
    },
  });
}
