// src/pages/api/load-projects.ts
import { supabase } from '@/lib/supabaseClient';

export async function GET({ request }) {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const limit = parseInt(url.searchParams.get('limit') || '3', 10);

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const projects = data.map(p => ({
        slug: p.slug,
        title: p.title_en,
        category: p.category_en,
        lang: 'en' // якщо треба зробимо динамічно для укр
    }));

    return new Response(JSON.stringify(projects), { status: 200 });
}
