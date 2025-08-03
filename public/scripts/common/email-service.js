document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.querySelector("#email-toggle button");
    const tooltip = document.getElementById("email-tooltip");
    const copyBtn = document.getElementById("copy-email");
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
        isOpen ? closeTooltip() : (tooltip.classList.add("visible"), icon.classList.add("opened"));
    });

    // Клік усередині тултіпа
    tooltip.addEventListener("click", (e) => e.stopPropagation());

    // Закриття тултіпа при кліку поза ним
    document.addEventListener("click", (e) => {
        if (!tooltip.contains(e.target) && !toggleBtn.contains(e.target)) {
            closeTooltip();
        }
    });

    // === Сповіщення про копіювання ===
    const showNotification = (message) => {
        let notif = document.createElement("div");
        notif.textContent = message;
        notif.style.position = "fixed";
        notif.style.bottom = "20px";
        notif.style.left = "50%";
        notif.style.transform = "translateX(-50%)";
        notif.style.background = "#dcfce7";
        notif.style.color = "#166534";
        notif.style.padding = "10px 16px";
        notif.style.border = "1px solid #bbf7d0";
        notif.style.borderRadius = "6px";
        notif.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
        notif.style.zIndex = "9999";
        notif.style.opacity = "0";
        notif.style.transition = "opacity 0.3s ease";
        document.body.appendChild(notif);
        setTimeout(() => (notif.style.opacity = "1"), 10);
        setTimeout(() => {
            notif.style.opacity = "0";
            setTimeout(() => notif.remove(), 300);
        }, 1500);
    };

    // Копіювання email
    if (copyBtn) {
        copyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText("michael.v@datux.design");
            showNotification("Email copied!");
            closeTooltip();
        });
    }
});