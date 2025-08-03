document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector("#email-toggle button");
    const tooltip = document.getElementById("email-tooltip");
    const copyBtn = document.getElementById("copy-email");
    const copyTooltip = document.getElementById("copy-tooltip");
    const icon = document.getElementById("email-icon");

    if (!toggleBtn || !tooltip || !icon) return;

    const closeTooltip = () => {
        tooltip.classList.remove("visible");
        icon.classList.remove("opened");
    };

    // Відкрити/закрити тултіп
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = tooltip.classList.contains("visible");
        if (isOpen) {
            closeTooltip();
        } else {
            tooltip.classList.add("visible");
            icon.classList.add("opened");
        }
    });

    // Клік усередині тултіпа: виконує дію та закриває тултіп
    tooltip.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.closest("a") || e.target.closest("button")) {
            closeTooltip();
        }
    });

    // Закриття тултіпа при кліку поза ним
    document.addEventListener("click", (e) => {
        if (!tooltip.contains(e.target) && !toggleBtn.contains(e.target)) {
            closeTooltip();
        }
    });

    // Копіювання email
    if (copyBtn && copyTooltip) {
        copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText("michael.v@datux.design");
            copyTooltip.textContent = "Email copied!";
            copyTooltip.classList.add("visible");
            setTimeout(() => {
                copyTooltip.classList.remove("visible");
                closeTooltip();
            }, 1500);
        });
    }
});
