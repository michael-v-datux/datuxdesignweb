document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector(".ribbon-content");
  if (content) {
    const clone = content.cloneNode(true);
    content.parentElement.appendChild(clone);
  }
});
