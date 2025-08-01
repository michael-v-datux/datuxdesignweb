export function initAnalytics() {
    const gaConfig = document.getElementById('ga-config');
    if (!gaConfig) {
        console.warn('⚠️ GA config not found.');
        return;
    }

    const GA_ID = gaConfig.getAttribute('data-ga-id');
    if (!GA_ID) {
        console.warn('⚠️ Google Analytics ID is missing.');
        return;
    }

    // Уникаємо подвійного завантаження
    if (window.gtagLoaded) return;

    // Створюємо тег скрипту
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Ініціалізація gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);

    console.log(`✅ Google Analytics initialized with ID: ${GA_ID}`);
    window.gtagLoaded = true;
}