/**
 * Shared contact-form validation helpers.
 * Used by email-service.js (Formspree submit + email tooltip).
 */
export function initContactFormValidation(form, btn, honeypot) {
  if (!form || !btn) return null;

  const fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("name-error"),
      validate: (val) => val.trim().length >= 1,
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("email-error"),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    },
    vacancy: {
      input: document.getElementById("vacancy"),
      error: document.getElementById("vacancy-error"),
      validate: (val) => {
        const cleaned = val.trim().replace(/^https?:\/\//i, "");
        const allowed = /^[a-z0-9\-._~:/?#\[\]@!$&'()*+,;=]+$/i.test(cleaned);
        let isURL = false;
        try {
          const url = new URL("https://" + cleaned);
          isURL = !!url.hostname && url.hostname.includes(".");
        } catch {
          isURL = false;
        }
        return allowed && isURL;
      },
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("message-error"),
      validate: (val) => val.trim().length >= 6,
    },
  };

  const dirty = new Set();
  let submitAttempted = false;
  let inputTimer;

  const validateAll = () => {
    let isValid = true;

    Object.entries(fields).forEach(([key, { input, error, validate }]) => {
      if (!input) return;
      const value = input.value;
      const valid = validate(value);
      const showError = (dirty.has(input) || submitAttempted) && !valid;

      if (error) {
        error.classList.toggle("hidden", !showError);
      }

      if (!valid) isValid = false;
    });

    btn.disabled = !isValid;
    btn.classList.toggle("opacity-50", !isValid);
    btn.classList.toggle("cursor-not-allowed", !isValid);

    return isValid;
  };

  Object.entries(fields).forEach(([key, { input }]) => {
    if (!input) return;

    input.addEventListener("input", () => {
      dirty.add(input);
      clearTimeout(inputTimer);
      inputTimer = setTimeout(validateAll, 300);
    });

    input.addEventListener("blur", () => {
      if (key === "vacancy") {
        input.value = input.value.trim().replace(/^https?:\/\//i, "");
      }
      if (!dirty.has(input)) return;
      validateAll();
    });
  });

  const resetValidationState = () => {
    dirty.clear();
    submitAttempted = false;
    Object.values(fields).forEach(({ error }) => {
      if (error) error.classList.add("hidden");
    });
    validateAll();
  };

  validateAll();

  return {
    fields,
    validateAll,
    markSubmitAttempt() {
      submitAttempted = true;
    },
    resetValidationState,
    isHoneypotFilled() {
      return !!(honeypot && honeypot.value.trim() !== "");
    },
  };
}
