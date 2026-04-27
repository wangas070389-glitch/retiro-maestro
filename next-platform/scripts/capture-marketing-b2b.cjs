const { chromium } = require('playwright-chromium');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\wanga\\.gemini\\antigravity\\brain\\643d09e3-b4ae-493a-b1e7-d7e822f9ffb6';

async function executeB2BCapture() {
    console.log("Starting B2B Capture Matrix for Asesores Elite...");
    
    // Config for Desktop 16:9 aspect ratio or 4:5 vertical
    // Let's do 1080x1350 for Meta Ads
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 1.5,
    });
    
    const page = await context.newPage();

    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'contacto@asesoreselite.com');

    if (!process.env.SEED_USER_PASSWORD) {
        throw new Error("Missing SEED_USER_PASSWORD environment variable");
    }
    await page.fill('input[name="password"]', process.env.SEED_USER_PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);

    // SHOT 05: El Cierre Mecánico (Dashboard / CRM)
    console.log("Capturing Shot 05 (Dashboard / CRM)...");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot05Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_05_CIERRE_MECANICO.png');
    await page.screenshot({ path: shot05Path, fullPage: true });

    // SHOT 06: Marca Blanca & 07: Derrame de Leads 
    console.log("Capturing Shot 06 (Authority / White-Label)...");
    await page.goto('http://localhost:3000/authority', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot06Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_06_MARCA_BLANCA.png');
    await page.screenshot({ path: shot06Path, fullPage: true });

    // SHOT 08: Filtro Anti-Errores
    console.log("Capturing Shot 08 (Laboratory)...");
    await page.goto('http://localhost:3000/laboratory', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot08Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_08_FILTRO_ANTI_ERRORES.png');
    await page.screenshot({ path: shot08Path, fullPage: true });

    await browser.close();
    console.log("B2B Capture Matrix COMPLETE!");
}

executeB2BCapture().catch(console.error);
