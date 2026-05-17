const stickyNavbar = document.getElementById("sticky-navbar");
const regularNavbar = document.getElementById("navbar");

if (stickyNavbar && regularNavbar) {
  const updateSticky = () => {
    const rect = regularNavbar.getBoundingClientRect();
    const showSticky = rect.bottom <= 0;

    stickyNavbar.classList.toggle("is-visible", showSticky);
  };

  updateSticky();
  window.addEventListener("scroll", updateSticky, { passive: true });
  window.addEventListener("resize", updateSticky);
}
