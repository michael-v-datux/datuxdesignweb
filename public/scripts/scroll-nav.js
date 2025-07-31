const stickyNavbar = document.getElementById("sticky-navbar");
const regularNavbar = document.getElementById("navbar");

const isRegularNavbarOutOfView = () => {
  const rect = regularNavbar.getBoundingClientRect();
  return rect.bottom <= 0;
};

const onScroll = () => {
  if (isRegularNavbarOutOfView()) {
    stickyNavbar.classList.remove("hidden");
    stickyNavbar.classList.add("visible");
  } else {
    stickyNavbar.classList.remove("visible");
    stickyNavbar.classList.add("hidden");
  }
};

window.addEventListener("scroll", onScroll);
