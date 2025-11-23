import { showToast } from "/scripts/common/toast.js";

const form = document.getElementById("new-project-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {
      title_en: formData.get("title_en") || null,
      title_uk: formData.get("title_uk") || null,
      description_en: formData.get("description_en") || null,
      description_uk: formData.get("description_uk") || null,

      // ВАЖЛИВО: назва поля як у БД
      thumbnail_url: formData.get("thumbnail_url") || null,

      is_protected: formData.get("is_protected") === "on",
      password: formData.get("password") || null,
      status: formData.get("status") || "draft",
    };

    try {
      const res = await fetch("/api/admin-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        showToast("Failed to create project", "error");
        return;
      }

      showToast("Project created", "success");

      // Якщо API повертає id — йдемо одразу на редагування
      if (data && data.id) {
        window.location.href = `/admin/projects/${data.id}/edit`;
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to create project", "error");
    }
  });
}
