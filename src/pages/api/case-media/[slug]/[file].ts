import type { APIRoute } from 'astro';
import { getServerSupabase } from '@/lib/supabaseServer';
import { projectPasswordHash, requestProjectToken, verifyProjectToken } from '@/lib/projects/access';
import { isAdminAuthenticated } from '@/lib/adminSession';

export const prerender = false;
export const GET: APIRoute = async ({ params, request }) => {
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, noarchive', 'X-Content-Type-Options': 'nosniff', Vary: 'Cookie' };
  const deny = (status = 401) => new Response('Private case material', { status, headers });
  if (!params.slug || !params.file || !/^[a-z0-9][a-z0-9-]*\.(webp|png|gif|mp4)$/.test(params.file)) return deny(404);
  const supabase = getServerSupabase();
  const { data: project } = await supabase.from('projects').select('id,slug,is_published,is_protected,password_hash').eq('slug', params.slug).maybeSingle();
  if (!project || !project.is_protected) return deny(404);
  const admin = isAdminAuthenticated(request);
  if (!project.is_published && !admin) return deny(404);
  const hash = await projectPasswordHash(project);
  if (!admin && !verifyProjectToken(requestProjectToken(request, project.slug), project.slug, hash)) return deny();
  const { data, error } = await supabase.storage.from('private-cases').download(`${project.id}/${params.file}`);
  if (error || !data) return deny(404);
  return new Response(data, { headers: { ...headers, 'Content-Type': data.type || 'application/octet-stream', 'Content-Disposition': 'inline' } });
};
