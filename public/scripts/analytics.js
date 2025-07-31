export function initAnalytics() {
    const GA_ID = document.getElementById('ga-config')?.dataset.gaId;

    if (!GA_ID) {
        console.warn('⚠️ Google Analytics ID is not set. Analytics will not be loaded.');
        return;
    }

    console.log(`✅ Google Analytics enabled with ID: ${GA_ID}`);

    if (window.gtagLoaded) return;
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
    window.gtagLoaded = true;
}