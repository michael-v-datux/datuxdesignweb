import { initContactFormValidation } from "../features/contact-validation.js?v=20261123-contact3";

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

    const labelErrorFailed =
      form.dataset.errorFailed || 'Failed to send the form. Please try again.';
    const labelErrorNetwork =
      form.dataset.errorNetwork || 'Network error. Please check your connection and try again.';

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
        message || labelErrorFailed;
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
        else showError(labelErrorFailed);
      } catch {
        showError(labelErrorNetwork);
      }
    });
  }

  const toggleBtn = document.querySelector("#email-toggle button");
  const tooltip = document.getElementById("email-tooltip");
  const copyBtn = document.getElementById("copy-email");
  const icon = document.getElementById("email-icon");

  if (toggleBtn && tooltip && icon) {
    const feedback = document.getElementById("copy-tooltip");
    let feedbackTimer;
    const closeTooltip = () => {
      tooltip.classList.remove("visible");
      icon.classList.remove("opened");
      tooltip.inert = true;
      toggleBtn.setAttribute("aria-expanded", "false");
    };

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = tooltip.classList.contains("visible");
      if (isOpen) closeTooltip();
      else {
        clearTimeout(feedbackTimer);
        if (feedback) feedback.hidden = true;
        tooltip.inert = false;
        tooltip.classList.add("visible");
        icon.classList.add("opened");
        toggleBtn.setAttribute("aria-expanded", "true");
      }
    });

    tooltip.addEventListener("click", (e) => {
      e.stopPropagation();
      if (e.target.closest("a,button")) closeTooltip();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && tooltip.classList.contains("visible")) {
        closeTooltip();
        toggleBtn.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (!tooltip.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeTooltip();
      }
    });

    const showNotification = (message) => {
      if (!feedback) return;
      clearTimeout(feedbackTimer);
      feedback.textContent = message;
      feedback.hidden = false;
      feedback.classList.toggle("email-copy-feedback--above",
        toggleBtn.parentElement.getBoundingClientRect().bottom + feedback.offsetHeight + 20 > window.innerHeight);
      feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 2800);
    };

    if (copyBtn) {
      copyBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        closeTooltip();
        toggleBtn.focus();
        try {
          await navigator.clipboard.writeText("michael.v@datux.design");
          showNotification(form?.dataset.emailCopied || "Email address copied");
        } catch {
          showNotification(form?.dataset.emailCopyFailed || "Could not copy the address.");
        }
      });
    }
  }
});
