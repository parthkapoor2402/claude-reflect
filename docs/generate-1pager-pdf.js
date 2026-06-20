const path = require('path');
const fs = require('fs');

async function main() {
  const input = process.argv[2] || 'claude-reflect-architecture-1pager';
  const htmlPath = path.join(__dirname, `${input}.html`);
  const pdfPath = path.join(__dirname, `${input}.pdf`);
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.error('Installing puppeteer for one-time PDF generation...');
    const { execSync } = require('child_process');
    execSync('npm install puppeteer --no-save', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    puppeteer = require('puppeteer');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();

  if (fs.existsSync(pdfPath)) {
    console.log('PDF created:', pdfPath);
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
