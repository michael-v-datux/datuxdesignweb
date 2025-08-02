import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export const prerender = false;

export async function POST({ params, request }) {
    const { slug } = params;
    const { key } = await request.json(); // тепер чекаємо JSON { key: "пароль" }

    const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !project) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    if (project.is_protected) {
        console.log("DEBUG PASSWORD CHECK:", { key, hashInDB: project.password_hash }); // 👈 додали
        const match = await bcrypt.compare(key, project.password_hash);
        if (!match) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
    }

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