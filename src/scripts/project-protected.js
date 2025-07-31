import { hashString } from '/src/scripts/hash.js';
import { loadProject } from '/src/scripts/api.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("protected-container");
    if (!container) return;

    const slug = container.dataset.slug;
    const lang = container.dataset.lang;
    const storageKey = `project_access_${slug}`;

    const form = document.getElementById("password-form");
    const content = document.getElementById("protected-content");
    const errorMsg = document.getElementById("error-message");
    const termsError = document.getElementById("terms-error");
    const termsBlock = document.getElementById("terms-block");
    const input = document.getElementById("project-password");
    const checkbox = document.getElementById("accept-terms");
    const unlockBtn = document.getElementById("unlock-btn");
    const backBtn = document.getElementById("back-btn");
    const togglePasswordBtn = document.getElementById("toggle-password");
    const loader = document.getElementById("loader");

    backBtn.addEventListener("click", () => {
        window.location.href = "/" + lang + "/#selected-projects";
    });

    function validateUnlockState() {
        const passwordFilled = input.value.trim().length > 0;
        unlockBtn.disabled = !(checkbox.checked && passwordFilled);
        if (checkbox.checked) {
            termsError.classList.add("hidden");
            termsBlock.classList.remove("border", "border-red-500");
        }
    }

    input.addEventListener("input", validateUnlockState);
    checkbox.addEventListener("change", validateUnlockState);

    togglePasswordBtn.addEventListener("click", () => {
        const type = input.type === "password" ? "text" : "password";
        input.type = type;
        togglePasswordBtn.textContent = type === "password" ? "👁" : "🙈";
    });

    function showModal() {
        const modal = document.getElementById("unlock-success-modal");
        modal.classList.remove("hidden");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 2000);
    }

    function renderSections(data) {
    const wrapper = document.createElement("div");
    wrapper.className = "animate-fade-in";

    const title = document.createElement("h2");
    title.className = "text-3xl font-semibold mb-6";
    title.textContent = data.title;
    wrapper.appendChild(title);

    if (data.subtitle) {
        const subtitle = document.createElement("p");
        subtitle.className = "text-neutral-600 mb-6";
        subtitle.textContent = data.subtitle;
        wrapper.appendChild(subtitle);
    }

    data.sections.forEach(section => {
        const sectionEl = document.createElement("section");
        sectionEl.className = `project-section ${section.layout} mb-12`;

        // Description (над/під блоком)
        if (section.description && section.layout !== "side-by-side") {
            const desc = document.createElement("p");
            desc.className = "section-description mb-4 text-lg";
            desc.textContent = section.description;
            sectionEl.appendChild(desc);
        }

        // FULL
        if (section.layout === "full") {
            section.images.forEach(imgObj => {
                const div = document.createElement("div");
                div.className = "screenshot-wrapper relative mb-6";
                const img = document.createElement("img");
                img.src = imgObj.src;
                img.alt = imgObj.alt || "";
                img.className = "rounded-lg w-full";
                div.appendChild(img);

                // Tooltip кнопка
                if (imgObj.tooltip) {
                    const btn = document.createElement("button");
                    btn.className = "info-icon absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full";
                    btn.dataset.tooltip = imgObj.tooltip;
                    btn.textContent = "i";
                    div.appendChild(btn);
                }
                sectionEl.appendChild(div);
            });
        }

        // SIDE-BY-SIDE
        if (section.layout === "side-by-side") {
            const grid = document.createElement("div");
            grid.className = "side-by-side-grid grid md:grid-cols-2 gap-6";

            section.images.forEach(imgObj => {
                const imgDiv = document.createElement("div");
                imgDiv.className = "screenshot-wrapper relative";
                const img = document.createElement("img");
                img.src = imgObj.src;
                img.alt = imgObj.alt || "";
                img.className = "rounded-lg w-full";
                imgDiv.appendChild(img);

                // Tooltip кнопка
                if (imgObj.tooltip) {
                    const btn = document.createElement("button");
                    btn.className = "info-icon absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full";
                    btn.dataset.tooltip = imgObj.tooltip;
                    btn.textContent = "i";
                    imgDiv.appendChild(btn);
                }

                grid.appendChild(imgDiv);
            });

            if (section.description) {
                const desc = document.createElement("p");
                desc.className = "screenshot-description text-base self-center";
                desc.textContent = section.description;
                grid.appendChild(desc);
            }

            sectionEl.appendChild(grid);
        }

        // GALLERY
        if (section.layout === "gallery") {
            const gallery = document.createElement("div");
            gallery.className = "screenshot-gallery grid gap-4 md:grid-cols-3";

            section.images.forEach((imgObj, index) => {
                const imgDiv = document.createElement("div");
                imgDiv.className = `screenshot-wrapper relative ${index === 0 ? "md:col-span-3" : ""}`;
                const img = document.createElement("img");
                img.src = imgObj.src;
                img.alt = imgObj.alt || "";
                img.className = "rounded-lg w-full";
                imgDiv.appendChild(img);

                // Tooltip кнопка
                if (imgObj.tooltip) {
                    const btn = document.createElement("button");
                    btn.className = "info-icon absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full";
                    btn.dataset.tooltip = imgObj.tooltip;
                    btn.textContent = "i";
                    imgDiv.appendChild(btn);
                }

                gallery.appendChild(imgDiv);
            });

            sectionEl.appendChild(gallery);

            if (section.description) {
                const desc = document.createElement("p");
                desc.className = "gallery-description text-base mt-3";
                desc.textContent = section.description;
                sectionEl.appendChild(desc);
            }
        }

        wrapper.appendChild(sectionEl);
    });

    // Ініціалізуємо тултіпи (той же tooltip.js)
    setTimeout(() => {
        if (typeof initTooltips === "function") initTooltips();
    }, 50);

    return wrapper;
}



    async function unlock() {
        try {
            loader.classList.remove("hidden");
            const entered = input.value.trim();
            const enteredHash = await hashString(entered);
            const projectData = await loadProject(slug, enteredHash);
            const rendered = renderSections(projectData);
            content.innerHTML = "";
            content.appendChild(rendered);
            form.classList.add("hidden");
            loader.classList.add("hidden");
            content.classList.remove("hidden");
            showModal();

            // 🔹 Зберігаємо доступ (і хеш)
            sessionStorage.setItem(storageKey, enteredHash);
        } catch {
            loader.classList.add("hidden");
            errorMsg?.classList.remove("hidden");
        }
    }

    // 🔹 Якщо доступ уже є — підтягуємо контент із хешем
    (async () => {
        const savedHash = sessionStorage.getItem(storageKey);
        if (savedHash) {
            try {
                loader.classList.remove("hidden");
                const projectData = await loadProject(slug, savedHash);
                const rendered = renderSections(projectData);
                content.innerHTML = "";
                content.appendChild(rendered);
                form.classList.add("hidden");
                loader.classList.add("hidden");
                content.classList.remove("hidden");
            } catch (err) {
                sessionStorage.removeItem(storageKey); // якщо хеш невалідний, очищуємо
            }
        }
    })();

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!checkbox.checked) {
            termsError.classList.remove("hidden");
            termsBlock.classList.add("border", "border-red-500");
            return;
        }
        await unlock();
    });
});