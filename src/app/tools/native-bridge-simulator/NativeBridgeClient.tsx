'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n';
import {
  BRIDGE_APIS,
  HAPTIC_PATTERNS,
  generateSafeBridgeCode,
  BridgeApiCategory,
  SupportedLang,
} from './bridgeDefinitions';
import {
  Vibrate,
  Lock,
  Share2,
  RotateCw,
  Camera,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  BellRing,
  Compass,
  Copy,
  Check,
  Terminal,
  Smartphone,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Play,
  Volume2,
  RefreshCw,
  Trash2,
  Code2,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ConsoleLog {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn' | 'dispatch';
  message: string;
}

export default function NativeBridgeClient() {
  const { lang, t } = useLanguage();
  const currentLang: SupportedLang = lang === 'ar' || lang === 'fr' ? lang : 'en';

  const isRtl = currentLang === 'ar';

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<BridgeApiCategory>('haptics');

  // Diagnostics Console
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  // Code Generator flavor
  const [codeFlavor, setCodeFlavor] = useState<'typescript' | 'javascript' | 'react' | 'android'>('typescript');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  // Phone Mockup States
  const [isVibrating, setIsVibrating] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [orientationMode, setOrientationMode] = useState<'portrait' | 'landscape'>('portrait');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState<number>(3);
  const [cameraActive, setCameraActive] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [gyroData, setGyroData] = useState<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  // Feature detection states
  const [supportState, setSupportState] = useState<Record<string, boolean>>({});

  // Audio Context for haptic sound fallback
  const audioContextRef = useRef<AudioContext | null>(null);
  const wakeLockSentinelRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Helper to add console log
  const addLog = useCallback((type: 'info' | 'success' | 'warn' | 'dispatch', message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: Math.random().toString(36).substring(7), time, type, message }, ...prev.slice(0, 49)]);
  }, []);

  // Initialize hardware feature detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checks: Record<string, boolean> = {
      haptics: 'vibrate' in navigator,
      wakelock: 'wakeLock' in navigator,
      share: typeof navigator.share === 'function',
      orientation: !!(screen as any)?.orientation?.lock,
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      battery: 'getBattery' in navigator,
      network: 'onLine' in navigator,
      badging: 'setAppBadge' in navigator,
      sensors: 'geolocation' in navigator,
      clipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
    };
    setSupportState(checks);

    addLog('info', 'Hardware detection suite initialized.');

    // Query real battery if supported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        addLog('success', `Real battery detected: ${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'On battery'})`);
      }).catch(() => {});
    }

    // Network listeners
    const handleOnline = () => {
      setIsOnline(true);
      addLog('success', 'Network status changed: ONLINE');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog('warn', 'Network status changed: OFFLINE');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (wakeLockSentinelRef.current) {
        wakeLockSentinelRef.current.release().catch(() => {});
      }
    };
  }, [addLog]);

  // Audio synthesizer for haptic tick fallback (pleasant clicks)
  const playHapticTone = useCallback((freq = 440, duration = 0.05) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch {
      // Audio fallback silent ignore
    }
  }, []);

  // 1. TRIGGER VIBRATION
  const triggerVibrate = (pattern: number | number[], freq = 440) => {
    setIsVibrating(true);
    playHapticTone(freq, 0.06);

    let supported = false;
    try {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        supported = navigator.vibrate(pattern);
      }
    } catch {
      supported = false;
    }

    addLog(
      'dispatch',
      `navigator.vibrate([${Array.isArray(pattern) ? pattern.join(', ') : pattern}]) dispatched (${
        supported ? 'Hardware vibrated' : 'Web Audio simulated'
      })`
    );

    setTimeout(() => {
      setIsVibrating(false);
    }, 450);
  };

  // 2. TOGGLE WAKE LOCK
  const toggleWakeLock = async () => {
    if (wakeLockActive && wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
        wakeLockSentinelRef.current = null;
        setWakeLockActive(false);
        addLog('info', 'Screen Wake Lock released manually.');
      } catch (e: any) {
        addLog('warn', `Failed to release Wake Lock: ${e.message}`);
      }
      return;
    }

    try {
      if ('wakeLock' in navigator && typeof (navigator as any).wakeLock?.request === 'function') {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        sentinel.addEventListener('release', () => {
          setWakeLockActive(false);
          wakeLockSentinelRef.current = null;
          addLog('warn', 'Screen Wake Lock released by system/visibility.');
        });
        wakeLockSentinelRef.current = sentinel;
        setWakeLockActive(true);
        addLog('success', 'Screen Wake Lock acquired! Screen will not sleep.');
      } else {
        // Fallback simulation
        setWakeLockActive(true);
        addLog('info', 'Simulated Wake Lock activated (navigator.wakeLock unsupported on this browser).');
      }
    } catch (e: any) {
      addLog('warn', `Wake Lock error: ${e.name} - ${e.message}`);
      setWakeLockActive(true); // simulated
    }
  };

  // 3. TRIGGER SHARE
  const [shareData, setShareData] = useState({
    title: 'Appifya - Web to Native PWA Builder',
    text: 'Transform any website into an Android APK & PWA with zero code!',
    url: 'https://www.appifya.app',
  });

  const triggerShare = async () => {
    addLog('dispatch', `navigator.share() called with: "${shareData.title}"`);
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        addLog('success', 'Native share completed successfully.');
      } catch (err: any) {
        if (err.name === 'AbortError') {
          addLog('info', 'Share dismissed by user.');
        } else {
          addLog('warn', `Native share failed: ${err.message}. Showing simulation modal.`);
          setShareModalOpen(true);
        }
      }
    } else {
      setShareModalOpen(true);
      addLog('info', 'Web Share API not supported on this platform. Displayed simulated Android sheet.');
    }
  };

  // 4. TOGGLE ORIENTATION
  const toggleOrientation = async (mode: 'portrait' | 'landscape') => {
    setOrientationMode(mode);
    addLog('dispatch', `screen.orientation.lock("${mode}-primary") requested`);

    try {
      const screenAny = screen as any;
      if (screenAny.orientation?.lock) {
        await screenAny.orientation.lock(`${mode}-primary`);
        addLog('success', `Orientation locked to ${mode}`);
      } else {
        addLog('info', `Orientation lock simulated (requires mobile fullscreen mode).`);
      }
    } catch (err: any) {
      addLog('warn', `Native lock error: ${err.message} (Simulated 3D rotation applied)`);
    }
  };

  // 5. CAMERA & BARCODE
  const toggleCamera = async () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setCameraActive(false);
      addLog('info', 'Camera stream stopped.');
      return;
    }

    try {
      addLog('dispatch', 'navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      addLog('success', 'Camera stream active. Viewfinder rendered.');
    } catch (err: any) {
      addLog('warn', `Camera access denied or unavailable: ${err.message}`);
    }
  };

  // 6. APP BADGING
  const updateBadge = async (val: number) => {
    setBadgeCount(val);
    addLog('dispatch', `navigator.setAppBadge(${val}) called`);
    if ('setAppBadge' in navigator) {
      try {
        await (navigator as any).setAppBadge(val);
        addLog('success', `App badge set to ${val}`);
      } catch (err: any) {
        addLog('warn', `Badge API failed: ${err.message}`);
      }
    } else {
      addLog('info', `App badge visually simulated on Android home screen mockup.`);
    }
  };

  const clearBadge = async () => {
    setBadgeCount(0);
    addLog('dispatch', 'navigator.clearAppBadge() called');
    if ('clearAppBadge' in navigator) {
      try {
        await (navigator as any).clearAppBadge();
        addLog('success', 'App badge cleared');
      } catch (err: any) {
        addLog('warn', `Clear badge failed: ${err.message}`);
      }
    }
  };

  // 7. GPS LOCATION
  const requestGps = () => {
    addLog('dispatch', 'navigator.geolocation.getCurrentPosition() requested');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsData({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            acc: Math.round(pos.coords.accuracy),
          });
          addLog(
            'success',
            `GPS lock: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(
              4
            )} (±${Math.round(pos.coords.accuracy)}m)`
          );
        },
        (err) => {
          addLog('warn', `GPS Error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      addLog('warn', 'Geolocation API unsupported.');
    }
  };

  // 8. CLIPBOARD WRITE
  const [clipboardInput, setClipboardInput] = useState('https://www.appifya.app/tools');
  const [clipboardStatus, setClipboardStatus] = useState<string | null>(null);

  const testClipboardWrite = async () => {
    try {
      addLog('dispatch', `navigator.clipboard.writeText("${clipboardInput}")`);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clipboardInput);
        setClipboardStatus('copied');
        addLog('success', 'Text copied to system clipboard!');
        setTimeout(() => setClipboardStatus(null), 2500);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (e: any) {
      addLog('warn', `Clipboard write failed: ${e.message}`);
    }
  };

  // Copy code helper
  const handleCopyCode = () => {
    const code = generateSafeBridgeCode(codeFlavor);
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addLog('info', `Generated ${codeFlavor.toUpperCase()} safe bridge code copied to clipboard.`);
  };

  // Copy logs helper
  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const activeApiMeta = BRIDGE_APIS.find((a) => a.id === activeTab) || BRIDGE_APIS[0];

  return (
    <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── TOOL HEADER ── */}
      <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-6 sm:p-10 relative overflow-hidden shadow-2xl shadow-black/60">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-bold text-violet-300 mb-4 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-violet-400" />
            <span>
              {currentLang === 'ar'
                ? 'مختبر الميزات الأصلية والتوافق مع أندرويد'
                : currentLang === 'fr'
                ? 'Simulateur d’APIs Matérielles & Bridge Android'
                : 'Interactive Hardware APIs & Android Bridge Playground'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {currentLang === 'ar' ? (
              <>
                محاكي واجهات برمجة الجهاز{' '}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  (Native Bridge Simulator)
                </span>
              </>
            ) : currentLang === 'fr' ? (
              <>
                Simulateur{' '}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  Native-Bridge (JS-Android)
                </span>
              </>
            ) : (
              <>
                Native-Bridge Simulator{' '}
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  (JS-to-Android Tester)
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            {currentLang === 'ar'
              ? 'اختبر ميزات الهاتف الحقيقية (الاهتزاز، قفل الشاشة، المشاركة الأصلية، الكاميرا، والبطارية) مباشرة من متصفحك، وشاهد ردود فعل الهاتف المحاكي فوراً مع كود آمن 100% يمنع أخطاء undefined عند تحويل موقعك إلى تطبيق أندرويد.'
              : currentLang === 'fr'
              ? 'Testez les fonctionnalités matérielles (vibrations, wake lock, partage système, orientation, caméra) en direct dans votre navigateur, observez la réaction sur un mockup Android réaliste et générez du code JS/TS sécurisé sans plantage.'
              : 'Test real hardware APIs (Haptics, Screen Wake Lock, Native Share, Camera, Battery, and Orientation) directly in your browser with live visual simulation on an Android phone and zero-crash safe wrappers.'}
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap gap-2.5 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1.5 border border-zinc-700/60">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                {currentLang === 'ar'
                  ? 'كود آمن ضد الأعطال (Zero-Crash)'
                  : currentLang === 'fr'
                  ? 'Code sécurisé sans crash'
                  : 'Zero-Crash Safe Fallbacks'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1.5 border border-zinc-700/60">
              <Smartphone className="h-4 w-4 text-violet-400" />
              <span>
                {currentLang === 'ar'
                  ? 'محاكاة أندرويد حية'
                  : currentLang === 'fr'
                  ? 'Mockup Android Interactif'
                  : 'Live Android Simulation'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-3 py-1.5 border border-zinc-700/60">
              <Volume2 className="h-4 w-4 text-amber-400" />
              <span>
                {currentLang === 'ar'
                  ? 'محاكاة صوتية للاهتزاز'
                  : currentLang === 'fr'
                  ? 'Synthèse audio du retour haptique'
                  : 'Web Audio Haptic Chimes'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE: CONTROLS (LEFT) + ANDROID PHONE MOCKUP (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER: API Selector & Interactive Control Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* API Categories Horizontal Scrollbar / Grid */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 shadow-lg">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {BRIDGE_APIS.map((api) => {
                const isActive = activeTab === api.id;
                const isSupportedOnUserDevice = supportState[api.id];

                return (
                  <button
                    key={api.id}
                    onClick={() => setActiveTab(api.id)}
                    className={`shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-400/40'
                        : 'text-slate-400 hover:text-white hover:bg-zinc-800/70'
                    }`}
                  >
                    {api.id === 'haptics' && <Vibrate className="h-3.5 w-3.5" />}
                    {api.id === 'wakelock' && <Lock className="h-3.5 w-3.5" />}
                    {api.id === 'share' && <Share2 className="h-3.5 w-3.5" />}
                    {api.id === 'orientation' && <RotateCw className="h-3.5 w-3.5" />}
                    {api.id === 'camera' && <Camera className="h-3.5 w-3.5" />}
                    {api.id === 'battery' && <Battery className="h-3.5 w-3.5" />}
                    {api.id === 'network' && <Wifi className="h-3.5 w-3.5" />}
                    {api.id === 'badging' && <BellRing className="h-3.5 w-3.5" />}
                    {api.id === 'sensors' && <Compass className="h-3.5 w-3.5" />}
                    {api.id === 'clipboard' && <Copy className="h-3.5 w-3.5" />}

                    <span>{api.title[currentLang].split(' ')[0]}</span>

                    {/* Support dot */}
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSupportedOnUserDevice ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-zinc-600'
                      }`}
                      title={
                        isSupportedOnUserDevice
                          ? 'Supported on this browser'
                          : 'Not natively available on this current browser'
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE API CONTROLS PANEL */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Header of Active API */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{activeApiMeta.title[currentLang]}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      supportState[activeTab]
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {supportState[activeTab] ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>
                          {currentLang === 'ar'
                            ? 'مدعوم في متصفحك'
                            : currentLang === 'fr'
                            ? 'Supporté sur ce navigateur'
                            : 'Supported in this browser'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {currentLang === 'ar'
                            ? 'محاكاة بالصوت والفيجوال'
                            : currentLang === 'fr'
                            ? 'Simulation active'
                            : 'Simulated Mode'}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {activeApiMeta.shortDesc[currentLang]}
                </p>
              </div>

              {/* API Specs pill */}
              <div className="text-xs bg-zinc-950/80 rounded-xl p-3 border border-zinc-800 shrink-0 font-mono text-indigo-300">
                <div className="text-slate-500 text-[10px] uppercase font-semibold mb-1">Web Standard API</div>
                <code className="text-violet-300">{activeApiMeta.webApi}</code>
              </div>
            </div>

            {/* ── TAB CONTENT: HAPTICS & VIBRATION ── */}
            {activeTab === 'haptics' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                    {currentLang === 'ar'
                      ? 'اختر نمط الاهتزاز للاختبار (Vibration Patterns):'
                      : currentLang === 'fr'
                      ? 'Choisissez un motif de vibration à tester :'
                      : 'Choose vibration pattern to test:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {HAPTIC_PATTERNS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => triggerVibrate(p.pattern, p.soundFreq)}
                        className="group flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 hover:border-violet-500/50 bg-zinc-950/60 hover:bg-violet-950/20 text-start transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform">
                            <Vibrate className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                              {currentLang === 'ar' ? p.labelAr : currentLang === 'fr' ? p.labelFr : p.labelEn}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              [{p.pattern.join(', ')} ms]
                            </div>
                          </div>
                        </div>
                        <Play className="h-3.5 w-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Vibration Input */}
                <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">
                      {currentLang === 'ar'
                        ? 'اختبار نبضة مخصصة (Custom Pulse)'
                        : currentLang === 'fr'
                        ? 'Impulsion personnalisée'
                        : 'Custom Duration Pulse'}
                    </span>
                    <span className="text-xs font-mono text-violet-400 font-bold">200 ms</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => triggerVibrate(200, 500)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer"
                    >
                      <Vibrate className="h-4 w-4" />
                      <span>
                        {currentLang === 'ar'
                          ? 'إطلاق الاهتزاز الفوري'
                          : currentLang === 'fr'
                          ? 'Déclencher la vibration'
                          : 'Trigger Vibration'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Compatibility Advice */}
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-300/90 leading-relaxed flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">
                      {currentLang === 'ar'
                        ? 'ملاحظة التوافق مع الهواتف:'
                        : currentLang === 'fr'
                        ? 'Compatibilité mobile :'
                        : 'Compatibility Tip:'}{' '}
                    </strong>
                    {currentLang === 'ar'
                      ? 'مكتبة navigator.vibrate مدعومة بنسبة 100% في جميع هواتف أندرويد وتطبيقات الـ TWA والـ PWA. في أجهزة iPhone، لا تتيح آبل هذا المفتاح في سفاري، لذلك يوفر الكود الآمن المولد بالأسفل تراجعاً تلقائياً عبر Web Audio API بدون أي خطأ.'
                      : currentLang === 'fr'
                      ? 'L’API navigator.vibrate fonctionne parfaitement sur Android, TWA et Chrome. Sur iOS Safari, Apple bloque cette API : notre wrapper sécurisé généré ci-dessous effectue un fallback audio propre sans aucune erreur.'
                      : 'navigator.vibrate is 100% supported on Android Chrome, TWA, and PWA installs. On iOS Safari it is restricted, so our safe bridge wrapper provides an instant audio chime fallback with zero runtime errors.'}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: WAKE LOCK ── */}
            {activeTab === 'wakelock' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                        wakeLockActive
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-zinc-800 border border-zinc-700 text-slate-400'
                      }`}
                    >
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-1">
                        {currentLang === 'ar'
                          ? 'حالة قفل إضاءة الشاشة:'
                          : currentLang === 'fr'
                          ? 'État du Wake Lock :'
                          : 'Screen Wake Lock Status:'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            wakeLockActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {wakeLockActive
                            ? currentLang === 'ar'
                              ? 'نشط (الشاشة لن تنطفئ)'
                              : 'ACTIVE (Screen Kept Awake)'
                            : currentLang === 'ar'
                            ? 'معطل (إعدادات النظام العادية)'
                            : 'RELEASED (Normal timeout)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={toggleWakeLock}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md ${
                      wakeLockActive
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {wakeLockActive
                      ? currentLang === 'ar'
                        ? 'إلغاء القفل (Release)'
                        : 'Release Wake Lock'
                      : currentLang === 'ar'
                      ? 'تفعيل بقاء الشاشة (Request)'
                      : 'Acquire Wake Lock'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 text-xs text-slate-400 space-y-2">
                  <div className="font-bold text-white">
                    {currentLang === 'ar' ? 'أين تستخدم هذه الميزة؟' : 'Best Practice Use Cases:'}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>
                      {currentLang === 'ar'
                        ? 'تطبيقات قراءة المقالات والكتب الإلكترونية والوصفات الغذائية.'
                        : 'Reading recipes, ebooks, or long-form documentation without tapping screen.'}
                    </li>
                    <li>
                      {currentLang === 'ar'
                        ? 'تطبيقات الملاحة وتتبع المشي واللياقة البدنية أثناء التمرين.'
                        : 'Fitness workout timers, GPS navigation, and delivery maps.'}
                    </li>
                    <li>
                      {currentLang === 'ar'
                        ? 'مشغلات الفيديو والصوت والمؤتمرات المباشرة.'
                        : 'Video players, live presentations, and barcode scanning screens.'}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: NATIVE SHARE ── */}
            {activeTab === 'share' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {currentLang === 'ar' ? 'عنوان المشاركة (Title):' : 'Share Title:'}
                    </label>
                    <input
                      type="text"
                      value={shareData.title}
                      onChange={(e) => setShareData({ ...shareData, title: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {currentLang === 'ar' ? 'نص الرسالة (Text):' : 'Share Body Text:'}
                    </label>
                    <input
                      type="text"
                      value={shareData.text}
                      onChange={(e) => setShareData({ ...shareData, text: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {currentLang === 'ar' ? 'الرابط (URL):' : 'Share URL:'}
                    </label>
                    <input
                      type="text"
                      value={shareData.url}
                      onChange={(e) => setShareData({ ...shareData, url: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <button
                  onClick={triggerShare}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-xl shadow-violet-600/25 transition-all cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>
                    {currentLang === 'ar'
                      ? 'استدعاء نافذة المشاركة الأصلية (Trigger Share)'
                      : currentLang === 'fr'
                      ? 'Ouvrir le partage système'
                      : 'Invoke Native Web Share Sheet'}
                  </span>
                </button>
              </div>
            )}

            {/* ── TAB CONTENT: ORIENTATION LOCK ── */}
            {activeTab === 'orientation' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                    {currentLang === 'ar'
                      ? 'اختبار قفل وتدوير اتجاه الشاشة:'
                      : 'Test Screen Orientation Lock:'}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => toggleOrientation('portrait')}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all cursor-pointer ${
                        orientationMode === 'portrait'
                          ? 'border-violet-500 bg-violet-600/15 text-white shadow-lg shadow-violet-600/20'
                          : 'border-zinc-800 bg-zinc-950/60 text-slate-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="h-10 w-7 rounded-md border-2 border-current flex items-center justify-center">
                        <span className="h-1 w-2 rounded-full bg-current mb-auto mt-1" />
                      </div>
                      <span className="text-xs font-bold">
                        {currentLang === 'ar' ? 'عمودي (Portrait)' : 'Portrait Mode'}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleOrientation('landscape')}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all cursor-pointer ${
                        orientationMode === 'landscape'
                          ? 'border-violet-500 bg-violet-600/15 text-white shadow-lg shadow-violet-600/20'
                          : 'border-zinc-800 bg-zinc-950/60 text-slate-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="h-7 w-10 rounded-md border-2 border-current flex items-center justify-center">
                        <span className="h-2 w-1 rounded-full bg-current mr-auto ml-1" />
                      </div>
                      <span className="text-xs font-bold">
                        {currentLang === 'ar' ? 'أفقي (Landscape)' : 'Landscape Mode'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-violet-400">
                    {currentLang === 'ar' ? 'معلومة تقنية:' : 'Technical Insight:'}{' '}
                  </span>
                  {currentLang === 'ar'
                    ? 'في تطبيقات PWA المثبتة وتطبيقات TWA المحولة عبر Appifya، يمكنك فرض اتجاه ثابت داخل manifest.json عبر "orientation": "portrait" ليتم فتحه عمودياً دوماً دون الحاجة لكتابة كود جافاسكريبت إضافي.'
                    : 'Inside installed PWAs and Appifya-generated APKs, you can enforce orientation statically via manifest.json ("orientation": "portrait") or dynamically via screen.orientation.lock().'}
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: CAMERA & BARCODE ── */}
            {activeTab === 'camera' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white mb-1">
                      {currentLang === 'ar' ? 'البث المباشر للكاميرا' : 'Live Camera Feed'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentLang === 'ar'
                        ? 'يستخدم navigator.mediaDevices.getUserMedia'
                        : 'Powered by getUserMedia & BarcodeDetector'}
                    </div>
                  </div>
                  <button
                    onClick={toggleCamera}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      cameraActive
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>
                      {cameraActive
                        ? currentLang === 'ar'
                          ? 'إيقاف الكاميرا'
                          : 'Stop Camera'
                        : currentLang === 'ar'
                        ? 'تشغيل الكاميرا'
                        : 'Start Camera'}
                    </span>
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black aspect-video relative flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {!cameraActive && (
                    <div className="text-center p-6 text-slate-500">
                      <Camera className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <div className="text-xs font-semibold">
                        {currentLang === 'ar'
                          ? 'الكاميرا متوقفة حالياً. انقر على تشغيل لبدء البث.'
                          : 'Camera is currently stopped. Click start to stream.'}
                      </div>
                    </div>
                  )}

                  {/* Viewfinder crosshairs if active */}
                  {cameraActive && (
                    <div className="absolute inset-8 border-2 border-violet-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="h-4 w-4 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                      <div className="h-4 w-4 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                      <div className="h-4 w-4 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                      <div className="h-4 w-4 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                      <span className="text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded-full font-mono">
                        SCANNING BARCODES...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: BATTERY STATUS ── */}
            {activeTab === 'battery' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      {isCharging ? <BatteryCharging className="h-6 w-6" /> : <Battery className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">
                        {currentLang === 'ar' ? 'نسبة الشحن الحالية' : 'Current Battery Level'}
                      </div>
                      <div className="text-2xl font-black text-white flex items-center gap-2">
                        <span>{batteryLevel}%</span>
                        {isCharging && (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {currentLang === 'ar' ? 'جارٍ الشحن ⚡' : 'Charging ⚡'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCharging(!isCharging)}
                    className="rounded-xl px-4 py-2 text-xs font-bold border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    {isCharging ? 'Simulate Unplug' : 'Simulate Plugged In'}
                  </button>
                </div>

                {/* Simulation Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>
                      {currentLang === 'ar' ? 'محاكاة نسبة شحن مختلفة:' : 'Simulate Battery Percentage:'}
                    </span>
                    <span className="text-violet-400 font-mono">{batteryLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={batteryLevel}
                    onChange={(e) => setBatteryLevel(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: NETWORK & OFFLINE ── */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isOnline ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">
                        {currentLang === 'ar' ? 'حالة الاتصال' : 'Connectivity State'}
                      </div>
                      <div className="text-xl font-black text-white flex items-center gap-2">
                        <span>{isOnline ? 'ONLINE (4G / Wi-Fi)' : 'OFFLINE (No Connection)'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const next = !isOnline;
                      setIsOnline(next);
                      addLog(next ? 'success' : 'warn', `Simulated network status: ${next ? 'ONLINE' : 'OFFLINE'}`);
                    }}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isOnline
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isOnline ? 'Simulate Go Offline' : 'Restore Online'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white block mb-1">
                    {currentLang === 'ar' ? 'فائدة ميزة Service Worker في PWA:' : 'PWA Offline Superpower:'}
                  </strong>
                  {currentLang === 'ar'
                    ? 'عند استخدام Appifya لبناء تطبيقك، يتم تزويد تطبيقك بـ Service Worker ذكي يقوم بتخزين الصفحات مؤقتاً (Cache)، ليعمل تطبيقك بسلاسة حتى لو دخل المستخدم نفقاً أو انقطع اتصاله بالإنترنت.'
                    : 'When packaged with Appifya, your PWA gets a smart Service Worker cache strategy, ensuring users can browse even when offline.'}
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: APP BADGING ── */}
            {activeTab === 'badging' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                        <BellRing className="h-6 w-6" />
                      </div>
                      {badgeCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center ring-2 ring-zinc-950 animate-bounce">
                          {badgeCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400">
                        {currentLang === 'ar' ? 'الرقم المعروض على الأيقونة' : 'Current Badge Count'}
                      </div>
                      <div className="text-xl font-black text-white">{badgeCount} unread</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBadge(badgeCount + 1)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      onClick={clearBadge}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 99].map((num) => (
                    <button
                      key={num}
                      onClick={() => updateBadge(num)}
                      className="py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-violet-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      Set badge to {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: SENSORS (GPS & GYRO) ── */}
            {activeTab === 'sensors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-violet-400" />
                        <span>GPS Coordinates</span>
                      </span>
                      <button
                        onClick={requestGps}
                        className="text-[11px] bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Query GPS
                      </button>
                    </div>

                    {gpsData ? (
                      <div className="space-y-1 font-mono text-xs text-slate-300">
                        <div>
                          Lat: <span className="text-emerald-400">{gpsData.lat}</span>
                        </div>
                        <div>
                          Lng: <span className="text-emerald-400">{gpsData.lng}</span>
                        </div>
                        <div>
                          Accuracy: <span className="text-violet-400">±{gpsData.acc} meters</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 py-3">
                        {currentLang === 'ar'
                          ? 'اضغط على Query GPS لقراءة إحداثيات موقعك'
                          : 'Click Query GPS to read real coordinates'}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="text-xs font-bold text-white mb-2">3D Gyroscope & Orientation</div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                          <span>Alpha (Compass Heading)</span>
                          <span className="font-mono text-violet-300">{gyroData.alpha}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={gyroData.alpha}
                          onChange={(e) => setGyroData({ ...gyroData, alpha: Number(e.target.value) })}
                          className="w-full accent-violet-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                          <span>Beta (Tilt Forward/Back)</span>
                          <span className="font-mono text-emerald-300">{gyroData.beta}°</span>
                        </div>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          value={gyroData.beta}
                          onChange={(e) => setGyroData({ ...gyroData, beta: Number(e.target.value) })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB CONTENT: CLIPBOARD ── */}
            {activeTab === 'clipboard' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {currentLang === 'ar' ? 'النص المراد نسخه للحافظة:' : 'Text to write to clipboard:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clipboardInput}
                      onChange={(e) => setClipboardInput(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={testClipboardWrite}
                      className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      {clipboardStatus === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{clipboardStatus === 'copied' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── LIVE HARDWARE DIAGNOSTIC TERMINAL / LOGS ── */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {currentLang === 'ar' ? 'سجل تشخيص العمليات الحية' : 'Live Hardware Event Log'}
                </span>
                <span className="text-[10px] bg-zinc-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {logs.length} events
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLogs}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  title="Copy logs"
                >
                  {copiedLog ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  title="Clear logs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] scrollbar-thin pr-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-8 text-center">
                  {currentLang === 'ar'
                    ? 'لم يتم تسجيل أي حدث بعد. اضغط على أزرار الاختبار أعلاه.'
                    : 'No hardware events recorded yet. Trigger any test above.'}
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    {log.type === 'success' && <span className="text-emerald-400 shrink-0 font-bold">[OK]</span>}
                    {log.type === 'warn' && <span className="text-amber-400 shrink-0 font-bold">[WARN]</span>}
                    {log.type === 'dispatch' && <span className="text-violet-400 shrink-0 font-bold">[CALL]</span>}
                    {log.type === 'info' && <span className="text-cyan-400 shrink-0 font-bold">[INFO]</span>}
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-300'
                          : log.type === 'warn'
                          ? 'text-amber-200'
                          : log.type === 'dispatch'
                          ? 'text-white font-medium'
                          : 'text-slate-400'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE ANDROID PHONE MOCKUP (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[340px]">
            {/* Phone Heading Indicator */}
            <div className="text-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-violet-400" />
                <span>
                  {currentLang === 'ar'
                    ? 'شاشة محاكاة أندرويد الحية'
                    : currentLang === 'fr'
                    ? 'Écran Android Simulé'
                    : 'Live Android Device Simulator'}
                </span>
              </span>
            </div>

            {/* Android Device Body with 3D Orientation & Vibration shake */}
            <div
              style={{
                transform: `rotate(${orientationMode === 'landscape' ? 90 : 0}deg) rotateY(${
                  gyroData.beta * 0.2
                }deg) rotateX(${-gyroData.gamma * 0.2}deg)`,
                transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={`relative mx-auto w-full aspect-[9/19] rounded-[44px] p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-4 border-zinc-700 shadow-2xl shadow-violet-950/40 select-none ${
                isVibrating ? 'animate-bounce' : ''
              }`}
            >
              {/* Outer physical volume and power buttons */}
              <div className="absolute -left-[7px] top-28 h-12 w-1 bg-zinc-700 rounded-l" />
              <div className="absolute -left-[7px] top-44 h-12 w-1 bg-zinc-700 rounded-l" />
              <div className="absolute -right-[7px] top-32 h-16 w-1 bg-zinc-700 rounded-r" />

              {/* Screen Glass */}
              <div className="relative h-full w-full rounded-[34px] overflow-hidden bg-zinc-950 flex flex-col border border-white/5">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white text-[11px] font-bold z-20">
                  <span>10:24</span>
                  {/* Punch Hole Camera */}
                  <div className="h-3.5 w-3.5 rounded-full bg-black ring-2 ring-zinc-800 shadow-inner" />
                  <div className="flex items-center gap-1.5">
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3 text-rose-400" />}
                    <span className="text-[10px] font-mono">5G</span>
                    <div className="flex items-center gap-0.5">
                      <span>{batteryLevel}%</span>
                      {isCharging && <BatteryCharging className="h-3 w-3 text-emerald-400" />}
                    </div>
                  </div>
                </div>

                {/* Simulated Screen Inner Content */}
                <div className="flex-1 relative flex flex-col p-4 overflow-hidden">
                  {/* Wake Lock Screen Glow */}
                  {wakeLockActive && (
                    <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse border-2 border-emerald-500/40 rounded-2xl m-2" />
                  )}

                  {/* Top App Bar */}
                  <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 px-3 py-2 border border-zinc-800 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-black">
                        A
                      </div>
                      <span className="text-xs font-bold text-white">Appifya PWA</span>
                    </div>
                    {wakeLockActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Lock className="h-2.5 w-2.5" />
                        <span>AWAKE</span>
                      </span>
                    )}
                  </div>

                  {/* Center Device State Presentation */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-3 space-y-3">
                    {activeTab === 'haptics' && (
                      <div className="space-y-2">
                        <div
                          className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center transition-all ${
                            isVibrating
                              ? 'bg-violet-600 text-white scale-125 shadow-xl shadow-violet-500/50'
                              : 'bg-zinc-900 text-violet-400 border border-zinc-800'
                          }`}
                        >
                          <Vibrate className="h-8 w-8" />
                        </div>
                        <div className="text-xs font-bold text-white">
                          {isVibrating ? 'VIBRATING TACTILE PULSE...' : 'Ready for Haptic Feedback'}
                        </div>
                      </div>
                    )}

                    {activeTab === 'wakelock' && (
                      <div className="space-y-2">
                        <div
                          className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center ${
                            wakeLockActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-500/30'
                              : 'bg-zinc-900 text-slate-500'
                          }`}
                        >
                          <Lock className="h-8 w-8" />
                        </div>
                        <div className="text-xs font-bold text-white">
                          {wakeLockActive ? 'Screen will stay on 100%' : 'Normal display sleep enabled'}
                        </div>
                      </div>
                    )}

                    {activeTab === 'badging' && (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                            A
                          </div>
                          {badgeCount > 0 && (
                            <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center ring-4 ring-zinc-950 shadow-md">
                              {badgeCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white">App Launcher Icon Badge</div>
                      </div>
                    )}

                    {activeTab === 'sensors' && (
                      <div className="space-y-2">
                        <div
                          style={{ transform: `rotate(${gyroData.alpha}deg)` }}
                          className="h-20 w-20 mx-auto rounded-full border-2 border-dashed border-violet-400 flex items-center justify-center transition-transform"
                        >
                          <Compass className="h-8 w-8 text-violet-400" />
                        </div>
                        <div className="text-xs font-mono text-violet-300">Heading: {gyroData.alpha}°</div>
                      </div>
                    )}

                    {activeTab === 'network' && (
                      <div className="space-y-2">
                        <div
                          className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center ${
                            isOnline
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {isOnline ? <Wifi className="h-8 w-8" /> : <WifiOff className="h-8 w-8" />}
                        </div>
                        <div className="text-xs font-bold text-white">
                          {isOnline ? 'Online High Speed 5G' : 'Offline Mode (Serving PWA Cache)'}
                        </div>
                      </div>
                    )}

                    {activeTab === 'camera' && (
                      <div className="text-center text-xs text-slate-400">
                        {cameraActive ? 'Camera streaming inside control panel' : 'Camera currently inactive'}
                      </div>
                    )}

                    {activeTab === 'share' && !shareModalOpen && (
                      <div className="text-center text-xs text-slate-400">
                        <Share2 className="h-10 w-10 text-violet-400 mx-auto mb-2 opacity-50" />
                        <span>Click "Invoke Native Web Share" to open share sheet</span>
                      </div>
                    )}

                    {activeTab === 'orientation' && (
                      <div className="text-center text-xs text-slate-400">
                        <RotateCw className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                        <span className="font-bold text-white">{orientationMode.toUpperCase()} ORIENTATION</span>
                      </div>
                    )}

                    {activeTab === 'battery' && (
                      <div className="space-y-2">
                        <div className="text-3xl font-black text-white">{batteryLevel}%</div>
                        <div className="text-xs text-slate-400">{isCharging ? 'Plugged into AC' : 'Running on battery'}</div>
                      </div>
                    )}

                    {activeTab === 'clipboard' && (
                      <div className="text-center text-xs text-slate-400">
                        <Copy className="h-8 w-8 text-violet-400 mx-auto mb-2 opacity-60" />
                        <span>Ready to copy / paste</span>
                      </div>
                    )}
                  </div>

                  {/* Simulated Android Material Share Sheet Bottom Sheet */}
                  {shareModalOpen && (
                    <div className="absolute inset-x-0 bottom-0 bg-zinc-900 border-t border-zinc-700/80 rounded-t-3xl p-4 shadow-2xl z-30 animate-in slide-in-from-bottom duration-200">
                      <div className="h-1 w-10 bg-zinc-600 rounded-full mx-auto mb-3" />
                      <div className="text-xs font-bold text-white mb-1">{shareData.title}</div>
                      <div className="text-[10px] text-slate-400 truncate mb-3">{shareData.url}</div>

                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-300">
                        <div
                          onClick={() => {
                            navigator.clipboard?.writeText(shareData.url);
                            setShareModalOpen(false);
                            addLog('success', 'URL copied from share sheet');
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                        >
                          <Copy className="h-4 w-4 text-violet-400" />
                          <span>Copy</span>
                        </div>
                        <div
                          onClick={() => {
                            window.open(
                              `https://api.whatsapp.com/send?text=${encodeURIComponent(
                                shareData.title + ' ' + shareData.url
                              )}`,
                              '_blank'
                            );
                            setShareModalOpen(false);
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                        >
                          <span className="text-emerald-400 font-bold">WA</span>
                          <span>WhatsApp</span>
                        </div>
                        <div
                          onClick={() => {
                            window.open(
                              `https://t.me/share/url?url=${encodeURIComponent(
                                shareData.url
                              )}&text=${encodeURIComponent(shareData.title)}`,
                              '_blank'
                            );
                            setShareModalOpen(false);
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                        >
                          <span className="text-cyan-400 font-bold">TG</span>
                          <span>Telegram</span>
                        </div>
                        <div
                          onClick={() => setShareModalOpen(false)}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                        >
                          <span className="text-rose-400 font-bold">X</span>
                          <span>Close</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Android Navigation Gesture Bar */}
                  <div className="pt-2 pb-1 flex justify-center">
                    <div className="h-1 w-24 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CODE GENERATOR: ZERO-CRASH SAFE DEVICE BRIDGE SNIPPETS ── */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {currentLang === 'ar'
                  ? 'كود جاهز للإنتاج بدون أعطال (Zero-Crash Wrapper)'
                  : 'Production Ready Safe Bridge'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {currentLang === 'ar'
                ? 'كود الربط الآمن (Safe Device Bridge Wrapper)'
                : 'Universal Safe Device Bridge Code'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentLang === 'ar'
                ? 'انسخ هذه المكتبة المصغرة وضعها في مشروعك لتشغيل الاهتزاز وقفل الشاشة والمشاركة دون أي أخطاء في المتصفحات غير الداعمة.'
                : 'Copy and drop this helper class into your web app or PWA to safely access hardware with built-in fallbacks.'}
            </p>
          </div>

          {/* Flavor Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            {(['typescript', 'javascript', 'react', 'android'] as const).map((flavor) => (
              <button
                key={flavor}
                onClick={() => setCodeFlavor(flavor)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  codeFlavor === flavor
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {flavor === 'typescript' && 'TypeScript'}
                {flavor === 'javascript' && 'Vanilla JS'}
                {flavor === 'react' && 'React Hook'}
                {flavor === 'android' && 'Android Kotlin'}
              </button>
            ))}
          </div>
        </div>

        {/* Code Display Area */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-xs text-slate-200 overflow-x-auto">
          <button
            onClick={handleCopyCode}
            className="absolute top-4 right-4 flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer z-10"
          >
            {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <pre className="text-violet-300 leading-relaxed pr-24 whitespace-pre">
            {generateSafeBridgeCode(codeFlavor)}
          </pre>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-900/50 to-zinc-950/90 p-8 sm:p-10 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-white/5 px-3 py-1 text-xs font-bold text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready to convert your website?</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            {currentLang === 'ar'
              ? 'حوّل موقعك إلى تطبيق أندرويد حقيقي خلال دقائق'
              : 'Turn your website into a full Android APK & PWA'}
          </h3>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {currentLang === 'ar'
              ? 'تتيح لك منصة Appifya تحويل أي رابط إلى تطبيق أندرويد مع دعم ميزات الأجهزة والاهتزاز وإعلانات AdMob وملف manifest جاهز للمتجر.'
              : 'Appifya packs your web app with native Android hardware bridge capabilities, Google Play compliance, and AdMob monetization.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-violet-500/25 transition-all"
          >
            <span>{currentLang === 'ar' ? 'ابدأ بناء تطبيقك مجاناً' : 'Start building for free'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
