import { AdminAccount, EmotionalQuote, VillaRegistration } from '../types/estate';

export const DEFAULT_COMMUNITY_ADDRESS =
  'Nalluri Homes, Rameswaram Banda / Patancheru, Sanga Reddy District, Hyderabad, Telangana 502319';

export const DEFAULT_APP_LOGO_URL = '/assets/aistudio/Image_09f287d5.jpeg';

const LOCAL_REGISTRATIONS_KEY = 'nalluri_owner_registrations_v1';
const ACTIVE_OWNER_UID_KEY = 'nalluri_active_owner_uid_v1';
const ACTIVE_ADMIN_UID_KEY = 'nalluri_active_admin_uid_v1';
const PROFILE_OVERRIDES_KEY = 'nalluri_profile_overrides_v1';
const LOCAL_ADMINS_KEY = 'nalluri_admin_accounts_v1';
const APP_LOGO_KEY = 'nalluri_app_logo_v1';
const LOGIN_QUOTE_INDEX_KEY = 'nalluri_login_quote_idx_v1';

export const EMOTIONAL_LOGIN_QUOTES: EmotionalQuote[] = [
  {
    id: 'q-1',
    quote: 'A house is built with brick and stone, but Nalluri Home comes alive through the love, laughter, and kindness inside every doorway.',
    subtitle: 'May today bring quiet joy to your family and warmth to every neighbor you greet.',
    mood: 'Heart & Home',
  },
  {
    id: 'q-2',
    quote: 'Every morning inside a peaceful home is a gentle reminder: you are surrounded by people who care and a sanctuary built for your dreams.',
    subtitle: 'Take a deep breath—your family’s smiles are your greatest treasure.',
    mood: 'Gratitude',
  },
  {
    id: 'q-3',
    quote: 'Great achievements begin in peaceful mornings. Step into today with courage, grace, and the quiet confidence that you are deeply loved.',
    subtitle: 'Wishing your villa abundant harmony, health, and bright moments today.',
    mood: 'Motivation',
  },
  {
    id: 'q-4',
    quote: 'The best chapters of life are written around shared dinner tables, evening walks along Boulevard Walk, and memories made with loved ones.',
    subtitle: 'Cherish the small moments—they become the stories we hold forever.',
    mood: 'Family Bond',
  },
  {
    id: 'q-5',
    quote: 'Home is the one place where your soul rests, your heart feels safe, and every returning step feels like a warm embrace.',
    subtitle: 'Welcome home—you belong here, and your presence brightens this community.',
    mood: 'Belonging',
  },
  {
    id: 'q-6',
    quote: 'When neighbors care like family and mornings start with gratitude, an ordinary day turns into an extraordinary blessing.',
    subtitle: 'Share a warm smile today—it might be the brightest light in someone’s day.',
    mood: 'Kindness',
  },
  {
    id: 'q-7',
    quote: 'No matter how busy the world feels outside the gates, within these walls peace waits patiently for you and everyone you love.',
    subtitle: 'Protect your peace, celebrate your progress, and savor today.',
    mood: 'Serenity',
  },
  {
    id: 'q-8',
    quote: 'Strength doesn’t roar—it lives quietly in every parent’s care, every neighbor’s helping hand, and every hopeful sunrise over your terrace.',
    subtitle: 'Keep shining forward; better and brighter days are unfolding for you.',
    mood: 'Uplift',
  },
  {
    id: 'q-9',
    quote: 'Love makes a villa timeless. Every lantern lit at dusk carries a silent wish for the health, happiness, and togetherness of our loved ones.',
    subtitle: 'May your home always overflow with warmth, peace, and celebration.',
    mood: 'Warmth',
  },
  {
    id: 'q-10',
    quote: 'Today is a fresh canvas full of promise—walk gently, love deeply, forgive quickly, and create a memory worth smiling about tonight.',
    subtitle: 'Together, 231 families make Nalluri Home a living family.',
    mood: 'Inspiration',
  },
];

