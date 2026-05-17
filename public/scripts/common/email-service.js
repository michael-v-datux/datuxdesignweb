import { initContactFormValidation } from "../features/contact-validation.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const btn = document.getElementById("submit-btn");
  const honeypot = document.getElementById("website");

  const validation = initContactFormValidation(form, btn, honeypot);

  if (validation) {
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
      validation.resetValidationState();
    };

    const errorBox = document.createElement("div");
    errorBox.id = "form-error";
    errorBox.className =
      "hidden opacity-0 flex items-center gap-2 mt-4 p-3 rounded-lg transition-opacity duration-300 ease-in-out bg-red-50 border border-red-200 shadow-md";
    errorBox.innerHTML = `
            <svg class="w-5 h-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"/>
            </svg>
            <span class="text-sm text-red-700">Something went wrong. Please try again later.</span>
        `;
    form.appendChild(errorBox);

    const showError = (message) => {
      errorBox.querySelector("span").textContent =
        message || "Something went wrong. Please try again later.";
      errorBox.classList.remove("hidden", "opacity-0");
      errorBox.classList.add("opacity-100");
    };

    const hideError = () => {
      errorBox.classList.add("opacity-0");
      setTimeout(() => errorBox.classList.add("hidden"), 300);
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideError();

      if (validation.isHoneypotFilled()) {
        console.warn("Spam blocked: honeypot filled");
        return;
      }

      validation.markSubmitAttempt();
      if (!validation.validateAll()) {
        return;
      }

      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
        if (response.ok) showModal();
        else showError("Failed to send the form. Please try again.");
      } catch {
        showError("Network error. Please check your connection and try again.");
      }
    });
  }

  const toggleBtn = document.querySelector("#email-toggle button");
  const tooltip = document.getElementById("email-tooltip");
  const copyBtn = document.getElementById("copy-email");
  const icon = document.getElementById("email-icon");

  if (toggleBtn && tooltip && icon) {
    const closeTooltip = () => {
      tooltip.classList.remove("visible");
      icon.classList.remove("opened");
    };

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = tooltip.classList.contains("visible");
      isOpen ? closeTooltip() : (tooltip.classList.add("visible"), icon.classList.add("opened"));
    });

    tooltip.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", (e) => {
      if (!tooltip.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeTooltip();
      }
    });

    const showNotification = (message) => {
      const notif = document.createElement("div");
      notif.textContent = message;
      Object.assign(notif.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#dcfce7",
        color: "#166534",
        padding: "10px 16px",
        border: "1px solid #bbf7d0",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        zIndex: "9999",
        opacity: "0",
        transition: "opacity 0.3s ease",
      });
      document.body.appendChild(notif);
      setTimeout(() => {
        notif.style.opacity = "1";
      }, 10);
      setTimeout(() => {
        notif.style.opacity = "0";
        setTimeout(() => notif.remove(), 300);
      }, 1500);
    };

    if (copyBtn) {
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText("michael.v@datux.design");
        showNotification("Email copied!");
        closeTooltip();
      });
    }
  }
});
