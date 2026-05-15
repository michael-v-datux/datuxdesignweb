// src/scripts/api.js
export async function loadProject(slug, password) {
    const res = await fetch(`/api/projects/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: password })
    });
    if (!res.ok) throw new Error('Unauthorized');
    return await res.json();
}