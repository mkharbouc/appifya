# Appifya

[![GitHub Marketplace](https://img.shields.io/badge/GitHub_Marketplace-Appifya_Action-blueviolet?logo=github-actions)](https://github.com/marketplace/actions/appifya-pwa-mobile-app-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Appifya converts a store or landing page into a configurable, installable PWA. Users can save applications in Appwrite, preview them, share an install page, and request an Android build through GitHub Actions.

## 🚀 Official GitHub Action

Appifya is available as an official **GitHub Action** in the **GitHub Marketplace**:
- **[Appifya PWA Audit & Android Mobile Builder](https://github.com/marketplace/actions/appifya-pwa-mobile-app-builder)**: Automatically audit any URL for PWA compliance, validate Web App Manifests, and prepare Android APK/AAB packages directly inside your CI/CD workflow.

## Requirements

- Node.js 20+
- An Appwrite project with an applications collection
- Optional GitHub repository for APK builds

## Configuration

Create `.env.local` with:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_TABLE_ID=your-collection-id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your-bucket-id

# Required only for the APK build endpoint
GITHUB_PAT=your-server-side-token
GITHUB_OWNER=your-github-owner
```

Never expose `GITHUB_PAT` through a `NEXT_PUBLIC_` variable or commit it to the repository.

The application collection must allow the signed-in user to create and list documents containing at least `user_id`, `store_url`, `app_name`, and `theme_color`. Configure document permissions so users can only access their own documents.

Optional AdMob fields can be added to the same collection for per-application Android advertising:

- `admob_app_id` — string, for example `ca-app-pub-1234567890123456~1234567890`
- `admob_banner_unit_id` — string, for example `ca-app-pub-1234567890123456/1234567890`

These values are sent to the Android build workflow. The Android builder must use the Google Mobile Ads SDK and render a banner with the supplied IDs; the current web/PWA export remains free and has no ads.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Export and APK notes

- `GET /api/proxy` validates an HTTPS URL and returns a real ZIP containing an HTML wrapper, manifest, service worker, and generated icon.
- APK requests dispatch the `build_apk` event to the configured Android repository. The Android workflow is responsible for producing and publishing the final artifact.
- Sites that send restrictive `X-Frame-Options` or CSP headers may not render inside the preview iframe; users can still open the original URL directly.

Payment and paid export flows are intentionally not implemented yet.
