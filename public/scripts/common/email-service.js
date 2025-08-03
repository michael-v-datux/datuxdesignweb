document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector("#email-toggle button");
    const tooltip = document.getElementById("email-tooltip");
    const copyBtn = document.getElementById("copy-email");
    const copyTooltip = document.getElementById("copy-tooltip");
    const icon = document.getElementById("email-icon");

    if (!toggleBtn || !tooltip || !icon) return;

    // Відкрити/закрити тултіп
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = tooltip.classList.contains("visible");

        if (isOpen) {
            tooltip.classList.remove("visible");
            icon.classList.remove("opened");
        } else {
            tooltip.classList.add("visible");
            icon.classList.add("opened");
        }
    });

    // Кліки всередині тултіпа не закривають його
    tooltip.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // Закриття тултіпа при кліку поза ним
    document.addEventListener("click", (e) => {
        // Приводимо className до строки (щоб уникнути помилки indexOf)
        const className = String(e.target.className || "");
        if (!tooltip.contains(e.target) && !toggleBtn.contains(e.target) && className.indexOf("email") === -1) {
            tooltip.classList.remove("visible");
            icon.classList.remove("opened");
        }
    });

    // Копіювання email
    if (copyBtn && copyTooltip) {
        copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText("michael.v@datux.design");
            copyTooltip.classList.add("visible");
            setTimeout(() => copyTooltip.classList.remove("visible"), 1500);
        });
    }
});