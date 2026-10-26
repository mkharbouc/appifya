/**
 * List of known disposable and temporary email domains.
 * Blocks disposable email services (e.g. Mohmal, Moakt, 10MinuteMail, GuerrillaMail, Mailinator, YopMail, TempMail, etc.)
 */
const DISPOSABLE_DOMAINS = new Set<string>([
  // Popular Arabic & Regional Temporary Mail
  'mohmal.com',
  'mohmal.in',
  'mohmal.im',
  'moakt.com',
  'moakt.ws',
  'moakt.co',
  'barid.me',
  'al-email.com',
  'tempr.email',
  'fawrymail.com',

  // 10 Minute Mail & Variants
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.co.uk',
  '10minemail.com',
  '10minutemailbox.com',
  '10minutemail.pro',
  '10minutenemail.de',
  '20minutemail.com',

  // Temp Mail & Variants
  'temp-mail.org',
  'temp-mail.io',
  'tempmail.com',
  'tempmail.net',
  'tempmailo.com',
  'tempmailgen.com',
  'tempmailaddress.com',
  'tempail.com',
  'tempinbox.com',
  'tmail.ws',
  'mytemp.email',
  'tempm.com',
  'tempmail24.com',

  // Guerrilla Mail & Variants
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'spam4.me',
  'pokemail.net',

  // Mailinator & Variants
  'mailinator.com',
  'mailinator2.com',
  'mailin8r.com',
  'mailinator.net',
  'safetymail.info',
  'suremail.info',
  'zippymail.info',
  'reconmail.com',
  'binkmail.com',
  'bobmail.info',

  // Yopmail & Variants
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',

  // Trash & Throwaway
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.org',
  'throwawaymail.com',
  'throwawayemailaddresses.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'dispostable.com',
  'discard.email',
  'discardmail.com',
  'spambog.com',
  'getairmail.com',
  'getnada.com',
  'emailondeck.com',
  'crazymailing.com',
  'burnermail.io',
  'dropmail.me',
  'inboxkitten.com',
  'maildrop.cc',
  'mintemail.com',
  'luxusmail.org',
  'generator.email',
  'harakirimail.com',
  'mailcatch.com',
  'mailnesia.com',
  'nada.ltd',
  'inboxbear.com',
  'inboxalias.com',
  'incognitomail.org',
  'byom.de',
  'mytempmail.com',
  'disposablemail.com',
  'fastmail.top', // (not FastMail legitimate .com)
  'sharklaser.com',
  'mytempmail.org',
  'crazymail.com',
  'mailpoof.com',
  'trashymail.com',
  'spamavert.com',
  'tempmailer.com',
]);

// Pattern to catch auto-generated disposable domain keywords
const DISPOSABLE_PATTERNS = [
  /^(.*\.)?temp[-_]?mail/i,
  /^(.*\.)?throw[-_]?away/i,
  /^(.*\.)?trash[-_]?mail/i,
  /^(.*\.)?10minute/i,
  /^(.*\.)?dispos(able)?/i,
  /^(.*\.)?fake[-_]?mail/i,
  /^(.*\.)?fake[-_]?inbox/i,
  /^(.*\.)?burner[-_]?mail/i,
  /^(.*\.)?guerrilla[-_]?mail/i,
  /^(.*\.)?mailinator/i,
  /^(.*\.)?mohmal/i,
  /^(.*\.)?moakt/i,
  /^(.*\.)?yopmail/i,
];

/**
 * Checks if the given email is from a known temporary/disposable domain.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];

  // Exact domain check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  // Subdomain check (e.g. abc.mailinator.com)
  for (const disposable of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${disposable}`)) {
      return true;
    }
  }

  // Heuristic pattern check
  for (const pattern of DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) {
      return true;
    }
  }

  return false;
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  errorAr?: string;
  errorEn?: string;
}

/**
 * Validates format and checks against disposable email providers.
 */
export function validateRegistrationEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'يرجى إدخال البريد الإلكتروني',
      errorAr: 'يرجى إدخال البريد الإلكتروني',
      errorEn: 'Please enter an email address',
    };
  }

  const clean = email.trim().toLowerCase();

  // Basic email structure regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return {
      isValid: false,
      error: 'صيغة البريد الإلكتروني غير صحيحة',
      errorAr: 'صيغة البريد الإلكتروني غير صحيحة',
      errorEn: 'Invalid email address format',
    };
  }

  const domain = clean.split('@')[1];
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2) {
    return {
      isValid: false,
      error: 'نطاق البريد الإلكتروني غير مكتمل أو غير صالح',
      errorAr: 'نطاق البريد الإلكتروني غير مكتمل أو غير صالح',
      errorEn: 'Incomplete or invalid domain extension',
    };
  }

  if (isDisposableEmail(clean)) {
    return {
      isValid: false,
      error: 'لا يُسمح باستخدام البريد الإلكتروني المؤقت أو الوهمي (Disposable). يرجى استخدام بريد رسمي أو شخصي حقيقي (مثل Gmail أو Outlook أو ياهو).',
      errorAr: 'لا يُسمح باستخدام البريد الإلكتروني المؤقت أو الوهمي (Disposable). يرجى استخدام بريد رسمي أو شخصي حقيقي (مثل Gmail أو Outlook أو ياهو).',
      errorEn: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address (e.g. Gmail, Outlook, Yahoo).',
    };
  }

  return { isValid: true };
}
