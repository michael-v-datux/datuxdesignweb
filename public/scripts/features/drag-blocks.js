import { supabase } from '@/lib/supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("blocks");
    if (!container) return;

    let dragged = null;
    let offsetY = 0;

    async function savePositions() {
        const items = [...container.querySelectorAll(".block-item")].map((el, index) => ({
            id: el.dataset.id,
            position: index + 1
        }));
        await supabase.from('project_blocks').upsert(items);
    }

    container.addEventListener("mousedown", (e) => {
        const handle = e.target.closest(".block-drag-handle");
        const block = e.target.closest(".block-item");
        if (!handle || !block) return;

        dragged = block;
        offsetY = e.clientY - block.getBoundingClientRect().top;
        block.classList.add("dragging");
        block.style.width = `${block.offsetWidth}px`;
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragged) return;

        const containerRect = container.getBoundingClientRect();
        let newY = e.clientY - containerRect.top - offsetY;
        dragged.style.position = "absolute";
        dragged.style.top = `${newY}px`;
        dragged.style.zIndex = 1000;

        const siblings = [...container.querySelectorAll(".block-item:not(.dragging)")];
        for (let sibling of siblings) {
            const rect = sibling.getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
                container.insertBefore(dragged, sibling);
                break;
            }
            if (sibling === siblings[siblings.length - 1]) {
                container.appendChild(dragged);
            }
        }
    });

    document.addEventListener("mouseup", async () => {
        if (!dragged) return;

        dragged.classList.remove("dragging");
        dragged.style.position = "relative";
        dragged.style.top = "";
        dragged.style.width = "";
        dragged.style.zIndex = "";
        document.body.style.userSelect = "";

        await savePositions();
        dragged = null;
    });
});