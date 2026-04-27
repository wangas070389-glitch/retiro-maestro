import { chromium } from 'playwright-chromium';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:\\Users\\wanga\\.gemini\\antigravity\\brain\\643d09e3-b4ae-493a-b1e7-d7e822f9ffb6';

async function executeCaptureSequence() {
    console.log("Starting B2C Capture Matrix for Carlos Mendoza...");
    
    // Config for Mobile/Portrait aspect ratio (1080x1350)
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 2,
    });
    
    const page = await context.newPage();

    // LOGIN
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'carlos.m@retiromaestro.com');
    await page.fill('input[name="password"]', 'Marketing123!');
    await page.click('button[type="submit"]');

    // SHOT 01: Shock Financiero
    console.log("Navigating to dashboard... capturing Shot 01");
    // Explicitly wait for navigation to complete
    await page.waitForTimeout(3000); 
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    // Wait for the chart to be visible/rendered
    await page.waitForTimeout(2000); 
    
    const shot01Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_01_SHOCK_FINANCIERO.png');
    await page.screenshot({ path: shot01Path, fullPage: true });

    // SHOT 02: Filtro de Realidad
    console.log("Capturing Shot 02...");
    // Assuming the requirements are on the dashboard or we can just capture the top section
    const shot02Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_02_FILTRO_REALIDAD.png');
    await page.screenshot({ path: shot02Path });

    // SHOT 03: Validación Lógica
    // The "Authority" page has the DOF monitor
    console.log("Navigating to authority... capturing Shot 03");
    await page.goto('http://localhost:3000/authority', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot03Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_03_VALIDACION_LOGICA.png');
    await page.screenshot({ path: shot03Path, fullPage: true });

    // SHOT 04: Gratificación Inmediata
    console.log("Navigating to laboratory... capturing Shot 04");
    await page.goto('http://localhost:3000/laboratory', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot04Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_04_GRATIFICACION_INMEDIATA.png');
    await page.screenshot({ path: shot04Path, fullPage: true });

    // SHOT 05: Prueba Notarial / Dossier Certificado (we do this back on Authority)
    console.log("Capturing Shot 05 (Trust Hard Proof)...");
    await page.goto('http://localhost:3000/authority', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot05Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_05_PRUEBA_NOTARIAL.png');
    await page.screenshot({ path: shot05Path });
    
    // SHOT 06: ROI Contextualizado
    console.log("Capturing Shot 06...");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot06Path = path.join(ARTIFACTS_DIR, 'RM73_MARKETING_06_ROI_CONTEXTUALIZADO.png');
    await page.screenshot({ path: shot06Path, fullPage: true });

    await browser.close();
    console.log("B2C Capture Matrix COMPLETE!");
}

executeCaptureSequence().catch(console.error);
