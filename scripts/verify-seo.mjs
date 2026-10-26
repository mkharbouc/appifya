import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_ROUTES = [
  { file: 'src/app/page.tsx', route: '/' },
  { file: 'src/app/about/page.tsx', route: '/about' },
  { file: 'src/app/admob/page.tsx', route: '/admob' },
  { file: 'src/app/contact/page.tsx', route: '/contact' },
  { file: 'src/app/guide/page.tsx', route: '/guide' },
  { file: 'src/app/privacy/page.tsx', route: '/privacy' },
  { file: 'src/app/terms/page.tsx', route: '/terms' },
  { file: 'src/app/tools/page.tsx', route: '/tools' },
  { file: 'src/app/tools/apk-permissions-auditor/page.tsx', route: '/tools/apk-permissions-auditor' },
  { file: 'src/app/tools/app-banner-generator/page.tsx', route: '/tools/app-banner-generator' },
  { file: 'src/app/tools/app-mockup-framer/page.tsx', route: '/tools/app-mockup-framer' },
  { file: 'src/app/tools/assetlinks-generator/page.tsx', route: '/tools/assetlinks-generator' },
  { file: 'src/app/tools/icon-generator/page.tsx', route: '/tools/icon-generator' },
  { file: 'src/app/tools/manifest-generator/page.tsx', route: '/tools/manifest-generator' },
  { file: 'src/app/tools/play-data-safety/page.tsx', route: '/tools/play-data-safety' },
  { file: 'src/app/tools/pwa-checker/page.tsx', route: '/tools/pwa-checker' },
  { file: 'src/app/tools/qr-generator/page.tsx', route: '/tools/qr-generator' },
];

let errors = 0;
let warnings = 0;

console.log('🔍 Running comprehensive SEO verification on all public pages...\n');

for (const { file, route } of PUBLIC_ROUTES) {
  if (!fs.existsSync(file)) {
    console.error(`❌ [${route}] Missing file: ${file}`);
    errors++;
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');

  // Check metadata export
  if (!content.includes('export const metadata')) {
    console.error(`❌ [${route}] Missing 'export const metadata' in ${file}`);
    errors++;
    continue;
  }

  // Check Title
  const titleMatch = content.match(/title:\s*['"`](.+?)['"`]/);
  if (!titleMatch) {
    console.error(`❌ [${route}] Could not extract metadata.title`);
    errors++;
  } else {
    const rawTitle = titleMatch[1];
    if (rawTitle.includes('| Appifya') || rawTitle.includes('- Appifya')) {
      console.error(`❌ [${route}] Title contains duplicate branding suffix: "${rawTitle}"`);
      errors++;
    }
    const finalTitle = `${rawTitle} | Appifya`;
    if (finalTitle.length > 58) {
      console.error(`❌ [${route}] Final Title exceeds 58 characters (${finalTitle.length} chars): "${finalTitle}"`);
      errors++;
    } else {
      console.log(`  ✓ Title (${finalTitle.length} chars): "${finalTitle}"`);
    }
  }

  // Check Meta Description
  const descMatch = content.match(/description:\s*\n?\s*['"`]([\s\S]*?)['"`],/);
  if (!descMatch) {
    console.error(`❌ [${route}] Could not extract metadata.description`);
    errors++;
  } else {
    const desc = descMatch[1].replace(/\s+/g, ' ').trim();
    if (desc.length < 50) {
      console.error(`❌ [${route}] Description too short (< 50 chars, found ${desc.length}): "${desc}"`);
      errors++;
    } else if (desc.length > 160) {
      console.error(`❌ [${route}] Description too long (> 160 chars, Bing will flag as error! Found ${desc.length}): "${desc}"`);
      errors++;
    } else {
      console.log(`  ✓ Description (${desc.length} chars): "${desc}"`);
    }
  }

  // Check Canonical
  const canonicalMatch = content.match(/canonical:\s*['"`](.+?)['"`]/);
  if (!canonicalMatch) {
    console.error(`❌ [${route}] Missing canonical link in metadata.alternates`);
    errors++;
  } else {
    const canonical = canonicalMatch[1];
    if (!canonical.startsWith('https://www.appifya.app')) {
      console.error(`❌ [${route}] Canonical must start with https://www.appifya.app: "${canonical}"`);
      errors++;
    }
  }

  // Check for invalid duplicate languages hreflang
  if (content.includes('languages:') && content.includes('x-default')) {
    console.error(`❌ [${route}] Deprecated/conflicting hreflang languages found in alternates`);
    errors++;
  }

  // Check OpenGraph and Twitter
  if (!content.includes('openGraph:')) {
    console.warn(`⚠️ [${route}] Missing openGraph metadata`);
    warnings++;
  }
  if (!content.includes('twitter:')) {
    console.warn(`⚠️ [${route}] Missing twitter metadata`);
    warnings++;
  }

  console.log(`✅ [${route}] Checked OK.\n`);
}

// Check sitemap.ts
const sitemapContent = fs.readFileSync('src/app/sitemap.ts', 'utf8');
if (sitemapContent.includes('lastModified: new Date()')) {
  console.error(`❌ [sitemap.ts] Found dynamic 'lastModified: new Date()'. Use fixed versioned dates.`);
  errors++;
} else {
  console.log(`✅ [sitemap.ts] Valid versioned lastModified dates.`);
}

// Check robots.ts
const robotsContent = fs.readFileSync('src/app/robots.ts', 'utf8');
if (!robotsContent.includes('sitemap: `https://appifya.app/sitemap.xml`') && !robotsContent.includes('${siteUrl}/sitemap.xml')) {
  console.error(`❌ [robots.ts] Missing sitemap reference`);
  errors++;
} else {
  console.log(`✅ [robots.ts] Sitemaps properly linked.`);
}

console.log(`\n========================================`);
if (errors === 0) {
  console.log(`🎉 ALL SEO CHECKS PASSED PERFECTLY! (0 Errors, ${warnings} Warnings)`);
  process.exit(0);
} else {
  console.error(`💥 SEO VERIFICATION FAILED: ${errors} errors found!`);
  process.exit(1);
}
