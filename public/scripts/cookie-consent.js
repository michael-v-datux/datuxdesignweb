import { initAnalytics } from './analytics.js';
import { showToast } from '/scripts/toast.js';

document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");
    const declineBtn = document.getElementById("decline-cookies");
    const changeBtn = document.getElementById("change-cookies");

    const acceptedText = banner.dataset.acceptedText;
    const declinedText = banner.dataset.declinedText;

    function deleteAnalyticsCookies() {
        // Видаляємо GA-куки
        const cookies = document.cookie.split("; ");
        cookies.forEach(cookie => {
            if (cookie.startsWith("_ga") || cookie.startsWith("_gid") || cookie.startsWith("_gat")) {
                document.cookie = `${cookie.split("=")[0]}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
            }
        });

        // Видаляємо скрипт GA, якщо він був доданий
        const gaScript = document.querySelector('script[src^="https://www.googletagmanager.com/gtag/js"]');
        if (gaScript) gaScript.remove();

        // Очищаємо dataLayer і скидаємо прапорець
        window.dataLayer = [];
        window.gtagLoaded = false;
        console.log("Google Analytics disabled and removed.");
    }

    function showBanner() {
        banner.classList.remove("hidden");
        setTimeout(() => banner.classList.add("slide-in"), 50);
    }

    function hideBanner(callback) {
        banner.classList.add("slide-out");
        banner.addEventListener("transitionend", () => {
            banner.classList.add("hidden");
            if (callback) callback();
        }, { once: true });
    }

    const cookiesChoice = localStorage.getItem("cookiesAccepted");

    // GA вантажиться тільки якщо є згода і ID
    if (cookiesChoice === "true" && window.PUBLIC_GA_ID) {
        initAnalytics();
    }

    acceptBtn.addEventListener("click", () => {
        localStorage.setItem("cookiesAccepted", "true");
        showToast(acceptedText, "success");
        hideBanner(() => {
            if (window.PUBLIC_GA_ID) initAnalytics();
        });
    });

    declineBtn.addEventListener("click", () => {
        localStorage.setItem("cookiesAccepted", "false");
        deleteAnalyticsCookies();
        showToast(declinedText, "error");
        hideBanner(() => setTimeout(() => location.reload(), 4000));
    });

    if (changeBtn) {
        changeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const prevChoice = localStorage.getItem("cookiesAccepted");
            localStorage.removeItem("cookiesAccepted");
            localStorage.setItem("previousCookiesChoice", prevChoice);
            location.reload();
        });
    }

    if (cookiesChoice === null) {
        setTimeout(() => {
            showBanner();
        }, 3000);
    }
});