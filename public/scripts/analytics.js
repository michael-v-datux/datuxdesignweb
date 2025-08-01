export function enableAnalytics() {
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

    if (window.gtagLoaded) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);

    console.log(`✅ [GA] Enabled with ID: ${GA_ID}`);
    window.gtagLoaded = true;
}