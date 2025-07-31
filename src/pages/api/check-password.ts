import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY // використовуємо service_role (тільки на сервері!)
);

export async function post({ request }) {
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