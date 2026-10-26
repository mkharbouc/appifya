import fs from 'node:fs';
import path from 'node:path';

function findPublicPages(dir, baseDir = dir) {
  let pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Exclude private/internal directories
      if (['api', 'dashboard', 'app', 'view', 'verify-email'].includes(entry.name)) {
        continue;
      }
      pages = pages.concat(findPublicPages(fullPath, baseDir));
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      const route = relPath === 'page.tsx' ? '/' : '/' + relPath.replace(/\/page\.tsx$/, '');
      pages.push({ file: 'src/app/' + relPath, route });
    }
  }

  return pages;
}

const PUBLIC_PAGES = findPublicPages('src/app');

let errors = 0;
let warnings = 0;

console.log(`🔍 Running comprehensive dynamic SEO verification on ${PUBLIC_PAGES.length} public pages...\n`);

const sitemapContent = fs.readFileSync('src/app/sitemap.ts', 'utf8');
const indexnowContent = fs.readFileSync('src/app/api/indexnow/route.ts', 'utf8');

for (const { file, route } of PUBLIC_PAGES) {
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
    console.error(`❌ [${route}] Could not extract metadata.title in ${file}`);
    errors++;
  } else {
    const rawTitle = titleMatch[1];
    if (rawTitle.includes('| Appifya') || rawTitle.includes('- Appifya')) {
      console.error(`❌ [${route}] Title contains duplicate branding suffix: "${rawTitle}"`);
      errors++;
    }
    const finalTitle = `${rawTitle} | Appifya`;
    if (finalTitle.length > 58) {
      console.error(`❌ [${route}] Final Title exceeds 58 characters (${finalTitle.length} chars, Bing limit is 60!): "${finalTitle}"`);
      errors++;
    } else {
      console.log(`  ✓ Title (${finalTitle.length} chars): "${finalTitle}"`);
    }
  }

  // Check Meta Description
  const descMatch = content.match(/description:\s*\n?\s*['"`]([\s\S]*?)['"`],/);
  if (!descMatch) {
    console.error(`❌ [${route}] Could not extract metadata.description in ${file}`);
    errors++;
  } else {
    const desc = descMatch[1].replace(/\s+/g, ' ').trim();
    if (desc.length < 50) {
      console.error(`❌ [${route}] Description too short (< 50 chars, found ${desc.length}): "${desc}"`);
      errors++;
    } else if (desc.length > 158) {
      console.error(`❌ [${route}] Description too long (> 158 chars, Bing will flag as error! Found ${desc.length}): "${desc}"`);
      errors++;
    } else {
      console.log(`  ✓ Description (${desc.length} chars): "${desc}"`);
    }
  }

  // Check Canonical
  const canonicalMatch = content.match(/canonical:\s*['"`](.+?)['"`]/);
  if (!canonicalMatch) {
    console.error(`❌ [${route}] Missing canonical link in metadata.alternates in ${file}`);
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
    console.error(`❌ [${route}] Deprecated/conflicting hreflang languages found in alternates in ${file}`);
    errors++;
  }

  // Check presence in sitemap.ts
  const sitemapRouteEntry = route === '/' ? "route: ''" : `route: '${route}'`;
  if (!sitemapContent.includes(sitemapRouteEntry)) {
    console.error(`❌ [${route}] Missing from src/app/sitemap.ts! (Expected ${sitemapRouteEntry})`);
    errors++;
  }

  // Check presence in indexnow
  const indexnowUrl = route === '/' ? "'https://www.appifya.app/'" : `'https://www.appifya.app${route}'`;
  if (!indexnowContent.includes(indexnowUrl)) {
    console.error(`❌ [${route}] Missing from src/app/api/indexnow/route.ts! (Expected ${indexnowUrl})`);
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
if (sitemapContent.includes('lastModified: new Date()')) {
  console.error(`❌ [sitemap.ts] Found dynamic 'lastModified: new Date()'. Use fixed versioned dates.`);
  errors++;
} else {
  console.log(`✅ [sitemap.ts] Valid versioned lastModified dates.`);
}

// Check robots.ts
const robotsContent = fs.readFileSync('src/app/robots.ts', 'utf8');
if (!robotsContent.includes('${siteUrl}/sitemap.xml')) {
  console.error(`❌ [robots.ts] Missing sitemap reference`);
  errors++;
} else {
  console.log(`✅ [robots.ts] Sitemaps properly linked.`);
}

console.log(`\n========================================`);
if (errors === 0) {
  console.log(`🎉 ALL ${PUBLIC_PAGES.length} PAGES PASSED SEO CHECKS PERFECTLY! (0 Errors, ${warnings} Warnings)`);
  process.exit(0);
} else {
  console.error(`💥 SEO VERIFICATION FAILED: ${errors} errors found!`);
  process.exit(1);
}
