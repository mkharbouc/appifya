# Plan: AdMob Setup Wizard — /admob page

## Context
Users who want to monetize their apps with Google AdMob need a dedicated space to configure their ad IDs and upload the final app file (APK, AAB, or IPA). The homepage already collects `admob_app_id` and `admob_banner_unit_id` and passes them to the build pipeline, but there's no post-build upload flow, no guidance, and no place to upload a file they received externally. This page fills that gap: a professional wizard that walks users through entering AdMob credentials and uploading their app file, with the file stored in Appwrite Storage.

## What we're building
A new page at `/admob` — a step-by-step AdMob setup wizard with:
1. **Hero section** — explains what AdMob is and why it matters (trilingual: AR/EN/FR)
2. **App selector** — dropdown to pick which of the user's apps to configure (pulls from Appwrite via the same `databases.listDocuments` pattern used in dashboard)
3. **Step 1 — AdMob credentials** — AdMob App ID + Banner Unit ID fields with inline format validation (same regex as homepage), plus a short visual guide explaining where to find these IDs
4. **Step 2 — Upload app file** — drag-and-drop + click-to-browse upload area accepting `.apk`, `.aab`, `.ipa` (max 100 MB). File is uploaded to Appwrite Storage (same `BUCKET_ID`). On success, the `icon_id`-equivalent field stores the file reference — we'll use a new `apk_file_id` field concept, but since we can't alter the Appwrite schema here, we store the uploaded file ID in Appwrite Storage and show a download link.
5. **Step 3 — Confirmation** — shows a summary card: app name, AdMob IDs saved, file uploaded with a download link back to the file.
6. **Save action** — calls `databases.updateDocument` to persist `admob_app_id` and `admob_banner_unit_id` on the existing app document (same pattern as `createDocument` on homepage).

## Critical files to modify
- `src/app/admob/page.tsx` — **new file** (the wizard page)
- `src/app/ClientLayoutWrapper.tsx` — add `/admob` link to nav and footer
- `src/lib/types.ts` — add optional `uploaded_file_id?: string` field to `AppDocument`

## Patterns to reuse (from existing code)
- Auth check + `openAuthModal()` — from `src/app/dashboard/page.tsx:23-45`
- `databases.listDocuments(DB_ID, TABLE_ID, [Query.equal('user_id', user.$id)])` — from `src/app/dashboard/page.tsx:52-55`
- `databases.updateDocument(DB_ID, TABLE_ID, appId, { ... })` — same Appwrite SDK, update instead of create
- `storage.createFile({ bucketId: BUCKET_ID, fileId: ID.unique(), file, permissions: [...] })` — from `src/app/page.tsx:167-173`
- `storage.getFileView(BUCKET_ID, fileId).toString()` — from `src/app/api/build-apk/route.ts:24`
- AdMob regex validators — from `src/app/page.tsx:145-158`
- `useLanguage()` + trilingual string pattern — from every existing page
- Theme/styling tokens — `bg-slate-900`, `border-slate-800`, `text-indigo-400`, gradient buttons — match existing pages exactly

## File upload constraints
- Accept: `.apk`, `.aab`, `.ipa`
- Max size: 100 MB (enforced client-side before upload)
- Upload to Appwrite Storage `BUCKET_ID` with `Permission.read(Role.any())`
- Store returned `$id` in component state; save to `uploaded_file_id` on the app document via `updateDocument`
- Show file name + size + a download link after upload

## Nav links to add
- Top nav (desktop): between "Install Guide" and "Contact"
- Footer: same position
- Label: `ar: 'إعداد AdMob'` / `fr: 'Config. AdMob'` / `en: 'AdMob Setup'`

## Wizard steps UI
Use a 3-step progress indicator at the top (Step 1 → Step 2 → Step 3). Each step is a card. User moves forward with a "Next" button; can go back. On step 3 a "Save & Finish" button commits the update and shows a success state with a link to /dashboard.

## Verification
1. `npm run build` — must compile cleanly
2. Navigate to `/admob` logged out → auth modal opens
3. Logged in → app selector shows user's apps
4. Enter invalid AdMob App ID → inline error shown, no save
5. Upload a `.apk` > 100MB → client-side rejection
6. Upload a valid small `.apk` → file appears in Appwrite Storage, download link shown
7. Save → `databases.updateDocument` called, admob fields visible in Appwrite dashboard
8. Nav bar and footer show "AdMob Setup" link in all 3 languages
