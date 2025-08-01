import fs from "fs";
import path from "path";

export async function GET({ params, request }) {
    const { slug } = params;
    const url = new URL(request.url, "http://localhost:4321");
    const key = url.searchParams.get("key");

    const projectPath = path.resolve("src/data/projects", `${slug}.json`);
    if (!fs.existsSync(projectPath)) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const project = JSON.parse(fs.readFileSync(projectPath, "utf-8"));
    const sanitizedKey = key?.trim().toLowerCase();
    const sanitizedHash = project.passwordHash.trim().toLowerCase();

    if (project.protected && sanitizedKey !== sanitizedHash) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    return new Response(JSON.stringify(project), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}