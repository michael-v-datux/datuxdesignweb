document.addEventListener("DOMContentLoaded", () => {
	const container = document.getElementById("protected-container");
	if (!container) return;

	const slug = container.dataset.slug;
	const correctHash = container.dataset.passwordHash;
	if (!slug || !correctHash) return;

	const PASSWORD_KEY = `project-access-${slug}`;
	const stored = sessionStorage.getItem(PASSWORD_KEY);

	const form = document.getElementById("password-form");
	const content = document.getElementById("protected-content");
	const errorMsg = document.getElementById("error-message");
	const input = document.getElementById("project-password");

	function animateUnlock() {
		content?.classList.remove("hidden");
		content?.classList.add("fade-in");
		form?.classList.add("hidden");
		errorMsg?.classList.add("hidden");
	}

	function unlock() {
		sessionStorage.setItem(PASSWORD_KEY, correctHash);
		animateUnlock();
	}

	// Хешування рядка через SHA-1
	async function hashString(str) {
		const encoder = new TextEncoder();
		const data = encoder.encode(str);
		const hashBuffer = await crypto.subtle.digest("SHA-1", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	}

	if (stored === correctHash) {
		animateUnlock();
	}

	form?.addEventListener("submit", async (e) => {
		e.preventDefault();
		const entered = input?.value;
		if (!entered) return;

		const enteredHash = await hashString(entered);
		if (enteredHash === correctHash) {
			unlock();
		} else {
			errorMsg?.classList.remove("hidden");
		}
	});
});
