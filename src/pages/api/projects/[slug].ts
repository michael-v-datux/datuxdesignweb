import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export const prerender = false;

export async function POST({ params, request }) {
    const { slug } = params;
    const { key } = await request.json();

    const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !project) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    if (project.is_protected) {
        const match = await bcrypt.compare(key, project.password_hash);
        console.log("DEBUG PASSWORD CHECK:", { key, hashInDB: project.password_hash });
        console.log("DEBUG PASSWORD MATCH:", match);
        if (!match) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
    }

    const { data: blocks } = await supabase
        .from("project_blocks")
        .select("*")
        .eq("project_id", project.id)
        .order("order", { ascending: true });

    // ✅ Готуємо sections із content_en (JSON у полі)
    let sections = [];
    try {
        sections = project.content_en ? JSON.parse(project.content_en).sections || [] : [];
    } catch (e) {
        console.error("Error parsing content_en:", e);
    }

    return new Response(JSON.stringify({
        title: project.title_en,
        subtitle: project.description_en,
        sections,        // 👈 Додаємо для рендера фронтом
        blocks: blocks || []
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}