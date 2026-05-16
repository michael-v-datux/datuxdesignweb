import { showToast } from "/scripts/common/toast.js";
import { adminFetch } from "/scripts/admin/api.js";

const projectsContainer = document.getElementById("projects");

function statusPill(status) {
  const s = (status || "draft").toLowerCase();
  const cls =
    s === "published" ? "admin-pill admin-pill--published" : "admin-pill admin-pill--draft";
  return `<span class="${cls}">${s}</span>`;
}

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
      projectsContainer.innerHTML = `
        <div class="admin-empty">
          <p class="admin-empty__title">No projects yet</p>
          <p class="admin-empty__text">
            Create your first case study to show it on the public site.
          </p>
          <a href="/admin/projects/new" class="admin-btn admin-btn--primary">
            Create project
          </a>
        </div>
      `;
      return;
    }

    data.forEach((proj) => {
      const row = document.createElement("article");
      row.className = "admin-project-row";

      const title =
        proj.title_en || proj.title_uk || `Project #${proj.id || "?"}`;
      const slug = proj.slug ? `/${proj.slug}` : "";

      row.innerHTML = `
        <div class="admin-project-row__main">
          <h3 class="admin-project-row__title">${escapeHtml(title)}</h3>
          <div class="admin-project-row__meta">
            ${statusPill(proj.status)}
            ${slug ? `<span>${escapeHtml(slug)}</span>` : ""}
            ${
              proj.is_protected
                ? '<span class="admin-badge">Protected</span>'
                : ""
            }
          </div>
        </div>
        <div class="admin-project-row__actions">
          <a href="/admin/projects/${proj.id}/edit" class="admin-btn admin-btn--ghost admin-btn--sm">
            Edit
          </a>
          <button type="button" class="admin-btn admin-btn--danger admin-btn--sm delete-btn">
            Delete
          </button>
        </div>
      `;

      row.querySelector(".delete-btn")?.addEventListener("click", async () => {
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

      projectsContainer.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    showToast("Failed to load projects", "error");
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

loadProjects();
