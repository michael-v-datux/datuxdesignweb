import { loadProject } from '/scripts/api.js';
import { showToast } from '/scripts/toast.js';

import { translations } from '/scripts/translations.js'; // зробимо один збірник
const lang = container.dataset.lang || 'en';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("protected-container");
    if (!container) return;

    const slug = container.dataset.slug;
    const lang = container.dataset.lang;
    const storageKey = `project_access_${slug}`;
    const ATTEMPTS_KEY = `project_attempts_${slug}`;
    const LOCK_KEY = `project_lock_${slug}`;
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 5 * 60 * 1000; // 5 хв

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

    let lockInterval;

    // ======= Блокування пароля =======
    function isLocked() {
        const lockUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
        return Date.now() < lockUntil;
    }
    function getLockTimeLeft() {
        const lockUntil = parseInt(localStorage.getItem(LOCK_KEY) || "0", 10);
        return Math.max(0, lockUntil - Date.now());
    }
    function registerAttempt() {
        let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10) + 1;
        localStorage.setItem(ATTEMPTS_KEY, attempts);
        if (attempts >= MAX_ATTEMPTS) {
            localStorage.setItem(LOCK_KEY, Date.now() + LOCK_TIME);
        }
    }
    function resetAttempts() {
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCK_KEY);
    }
    function startLockCountdown() {
        clearInterval(lockInterval);
        const update = () => {
            const timeLeft = getLockTimeLeft();
            if (timeLeft <= 0) {
                clearInterval(lockInterval);
                errorMsg.textContent = translations[lang].messages.retryNow;
                resetAttempts();
                return;
            }
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            errorMsg.textContent = translations[lang].messages.tooManyAttempts.replace('{time}', `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
        };
        update();
        lockInterval = setInterval(update, 1000);
    }

    // ======= UI =======
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
        setTimeout(() => modal.classList.add("hidden"), 2000);
    }

    // ======= Рендеринг секцій =======
    function createImage(imgObj) {
        const imgDiv = document.createElement("div");
        imgDiv.className = "screenshot-wrapper relative";
        const img = document.createElement("img");
        img.src = imgObj.src;
        img.alt = imgObj.alt || "";
        img.className = "rounded-lg w-full";
        imgDiv.appendChild(img);
        if (imgObj.tooltip) {
            const btn = document.createElement("button");
            btn.className = "info-icon absolute bottom-3 right-3 bg-black/60 text-white p-2 rounded-full";
            btn.dataset.tooltip = imgObj.tooltip;
            btn.textContent = "i";
            imgDiv.appendChild(btn);
        }
        return imgDiv;
    }
    function renderFullSection(section) {
        const sectionEl = document.createElement("section");
        sectionEl.className = "project-section full mb-12";
        section.images.forEach(imgObj => sectionEl.appendChild(createImage(imgObj)));
        return sectionEl;
    }
    function renderSideBySideSection(section) {
        const sectionEl = document.createElement("section");
        sectionEl.className = "project-section side-by-side mb-12";
        const grid = document.createElement("div");
        grid.className = "side-by-side-grid grid md:grid-cols-2 gap-6";
        section.images.forEach(imgObj => grid.appendChild(createImage(imgObj)));
        if (section.description) {
            const desc = document.createElement("p");
            desc.className = "screenshot-description text-base self-center";
            desc.textContent = section.description;
            grid.appendChild(desc);
        }
        sectionEl.appendChild(grid);
        return sectionEl;
    }
    function renderGallerySection(section) {
        const sectionEl = document.createElement("section");
        sectionEl.className = "project-section gallery mb-12";
        const gallery = document.createElement("div");
        gallery.className = "screenshot-gallery grid gap-4 md:grid-cols-3";
        section.images.forEach((imgObj, index) => {
            const imgDiv = createImage(imgObj);
            if (index === 0) imgDiv.classList.add("md:col-span-3");
            gallery.appendChild(imgDiv);
        });
        sectionEl.appendChild(gallery);
        if (section.description) {
            const desc = document.createElement("p");
            desc.className = "gallery-description text-base mt-3";
            desc.textContent = section.description;
            sectionEl.appendChild(desc);
        }
        return sectionEl;
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
            if (section.layout === "full") wrapper.appendChild(renderFullSection(section));
            if (section.layout === "side-by-side") wrapper.appendChild(renderSideBySideSection(section));
            if (section.layout === "gallery") wrapper.appendChild(renderGallerySection(section));
        });
        setTimeout(() => { if (typeof initTooltips === "function") initTooltips(); }, 50);
        return wrapper;
    }

    // ======= Основна логіка =======
    async function unlock() {
        if (isLocked()) {
            errorMsg?.classList.remove("hidden");
            startLockCountdown();
            return;
        }
        try {
            loader.classList.remove("hidden");
            const entered = input.value.trim();
            const projectData = await loadProject(slug, entered);
            const rendered = renderSections(projectData);
            content.innerHTML = "";
            content.appendChild(rendered);
            form.classList.add("hidden");
            loader.classList.add("hidden");
            content.classList.remove("hidden");
            showModal();
            sessionStorage.setItem(storageKey, "unlocked");
            resetAttempts();
            errorMsg?.classList.add("hidden");
        } catch {
            loader.classList.add("hidden");
            errorMsg?.classList.remove("hidden");
            errorMsg.textContent = translations[lang].messages.wrongPassword;
            showToast(translations[lang].messages.wrongPassword, "error");
            registerAttempt();
            if (isLocked()) startLockCountdown();
        }
    }

    (async () => {
        const unlocked = sessionStorage.getItem(storageKey) === "unlocked";
        if (unlocked) {
            try {
                loader.classList.remove("hidden");
                const projectData = await loadProject(slug, "");
                const rendered = renderSections(projectData);
                content.innerHTML = "";
                content.appendChild(rendered);
                form.classList.add("hidden");
                loader.classList.add("hidden");
                content.classList.remove("hidden");
            } catch {
                sessionStorage.removeItem(storageKey);
            }
        }
        if (isLocked()) {
            errorMsg?.classList.remove("hidden");
            startLockCountdown();
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
