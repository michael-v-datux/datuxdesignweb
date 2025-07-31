document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("protected-container");
    if (!container) return;

    const slug = container.dataset.slug;
    if (!slug) return;

    const PASSWORD_KEY = `project-access-${slug}`;
    const stored = sessionStorage.getItem(PASSWORD_KEY);

    const form = document.getElementById("password-form");
    const content = document.getElementById("protected-content");
    const errorMsg = document.getElementById("error-message");
    const input = document.getElementById("project-password");
    const successModal = document.getElementById("unlock-success-modal");
    const loader = document.getElementById("loader");

    function animateUnlock() {
        content?.classList.remove("hidden");
        content?.classList.add("fade-in");
        form?.classList.add("hidden");
        errorMsg?.classList.add("hidden");
        showToast("Access granted", "success");
    }

    function unlock() {
        sessionStorage.setItem(PASSWORD_KEY, "unlocked");
        animateUnlock();
    }

    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white ${
            type === "success" ? "bg-green-500" : "bg-red-500"
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    async function checkPassword(password) {
        const res = await fetch("/api/check-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, password })
        });
        return res.ok;
    }

    if (stored === "unlocked") {
        animateUnlock();
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const entered = input?.value;
        if (!entered) return;

        loader?.classList.remove("hidden");
        const isValid = await checkPassword(entered);
        loader?.classList.add("hidden");

        if (isValid) {
            unlock();
        } else {
            errorMsg?.classList.remove("hidden");
            showToast("Wrong password", "error");
        }
    });
});