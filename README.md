# Appifya

Appifya converts a store or landing page into a configurable, installable PWA. Users can save applications in Appwrite, preview them, share an install page, and request an Android build through GitHub Actions.

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

Optional AdSense fields can be added to the same collection for per-application advertising:

- `adsense_publisher_id` — string, for example `ca-pub-1234567890123456`
- `adsense_slot_id` — string containing the AdSense ad unit slot number
- `adsense_format` — string enum/value: `auto`, `fluid`, or `rectangle`

The exported PWA ZIP includes the AdSense unit when both IDs are provided. Google must approve the publisher account and site before ads can serve. The Android WebView builder currently receives these values in the dispatch payload but must explicitly render the exported wrapper to display them in APKs.

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
