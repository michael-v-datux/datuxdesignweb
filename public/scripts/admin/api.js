/** Admin fetch with session cookie + 401 redirect. */
export async function adminFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'same-origin',
  });

  if (res.status === 401) {
    window.location.href = '/admin';
    throw new Error('Unauthorized');
  }

  return res;
}
