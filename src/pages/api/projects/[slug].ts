export const prerender = false;

import fs from "fs";
import path from "path";

export async function GET({ params }) {
    const { slug } = params;
    const projectPath = path.resolve("src/data/projects", `${slug}.json`);

    if (!fs.existsSync(projectPath)) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const project = JSON.parse(fs.readFileSync(projectPath, "utf-8"));

    return new Response(JSON.stringify(project), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}