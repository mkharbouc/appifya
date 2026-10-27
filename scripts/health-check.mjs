#!/usr/bin/env node

/**
 * Appifya 360° Platform Diagnostic & Health Check Script
 * Run anytime with: node scripts/health-check.mjs
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const targetRepo = 'appifya-android-engine';
const owner = process.env.GITHUB_OWNER || 'mkharbouc';

console.log('\n========================================================');
console.log('       🔍 APPIFYA PLATFORM AUTONOMOUS HEALTH AUDIT       ');
console.log('========================================================\n');

let allPassed = true;

// 1. Check local environment variables file
console.log('1. Checking Local Environment Configuration (.env.local)...');
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasAppwrite = envContent.includes('NEXT_PUBLIC_APPWRITE_ENDPOINT');
  const hasPat = envContent.includes('GITHUB_PAT=');
  
  if (hasAppwrite && hasPat) {
    console.log('   ✅ .env.local contains Appwrite and GitHub PAT configurations.');
  } else {
    console.log('   ⚠️ .env.local is missing some keys.');
    allPassed = false;
  }
} else {
  console.log('   ⚠️ .env.local file not found locally.');
  allPassed = false;
}

// 2. Run TypeScript compilation audit
console.log('\n2. Auditing TypeScript compilation and type safety...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript audit passed with 0 errors.');
} catch (err) {
  console.log('   ❌ TypeScript compilation failed:');
  console.log(err.stdout ? err.stdout.toString() : err.message);
  allPassed = false;
}

// 3. Helper for HTTP requests
function fetchJson(url, options = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Appifya-Diagnostic-Runner',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
        timeout: 8000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Request timed out' });
    });
    req.end();
  });
}

// 4. Check Live Production Endpoint
console.log('\n3. Probing Live Production Web Service (https://www.appifya.app)...');
const liveHealth = await fetchJson('https://www.appifya.app/api/health');

if (liveHealth.error) {
  console.log(`   ⚠️ Could not reach live endpoint: ${liveHealth.error}`);
} else if (liveHealth.status === 200) {
  console.log(`   ✅ Live production is UP (HTTP 200). Status: ${liveHealth.body?.status || 'OK'}`);
} else {
  console.log(`   ⚠️ Live production health check returned HTTP ${liveHealth.status}`);
  if (liveHealth.body?.checks?.cloud_runner?.message) {
    console.log(`      Runner alert: ${liveHealth.body.checks.cloud_runner.message}`);
  }
}

console.log('\n========================================================');
if (allPassed) {
  console.log('  🎉 PLATFORM CORE STATUS: STABLE & READY FOR CUSTOMERS   ');
} else {
  console.log('  ⚠️ ACTION RECOMMENDED: Review items flagged above      ');
}
console.log('========================================================\n');
