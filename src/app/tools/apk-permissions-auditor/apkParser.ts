import JSZip from 'jszip';
import {
  PERMISSIONS_KNOWLEDGE_BASE,
  POPULAR_SDKS,
  type PermissionDefinition,
  type RiskLevel,
  type SdkDefinition,
} from './permissionsData';

export interface ParsedPermissionItem {
  name: string;
  simpleName: string;
  risk: RiskLevel;
  info: PermissionDefinition;
  isCustom?: boolean;
}

export interface DetectedSdkItem {
  sdk: SdkDefinition;
  detectedVia: string;
}

export interface AuditResult {
  fileName: string;
  fileSize: number;
  fileType: 'apk' | 'aab' | 'manifest';
  packageName: string;
  versionCode: string;
  versionName: string;
  minSdkVersion: string;
  targetSdkVersion: string;
  permissions: ParsedPermissionItem[];
  detectedSdks: DetectedSdkItem[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  safeCount: number;
  complianceScore: number;
  status: 'critical' | 'warning' | 'compliant';
  remediationSnippet: string;
  isTargetSdkCompliant: boolean;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Binary XML (AXML) String Pool & Node Parser
// ---------------------------------------------------------------------------

function decodeUtf16LE(bytes: Uint8Array, offset: number, lenChars: number): string {
  const chars: string[] = [];
  for (let i = 0; i < lenChars; i++) {
    const code = bytes[offset + i * 2] | (bytes[offset + i * 2 + 1] << 8);
    if (code === 0) break;
    chars.push(String.fromCharCode(code));
  }
  return chars.join('');
}

function decodeUtf8(bytes: Uint8Array, offset: number, lenBytes: number): string {
  try {
    const slice = bytes.subarray(offset, offset + lenBytes);
    return new TextDecoder('utf-8', { fatal: false }).decode(slice);
  } catch {
    let s = '';
    for (let i = 0; i < lenBytes; i++) {
      const b = bytes[offset + i];
      if (b === 0) break;
      s += String.fromCharCode(b);
    }
    return s;
  }
}

interface AxmlParseResult {
  packageName: string;
  versionCode: string;
  versionName: string;
  minSdkVersion: string;
  targetSdkVersion: string;
  permissions: string[];
}

export function parseAxml(buffer: ArrayBuffer): AxmlParseResult {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const result: AxmlParseResult = {
    packageName: '',
    versionCode: '',
    versionName: '',
    minSdkVersion: '',
    targetSdkVersion: '',
    permissions: [],
  };

  const permSet = new Set<string>();

  // 1. Fallback regex scanner across all binary string sequences first
  // Android permissions follow standard naming: android.permission.X or com.google.android.gms.permission.AD_ID
  try {
    const rawAscii = new TextDecoder('latin1').decode(bytes);
    const permRegex = /(android\.permission\.[A-Z0-9_]+|com\.google\.android\.gms\.permission\.[A-Z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = permRegex.exec(rawAscii)) !== null) {
      if (match[1]) permSet.add(match[1]);
    }

    // Try finding package name pattern
    const pkgMatch = /package="([^"]+)"|([a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,})/.exec(rawAscii);
    if (pkgMatch && !result.packageName) {
      result.packageName = pkgMatch[1] || pkgMatch[2] || '';
    }
  } catch {
    // Ignore regex fallback failures
  }

