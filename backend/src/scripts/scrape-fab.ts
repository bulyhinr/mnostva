import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load .env variables
config();

const EMAIL = process.env.FAB_EMAIL;
const PASSWORD = process.env.FAB_PASSWORD;

async function run() {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ Please set FAB_EMAIL and FAB_PASSWORD in your backend/.env file');
    process.exit(1);
  }

  console.log('🚀 Starting scraper with UI visible (headless: false)...');
  
  // We launch with UI so you can solve captchas or 2FA if Epic Games asks for it
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 Going to Fab.com to login...');
  // Go directly to the seller page, it might redirect to login, or we can click login
  await page.goto('https://www.fab.com/');

  console.log('⏳ Waiting for you to handle login (since Epic Games has Captcha & 2FA)...');
  console.log('🤖 The script will attempt to type your email and password if it sees the fields, but you might need to click things or solve captchas.');
  
  try {
    // Attempting to click the Login button on Fab.com
    await page.waitForTimeout(3000);
    const loginBtn = await page.$('text="Sign In"');
    if (loginBtn) await loginBtn.click();
    
    // Wait for Epic Games Login frame/page to load
    await page.waitForTimeout(5000);

    // Try clicking "Sign in with Epic Games" if it exists
    const epicLoginItem = await page.$('#login-with-epic');
    if (epicLoginItem) await epicLoginItem.click();

    // Try finding email and password fields
    await page.waitForSelector('#email', { timeout: 10000 }).catch(() => {});
    const emailInput = await page.$('#email');
    if (emailInput) {
       await emailInput.fill(EMAIL);
       const passInput = await page.$('#password');
       if (passInput) await passInput.fill(PASSWORD);
       
       const submitBtn = await page.$('#sign-in');
       if (submitBtn) await submitBtn.click();
       console.log('✅ Credentials filled. Please complete any Captcha or 2FA if prompted.');
    }
  } catch (err) {
    console.log('⚠️ Could not auto-fill. Please log in manually in the opened browser window.');
  }

  // PAUSE HERE AND WAIT FOR USER INPUT IN TERMINAL
  console.log('\n\n======================================================');
  console.log('🛑 PAUSED: PLEASE COMPLETE LOGIN AND CAPTCHA IN BROWSER');
  console.log('✅ ONCE YOU ARE LOGGED IN AND ON THE MAIN PAGE, CLICK BACK TO THIS TERMINAL AND PRESS "ENTER" TO CONTINUE ->');
  console.log('======================================================\n\n');
  
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
  
  console.log('✅ Logged in! Navigating to the shop...');
  await page.goto('https://www.fab.com/sellers/Mnostva%20Art', { waitUntil: 'domcontentloaded' });
  
  console.log('📜 Waiting for products to load...');
  await page.waitForTimeout(5000); // Give JS time to execute

  // Try to wait for actual product link elements to appear
  try {
    await page.waitForSelector('a[href*="/listings/"]', { timeout: 15000 });
  } catch (e) {
    console.log('⚠️ Could not find exact /listings/ tag in time, trying to scroll anyway...');
  }

  console.log('📜 Scrolling page to load all products...');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(1000);
  }

  // Extract all product links
  console.log('🔍 Searching for product links...');
  const links = await page.$$eval('a', (anchors) => 
    anchors
      .map(a => a.href)
      .filter(href => href.includes('/listings/'))
  );
  
  const uniqueLinks = [...new Set(links)];
  console.log(`🎉 Found ${uniqueLinks.length} products!`);

  interface ProductResult {
    sourceUrl: string;
    title: string | null;
    description: string | null;
    price: string | null;
    localImage: string | null;
  }

  const results: ProductResult[] = [];
  const imagesDir = path.join(__dirname, '..', '..', '..', 'public', 'scraped_images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  for (let i = 0; i < uniqueLinks.length; i++) {
    const link = uniqueLinks[i];
    console.log(`\n📄 [${i + 1}/${uniqueLinks.length}] Scraping: ${link}`);
    try {
      await page.goto(link);
      await page.waitForTimeout(4000); // Give it time to load 3D viewer/images

      // Get Title
      const title = await page.$eval('h1', el => el.textContent?.trim()).catch(() => 'Unknown Title');
      
      // Get Description (adjust selectors if needed when you see the DOM)
      const description = await page.$eval('.description-container, p', el => el.textContent?.trim()).catch(() => '');

      // Get Price
      const priceText = await page.$eval('[data-testid="price"], .price', el => el.textContent?.trim()).catch(() => '0');

      // Get Image URL
      const imageUrl = await page.$eval('img', img => img.src).catch(() => null);

      let localImage: string | null = null;
      if (imageUrl && !imageUrl.startsWith('data:')) {
        console.log(`📸 Downloading image: ${imageUrl}`);
        const response = await page.goto(imageUrl);
        const buffer = await response?.body();
        if (buffer) {
          const fileName = `product_${Date.now()}.jpg`;
          fs.writeFileSync(path.join(imagesDir, fileName), buffer);
          localImage = `/scraped_images/${fileName}`;
          console.log(`✅ Saved image to ${localImage}`);
        }
      }

      results.push({
        sourceUrl: link,
        title,
        description,
        price: priceText,
        localImage
      });

    } catch (err) {
      console.log(`❌ Failed to scrape ${link}: ${(err as Error).message}`);
    }
  }

  const outputJson = path.join(__dirname, '..', '..', 'scraped_products.json');
  fs.writeFileSync(outputJson, JSON.stringify(results, null, 2));
  console.log(`\n🎉 All done! Saved JSON to ${outputJson}.`);
  console.log('To import this into the DB, we will create a seeder next.');

  await browser.close();
}

run().catch(console.error);
