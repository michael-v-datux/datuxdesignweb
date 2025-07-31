document.addEventListener("DOMContentLoaded", () => {
    let draggedTooltip = null;
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let containerRect;

    function savePosition(key, x, y) {
        sessionStorage.setItem(key, JSON.stringify({ x, y }));
    }

    function loadPosition(key) {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    document.addEventListener("click", (e) => {
        const icon = e.target.closest(".info-icon");
        const tooltipEl = e.target.closest(".custom-tooltip");
        const existingTooltips = document.querySelectorAll(".custom-tooltip");

        // Якщо клік поза тултіпом і не по іконці — закриваємо
        if (!icon && !tooltipEl && !isDragging) {
            existingTooltips.forEach(t => {
                t.classList.add("closing");
                setTimeout(() => t.remove(), 300);
            });
            return;
        }

        // Якщо клік по іконці — відкриваємо тултіп
        if (icon) {
            e.stopPropagation();
            existingTooltips.forEach(t => t.remove()); // закриваємо інші

            const tooltip = document.createElement("div");
            tooltip.className = "custom-tooltip";
            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <span class="tooltip-drag-handle">☰</span>
                    <button class="tooltip-close">×</button>
                </div>
                <div class="tooltip-content">${icon.dataset.tooltip || ""}</div>
            `;

            const wrapper = icon.closest(".screenshot-wrapper");
            wrapper.appendChild(tooltip);

            const tooltipKey = `${wrapper.dataset.tooltipKey || "tooltip"}_${[...wrapper.parentNode.children].indexOf(wrapper)}`;

            // Встановлюємо позицію: збережену або автоматичну
            requestAnimationFrame(() => {
                const saved = loadPosition(tooltipKey);
                if (saved) {
                    tooltip.style.left = `${saved.x}px`;
                    tooltip.style.top = `${saved.y}px`;
                } else {
                    const iconRect = icon.getBoundingClientRect();
                    const tooltipRect = tooltip.getBoundingClientRect();

                    let top = icon.offsetTop - tooltipRect.height - 10;
                    let left = icon.offsetLeft - tooltipRect.width + iconRect.width;

                    if (top < 0) top = icon.offsetTop + iconRect.height + 10;
                    if (left < 0) left = icon.offsetLeft + iconRect.width + 10;

                    tooltip.style.top = `${top}px`;
                    tooltip.style.left = `${left}px`;
                }
            });

            // Закриття
            tooltip.querySelector(".tooltip-close").addEventListener("click", (event) => {
                event.stopPropagation();
                tooltip.classList.add("closing");
                setTimeout(() => tooltip.remove(), 300);
            });

            // Початок drag
            const dragHandle = tooltip.querySelector(".tooltip-drag-handle");
            dragHandle.addEventListener("mousedown", (e) => {
                e.preventDefault();
                e.stopPropagation();
                draggedTooltip = tooltip;
                const rect = tooltip.getBoundingClientRect();
                containerRect = tooltip.parentElement.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                tooltip.style.transition = "none";
                isDragging = true;
            });

            // Запам’ятовуємо ключ для збереження позиції
            tooltip.dataset.key = tooltipKey;
        }
    });

    // Drag рух із відступами 5–8%
    document.addEventListener("mousemove", (e) => {
        if (draggedTooltip) {
            const tooltipRect = draggedTooltip.getBoundingClientRect();
            const marginX = containerRect.width * 0.05; // 5% відступ
            const marginY = containerRect.height * 0.05;

            let newX = e.clientX - containerRect.left - offsetX;
            let newY = e.clientY - containerRect.top - offsetY;

            // Обмеження з відступами
            newX = Math.min(
                Math.max(newX, marginX),
                containerRect.width - tooltipRect.width - marginX
            );
            newY = Math.min(
                Math.max(newY, marginY),
                containerRect.height - tooltipRect.height - marginY
            );

            draggedTooltip.style.left = `${newX}px`;
            draggedTooltip.style.top = `${newY}px`;
        }
    });

    // Drag кінець
    document.addEventListener("mouseup", () => {
        if (draggedTooltip) {
            const x = parseInt(draggedTooltip.style.left);
            const y = parseInt(draggedTooltip.style.top);
            savePosition(draggedTooltip.dataset.key, x, y);
            draggedTooltip.style.transition = "all 0.2s ease";
            draggedTooltip = null;
            setTimeout(() => (isDragging = false), 100);
        }
    });

    // Закриття по ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".custom-tooltip").forEach(t => {
                t.classList.add("closing");
                setTimeout(() => t.remove(), 300);
            });
        }
    });
});
