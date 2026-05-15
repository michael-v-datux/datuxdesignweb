import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getServerSupabase } from '@/lib/supabaseServer';

const supabase = getServerSupabase();

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug, password } = await request.json();

    // Отримуємо проект із Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .select('password_hash')
      .eq('slug', slug)
      .single();

    if (error || !project || !project.password_hash) {
      return new Response(JSON.stringify({ success: false }), { status: 400 });
    }

    // Перевіряємо пароль
    const isMatch = await bcrypt.compare(password, project.password_hash);

    if (!isMatch) {
      return new Response(JSON.stringify({ success: false }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export const GET: APIRoute = async () => {
  return new Response('Method not allowed', { status: 405 });
};