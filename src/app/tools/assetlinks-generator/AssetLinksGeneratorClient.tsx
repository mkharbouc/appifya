'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Terminal,
  RefreshCw,
  Search,
  KeyRound,
  FileCheck2,
  Server,
} from 'lucide-react';

interface VerificationResult {
  ok: boolean;
  status?: number;
  contentType?: string;
  error?: string;
  url?: string;
  packageMatched?: boolean;
  fingerprintMatched?: boolean;
  itemsCount?: number;
}

type GuideTab = 'play-console' | 'keytool' | 'studio';
type HostTab = 'nextjs' | 'wordpress' | 'nginx' | 'apache';

export default function AssetLinksGeneratorClient() {
  const { lang } = useLanguage();
  const pkgInputId = useId();

  // ─── Form State ───
  const [packageName, setPackageName] = useState('com.company.myapp');
  const [fingerprints, setFingerprints] = useState<string[]>([
    '14:6D:E9:44:C5:11:6E:40:BC:A6:FC:E8:B2:38:4B:06:84:7F:5E:FB:F0:4C:86:78:A6:42:15:60:E4:52:90:5F',
  ]);
  const [handleAllUrls, setHandleAllUrls] = useState(true);
  const [getLoginCreds, setGetLoginCreds] = useState(false);
  const [targetDomain] = useState('https://example.com');

  // ─── Keytool Helper State ───
  const [keystorePath, setKeystorePath] = useState('my-release-key.jks');
  const [keyAlias, setKeyAlias] = useState('my-alias');

  // ─── Live Verifier State ───
  const [testDomain, setTestDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // ─── UI State ───
  const [copied, setCopied] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<GuideTab>('play-console');
  const [activeHostTab, setActiveHostTab] = useState<HostTab>('nextjs');

  // Format single fingerprint to uppercase with colons
  const formatFingerprint = (raw: string): string => {
    // Strip everything except hex digits
    const clean = raw.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
    // Split into pairs of 2
    const pairs = clean.match(/.{1,2}/g);
    return pairs ? pairs.join(':') : clean;
  };

  // Check if fingerprint is valid (exactly 32 bytes = 64 hex characters)
  const isValidFingerprint = (fp: string): boolean => {
    const clean = fp.replace(/[^a-fA-F0-9]/g, '');
    return clean.length === 64;
  };

  const handleFingerprintChange = (index: number, value: string) => {
    const updated = [...fingerprints];
    updated[index] = value;
    setFingerprints(updated);
  };

  const handleAutoFormatFingerprint = (index: number) => {
    const updated = [...fingerprints];
    updated[index] = formatFingerprint(updated[index]);
    setFingerprints(updated);
  };

  const handleAddFingerprint = () => {
    setFingerprints([...fingerprints, '']);
  };

  const handleRemoveFingerprint = (index: number) => {
    if (fingerprints.length <= 1) return;
    setFingerprints(fingerprints.filter((_, i) => i !== index));
  };

  // Generate assetlinks object
  const generateAssetLinksObject = () => {
    const relations: string[] = [];
    if (handleAllUrls) relations.push('delegate_permission/common.handle_all_urls');
    if (getLoginCreds) relations.push('delegate_permission/common.get_login_creds');
    if (relations.length === 0) relations.push('delegate_permission/common.handle_all_urls');

    // Clean and validate fingerprints
    const validFps = fingerprints
      .map((fp) => formatFingerprint(fp))
      .filter((fp) => isValidFingerprint(fp));

    return [
      {
        relation: relations,
        target: {
          namespace: 'android_app',
          package_name: packageName.trim() || 'com.example.app',
          sha256_cert_fingerprints: validFps.length > 0 ? validFps : [fingerprints[0] || ''],
        },
      },
    ];
  };

  const assetLinksJsonString = JSON.stringify(generateAssetLinksObject(), null, 2);

  // Copy JSON to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assetLinksJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Download assetlinks.json
  const handleDownload = () => {
    const blob = new Blob([assetLinksJsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assetlinks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Verify Live Domain AssetLinks
  const handleVerifyDomain = async () => {
    const domainToCheck = testDomain.trim() || targetDomain.trim();
    if (!domainToCheck) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/check-assetlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domainToCheck,
          packageName: packageName.trim(),
          fingerprint: fingerprints[0] || '',
        }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to verification server';
      setVerificationResult({
        ok: false,
        error: message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="site-main flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* ─── Breadcrumbs ─── */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition-colors">
          {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-white transition-colors">
          {lang === 'ar' ? 'الأدوات' : 'Tools'}
        </Link>
        <span>/</span>
        <span className="text-cyan-400 font-semibold">
          {lang === 'ar' ? 'مولد ملف assetlinks.json' : 'Digital Asset Links Generator'}
        </span>
      </nav>

      {/* ─── Header ─── */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold text-cyan-400 mb-4 shadow-sm shadow-cyan-500/10">
          <KeyRound className="h-3.5 w-3.5" />
          <span>
            {lang === 'ar'
              ? 'معتمد لأندرويد و TWA و App Links الرسمية'
              : 'Official W3C & Android App Links Standard'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Digital Asset Links{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            {lang === 'ar' ? 'مولّد assetlinks.json' : 'Generator'}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {lang === 'ar'
            ? 'أنشئ ملف assetlinks.json القياسي لربط موقعك بتطبيق الأندرويد لفتح الروابط داخل التطبيق مباشرة (Android App Links) وإزالة شريط المتصفح في تطبيقات TWA مع أداة فحص واختبار فورية للنطاق.'
            : 'Generate standards-compliant assetlinks.json for Android App Links, Trusted Web Activities (TWA), and seamless deep linking. Includes SHA-256 formatter and live domain verification.'}
        </p>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Left Column: Input Form (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: App & Certificate Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-400">
                <FileCode className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {lang === 'ar' ? '1. بيانات تطبيق الأندرويد والشهادة' : '1. Android App & Certificate'}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'Package Name وبصمة SHA-256 لشهادة التوقيع' : 'Application ID and SHA-256 signing fingerprint'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Package Name */}
              <div>
                <label
                  htmlFor={pkgInputId}
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  {lang === 'ar' ? 'معرّف الحزمة (Package Name / Application ID)' : 'Android Package Name'}
                </label>
                <input
                  id={pkgInputId}
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g. com.example.myapp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  {lang === 'ar'
                    ? 'يجب أن يطابق تماماً applicationId في ملف build.gradle أو في Google Play Console.'
                    : 'Must exactly match your applicationId in build.gradle or Google Play Console.'}
                </p>
              </div>

              {/* SHA-256 Fingerprints List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {lang === 'ar' ? 'بصمات شهادة SHA-256 (Fingerprints)' : 'SHA-256 Fingerprints'}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFingerprint}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{lang === 'ar' ? 'إضافة بصمة أخرى' : 'Add Fingerprint'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {fingerprints.map((fp, index) => {
                    const valid = isValidFingerprint(fp);
                    const hasColons = fp.includes(':');

                    return (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-400">
                            {index === 0
                              ? lang === 'ar'
                                ? 'الشهادة الرئيسية (Google Play أو Release)'
                                : 'Primary Fingerprint (Play Signing or Release)'
                              : `${lang === 'ar' ? 'بصمة إضافية' : 'Secondary Fingerprint'} #${index + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            {valid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>{lang === 'ar' ? 'صيغة صحيحة (32 بايت)' : 'Valid (32 bytes)'}</span>
                              </span>
                            ) : fp.trim() ? (
                              <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[10px]">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{lang === 'ar' ? 'طول غير مكتمل' : 'Incomplete length'}</span>
                              </span>
                            ) : null}

                            {fingerprints.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFingerprint(index)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                                title="Remove Fingerprint"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          value={fp}
                          onChange={(e) => handleFingerprintChange(index, e.target.value)}
                          placeholder="14:6D:E9:44:C5:11:6E:40:BC:A6:FC:E8:B2:38:4B:06:84:7F:5E:FB:F0:4C:86:78:A6:42:15:60:E4:52:90:5F"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />

                        {/* Quick Auto-formatter trigger */}
                        {!hasColons && fp.trim().length >= 10 && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-500">
                              {lang === 'ar' ? 'تم اكتشاف نص خام بدون نقاط فصل' : 'Raw hex detected without colons'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAutoFormatFingerprint(index)}
                              className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold hover:bg-cyan-500/25 transition-colors cursor-pointer"
                            >
                              {lang === 'ar' ? '⚡ تحويل تلقائي (إضافة النقطتين)' : '⚡ Auto-format with Colons'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Relations / Permissions */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  {lang === 'ar' ? 'الصلاحيات والعلاقات (Relation)' : 'Relations & Permissions'}
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={handleAllUrls}
                      onChange={(e) => setHandleAllUrls(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">
                        handle_all_urls (Android App Links & TWA)
                      </span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {lang === 'ar'
                          ? 'تفويض التطبيق لفتح كافة روابط الموقع مباشرة داخل التطبيق دون إظهار نافذة المتصفح.'
                          : 'Delegates permission for your app to handle and open all URLs for this domain directly.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={getLoginCreds}
                      onChange={(e) => setGetLoginCreds(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">
                        get_login_creds (Shared Credentials / Smart Lock)
                      </span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {lang === 'ar'
                          ? 'مشاركة بيانات تسجيل الدخول وكلمات المرور بين الموقع وتطبيق الأندرويد عبر Google Password Manager.'
                          : 'Enables sharing stored login credentials between the website and your Android app.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Guide: Where to find SHA-256 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'ar' ? 'كيف تحصل على بصمة SHA-256؟' : 'Where to find your SHA-256 Fingerprint?'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'طرق استخراج البصمة من Play Console أو أداة keytool' : 'Extraction guides for Google Play or terminal'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {[
                { id: 'play-console' as const, label: 'Google Play Console' },
                { id: 'keytool' as const, label: 'Keytool Terminal' },
                { id: 'studio' as const, label: 'Android Studio' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGuideTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeGuideTab === tab.id
                      ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeGuideTab === 'play-console' && (
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="font-semibold text-emerald-400">
                  {lang === 'ar'
                    ? '✓ الطريقة الموصى بها إذا كان تطبيقك منشوراً على متجر Google Play:'
                    : '✓ Recommended if your app uses Google Play App Signing:'}
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                  <li>{lang === 'ar' ? 'افتح حسابك في Google Play Console.' : 'Log in to Google Play Console.'}</li>
                  <li>
                    {lang === 'ar'
                      ? 'اختر تطبيقك ثم انتقل إلى: الإعداد (Setup) > تكامل التطبيق (App Integrity).'
                      : 'Select your app and navigate to: Setup > App Integrity.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'انقر على تبويب "شهادة توقيع التطبيق" (App signing key certificate).'
                      : 'Under the "App signing" tab, locate the "App signing key certificate".'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'انسخ قيمة بصمة شهادة SHA-256 (SHA-256 certificate fingerprint) والصقها في الحقل أعلاه.'
                      : 'Copy the SHA-256 certificate fingerprint and paste it into the field above.'}
                  </li>
                </ol>
              </div>
            )}

            {activeGuideTab === 'keytool' && (
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <p className="text-slate-400">
                  {lang === 'ar'
                    ? 'إذا كنت تستخدم مفتاح توقيع محلي (.jks أو .keystore)، نفّذ هذا الأمر في التيرمينال:'
                    : 'If signing locally with a keystore file (.jks or .keystore), run this keytool command:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                  <input
                    type="text"
                    value={keystorePath}
                    onChange={(e) => setKeystorePath(e.target.value)}
                    placeholder="Keystore path"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={keyAlias}
                    onChange={(e) => setKeyAlias(e.target.value)}
                    placeholder="Key alias"
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto">
                    <code>{`keytool -list -v -keystore ${keystorePath} -alias ${keyAlias}`}</code>
                  </pre>
                </div>
              </div>
            )}

            {activeGuideTab === 'studio' && (
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                  <li>{lang === 'ar' ? 'افتح مشروع التطبيق في Android Studio.' : 'Open your project in Android Studio.'}</li>
                  <li>
                    {lang === 'ar'
                      ? 'افتح شريط Gradle الجانبي في أقصى اليمين.'
                      : 'Open the Gradle tab on the far right panel.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'انتقل إلى: [اسم المشروع] > Tasks > android > signingReport.'
                      : 'Navigate to: [Project Name] > Tasks > android > signingReport.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'انقر نقراً مزدوجاً لتشغيله، وستظهر بصمة SHA-256 في نافذة Run بالأسفل.'
                      : 'Double-click to run. Your SHA-256 fingerprint will be printed in the Run terminal.'}
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Column: Live Output & Verifier (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {/* Card: Generated JSON Output */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  assetlinks.json
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                JSON Array
              </span>
            </div>

            {/* Code Box */}
            <div className="relative mb-4">
              <pre className="max-h-72 overflow-x-auto overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-cyan-300/90 leading-relaxed scrollbar-thin">
                <code>{assetLinksJsonString}</code>
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>
                  {copied
                    ? lang === 'ar'
                      ? 'تم النسخ بنجاح!'
                      : 'Copied!'
                    : lang === 'ar'
                    ? 'نسخ محتوى JSON'
                    : 'Copy JSON'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-cyan-400" />
                <span>
                  {lang === 'ar' ? 'تحميل assetlinks.json' : 'Download File'}
                </span>
              </button>
            </div>
          </div>

          {/* Card: Live Domain AssetLinks Verifier */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'فاحص النطاق المباشر (Domain Verifier)' : 'Live AssetLinks Verifier'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'ar'
                    ? 'تحقق هل الملف متاح على موقعك ومتوافق مع شروط أندرويد'
                    : 'Check if your live domain serves assetlinks.json correctly'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testDomain}
                  onChange={(e) => setTestDomain(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyDomain}
                  disabled={isVerifying}
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? (lang === 'ar' ? 'جاري الفحص...' : 'Checking...') : lang === 'ar' ? 'فحص' : 'Test'}</span>
                </button>
              </div>

              {/* Verification Result Display */}
              {verificationResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    verificationResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {verificationResult.ok ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{lang === 'ar' ? 'الملف متاح ومتوافق بنجاح!' : 'assetlinks.json verified successfully!'}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>{lang === 'ar' ? 'فشل التحقق من الملف' : 'Verification Failed'}</span>
                      </>
                    )}
                  </div>

                  {verificationResult.url && (
                    <p className="text-[11px] font-mono break-all opacity-80">
                      {verificationResult.url}
                    </p>
                  )}

                  {verificationResult.error && (
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {verificationResult.error}
                    </p>
                  )}

                  {verificationResult.ok && (
                    <div className="space-y-1 pt-1 border-t border-emerald-500/20 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <span className="font-mono font-bold">200 OK</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>HTTPS:</span>
                        <span className="font-bold">✓ Secure</span>
                      </div>
                      {verificationResult.packageMatched !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Package Name Match:</span>
                          <span className="font-bold">
                            {verificationResult.packageMatched ? '✓ Matched' : '⚠ Not Found in File'}
                          </span>
                        </div>
                      )}
                      {verificationResult.fingerprintMatched !== undefined && (
                        <div className="flex items-center justify-between">
                          <span>Fingerprint Match:</span>
                          <span className="font-bold">
                            {verificationResult.fingerprintMatched ? '✓ Matched' : '⚠ Not Found in File'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hosting Guide Section ─── */}
      <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 mb-2">
            <Server className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'دليل الرفع والتثبيت' : 'Hosting & Placement'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {lang === 'ar' ? 'أين وكيف ترفع ملف assetlinks.json؟' : 'Where to Place assetlinks.json?'}
          </h2>
          <p className="text-sm text-slate-400">
            {lang === 'ar'
              ? 'يجب أن يكون الملف متاحاً بدقة على المسار: https://yourdomain.com/.well-known/assetlinks.json'
              : 'Must be publicly accessible at exactly: https://yourdomain.com/.well-known/assetlinks.json'}
          </p>
        </div>

        {/* Server Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {[
            { id: 'nextjs' as const, label: 'Next.js' },
            { id: 'wordpress' as const, label: 'WordPress' },
            { id: 'nginx' as const, label: 'Nginx Server' },
            { id: 'apache' as const, label: 'Apache (.htaccess)' },
          ].map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setActiveHostTab(h.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeHostTab === h.id
                  ? 'bg-cyan-500/20 border border-cyan-500 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {/* Server Guide Contents */}
        <div className="max-w-3xl mx-auto bg-slate-950 rounded-2xl border border-slate-800 p-5 sm:p-6 text-xs text-slate-300 space-y-4">
          {activeHostTab === 'nextjs' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Next.js (App Router & Pages Router)</h4>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? 'في مشاريع Next.js، يكفي إنشاء مجلد باسم .well-known داخل مجلد public في مشروعك ووضع الملف داخله:'
                  : 'Place the file inside your project\'s public directory under a .well-known folder:'}
              </p>
              <pre className="p-3 bg-slate-900 rounded-xl font-mono text-cyan-300 text-[11px] overflow-x-auto">
                <code>{`your-project/
├── public/
│   └── .well-known/
│       └── assetlinks.json`}</code>
              </pre>
              <p className="text-slate-500 text-[11px]">
                {lang === 'ar'
                  ? 'سيتكفل Next.js بتقديم الملف تلقائياً بالصيغة القياسية عبر https://domain/.well-known/assetlinks.json'
                  : 'Next.js automatically serves static files from public at the root path.'}
              </p>
            </div>
          )}

          {activeHostTab === 'wordpress' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">WordPress</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                <li>
                  {lang === 'ar'
                    ? 'افتح مدير الملفات (cPanel File Manager) أو برنامج FTP (مثل FileZilla).'
                    : 'Open your hosting File Manager or connect via FTP.'}
                </li>
                <li>
                  {lang === 'ar'
                    ? 'انتقل إلى المجلد الرئيسي لموقعك (غالباً public_html).'
                    : 'Navigate to your website root directory (usually public_html).'}
                </li>
                <li>
                  {lang === 'ar'
                    ? 'أنشئ مجلداً جديداً باسم .well-known (احرص على ظهور الملفات المخفية ذات النقطة).'
                    : 'Create a new folder named .well-known.'}
                </li>
                <li>
                  {lang === 'ar'
                    ? 'ارفع ملف assetlinks.json داخل هذا المجلد.'
                    : 'Upload assetlinks.json into that folder.'}
                </li>
              </ol>
            </div>
          )}

          {activeHostTab === 'nginx' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Nginx Configuration</h4>
              <p className="text-slate-400">
                {lang === 'ar'
                  ? 'تأكد من أن خادم Nginx يتيح الوصول لمجلد .well-known ولا يمنع الملفات المخفية:'
                  : 'Ensure Nginx allows access to .well-known and serves application/json:'}
              </p>
              <pre className="p-3 bg-slate-900 rounded-xl font-mono text-emerald-300 text-[11px] overflow-x-auto">
                <code>{`location ^~ /.well-known/assetlinks.json {
    default_type application/json;
    add_header Access-Control-Allow-Origin *;
}`}</code>
              </pre>
            </div>
          )}

          {activeHostTab === 'apache' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Apache (.htaccess)</h4>
              <p className="text-slate-400">
                {lang === 'ar'
                  ? 'إذا كان خادمك يمنع الملفات ذات النقطة، يمكنك إضافة هذا السطر في ملف .htaccess:'
                  : 'Add this rule to your root .htaccess if hidden dot-files are restricted:'}
              </p>
              <pre className="p-3 bg-slate-900 rounded-xl font-mono text-emerald-300 text-[11px] overflow-x-auto">
                <code>{`<Files "assetlinks.json">
    Header set Content-Type "application/json"
    Header set Access-Control-Allow-Origin "*"
</Files>`}</code>
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 text-center">
          {lang === 'ar' ? 'الأسئلة الشائعة حول Digital Asset Links' : 'Frequently Asked Questions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-start">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400">
              {lang === 'ar' ? 'ما فائدة assetlinks.json في تطبيقات TWA؟' : 'Why is it crucial for TWA apps?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'عند تحويل موقعك لتطبيق أندرويد عبر TWA، يتحقق نظام أندرويد من وجود هذا الملف. في حال نجاح التحقق، يتم إخفاء شريط المتصفح العلوي بالكامل ليظهر تطبيقك كتطبيق أصلي Native بشاشة كاملة.'
                : 'In Trusted Web Activities (TWA), Android verifies assetlinks.json to confirm you own the web domain. Once verified, Android hides the Chrome address bar, delivering a full-screen native app.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400">
              {lang === 'ar' ? 'لماذا يشترط أندرويد اتصال HTTPS حصراً؟' : 'Why is HTTPS strictly required?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'لأسباب أمنية لمنع هجمات الوسيط (Man-in-the-Middle)، يرفض نظام أندرويد أي ملف assetlinks يتم تقديمه عبر بروتوكول HTTP غير المشفر أو عبر شهادة SSL غير صالحة.'
                : 'To prevent DNS spoofing and Man-in-the-Middle tampering, Android rejects any assetlinks.json served over unencrypted HTTP or invalid SSL certificates.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400">
              {lang === 'ar' ? 'هل يمكن وضع أكثر من تطبيق في نفس الملف؟' : 'Can I include multiple apps or keys?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'نعم، ملف assetlinks.json عبارة عن مصفوفة JSON Array، ويمكن أن يحتوي على أكثر من بصمة SHA-256 لنفس التطبيق، أو عدة كائنات لعدة تطبيقات مختلفة تتبع لنفس الموقع.'
                : 'Yes! assetlinks.json is a JSON array. You can include multiple SHA-256 fingerprints in the same target, or multiple target app statements for different apps.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-cyan-400">
              {lang === 'ar' ? 'كم يستغرق أندرويد للتحقق من الملف؟' : 'How long does verification take?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar'
                ? 'يقوم نظام أندرويد بالتحقق من الملف فور تثبيت التطبيق على الجهاز. كما يمكن إعادة اختبار التحقق فوراً عبر أداة الفاحص المباشر بالأعلى.'
                : 'Android verifies the file upon app installation on the device. You can verify it immediately using our Live Domain Verifier tool above.'}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <div className="mt-16 rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-3 py-1 text-xs font-bold text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Appifya PWA to Android APK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {lang === 'ar'
              ? 'حوّل موقعك إلى تطبيق أندرويد APK متكامل'
              : 'Build a full Android APK & PWA with Appifya'}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
            {lang === 'ar'
              ? 'يتولى Appifya بناء تطبيقك وضبط ملفات الربط والتحقق تلقائياً، مع دعم إعلانات AdMob وحزم التوقيع الجاهزة للنشر على Google Play.'
              : 'Appifya automatically configures assetlinks, generates release-ready Android APKs, and integrates AdMob monetization in minutes.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition-all"
          >
            <span>{lang === 'ar' ? 'ابدأ بناء تطبيقك مجاناً' : 'Start building for free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