  // 2. Structured AXML String Pool Parser
  try {
    if (buffer.byteLength < 32) return result;

    const fileType = view.getUint32(0, true);
    // RES_XML_TYPE = 0x00080003
    if (fileType !== 0x00080003) {
      result.permissions = Array.from(permSet);
      return result;
    }

    let offset = 8;
    let stringPool: string[] = [];

    // Search for string pool chunk (0x001C0001)
    while (offset + 8 <= buffer.byteLength) {
      const chunkType = view.getUint32(offset, true);
      const chunkSize = view.getUint32(offset + 4, true);

      if (chunkType === 0x001c0001) {
        // String pool
        const stringCount = view.getUint32(offset + 8, true);
        const flags = view.getUint32(offset + 16, true);
        const isUtf8 = (flags & (1 << 8)) !== 0;
        const stringsStart = offset + view.getUint32(offset + 20, true);

        const offsets: number[] = [];
        for (let i = 0; i < stringCount; i++) {
          offsets.push(view.getUint32(offset + 28 + i * 4, true));
        }

        stringPool = offsets.map((strOffset) => {
          const actualPos = stringsStart + strOffset;
          if (actualPos >= bytes.length) return '';

          if (isUtf8) {
            // Read length byte (or 2 bytes if >= 0x80)
            let pos = actualPos;
            let lenChars = bytes[pos++];
            if (lenChars & 0x80) {
              lenChars = ((lenChars & 0x7f) << 8) | bytes[pos++];
            }
            let lenBytes = bytes[pos++];
            if (lenBytes & 0x80) {
              lenBytes = ((lenBytes & 0x7f) << 8) | bytes[pos++];
            }
            return decodeUtf8(bytes, pos, lenBytes);
          } else {
            // UTF-16
            let pos = actualPos;
            let lenChars = bytes[pos] | (bytes[pos + 1] << 8);
            pos += 2;
            if (lenChars & 0x8000) {
              lenChars = ((lenChars & 0x7fff) << 16) | (bytes[pos] | (bytes[pos + 1] << 8));
              pos += 2;
            }
            return decodeUtf16LE(bytes, pos, lenChars);
          }
        });

        // Scan string pool directly for permissions and package info
        for (const s of stringPool) {
          if (
            s.startsWith('android.permission.') ||
            s.startsWith('com.google.android.gms.permission.') ||
            s.includes('.permission.')
          ) {
            permSet.add(s.trim());
          }
        }

        offset += chunkSize;
        break;
      }

      if (chunkSize <= 0) break;
      offset += chunkSize;
    }

    // Now scan XML Tree Nodes for attributes (manifest package, versionCode, targetSdkVersion)
    while (offset + 8 <= buffer.byteLength) {
      const chunkType = view.getUint32(offset, true);
      const chunkSize = view.getUint32(offset + 4, true);

      // RES_XML_START_ELEMENT_TYPE = 0x00100102
      if (chunkType === 0x00100102) {
        const nameIdx = view.getUint32(offset + 20, true);
        const attrStart = view.getUint16(offset + 24, true);
        const attrSize = view.getUint16(offset + 26, true);
        const attrCount = view.getUint16(offset + 28, true);

        const tagName = stringPool[nameIdx] || '';

        for (let i = 0; i < attrCount; i++) {
          const aOffset = offset + attrStart + i * attrSize;
          if (aOffset + 20 > buffer.byteLength) break;

          const attrNameIdx = view.getUint32(aOffset + 4, true);
          const rawValueIdx = view.getUint32(aOffset + 8, true);
          const typedData = view.getUint32(aOffset + 16, true);

          const attrName = stringPool[attrNameIdx] || '';
          const rawValue = stringPool[rawValueIdx] || '';

          if (tagName === 'manifest') {
            if (attrName === 'package' && rawValue) {
              result.packageName = rawValue;
            }
            if (attrName === 'versionCode') {
              result.versionCode = rawValue || String(typedData);
            }
            if (attrName === 'versionName' && rawValue) {
              result.versionName = rawValue;
            }
          } else if (tagName === 'uses-sdk') {
            if (attrName === 'minSdkVersion') {
              result.minSdkVersion = rawValue || String(typedData);
            }
            if (attrName === 'targetSdkVersion') {
              result.targetSdkVersion = rawValue || String(typedData);
            }
          } else if (tagName === 'uses-permission') {
            if (attrName === 'name' && rawValue) {
              permSet.add(rawValue);
            }
          }
        }
      }

      if (chunkSize <= 0) break;
      offset += chunkSize;
    }
  } catch (err) {
    console.warn('AXML structure parse notice:', err);
  }

  result.permissions = Array.from(permSet).filter((p) => p && p.length > 3);
  return result;
}

// ---------------------------------------------------------------------------
// Plain Text XML Parser (for raw AndroidManifest.xml uploads)
// ---------------------------------------------------------------------------

