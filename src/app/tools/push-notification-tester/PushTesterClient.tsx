'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  getDefaultPushForm,
  getPresetPushForm,
  PRESET_DEFINITIONS,
  generateFcmHttpV1Payload,
  generateWebPushPayload,
  generateOneSignalPayload,
  generateCurlCommand,
  generateNodeJsSnippet,
  generatePythonSnippet,
  type PushNotificationForm,
  type SupportedLang,
} from './pushPayloads';
import {
  Bell,
  BellRing,
  Smartphone,
  Send,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Link2,
  Sliders,
  Plus,
  Trash2,
  Volume2,
  Radio,
  Clock,
  Wifi,
  BatteryCharging,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function PushTesterClient() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const supportedLang: SupportedLang = (lang === 'ar' || lang === 'fr') ? lang : 'en';

  const [selectedPreset, setSelectedPreset] = useState<string>('ecommerce');
  const [form, setForm] = useState<PushNotificationForm>(() => getDefaultPushForm((lang === 'ar' || lang === 'fr') ? lang : 'en'));
  const [activeCodeTab, setActiveCodeTab] = useState<'fcm_v1' | 'webpush' | 'onesignal' | 'curl' | 'node' | 'python'>('fcm_v1');
  const [copied, setCopied] = useState(false);
  const [isExpandedPreview, setIsExpandedPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'lockscreen' | 'shade'>('lockscreen');
  const [wallpaper, setWallpaper] = useState<'dark' | 'gradient' | 'minimal'>('gradient');
  const [browserTestStatus, setBrowserTestStatus] = useState<'idle' | 'success' | 'permission_denied' | 'unsupported'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');

  // Automatically update the sample notification text when user changes site language
  const prevLangRef = useRef(lang);
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      const currentLang: SupportedLang = (lang === 'ar' || lang === 'fr') ? lang : 'en';
      setForm(getPresetPushForm(selectedPreset, currentLang));
    }
  }, [lang, selectedPreset]);

  const t = (ar: string, en: string, fr: string) => {
    if (lang === 'ar') return ar;
    if (lang === 'fr') return fr;
    return en;
  };

  const handlePresetSelect = (key: string) => {
    setSelectedPreset(key);
    setForm(getPresetPushForm(key, supportedLang));
  };

  const handleAddAction = () => {
    if (form.actions.length >= 3) return;
    const n = form.actions.length + 1;
    const defaultTitle = t(`زر ${n}`, `Button ${n}`, `Bouton ${n}`);
    setForm((prev) => ({
      ...prev,
      actions: [...prev.actions, { action: `action_${n}`, title: defaultTitle }],
    }));
  };

  const handleRemoveAction = (index: number) => {
    setForm((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleAddCustomData = () => {
    setForm((prev) => ({
      ...prev,
      customData: [...prev.customData, { key: '', value: '' }],
    }));
  };

  const handleRemoveCustomData = (index: number) => {
    setForm((prev) => ({
      ...prev,
      customData: prev.customData.filter((_, i) => i !== index),
    }));
  };

  const copyCode = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live Native Browser Notification Test
  const triggerBrowserTest = async () => {
    setBrowserTestStatus('idle');
    setTestErrorMessage('');

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserTestStatus('unsupported');
      setTestErrorMessage(
        t(
          'متصفحك الحالي لا يدعم Web Notification API.',
          'Your current browser does not support the Web Notification API.',
          'Votre navigateur ne prend pas en charge l’API Web Notification.',
        ),
      );
      return;
    }

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        setBrowserTestStatus('permission_denied');
        setTestErrorMessage(
          t(
            'تم رفض إذن الإشعارات من إعدادات المتصفح. يرجى تفعيل الإذن لتجربة الإشعار الحقيقي.',
            'Notification permission was denied. Please allow notifications in your browser address bar.',
            'L’autorisation de notification a été refusée dans les paramètres de votre navigateur.',
          ),
        );
        return;
      }

      // Play pleasant audio chime via Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {
        // Safe fallback
      }

      // Trigger native notification
      const options: NotificationOptions & { image?: string } = {
        body: form.body,
        icon: form.iconUrl || '/icon.svg',
        image: form.imageUrl || undefined,
        tag: form.tag || 'appifya-live-test',
        data: { url: form.targetUrl || '/' },
      };
      const notification = new Notification(form.title, options);

      notification.onclick = () => {
        window.focus();
        if (form.targetUrl) {
          window.open(form.targetUrl, '_blank');
        }
        notification.close();
      };

      setBrowserTestStatus('success');
      setTimeout(() => setBrowserTestStatus('idle'), 4000);
    } catch (err) {
      console.error('Push test error:', err);
      setBrowserTestStatus('permission_denied');
      setTestErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'fcm_v1':
        return generateFcmHttpV1Payload(form);
      case 'webpush':
        return generateWebPushPayload(form);
      case 'onesignal':
        return generateOneSignalPayload(form);
      case 'curl':
        return generateCurlCommand(form);
      case 'node':
        return generateNodeJsSnippet(form);
      case 'python':
        return generatePythonSnippet(form);
    }
  };

  return (
    <div className="space-y-10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── TOP HERO BANNER ── */}
      <section className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
          <BellRing className="h-4 w-4 text-amber-400 animate-pulse" />
          <span>
            {t(
              'صانع ومختبر حمولة الإشعارات الفورية (FCM & Web Push)',
              'Push Notification Payload Builder & Tester',
              'Générateur & Testeur de Notifications Push',
            )}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {t(
            'صمم واختبر إشعارات أندرويد و PWA بصرياً',
            'Push Notification Payload Builder & Tester',
            'Testeur Visuel de Notifications Push Android & PWA',
          )}
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          {t(
            'تجنب أخطاء عدم ظهور الصور أو تعطل الروابط الداخلية. شاهد معاينة حية واقعية لكيفية ظهور الإشعار على شاشة قفل أندرويد، ولّد كود FCM HTTP v1 و Web Push و OneSignal الجاهز مع اختبار فوري في متصفحك.',
            'Eliminate broken deep links and missing images. Live interactive visual preview on real Android lock screen, auto-generating compliant FCM HTTP v1, Web Push, and cURL commands with instant local browser test.',
            'Prévisualisez vos notifications sur l’écran de verrouillage Android et générez les payloads conformes FCM v1, Web Push et cURL.',
          )}
        </p>
      </section>

      {/* ── PRESETS BAR ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 me-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{t('نماذج جاهزة:', 'Presets:', 'Modèles :')}</span>
        </span>
        {Object.entries(PRESET_DEFINITIONS).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePresetSelect(key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
              selectedPreset === key
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-850'
            }`}
          >
            {item.label[supportedLang] || item.label.en}
          </button>
        ))}
      </div>

      {/* ── MAIN WORKSPACE: BUILDER (LEFT) + LIVE DEVICE PREVIEW (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
        {/* LEFT COLUMN: FORM CONTROLS (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-400" />
              <span>{t('تخصيص بيانات الإشعار (Payload Content)', 'Notification Content & Options', 'Contenu de la notification')}</span>
            </h2>

            <button
              type="button"
              onClick={triggerBrowserTest}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t('إرسال تجريبي للمتصفح الآن', 'Test on this Browser', 'Tester sur ce navigateur')}</span>
            </button>
          </div>

          {browserTestStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{t('تم إطلاق الإشعار بنجاح! راجع شريط التنبيهات في نظامك الآن.', 'Notification dispatched! Check your system notification center now.', 'Notification envoyée avec succès !')}</span>
            </div>
          )}

          {browserTestStatus === 'permission_denied' && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{testErrorMessage}</span>
            </div>
          )}

          {/* Title & Body */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t('عنوان الإشعار (Title)', 'Notification Title', 'Titre de la notification')} <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">{form.title.length}/65</span>
              </div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('تخفيضات نهاية الأسبوع...', 'Weekend Flash Sale...', 'Vente Flash du Week-end...')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t('نص الرسالة (Body Message)', 'Message Body', 'Corps du message')} <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">{form.body.length}/240</span>
              </div>
              <textarea
                rows={3}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={t('اكتب محتوى الرسالة الترويجية أو التنبيه هنا...', 'Enter promotional message or alert content here...', 'Saisissez le contenu du message ici...')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Image & Icon URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                <span>{t('رابط الصورة الكبيرة (Big Picture URL)', 'Big Image URL (Hero)', 'Image grand format (URL)')}</span>
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t('صورة بنسبة 2:1 لظهور مبهر على أندرويد والويب.', '2:1 aspect ratio banner image for high engagement.', 'Format paysage 2:1 recommandé.')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>{t('رابط التوجيه (Deep Link / Target URL)', 'Target Deep Link URL', 'Lien de destination')}</span>
              </label>
              <input
                type="url"
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                placeholder="https://myapp.com/products/sale"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t('يفتح هذا الرابط عند نقر المستخدم على الإشعار.', 'Opens this web link or deep link when clicked.', 'Lien ouvert au clic sur la notification.')}
              </span>
            </div>
          </div>

          {/* Android Channel & Priority Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('قناة أندرويد (Channel ID)', 'Android Channel ID', 'Canal Android (Channel ID)')}
              </label>
              <input
                type="text"
                value={form.channelId}
                onChange={(e) => setForm({ ...form, channelId: e.target.value })}
                placeholder="promotions"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('الأولوية (Priority)', 'Priority', 'Priorité')}
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as 'high' | 'normal' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="high">{t('HIGH (إيقاظ فوري للشاشة)', 'HIGH (Instant wake-up alert)', 'HIGH (Réveil immédiat de l’écran)')}</option>
                <option value="normal">{t('NORMAL (عادي - توفير بطارية)', 'NORMAL (Standard battery-saving)', 'NORMAL (Standard économie)')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('وسم الإشعار (Tag / Collapse)', 'Tag (Collapse Key)', 'Tag (Remplacement)')}
              </label>
              <input
                type="text"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="promo-tag"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{t('أزرار الإجراء السريع (Action Buttons)', 'Quick Action Buttons', 'Boutons d’action')}</span>
                <span className="text-[10px] text-slate-500">({form.actions.length}/3)</span>
              </label>
              {form.actions.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddAction}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('إضافة زر', 'Add Button', 'Ajouter')}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {form.actions.map((act, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    value={act.title}
                    onChange={(e) => {
                      const updated = [...form.actions];
                      updated[idx].title = e.target.value;
                      setForm({ ...form, actions: updated });
                    }}
                    placeholder={t('عنوان الزر (مثلاً: تسوق الآن)', 'Button Label (e.g. Shop Now)', 'Libellé du bouton')}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={act.action}
                    onChange={(e) => {
                      const updated = [...form.actions];
                      updated[idx].action = e.target.value;
                      setForm({ ...form, actions: updated });
                    }}
                    placeholder="action_id"
                    dir="ltr"
                    className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Remove button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Key-Value Data Payload */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{t('بيانات إضافية مخصصة (Custom Data Payload)', 'Custom Data Payload (Key-Value)', 'Données personnalisées (Data Payload)')}</span>
              </label>
              <button
                type="button"
                onClick={handleAddCustomData}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('إضافة مفتاح', 'Add Key', 'Ajouter une clé')}</span>
              </button>
            </div>

            <div className="space-y-2">
              {form.customData.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800" dir="ltr">
                  <input
                    type="text"
                    value={d.key}
                    onChange={(e) => {
                      const updated = [...form.customData];
                      updated[idx].key = e.target.value;
                      setForm({ ...form, customData: updated });
                    }}
                    placeholder="key (e.g. order_id)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={d.value}
                    onChange={(e) => {
                      const updated = [...form.customData];
                      updated[idx].value = e.target.value;
                      setForm({ ...form, customData: updated });
                    }}
                    placeholder="value"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomData(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC ANDROID DEVICE MOCKUP (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          {/* Controls Bar for Preview */}
          <div className="flex items-center justify-between text-xs font-bold bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewMode('lockscreen')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  previewMode === 'lockscreen' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('شاشة القفل', 'Lock Screen', 'Écran verrouillé')}
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('shade')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  previewMode === 'shade' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('الستارة المنسدلة', 'Notification Shade', 'Volet de notif.')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsExpandedPreview(!isExpandedPreview)}
              className="text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-[11px]"
              title="Toggle expanded / collapsed"
            >
              {isExpandedPreview ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isExpandedPreview ? t('تصغير', 'Collapse', 'Réduire') : t('توسيع', 'Expand', 'Développer')}</span>
            </button>
          </div>

          {/* Smartphone Frame */}
          <div className="relative mx-auto w-full max-w-[340px] rounded-[44px] border-[10px] border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-indigo-950/60 overflow-hidden select-none">
            {/* Punch hole camera */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-4 bg-black rounded-full z-30 border border-slate-800/80"></div>

            {/* Device Screen Interior */}
            <div
              className={`relative rounded-[32px] overflow-hidden min-h-[580px] flex flex-col justify-between p-4 transition-all duration-300 ${
                wallpaper === 'gradient'
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950'
                  : wallpaper === 'dark'
                  ? 'bg-slate-950'
                  : 'bg-gradient-to-b from-blue-950 via-slate-900 to-black'
              }`}
            >
              {/* Android Status Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono font-bold px-2 pt-1 z-20">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" />
                  <Radio className="h-3 w-3" />
                  <BatteryCharging className="h-4 w-4 text-emerald-400" />
                </div>
              </div>

              {/* Lock Screen Clock (When in LockScreen mode) */}
              {previewMode === 'lockscreen' && (
                <div className="text-center py-6 space-y-1 z-10">
                  <div className="text-5xl font-black text-white/90 tracking-tight font-sans">09:41</div>
                  <div className="text-xs text-slate-300 font-medium">
                    {t('الأربعاء، 26 أكتوبر', 'Wednesday, Oct 26', 'Mercredi 26 oct.')}
                  </div>
                </div>
              )}

              {/* Notification Shade Header (When in Shade mode) */}
              {previewMode === 'shade' && (
                <div className="text-xs font-bold text-slate-400 px-1 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/60">
                  <span>{t('الإشعارات الصامتة والمهمة', 'Notifications', 'Notifications')}</span>
                  <span className="text-[10px] text-indigo-400 font-mono">{t('مسح الكل', 'Clear all', 'Tout effacer')}</span>
                </div>
              )}

              {/* THE NOTIFICATION CARD (Android 14 Material You Style) */}
              <div className="my-auto z-20">
                <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-md p-3.5 shadow-xl space-y-2.5 transition-all">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <img src={form.iconUrl || '/icon.svg'} alt="app" className="h-3.5 w-3.5 rounded-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-white truncate">Appifya</span>
                      <span className="text-slate-500 text-[10px]">·</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t('الآن', 'now', 'mnt')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsExpandedPreview(!isExpandedPreview)}
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      {isExpandedPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-xs font-black text-white leading-snug">{form.title || t('عنوان الإشعار', 'Notification Title', 'Titre')}</h4>
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-3 font-normal">
                        {form.body || t('نص الرسالة...', 'Message body goes here...', 'Corps du message...')}
                      </p>
                    </div>

                    {/* Small thumbnail when collapsed */}
                    {!isExpandedPreview && form.imageUrl && (
                      <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                        <img src={form.imageUrl} alt="preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Big Hero Image when Expanded */}
                  {isExpandedPreview && form.imageUrl && (
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 aspect-[2/1] w-full mt-1.5 shadow-inner">
                      <img src={form.imageUrl} alt="hero preview" className="h-full w-full object-cover" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  {form.actions.length > 0 && isExpandedPreview && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
                      {form.actions.map((act, i) => (
                        <div
                          key={i}
                          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-indigo-300 border border-slate-700/80 shadow-sm transition-colors cursor-pointer"
                        >
                          {act.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lockscreen Bottom Icons */}
              <div className="flex items-center justify-between text-slate-400 px-3 pb-1 z-10 text-[10px]">
                <span>{t('اسحب للأعلى للفتح', 'Swipe up to unlock', 'Glissez pour déverrouiller')}</span>
                <span className="font-mono">Appifya OS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CODE & PAYLOAD EXPORT SECTION ── */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-cyan-400" />
              <span>{t('الحمولة البرمجية الجاهزة للإرسال (Multi-Format Payload)', 'Generated Payloads & Code Snippets', 'Payloads & Snippets Générés')}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                'اختر الصيغة المطلوبة لنسخ الكود واستخدامه فوراً في الباك إند أو سطر الأوامر.',
                'Select your backend framework or protocol to copy production-ready payload code.',
                'Sélectionnez votre framework pour copier le code de la notification.',
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyCode(getActiveCode())}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t('تم النسخ!', 'Copied!', 'Copié !') : t('نسخ الكود', 'Copy Code', 'Copier')}</span>
            </button>
          </div>
        </div>

        {/* Protocol Selector Tabs */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveCodeTab('fcm_v1')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeCodeTab === 'fcm_v1'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🔥 FCM HTTP v1 (Google Cloud 2026)
          </button>

          <button
            type="button"
            onClick={() => setActiveCodeTab('webpush')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeCodeTab === 'webpush'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🌐 Web Push (Service Worker)
          </button>

          <button
            type="button"
            onClick={() => setActiveCodeTab('curl')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeCodeTab === 'curl'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            💻 cURL Terminal
          </button>

          <button
            type="button"
            onClick={() => setActiveCodeTab('node')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeCodeTab === 'node'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🟢 Node.js (firebase-admin)
          </button>

          <button
            type="button"
            onClick={() => setActiveCodeTab('python')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeCodeTab === 'python'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🐍 Python (firebase-admin)
          </button>

          <button
            type="button"
            onClick={() => setActiveCodeTab('onesignal')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeCodeTab === 'onesignal'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ⚡ OneSignal API v9
          </button>
        </div>

        {/* Code Display Area */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5 overflow-x-auto shadow-inner" dir="ltr">
          <pre className="text-xs font-mono text-cyan-300 leading-relaxed">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </section>

      {/* ── EDUCATIONAL GUIDE ACCORDION ── */}
      <section className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t('أهم أسرار نجاح إشعارات أندرويد و PWA في 2026', 'Android & PWA Push Notifications Best Practices', 'Bonnes pratiques pour les notifications Push')}
          </h3>
          <p className="text-xs text-slate-400">
            {t(
              'تفاصيل تقنية أساسية لضمان وصول التنبيهات وتفادي مشاكل عدم ظهور الصور أو الأصوات.',
              'Essential technical requirements to ensure instant delivery and rich media rendering.',
              'Points techniques essentiels pour assurer la livraison et l’affichage des images.',
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>{t('أندرويد 13+ وقنوات الإشعار (NotificationChannel)', 'Android 13+ Notification Channels', 'Canaux Android 13+')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'بدءاً من Android 8 وحتى أندرويد 14/15، لن يظهر أي إشعار إذا لم تقم بتحديد channel_id صالح تم إنشاؤه مسبقاً في كود التطبيق، مع ضرورة طلب إذن POST_NOTIFICATIONS عند تشغيل التطبيق.',
                'Android 13+ requires both runtime POST_NOTIFICATIONS consent and a pre-registered channel_id in your native code, otherwise the system drops the alert silently.',
                'Android 13+ exige l’autorisation d’exécution et un channel_id valide pré-enregistré dans l’application.',
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>{t('لماذا تفشل الصور الكبيرة (Big Picture) أحياناً؟', 'Why do Hero Images fail to load?', 'Pourquoi les images échouent-elles ?')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'يجب أن يكون رابط الصورة مباشراً وينتهي بـ (.jpg أو .png أو .webp) ويعمل ببروتوكول HTTPS المشفر، مع حجم لا يتجاوز 1 ميجابايت لضمان تنزيله خلال مهلة نظام أندرويد القصيرة.',
                'Image URLs must be direct HTTPS endpoints (JPEG/PNG/WebP) and under 1MB so the OS background downloader can fetch it before the notification timeout.',
                'Les URLs d’images doivent être en HTTPS direct et peser moins de 1 Mo pour respecter le délai de téléchargement.',
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span>{t('الفرق بين Notification و Data Payload في FCM', 'FCM Notification vs Data Payload', 'Notification vs Data Payload')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'حقل notification يعالجه نظام أندرويد تلقائياً في شريط التنبيهات حتى لو كان التطبيق مغلقاً. أما حقل data فيتم تسليمه لكود تطبيقك (onMessageReceived) لمعالجة الروابط الداخلية والإجراءات الخاصة.',
                'The notification object is handled by the OS system tray when app is backgrounded. The data object is delivered to your client background worker for custom routing.',
                'L’objet notification est géré automatiquement par le système, tandis que data est transmis à votre service worker.',
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-indigo-300 flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span>{t('الانتقال إلى معيار FCM HTTP v1 الرسمي', 'Migrating to FCM HTTP v1 standard', 'Migration vers FCM HTTP v1')}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {t(
                'قامت جوجل بإيقاف واجهة Legacy FCM القديمة (مفاتيح السيرفر القديمة). المعيار الجديد FCM HTTP v1 يعتمد على رموز OAuth 2.0 ويمنحك تخصيصاً منفصلاً لأندرويد والويب وiOS.',
                'Google deprecated the legacy server key API in June 2024. FCM HTTP v1 uses OAuth2 access tokens and allows fine-grained overrides per platform.',
                'Google a supprimé l’ancienne API FCM. La version v1 utilise OAuth2 et sépare la configuration Android et Web.',
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
