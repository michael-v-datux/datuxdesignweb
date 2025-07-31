export async function loadProject(slug, key) {
    const url = `/api/projects/${slug}?key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status === 401 ? "Unauthorized" : "Error");
    return await res.json();
}
