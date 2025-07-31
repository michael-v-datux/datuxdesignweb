import localIpUrl from 'local-ip-url';
import detect from 'detect-port';
import qrcode from 'qrcode-terminal';

const DEFAULT_PORT = 4321;
const HOST = localIpUrl('public');

(async () => {
    const port = await detect(DEFAULT_PORT);
    const url = `http://${HOST}:${port}`;
    console.log(`\n🌐  Open on mobile: ${url}\n`);
    qrcode.generate(url, { small: true }); // генерує QR-код прямо в консолі
})();