export function parsePlainManifest(xmlText: string): AxmlParseResult {
  const result: AxmlParseResult = {
    packageName: '',
    versionCode: '',
    versionName: '',
    minSdkVersion: '',
    targetSdkVersion: '',
    permissions: [],
  };

  const permSet = new Set<string>();

  // Extract package
  const pkgMatch = xmlText.match(/package=["']([^"']+)["']/);
  if (pkgMatch) result.packageName = pkgMatch[1];

  // Extract versionCode & versionName
  const vcMatch = xmlText.match(/android:versionCode=["']([^"']+)["']/);
  if (vcMatch) result.versionCode = vcMatch[1];
  const vnMatch = xmlText.match(/android:versionName=["']([^"']+)["']/);
  if (vnMatch) result.versionName = vnMatch[1];

  // Extract SDK versions
  const minSdkMatch = xmlText.match(/android:minSdkVersion=["']([^"']+)["']/);
  if (minSdkMatch) result.minSdkVersion = minSdkMatch[1];
  const targetSdkMatch = xmlText.match(/android:targetSdkVersion=["']([^"']+)["']/);
  if (targetSdkMatch) result.targetSdkVersion = targetSdkMatch[1];

  // Extract permissions
  const permRegex = /<uses-permission[^>]+android:name=["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = permRegex.exec(xmlText)) !== null) {
    if (m[1]) permSet.add(m[1].trim());
  }

  // Also check for queries packages
  const queriesMatch = xmlText.match(/<queries>([\s\S]*?)<\/queries>/);
  if (queriesMatch && !permSet.has('android.permission.QUERY_ALL_PACKAGES')) {
    // Great! Using compliant queries block
  }

  result.permissions = Array.from(permSet);
  return result;
}

// ---------------------------------------------------------------------------
// Main File Auditor (handles .apk, .aab, and raw AndroidManifest.xml)
// ---------------------------------------------------------------------------

