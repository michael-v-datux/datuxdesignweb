export function showToast(message, type = "info", duration = 4000) {
    const colors = {
        success: { bg: "#16a34a", text: "#ffffff" }, // зелений
        error: { bg: "#dc2626", text: "#ffffff" },   // червоний
        info: { bg: "#4b5563", text: "#ffffff" }     // темно-сірий замість прозорого
    };
    const popup = document.createElement("div");
    popup.className = "toast fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-sm border z-50 animate-fade-in";
    popup.textContent = message;
    popup.style.background = colors[type].bg;
    popup.style.color = colors[type].text;
    popup.style.borderColor = "rgba(255,255,255,0.2)";
    popup.style.backdropFilter = "blur(8px)";
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add("animate-fade-out");
        popup.addEventListener("animationend", () => popup.remove());
    }, duration);
}