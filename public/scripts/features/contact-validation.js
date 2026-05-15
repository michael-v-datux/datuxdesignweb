document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const btn = document.getElementById("submit-btn");
    const honeypot = document.getElementById("website"); // honeypot

    if (!form || !btn) return;

    const fields = {
        name: {
            input: document.getElementById("name"),
            error: document.getElementById("name-error"),
            validate: val => val.trim().length >= 1,
        },
        email: {
            input: document.getElementById("email"),
            error: document.getElementById("email-error"),
            validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        },
        vacancy: {
            input: document.getElementById("vacancy"),
            error: document.getElementById("vacancy-error"),
            validate: val => {
                const cleaned = val.trim().replace(/^https?:\/\//i, '');
                const allowed = /^[a-z0-9\-._~:/?#\[\]@!$&'()*+,;=]+$/i.test(cleaned);
                let isURL = false;
                try {
                    const url = new URL("https://" + cleaned);
                    isURL = !!url.hostname && url.hostname.includes(".");
                } catch (e) {
                    isURL = false;
                }
                return allowed && isURL;
            },
        },
        message: {
            input: document.getElementById("message"),
            error: document.getElementById("message-error"),
            validate: val => val.trim().length >= 6,
        },
    };

    let touched = new Set();

    const validateAll = () => {
        let isValid = true;

        Object.values(fields).forEach(({ input, error, validate }) => {
            if (!input) return;
            const value = input.value;
            const valid = validate(value);

            if (touched.has(input) && error) {
                error.classList.toggle("hidden", valid);
            }

            if (!valid) isValid = false;
        });

        btn.disabled = !isValid;
        btn.classList.toggle("opacity-50", !isValid);
        btn.classList.toggle("cursor-not-allowed", !isValid);
    };

    Object.entries(fields).forEach(([key, { input }]) => {
        if (!input) return;

        input.addEventListener("input", () => {
            setTimeout(validateAll, 300);
        });

        input.addEventListener("blur", () => {
            touched.add(input);
            if (key === "vacancy") {
                input.value = input.value.trim().replace(/^https?:\/\//i, '');
            }
            validateAll();
        });
    });

    // Modal logic
    const modal = document.getElementById("success-modal");
    const confirmBtn = document.getElementById("confirm-btn");

    const showModal = () => {
        if (!modal || !confirmBtn) return;

        modal.classList.remove("hidden", "modal-exit");
        modal.classList.add("flex", "modal-enter");

        const timer = setTimeout(() => startFadeOut(), 4000);

        confirmBtn.onclick = () => {
            clearTimeout(timer);
            startFadeOut();
        };
    };

    const startFadeOut = () => {
        modal.classList.remove("modal-enter");
        modal.classList.add("modal-exit");
        setTimeout(() => hideModal(), 400);
    };

    const hideModal = () => {
        modal.classList.remove("flex", "modal-exit");
        modal.classList.add("hidden");
        form.reset();
        touched.clear();
        validateAll();
    };

    form.addEventListener("submit", (e) => {
        // === Honeypot check ===
        if (honeypot && honeypot.value.trim() !== "") {
            e.preventDefault();
            console.warn("Spam blocked: honeypot filled");
            return;
        }

        e.preventDefault();
        showModal();
    });

    validateAll();
});