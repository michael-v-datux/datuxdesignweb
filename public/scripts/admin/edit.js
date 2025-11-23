import { showToast } from "/scripts/common/toast.js";

const form = document.getElementById("project-form");
const blocksContainer = document.getElementById("blocks");
const addBlockBtn = document.getElementById("add-block");

function getProjectIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  // /admin/projects/:id/edit
  const idIndex = parts.indexOf("projects") + 1;
  return parts[idIndex];
}

const projectId = getProjectIdFromPath();

async function loadProject() {
  try {
    const res = await fetch(`/api/admin-project?id=${projectId}`);
    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      showToast("Failed to load project", "error");
      return;
    }

    // Заповнюємо форму
    document.getElementById("title_en").value = data.title_en || "";
    document.getElementById("title_uk").value = data.title_uk || "";
    document.getElementById("description_en").value = data.description_en || "";
    document.getElementById("description_uk").value = data.description_uk || "";
    document.getElementById("thumbnail_url").value = data.thumbnail_url || "";
    document.getElementById("is_protected").checked = !!data.is_protected;
    document.getElementById("password").value = data.password_hash || "";
    document.getElementById("status").value = data.status || "draft";
  } catch (err) {
    console.error(err);
    showToast("Failed to load project", "error");
  }
}

// Поки що блоки залишаємо порожніми або підключимо пізніше через окремий API
if (blocksContainer) {
  const info = document.createElement("p");
  info.className = "text-xs text-slate-400";
  info.textContent =
    "Block manager will be implemented here (drag & drop, block types, etc.).";
  blocksContainer.appendChild(info);
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {
      id: projectId,
      title_en: formData.get("title_en") || null,
      title_uk: formData.get("title_uk") || null,
      description_en: formData.get("description_en") || null,
      description_uk: formData.get("description_uk") || null,
      thumbnail: formData.get("thumbnail_url") || null,
      is_protected: formData.get("is_protected") === "on",
      password: formData.get("password") || null,
      status: formData.get("status") || "draft",
    };

    try {
      const res = await fetch("/api/admin-project", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        showToast("Failed to update project", "error");
        return;
      }

      showToast("Project updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update project", "error");
    }
  });
}

if (projectId) {
  loadProject();
}

if (addBlockBtn) {
  addBlockBtn.addEventListener("click", () => {
    showToast("Block manager is not implemented yet", "info");
  });
}