export function loadLoginQuoteIndex(): number {
  try {
    const raw = window.localStorage.getItem(LOGIN_QUOTE_INDEX_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed % EMOTIONAL_LOGIN_QUOTES.length;
  } catch {
    return 0;
  }
}

export function advanceLoginQuoteIndex(currentIndex?: number): number {
  const base = typeof currentIndex === 'number' ? currentIndex : loadLoginQuoteIndex();
  const next = (base + 1) % EMOTIONAL_LOGIN_QUOTES.length;
  try {
    window.localStorage.setItem(LOGIN_QUOTE_INDEX_KEY, String(next));
  } catch {
    // Ignore storage errors
  }
  return next;
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'NH';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function normalizePhoneForMatch(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function phonesMatch(storedPhone: string, inputPhone: string): boolean {
  const storedAll = (storedPhone || '').replace(/\D+/g, '');
  const inputAll = (inputPhone || '').replace(/\D+/g, '');
  if (inputAll.length < 7 || storedAll.length < 7) return false;
  if (storedAll === inputAll) return true;
  if (normalizePhoneForMatch(storedPhone) === normalizePhoneForMatch(inputPhone)) return true;
  if (inputAll.length >= 8 && storedAll.endsWith(inputAll)) return true;
  if (storedAll.length >= 8 && inputAll.endsWith(storedAll)) return true;
  return false;
}

export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordWithSalt(
  password: string,
  providedSalt?: string
): Promise<{ salt: string; hash: string }> {
  const salt = providedSalt || generateSalt(12);
  const input = `${salt}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    const hash = Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, '0')
    ).join('');
    return { salt, hash };
  }
  let acc = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    acc ^= input.charCodeAt(i);
    acc = Math.imul(acc, 16777619);
  }
  return { salt, hash: (acc >>> 0).toString(16).padStart(16, '0') };
}

export async function verifyPasswordWithSalt(
  password: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  const { hash } = await hashPasswordWithSalt(password, salt);
  return hash === expectedHash;
}

export function loadLocalRegistrations(): VillaRegistration[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VillaRegistration[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalRegistrations(list: VillaRegistration[]): void {
  try {
    window.localStorage.setItem(LOCAL_REGISTRATIONS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

export function upsertLocalRegistration(reg: VillaRegistration): VillaRegistration[] {
  const existing = loadLocalRegistrations();
  const idx = existing.findIndex((item) => item.userId === reg.userId);
  const next =
    idx >= 0
      ? existing.map((item, i) => (i === idx ? { ...item, ...reg } : item))
      : [reg, ...existing];
  saveLocalRegistrations(next);
  return next;
}

export function loadLocalAdmins(): AdminAccount[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_ADMINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AdminAccount[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalAdmins(list: AdminAccount[]): void {
  try {
    window.localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

export function upsertLocalAdmin(admin: AdminAccount): AdminAccount[] {
  const existing = loadLocalAdmins();
  const idx = existing.findIndex(
    (item) =>
      item.uid === admin.uid ||
      item.email.toLowerCase() === admin.email.toLowerCase()
  );
  const next =
    idx >= 0
      ? existing.map((item, i) => (i === idx ? { ...item, ...admin } : item))
      : [...existing, admin];
  saveLocalAdmins(next);
  return next;
}

export function removeLocalAdmin(uid: string): AdminAccount[] {
  const next = loadLocalAdmins().filter((item) => item.uid !== uid);
  saveLocalAdmins(next);
  return next;
}

export function loadActiveOwnerUid(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_OWNER_UID_KEY);
  } catch {
    return null;
  }
}

export function saveActiveOwnerUid(uid: string | null): void {
  try {
    if (uid) {
      window.localStorage.setItem(ACTIVE_OWNER_UID_KEY, uid);
    } else {
      window.localStorage.removeItem(ACTIVE_OWNER_UID_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadActiveAdminUid(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_ADMIN_UID_KEY);
  } catch {
    return null;
  }
}

export function saveActiveAdminUid(uid: string | null): void {
  try {
    if (uid) {
      window.localStorage.setItem(ACTIVE_ADMIN_UID_KEY, uid);
    } else {
      window.localStorage.removeItem(ACTIVE_ADMIN_UID_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadSavedAppLogo(): string | null {
  try {
    const val = window.localStorage.getItem(APP_LOGO_KEY);
    return val || null;
  } catch {
    return null;
  }
}

export function saveAppLogoLocally(dataUrl: string | null): void {
  try {
    if (dataUrl) {
      window.localStorage.setItem(APP_LOGO_KEY, dataUrl);
    } else {
      window.localStorage.removeItem(APP_LOGO_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export interface ProfileOverride {
  fullName?: string;
  avatarDataUrl?: string;
  address?: string;
}

export function loadProfileOverrides(): Record<string, ProfileOverride> {
  try {
    const raw = window.localStorage.getItem(PROFILE_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProfileOverride(key: string, patch: ProfileOverride): void {
  try {
    const current = loadProfileOverrides();
    const next = {
      ...current,
      [key]: {
        ...(current[key] || {}),
        ...patch,
      },
    };
    window.localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, WebP).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

export function resizeImageFileToDataUrl(
  file: File,
  maxDimension = 220,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxDimension / img.width, maxDimension / img.height, 1);
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
