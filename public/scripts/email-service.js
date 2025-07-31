document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("email-toggle");
  const icon = document.getElementById("email-icon");
  const tooltip = document.getElementById("email-tooltip");
  const copyBtn = document.getElementById("copy-email");
  const copyTooltip = document.getElementById("copy-tooltip");

  if (!toggleBtn || !icon || !tooltip || !copyBtn || !copyTooltip) return;

  let isOpen = false;

  const openTooltip = () => {
    tooltip.classList.remove("hidden");
    requestAnimationFrame(() => tooltip.classList.add("visible"));
    icon.classList.remove("hovered");
    icon.classList.add("opened");
    isOpen = true;
  };

  const closeTooltip = () => {
    tooltip.classList.remove("visible");
    setTimeout(() => tooltip.classList.add("hidden"), 200);
    icon.classList.remove("opened");
    isOpen = false;
  };

  const showCopyTooltip = () => {
    copyTooltip.classList.remove("hidden");
    void copyTooltip.offsetWidth;
    copyTooltip.classList.add("visible");

    setTimeout(() => {
      copyTooltip.classList.remove("visible");
      copyTooltip.classList.add("hidden");
    }, 2000);
  };

  toggleBtn.addEventListener("mouseenter", () => {
    if (!isOpen) icon.classList.add("hovered");
  });

  toggleBtn.addEventListener("mouseleave", () => {
    if (!isOpen) icon.classList.remove("hovered");
  });

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen ? closeTooltip() : openTooltip();
  });

  document.addEventListener("click", (e) => {
    if (isOpen && !tooltip.contains(e.target) && !toggleBtn.contains(e.target)) {
      closeTooltip();
    }
  });

  tooltip.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeTooltip());
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("michael.v@datux.design").then(() => {
      showCopyTooltip();
      closeTooltip();
    });
  });
});
