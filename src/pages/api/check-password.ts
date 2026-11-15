import type { APIRoute } from 'astro';
import { matchesProjectPassword, projectPasswordHash, issueProjectToken, projectCookieName, projectCookieOptions } from '@/lib/projects/access';
import { getServerSupabase } from '@/lib/supabaseServer';

const supabase = getServerSupabase();

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { slug, password } = await request.json();

    // Отримуємо проект із Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .select('id,slug,password_hash,is_protected')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !project || !project.is_protected) {
      return new Response(JSON.stringify({ success: false }), { status: 400 });
    }

    // Перевіряємо пароль
    const hash = await projectPasswordHash(project);
    const isMatch = await matchesProjectPassword(password, hash);

    if (!isMatch) {
      return new Response(JSON.stringify({ success: false }), { status: 401 });
    }

    cookies.set(projectCookieName(slug), issueProjectToken(slug, hash), projectCookieOptions);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Cache-Control': 'private, no-store' } });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}

export const GET: APIRoute = async () => {
  return new Response('Method not allowed', { status: 405 });
};