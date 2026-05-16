import { showToast } from "/scripts/common/toast.js";
import { adminFetch } from "/scripts/admin/api.js";

const projectsContainer = document.getElementById("projects");

async function loadProjects() {
  try {
    const res = await adminFetch("/api/admin-projects");
    if (!res.ok) {
      showToast("Failed to load projects", "error");
      return;
    }

    const data = await res.json();
    projectsContainer.innerHTML = "";

    if (!data.length) {
      const empty = document.createElement("p");
      empty.className = "text-sm text-slate-400";
      empty.textContent = "No projects yet. Create your first one!";
      projectsContainer.appendChild(empty);
      return;
    }

    data.forEach((proj) => {
      const div = document.createElement("div");
      div.className =
        "flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3";

      const title =
        proj.title_en || proj.title_uk || `Project #${proj.id || "?"}`;
      const status = proj.status || "draft";

      div.innerHTML = `
        <div>
          <h3 class="font-medium text-slate-100">${title}</h3>
          <p class="text-xs text-slate-400">
            Status: <span class="uppercase">${status}</span>
            ${
              proj.is_protected
                ? ' • <span class="text-amber-400">Protected</span>'
                : ""
            }
          </p>
        </div>
        <div class="flex gap-2">
          <a
            href="/admin/projects/${proj.id}/edit"
            class="rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-700"
          >
            Edit
          </a>
          <button
            class="delete-btn rounded-md bg-red-500/90 px-3 py-1.5 text-xs text-white hover:bg-red-500"
            type="button"
          >
            Delete
          </button>
        </div>
      `;

      const deleteBtn = div.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Delete this project?")) return;

        const resp = await adminFetch("/api/admin-projects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: proj.id }),
        });

        if (!resp.ok) {
          showToast("Failed to delete project", "error");
          return;
        }

        showToast("Project deleted", "success");
        loadProjects();
      });

      projectsContainer.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    showToast("Failed to load projects", "error");
  }
}

loadProjects();