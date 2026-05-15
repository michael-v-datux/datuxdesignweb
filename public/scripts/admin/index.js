import { supabase } from '/src/lib/supabaseClient.js';
import { showToast } from '/js/common/toast.js';

const form = document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.email.value;
  const password = form.password.value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast('Login failed', 'error');
  } else {
    window.location.href = '/admin/dashboard';
  }
});