export async function auditAndroidFile(file: File): Promise<AuditResult> {
  const fileName = file.name;
  const fileSize = file.size;
  const lowerName = fileName.toLowerCase();

  let fileType: 'apk' | 'aab' | 'manifest' = 'apk';
  if (lowerName.endsWith('.aab')) fileType = 'aab';
  else if (lowerName.endsWith('.xml')) fileType = 'manifest';

  let parseResult: AxmlParseResult = {
    packageName: '',
    versionCode: '',
    versionName: '',
    minSdkVersion: '',
    targetSdkVersion: '',
    permissions: [],
  };

  const detectedSdks: DetectedSdkItem[] = [];
  const warnings: string[] = [];

  if (fileType === 'manifest') {
    const text = await file.text();
    parseResult = parsePlainManifest(text);
  } else {
    // It's a ZIP archive (APK or AAB)
    try {
      const zip = await JSZip.loadAsync(file);

      // 1. Locate manifest inside the archive
      // In APK: AndroidManifest.xml (root)
      // In AAB: base/manifest/AndroidManifest.xml
      let manifestEntry = zip.file('AndroidManifest.xml');
      if (!manifestEntry && fileType === 'aab') {
        manifestEntry = zip.file('base/manifest/AndroidManifest.xml');
      }
      if (!manifestEntry) {
        // Search dynamically
        const found = zip.file(/AndroidManifest\.xml$/i);
        if (found.length > 0) manifestEntry = found[0];
      }

      if (manifestEntry) {
        const manifestBuffer = await manifestEntry.async('arraybuffer');
        // Check if it starts with standard XML text "<manifest" or binary AXML
        const firstBytes = new Uint8Array(manifestBuffer.slice(0, 4));
        const isBinaryAxml = firstBytes[0] === 0x03 && firstBytes[1] === 0x00 && firstBytes[2] === 0x08 && firstBytes[3] === 0x00;

        if (isBinaryAxml) {
          parseResult = parseAxml(manifestBuffer);
        } else {
          // May be protobuf (AAB bundle) or plain text XML
          try {
            const text = new TextDecoder('utf-8').decode(manifestBuffer);
            if (text.includes('<manifest') || text.includes('android:name=')) {
              parseResult = parsePlainManifest(text);
            } else {
              // Protobuf AAB manifest or binary chunk: extract with regex
              parseResult = parseAxml(manifestBuffer);
            }
          } catch {
            parseResult = parseAxml(manifestBuffer);
          }
        }
      } else {
        warnings.push('لم يتم العثور على ملف AndroidManifest.xml داخل الحزمة المرفوعة.');
      }

      // 2. Scan DEX files and file paths for third-party SDKs
      // Gather entry paths
      const allPaths = Object.keys(zip.files);
      const dexEntries = zip.file(/classes\d*\.dex$/i);

      // Search markers in DEX bytecode strings
      const dexBuffers: string[] = [];
      for (const dex of dexEntries.slice(0, 3)) {
        try {
          // Read up to first 2.5 MB to keep browser snappy
          const buf = await dex.async('uint8array');
          const slice = buf.subarray(0, Math.min(buf.length, 2500000));
          dexBuffers.push(new TextDecoder('latin1').decode(slice));
        } catch {
          // Continue if single dex fails
        }
      }

      const combinedDexContent = dexBuffers.join(' ');
      const joinedPaths = allPaths.join(' ');

      for (const sdk of POPULAR_SDKS) {
        let isDetected = false;
        let detectedVia = '';

        for (const marker of sdk.markers) {
          if (combinedDexContent.includes(marker)) {
            isDetected = true;
            detectedVia = `مكتشف في Bytecode فئات DEX (${marker})`;
            break;
          }
          if (joinedPaths.includes(marker)) {
            isDetected = true;
            detectedVia = `مكتشف في مسارات حزم الحزمة (${marker})`;
            break;
          }
        }

        if (isDetected) {
          detectedSdks.push({ sdk, detectedVia });
        }
      }
    } catch (zipErr) {
      console.error('ZIP extraction failed:', zipErr);
      warnings.push('تعذر فك ضغط الحزمة بالكامل. يرجى التأكد من سلامة ملف APK/AAB أو رفعه بصيغة AndroidManifest.xml مباشرة.');
    }
  }

  // 3. Classify and format Permissions
  const formattedPermissions: ParsedPermissionItem[] = parseResult.permissions.map((permName) => {
    const known = PERMISSIONS_KNOWLEDGE_BASE[permName];
    if (known) {
      return {
        name: permName,
        simpleName: known.simpleName,
        risk: known.risk,
        info: known,
      };
    }

    // Unknown or custom permission
    const simple = permName.split('.').pop() || permName;
    const isSuspicious =
      permName.includes('STORAGE') ||
      permName.includes('LOCATION') ||
      permName.includes('RECORD') ||
      permName.includes('CAMERA') ||
      permName.includes('SMS');

    const customInfo: PermissionDefinition = {
      name: permName,
      simpleName: simple,
      risk: isSuspicious ? 'high' : 'medium',
      category: {
        ar: 'إذن مخصص أو غير قياسي (Custom Permission)',
        en: 'Custom or Non-Standard Permission',
        fr: 'Permission personnalisée',
      },
      title: {
        ar: `إذن خاص: ${simple}`,
        en: `Custom Permission: ${simple}`,
        fr: `Permission spécifique : ${simple}`,
      },
      description: {
        ar: `إذن معرّف باسم "${permName}". تأكد من أن تطبيقك أو المكاتب المدمجة تستخدمه لغرض مشروع.`,
        en: `Custom permission declared under "${permName}". Verify that it is required for your app workflow.`,
        fr: `Permission personnalisée déclarée sous "${permName}".`,
      },
      playPolicyNotice: {
        ar: 'إذا كان الإذن يتناول بيانات المستخدم أو وظائف النظام، فيجب توضيحه في سياسة الخصوصية.',
        en: 'Must be documented in your privacy policy if accessing sensitive user data.',
        fr: 'Doit être documenté dans votre politique de confidentialité.',
      },
      remediationAdvice: {
        ar: 'إذا لم تكن أنت من أضافه، تحقّق من مكاتب الطرف الثالث في build.gradle.',
        en: 'Check third-party dependencies in build.gradle if you did not explicitly add this.',
        fr: 'Vérifiez les dépendances tierces dans build.gradle.',
      },
    };

    return {
      name: permName,
      simpleName: simple,
      risk: isSuspicious ? 'high' : 'medium',
      info: customInfo,
      isCustom: true,
    };
  });

  // Sort by risk priority: Critical -> High -> Medium -> Safe
  const riskWeights: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    safe: 1,
  };

  formattedPermissions.sort((a, b) => riskWeights[b.risk] - riskWeights[a.risk]);

  // Counts
  const criticalCount = formattedPermissions.filter((p) => p.risk === 'critical').length;
  const highCount = formattedPermissions.filter((p) => p.risk === 'high').length;
  const mediumCount = formattedPermissions.filter((p) => p.risk === 'medium').length;
  const safeCount = formattedPermissions.filter((p) => p.risk === 'safe').length;

  // Google Play 2026 Target SDK Compliance (Target SDK must be >= 34/35)
  const targetSdkNum = parseInt(parseResult.targetSdkVersion, 10);
  const isTargetSdkCompliant = isNaN(targetSdkNum) || targetSdkNum >= 34;

  if (!isTargetSdkCompliant) {
    warnings.push(
      `متطلبات Google Play 2026 تشترط أن يكون targetSdkVersion مساوياً لـ 34 على الأقل (المكتشف: ${parseResult.targetSdkVersion || 'غير محدد'}).`,
    );
  }

  // Calculate Compliance Score (100 is perfect)
  let score = 100;
  score -= criticalCount * 30;
  score -= highCount * 12;
  score -= mediumCount * 3;
  if (!isTargetSdkCompliant) score -= 15;
  score = Math.max(0, Math.min(100, score));

  let status: 'critical' | 'warning' | 'compliant' = 'compliant';
  if (criticalCount > 0 || score < 50) {
    status = 'critical';
  } else if (highCount > 0 || score < 85) {
    status = 'warning';
  }

  // Generate actionable tools:node="remove" snippet
  const sensitivePermissions = formattedPermissions.filter((p) => p.risk === 'critical' || p.risk === 'high');
  let snippet = `<!-- أضف هذه الأسطر داخل ملف AndroidManifest.xml لحذف الأذونات الحساسة المحقونة تلقائياً -->\n`;
  snippet += `<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n`;
  snippet += `    xmlns:tools="http://schemas.android.com/tools">\n\n`;

  if (sensitivePermissions.length === 0) {
    snippet += `    <!-- تطبيقك نظيف ولا يحتاج لحذف أذونات حساسة! -->\n`;
  } else {
    for (const p of sensitivePermissions) {
      snippet += `    <!-- إزالة: ${p.info.title.ar} -->\n`;
      snippet += `    <uses-permission android:name="${p.name}" tools:node="remove" />\n\n`;
    }
  }

  if (formattedPermissions.some((p) => p.name === 'android.permission.QUERY_ALL_PACKAGES')) {
    snippet += `    <!-- بديل QUERY_ALL_PACKAGES المعتمد من جوجل: تحديد التطبيقات المستهدفة فقط -->\n`;
    snippet += `    <queries>\n`;
    snippet += `        <package android:name="com.whatsapp" />\n`;
    snippet += `        <intent>\n`;
    snippet += `            <action android:name="android.intent.action.VIEW" />\n`;
    snippet += `            <data android:scheme="https" />\n`;
    snippet += `        </intent>\n`;
    snippet += `    </queries>\n\n`;
  }

  snippet += `</manifest>`;

  return {
    fileName,
    fileSize,
    fileType,
    packageName: parseResult.packageName || 'com.example.app',
    versionCode: parseResult.versionCode || '1',
    versionName: parseResult.versionName || '1.0.0',
    minSdkVersion: parseResult.minSdkVersion || '24',
    targetSdkVersion: parseResult.targetSdkVersion || '34',
    permissions: formattedPermissions,
    detectedSdks,
    criticalCount,
    highCount,
    mediumCount,
    safeCount,
    complianceScore: score,
    status,
    remediationSnippet: snippet,
    isTargetSdkCompliant,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Pre-configured Demo Profiles (for instant 1-click test without uploading)
// ---------------------------------------------------------------------------

export function getDemoAuditResult(demoType: 'ecommerce_admob' | 'clean_pwa'): AuditResult {
  if (demoType === 'ecommerce_admob') {
    const permNames = [
      'android.permission.QUERY_ALL_PACKAGES',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.RECORD_AUDIO',
      'android.permission.POST_NOTIFICATIONS',
      'com.google.android.gms.permission.AD_ID',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.INTERNET',
      'android.permission.VIBRATE',
    ];

    const permissions: ParsedPermissionItem[] = permNames.map((name) => {
      const info = PERMISSIONS_KNOWLEDGE_BASE[name];
      return {
        name,
        simpleName: info.simpleName,
        risk: info.risk,
        info,
      };
    });

    const detectedSdks: DetectedSdkItem[] = [
      {
        sdk: POPULAR_SDKS[0], // AdMob
        detectedVia: 'مكتشف في Bytecode فئات DEX (com/google/android/gms/ads)',
      },
      {
        sdk: POPULAR_SDKS[1], // OneSignal
        detectedVia: 'مكتشف في Bytecode فئات DEX (com/onesignal)',
      },
      {
        sdk: POPULAR_SDKS[2], // Firebase Analytics
        detectedVia: 'مكتشف في حزم القياس (com/google/firebase/analytics)',
      },
      {
        sdk: POPULAR_SDKS[4], // Meta SDK
        detectedVia: 'مكتشف في مسارات الحزمة (com/facebook/FacebookSdk)',
      },
    ];

    let snippet = `<!-- إزالة الأذونات الحساسة المحقونة بالخطأ في تطبيق المتجر -->\n`;
    snippet += `<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n`;
    snippet += `    xmlns:tools="http://schemas.android.com/tools">\n\n`;
    snippet += `    <!-- إزالة استطلاع التطبيقات المحظور من Google Play -->\n`;
    snippet += `    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" tools:node="remove" />\n\n`;
    snippet += `    <!-- إزالة الموقع الجغرافي الدقيق المحقون من مكتبة الإعلانات -->\n`;
    snippet += `    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" tools:node="remove" />\n\n`;
    snippet += `    <!-- إزالة إذن تسجيل الصوت -->\n`;
    snippet += `    <uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove" />\n\n`;
    snippet += `    <!-- بديل آمن لفتح روابط واتساب والمتصفح -->\n`;
    snippet += `    <queries>\n`;
    snippet += `        <package android:name="com.whatsapp" />\n`;
    snippet += `    </queries>\n`;
    snippet += `</manifest>`;

    return {
      fileName: 'store_release_v2.4.1.apk',
      fileSize: 18452096, // ~17.6 MB
      fileType: 'apk',
      packageName: 'com.mystore.fashion.app',
      versionCode: '142',
      versionName: '2.4.1',
      minSdkVersion: '24',
      targetSdkVersion: '34',
      permissions,
      detectedSdks,
      criticalCount: 1,
      highCount: 3,
      mediumCount: 4,
      safeCount: 3,
      complianceScore: 42,
      status: 'critical',
      remediationSnippet: snippet,
      isTargetSdkCompliant: true,
      warnings: [
        'تم اكتشاف إذن QUERY_ALL_PACKAGES عالي الخطورة! قد يرفض متجر Google Play التطبيق فوراً ما لم تقدم مبرراً معتمداً.',
        'تم رصد 4 حزم SDK إعلانية وتتبعية مدمجة تتطلب تعبئة استبيان سلامة البيانات Data Safety بدقة.',
      ],
    };
  } else {
    // Clean PWA
    const permNames = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
    ];

    const permissions: ParsedPermissionItem[] = permNames.map((name) => {
      const info = PERMISSIONS_KNOWLEDGE_BASE[name];
      return {
        name,
        simpleName: info.simpleName,
        risk: info.risk,
        info,
      };
    });

    const snippet = `<!-- تطبيقك متوافق 100% مع متطلبات متجر Google Play 2026 ولا يحتوي على أي أذونات خطرة -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
</manifest>`;

    return {
      fileName: 'appifya_starter_pwa.aab',
      fileSize: 4210520, // ~4 MB
      fileType: 'aab',
      packageName: 'com.appifya.quickorder',
      versionCode: '1',
      versionName: '1.0.0',
      minSdkVersion: '24',
      targetSdkVersion: '35',
      permissions,
      detectedSdks: [],
      criticalCount: 0,
      highCount: 0,
      mediumCount: 1,
      safeCount: 3,
      complianceScore: 97,
      status: 'compliant',
      remediationSnippet: snippet,
      isTargetSdkCompliant: true,
      warnings: [],
    };
  }
}
