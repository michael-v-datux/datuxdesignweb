document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector("#email-toggle button");
    const tooltip = document.getElementById("email-tooltip");
    const copyBtn = document.getElementById("copy-email");
    const copyTooltip = document.getElementById("copy-tooltip");
    const lid = document.getElementById("lid");

    if (!toggleBtn || !tooltip) return;

    // Відкрити/закрити тултіп
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = tooltip.classList.contains("opacity-100");

        if (isOpen) {
            tooltip.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
            tooltip.classList.add("opacity-0", "scale-95", "pointer-events-none");
            lid.style.transform = "rotateX(0deg)";
        } else {
            tooltip.classList.remove("opacity-0", "scale-95", "pointer-events-none");
            tooltip.classList.add("opacity-100", "scale-100", "pointer-events-auto");
            lid.style.transform = "rotateX(-40deg)";
        }
    });

    // Закриття тултіпа при кліку поза ним
    document.addEventListener("click", (e) => {
        if (!tooltip.contains(e.target) && !toggleBtn.contains(e.target)) {
            tooltip.classList.remove("opacity-100", "scale-100", "pointer-events-auto");
            tooltip.classList.add("opacity-0", "scale-95", "pointer-events-none");
            lid.style.transform = "rotateX(0deg)";
        }
    });

    // Копіювання email
    if (copyBtn && copyTooltip) {
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText("michael.v@datux.design");
            copyTooltip.classList.remove("hidden");
            setTimeout(() => copyTooltip.classList.add("hidden"), 1500);
        });
    }
});