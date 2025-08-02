// src/pages/api/projects/[slug].ts
import { supabase } from '@/lib/supabaseClient';

export const prerender = false;

export async function GET({ params, request }) {
    const { slug } = params;
    const url = new URL(request.url);
    const key = url.searchParams.get("key"); // пароль (hash)

    const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !project) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    if (project.is_protected && key !== project.password_hash) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Отримуємо блоки
    const { data: blocks } = await supabase
        .from("project_blocks")
        .select("*")
        .eq("project_id", project.id)
        .order("order", { ascending: true });

    return new Response(JSON.stringify({
        title: project.title_en,
        subtitle: project.description_en,
        blocks: blocks || []
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}