import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  Bell,
  Check,
  CheckCheck,
  Crown,
  KeyRound,
  LogOut,
  MapPin,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { AuthAndProfileModal } from './components/AuthAndProfileModal';
import { FastPassModal } from './components/FastPassModal';
import { AmenitiesScreen } from './components/screens/AmenitiesScreen';
import { CommunityScreen } from './components/screens/CommunityScreen';
import {
  DirectoryScreen,
  DirectorySubTab,
} from './components/screens/DirectoryScreen';
import { GateAccessScreen } from './components/screens/GateAccessScreen';
import { OverviewScreen } from './components/screens/OverviewScreen';
import {
  NalluriHomesEmblem,
  TrendyNavIcon,
  TrendyNavTabId,
  UserAvatar,
} from './components/ui/EstatePrimitives';
import {
  INITIAL_BOOKINGS,
  INITIAL_CLIMATE_ZONES,
  INITIAL_IRRIGATION,
  INITIAL_LIGHTING_SCENES,
  INITIAL_MESSAGES,
  INITIAL_PARCELS,
  INITIAL_PASSES,
  INITIAL_POSTS,
  INITIAL_VEHICLES,
  RESIDENT_PROFILE,
} from './data/initialEstateData';
import {
  BASE_231_VILLAS,
  EmergencyDesk,
  ENCLAVE_EMERGENCY_DESKS,
  VillaRecord,
} from './data/villas231';
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  ActiveSessionProfile,
  AdminAccount,
  AmenityBooking,
  AmenityFacility,
  ClimateZone,
  CommunityCategoryTag,
  CommunityPost,
  ConciergeMessage,
  DirectoryContact,
  GuestPass,
  HouseholdVehicle,
  IrrigationZone,
  LightingScene,
  ParcelItem,
  ScreenId,
  VillaDirectorySync,
  VillaRegistration,
} from './types/estate';
import {
  advanceLoginQuoteIndex,
  DEFAULT_APP_LOGO_URL,
  DEFAULT_COMMUNITY_ADDRESS,
  EMOTIONAL_LOGIN_QUOTES,
  getInitials,
  hashPasswordWithSalt,
  loadActiveAdminUid,
  loadActiveOwnerUid,
  loadLocalAdmins,
  loadLocalRegistrations,
  loadLoginQuoteIndex,
  loadProfileOverrides,
  loadSavedAppLogo,
  phonesMatch,
  ProfileOverride,
  removeLocalAdmin,
  saveActiveAdminUid,
  saveActiveOwnerUid,
  saveAppLogoLocally,
  saveProfileOverride,
  upsertLocalAdmin,
  upsertLocalRegistration,
  verifyPasswordWithSalt,
} from './utils/ownerAuth';

const LOCAL_EMERGENCY_DESKS_KEY = 'nalluri_emergency_desks_v1';
const LOCAL_VILLAS_SYNC_KEY = 'nalluri_local_villas_v1';
const LOCAL_READ_ALERTS_KEY = 'nalluri_read_alerts_v1';

interface EnclaveAlert {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  targetScreen: ScreenId;
  targetDirectoryTab?: DirectorySubTab;
}

const INITIAL_ENCLAVE_ALERTS: EnclaveAlert[] = [
  {
    id: 'alert-sankranti-reels',
    title: 'Sankranti Festival Reels Live',
    description: 'Watch neighbor celebration videos & occupation spotlights in Community.',
    timeLabel: '10m ago',
    targetScreen: 'community',
  },
  {
    id: 'alert-villas-231',
    title: '231 Villas Registry Live',
    description: 'Emergency desk extensions and owner directory verified.',
    timeLabel: '35m ago',
    targetScreen: 'directory',
    targetDirectoryTab: 'villas231',
  },
  {
    id: 'alert-gate-fastpass',
    title: 'North Pavilion Gate FastPass Ready',
    description: 'Encrypted QR visitor passes ready for instant guest sharing.',
    timeLabel: '1h ago',
    targetScreen: 'gate',
  },
  {
    id: 'alert-amenities-evening',
    title: 'Badminton Court & Pool Slots Open',
    description: 'Reserve evening clubhouse and wellness slots for your villa.',
    timeLabel: '3h ago',
    targetScreen: 'amenities',
  },
];

const NAV_ITEMS: Array<{
  id: TrendyNavTabId;
  label: string;
  mobileLabel: string;
  activeTextClass: string;
  accentBarClass: string;
}> = [
  {
    id: 'home',
    label: 'Home',
    mobileLabel: 'Home',
    activeTextClass: 'text-[#059669]',
    accentBarClass: 'bg-gradient-to-r from-[#059669] to-[#D97706]',
  },
  {
    id: 'gate',
    label: 'Gate Pass',
    mobileLabel: 'Gate Pass',
    activeTextClass: 'text-[#0284C7]',
    accentBarClass: 'bg-gradient-to-r from-[#0284C7] to-[#0D9488]',
  },
  {
    id: 'amenities',
    label: 'Amenities',
    mobileLabel: 'Amenities',
    activeTextClass: 'text-[#0D9488]',
    accentBarClass: 'bg-gradient-to-r from-[#0D9488] to-[#F59E0B]',
  },
  {
    id: 'community',
    label: 'Community',
    mobileLabel: 'Community',
    activeTextClass: 'text-[#E11D48]',
    accentBarClass: 'bg-gradient-to-r from-[#E11D48] to-[#7C3AED]',
  },
  {
    id: 'directory',
    label: '231 Villas',
    mobileLabel: '231 Villas',
    activeTextClass: 'text-[#4F46E5]',
    accentBarClass: 'bg-gradient-to-r from-[#4F46E5] to-[#C59B48]',
  },
];

const SCREEN_THEME_CLASS: Record<ScreenId, string> = {
  home: 'estate-theme-home',
  gate: 'estate-theme-gate',
  amenities: 'estate-theme-amenities',
  community: 'estate-theme-community',
  directory: 'estate-theme-directory',
};

function loadSavedEmergencyDesks(): Record<string, EmergencyDesk> {
  try {
    const raw = window.localStorage.getItem(LOCAL_EMERGENCY_DESKS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadSavedVillasSync(): Record<number, VillaDirectorySync> {
  try {
    const raw = window.localStorage.getItem(LOCAL_VILLAS_SYNC_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadReadAlertIds(): string[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_READ_ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [navDirection, setNavDirection] = useState<1 | -1>(1);
  const [navPulse, setNavPulse] = useState<Record<TrendyNavTabId, number>>({
    home: 0,
    gate: 0,
    amenities: 0,
    community: 0,
    directory: 0,
  });
  const [directoryTab, setDirectoryTab] = useState<DirectorySubTab>('villas231');

  // Firebase Auth & Firestore RBAC state
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);
  const [myCloudRegistration, setMyCloudRegistration] = useState<VillaRegistration | null>(null);
  const [cloudRegistrations, setCloudRegistrations] = useState<VillaRegistration[]>([]);
  const [cloudAdmins, setCloudAdmins] = useState<AdminAccount[]>([]);
  const [cloudAppLogoUrl, setCloudAppLogoUrl] = useState<string | null>(null);
  const [cloudSyncedVillas, setCloudSyncedVillas] = useState<Record<number, VillaDirectorySync>>({});
  const [cloudEmergencyDesks, setCloudEmergencyDesks] = useState<Record<string, EmergencyDesk>>({});

  // Local Owner & Multi-Admin Credentials + Branding Mirrors
  const [localRegistrations, setLocalRegistrations] = useState<VillaRegistration[]>(() =>
    loadLocalRegistrations()
  );
  const [localAdmins, setLocalAdmins] = useState<AdminAccount[]>(() => loadLocalAdmins());
  const [localAppLogoUrl, setLocalAppLogoUrl] = useState<string | null>(() => loadSavedAppLogo());
  const [activeOwnerUid, setActiveOwnerUid] = useState<string | null>(() => loadActiveOwnerUid());
  const [activeAdminUid, setActiveAdminUid] = useState<string | null>(() => loadActiveAdminUid());
  const [lastSubmittedRegUid, setLastSubmittedRegUid] = useState<string | null>(null);
  const [loginQuoteIndex, setLoginQuoteIndex] = useState<number>(() => loadLoginQuoteIndex());
  const [profileOverrides, setProfileOverrides] = useState<Record<string, ProfileOverride>>(() =>
    loadProfileOverrides()
  );
  const [localEmergencyDesks, setLocalEmergencyDesks] = useState<Record<string, EmergencyDesk>>(() =>
    loadSavedEmergencyDesks()
  );
  const [localSyncedVillas, setLocalSyncedVillas] = useState<Record<number, VillaDirectorySync>>(() =>
    loadSavedVillasSync()
  );

  // Merged Admin Roster (Primary Admin + Cloud Admins + Local Admins)
  const allAdminAccounts = useMemo<AdminAccount[]>(() => {
    const primaryAdmin: AdminAccount = {
      uid: 'primary-admin-balakrishna',
      fullName: 'Balakrishna Reddy',
      email: ADMIN_EMAIL,
      isPrimary: true,
    };
    const map = new Map<string, AdminAccount>();
    map.set(primaryAdmin.email.toLowerCase(), primaryAdmin);
    localAdmins.forEach((a) => {
      map.set(a.email.toLowerCase(), a);
    });
    cloudAdmins.forEach((a) => {
      const existing = map.get(a.email.toLowerCase());
      map.set(a.email.toLowerCase(), existing ? { ...existing, ...a } : a);
    });
    return Array.from(map.values());
  }, [cloudAdmins, localAdmins]);

  const activeCredentialAdmin = useMemo(() => {
    if (!activeAdminUid) return null;
    return allAdminAccounts.find((a) => a.uid === activeAdminUid) || null;
  }, [activeAdminUid, allAdminAccounts]);

  const matchesAdminEmail = Boolean(
    user &&
      user.emailVerified &&
      user.email &&
      allAdminAccounts.some((a) => a.email.toLowerCase() === user.email?.toLowerCase())
  );

  const isAdmin =
    Boolean(user && user.emailVerified && user.email === ADMIN_EMAIL) ||
    hasAdminDoc ||
    matchesAdminEmail ||
    Boolean(activeCredentialAdmin);

  const resolvedAppLogoUrl = cloudAppLogoUrl || localAppLogoUrl || DEFAULT_APP_LOGO_URL;
  const currentLoginQuote = EMOTIONAL_LOGIN_QUOTES[loginQuoteIndex % EMOTIONAL_LOGIN_QUOTES.length];

  const [passes, setPasses] = useState<GuestPass[]>(INITIAL_PASSES);
  const [vehicles, setVehicles] = useState<HouseholdVehicle[]>(INITIAL_VEHICLES);
  const [bookings, setBookings] = useState<AmenityBooking[]>(INITIAL_BOOKINGS);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [attendingGazette, setAttendingGazette] = useState(true);
  const [climateZones, setClimateZones] = useState<ClimateZone[]>(INITIAL_CLIMATE_ZONES);
  const [lightingScenes, setLightingScenes] = useState<LightingScene[]>(INITIAL_LIGHTING_SCENES);
  const [irrigationZones, setIrrigationZones] = useState<IrrigationZone[]>(INITIAL_IRRIGATION);
  const [parcels, setParcels] = useState<ParcelItem[]>(INITIAL_PARCELS);
  const [messages, setMessages] = useState<ConciergeMessage[]>(INITIAL_MESSAGES);

  const [intercomActive, setIntercomActive] = useState(false);
  const [intercomSeconds, setIntercomSeconds] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [readAlertIds, setReadAlertIds] = useState<string[]>(() => loadReadAlertIds());
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'profile' }>({
    open: false,
    mode: 'login',
  });

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: 'view' | 'create';
    pass: GuestPass | null;
  }>({ open: false, mode: 'create', pass: null });

  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setHasAdminDoc(false);
        setMyCloudRegistration(null);
        setCloudRegistrations([]);
        setCloudAdmins([]);
        setCloudSyncedVillas({});
        setCloudEmergencyDesks({});
      }
    });
    return () => unsub();
  }, []);

  // Public branding doc listener (custom app logo updated by Admin)
  useEffect(() => {
    const brandingPath = 'app_settings/branding';
    const unsubBranding = onSnapshot(
      doc(db, 'app_settings', 'branding'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { logoDataUrl?: string };
          if (data.logoDataUrl) {
            setCloudAppLogoUrl(data.logoDataUrl);
            saveAppLogoLocally(data.logoDataUrl);
          }
        } else {
          setCloudAppLogoUrl(null);
        }
      },
      () => {
        // Ignore read failure if offline or uninitialized
      }
    );
    return () => unsubBranding();
  }, []);

  // Own registration + Admin doc + Villas Directory + Emergency Desks listeners (guarded by authReady & user)
  useEffect(() => {
    if (!authReady || !user) return;

    const regPath = `registrations/${user.uid}`;
    const unsubMyReg = onSnapshot(
      doc(db, 'registrations', user.uid),
      (snap) => {
        setMyCloudRegistration(snap.exists() ? (snap.data() as VillaRegistration) : null);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, regPath);
      }
    );

    const adminPath = `admins/${user.uid}`;
    const unsubAdminDoc = onSnapshot(
      doc(db, 'admins', user.uid),
      (snap) => {
        setHasAdminDoc(snap.exists());
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, adminPath);
      }
    );

    const villasPath = 'villas_directory';
    const villasQuery = query(
      collection(db, villasPath),
      where('villaNumber', '>=', 1),
      where('villaNumber', '<=', 231)
    );
    const unsubVillas = onSnapshot(
      villasQuery,
      (snap) => {
        const map: Record<number, VillaDirectorySync> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data() as VillaDirectorySync;
          if (typeof data.villaNumber === 'number') {
            map[data.villaNumber] = data;
          }
        });
        setCloudSyncedVillas(map);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, villasPath);
      }
    );

    const deskUnsubs = ENCLAVE_EMERGENCY_DESKS.map((baseDesk) => {
      const deskPath = `emergency_desks/${baseDesk.id}`;
      return onSnapshot(
        doc(db, 'emergency_desks', baseDesk.id),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as EmergencyDesk;
            setCloudEmergencyDesks((prev) => ({
              ...prev,
              [baseDesk.id]: data,
            }));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, deskPath);
        }
      );
    });

    return () => {
      unsubMyReg();
      unsubAdminDoc();
      unsubVillas();
      deskUnsubs.forEach((unsub) => unsub());
    };
  }, [authReady, user]);

  // Admin-only registrations & multi-admin list listeners
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setCloudRegistrations([]);
      setCloudAdmins([]);
      return;
    }

    const regsPath = 'registrations';
    const q = query(collection(db, regsPath), orderBy('updatedAt', 'desc'));
    const unsubAll = onSnapshot(
      q,
      (snap) => {
        const list: VillaRegistration[] = [];
        snap.forEach((d) => list.push(d.data() as VillaRegistration));
        setCloudRegistrations(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, regsPath);
      }
    );

    const adminsPath = 'admins';
    const unsubAdmins = onSnapshot(
      collection(db, adminsPath),
      (snap) => {
        const list: AdminAccount[] = [];
        snap.forEach((d) => list.push(d.data() as AdminAccount));
        setCloudAdmins(list);
      },
      () => {
        // Gracefully ignore if secondary admin doesn't yet have list token sync
      }
    );

    return () => {
      unsubAll();
      unsubAdmins();
    };
  }, [authReady, user, isAdmin]);

  useEffect(() => {
    if (!intercomActive) {
      setIntercomSeconds(0);
      return;
    }
    const id = window.setInterval(() => {
      setIntercomSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [intercomActive]);

  // Merged Registrations (Cloud + Local)
  const allRegistrations = useMemo(() => {
    const map = new Map<string, VillaRegistration>();
    localRegistrations.forEach((r) => map.set(r.userId, r));
    cloudRegistrations.forEach((r) => {
      const existing = map.get(r.userId);
      map.set(r.userId, existing ? { ...existing, ...r } : r);
    });
    return Array.from(map.values());
  }, [cloudRegistrations, localRegistrations]);

  // Merged Emergency Desks
  const emergencyDesks: EmergencyDesk[] = useMemo(() => {
    return ENCLAVE_EMERGENCY_DESKS.map((base) => ({
      ...base,
      ...(localEmergencyDesks[base.id] || {}),
      ...(cloudEmergencyDesks[base.id] || {}),
    }));
  }, [cloudEmergencyDesks, localEmergencyDesks]);

  // Merged 231 Villas Overrides
  const syncedVillas: Record<number, VillaDirectorySync> = useMemo(() => {
    return {
      ...localSyncedVillas,
      ...cloudSyncedVillas,
    };
  }, [cloudSyncedVillas, localSyncedVillas]);

  // Active Credential Owner (when logged in via Email/Phone + Password)
  const activeCredentialOwner = useMemo(() => {
    if (!activeOwnerUid) return null;
    return (
      allRegistrations.find((r) => r.userId === activeOwnerUid && r.status === 'approved') || null
    );
  }, [activeOwnerUid, allRegistrations]);

  // Current User Registration for Owner Sign-Up card
  const myRegistration = useMemo(() => {
    if (user) {
      return (
        myCloudRegistration ||
        localRegistrations.find((r) => r.userId === user.uid) ||
        null
      );
    }
    if (activeCredentialOwner) return activeCredentialOwner;
    if (lastSubmittedRegUid) {
      return allRegistrations.find((r) => r.userId === lastSubmittedRegUid) || null;
    }
    return null;
  }, [activeCredentialOwner, allRegistrations, lastSubmittedRegUid, localRegistrations, myCloudRegistration, user]);

  // Active Session Profile (dynamically drives Home greeting, Avatar, Community posts, Concierge)
  const activeProfile: ActiveSessionProfile = useMemo(() => {
    if (user) {
      const reg = myCloudRegistration || localRegistrations.find((r) => r.userId === user.uid);
      const override = profileOverrides[user.uid];
      const fullName =
        reg?.fullName || override?.fullName || user.displayName || (isAdmin ? 'Enclave Admin' : 'Villa Owner');
      const villaNumber = reg?.villaNumber || 108;
      const baseVilla = BASE_231_VILLAS[villaNumber - 1];
      const avatarDataUrl =
        override?.avatarDataUrl !== undefined
          ? override.avatarDataUrl || undefined
          : reg?.avatarDataUrl || user.photoURL || undefined;

      return {
        isLoggedIn: true,
        loginMethod: 'google',
        uid: user.uid,
        fullName,
        email: reg?.email || user.email || '',
        phone: reg?.phone || '',
        villaNumber,
        villaLabel:
          isAdmin && !reg
            ? 'ADMIN SECRETARIAT'
            : `VILLA #${String(villaNumber).padStart(3, '0')}`,
        street: baseVilla?.street || 'Boulevard Walk',
        tier: isAdmin && !reg ? 'Governance' : 'Tier 1',
        address: reg?.address || DEFAULT_COMMUNITY_ADDRESS,
        avatarDataUrl,
        initials: getInitials(fullName),
        isAdmin,
        approvalStatus: reg?.status,
      };
    }

    if (activeCredentialAdmin) {
      const override = profileOverrides[activeCredentialAdmin.uid];
      const villaNum = activeCredentialAdmin.villaNumber || 1;
      const baseVilla = BASE_231_VILLAS[villaNum - 1];
      const avatarDataUrl =
        override?.avatarDataUrl !== undefined
          ? override.avatarDataUrl || undefined
          : undefined;

      return {
        isLoggedIn: true,
        loginMethod: 'credentials',
        uid: activeCredentialAdmin.uid,
        fullName: activeCredentialAdmin.fullName,
        email: activeCredentialAdmin.email,
        phone: activeCredentialAdmin.phone || '',
        villaNumber: villaNum,
        villaLabel: activeCredentialAdmin.villaNumber
          ? `VILLA #${String(villaNum).padStart(3, '0')} · ADMIN`
          : 'ADMIN SECRETARIAT',
        street: baseVilla?.street || 'Central Secretariat',
        tier: 'Admin Governance',
        address: DEFAULT_COMMUNITY_ADDRESS,
        avatarDataUrl,
        initials: getInitials(activeCredentialAdmin.fullName),
        isAdmin: true,
      };
    }

    if (activeCredentialOwner) {
      const override = profileOverrides[activeCredentialOwner.userId];
      const baseVilla = BASE_231_VILLAS[activeCredentialOwner.villaNumber - 1];
      const avatarDataUrl =
        override?.avatarDataUrl !== undefined
          ? override.avatarDataUrl || undefined
          : activeCredentialOwner.avatarDataUrl || undefined;

      return {
        isLoggedIn: true,
        loginMethod: 'credentials',
        uid: activeCredentialOwner.userId,
        fullName: activeCredentialOwner.fullName,
        email: activeCredentialOwner.email,
        phone: activeCredentialOwner.phone,
        villaNumber: activeCredentialOwner.villaNumber,
        villaLabel: `VILLA #${String(activeCredentialOwner.villaNumber).padStart(3, '0')}`,
        street: baseVilla?.street || 'Boulevard Walk',
        tier: 'Tier 1',
        address: activeCredentialOwner.address || DEFAULT_COMMUNITY_ADDRESS,
        avatarDataUrl,
        initials: getInitials(activeCredentialOwner.fullName),
        isAdmin: false,
        approvalStatus: activeCredentialOwner.status,
      };
    }

    return {
      isLoggedIn: false,
      loginMethod: 'guest',
      fullName: 'Guest Visitor',
      email: '',
      phone: '',
      villaNumber: 108,
      villaLabel: 'VILLA #108',
      street: 'Boulevard Walk',
      tier: 'Visitor View',
      address: DEFAULT_COMMUNITY_ADDRESS,
      initials: 'NH',
      isAdmin: false,
    };
  }, [activeCredentialAdmin, activeCredentialOwner, isAdmin, localRegistrations, myCloudRegistration, profileOverrides, user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setActiveOwnerUid(null);
      saveActiveOwnerUid(null);
      setActiveAdminUid(null);
      saveActiveAdminUid(null);
      setLoginQuoteIndex((prev) => advanceLoginQuoteIndex(prev));
      showToast('Signed in to Nalluri Home Portal');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in cancelled';
      showToast(message);
    }
  };

  const handleCredentialLogin = async (
    identifier: string,
    password: string
  ): Promise<string | null> => {
    const trimmed = identifier.trim();
    const loweredEmail = trimmed.toLowerCase();

    // 1. Check Multi-Admin Accounts first
    const matchedAdmin = allAdminAccounts.find((adm) => {
      if (adm.email.toLowerCase() === loweredEmail) return true;
      if (adm.phone && phonesMatch(adm.phone, trimmed)) return true;
      return false;
    });

    if (matchedAdmin) {
      if (!matchedAdmin.passwordSalt || !matchedAdmin.passwordHash) {
        return 'This Admin account uses Google Sign-In. Please click "Google / Admin Login" below.';
      }
      const okAdmin = await verifyPasswordWithSalt(
        password,
        matchedAdmin.passwordSalt,
        matchedAdmin.passwordHash
      );
      if (!okAdmin) {
        return 'Incorrect password. Please try again.';
      }
      if (user) {
        await signOut(auth);
      }
      setActiveOwnerUid(null);
      saveActiveOwnerUid(null);
      setActiveAdminUid(matchedAdmin.uid);
      saveActiveAdminUid(matchedAdmin.uid);
      setLoginQuoteIndex((prev) => advanceLoginQuoteIndex(prev));
      showToast(`Welcome Admin, ${matchedAdmin.fullName}`);
      return null;
    }

    // 2. Check Registered Villa Owners
    const matched = allRegistrations.find((reg) => {
      if (reg.email.toLowerCase() === loweredEmail) return true;
      if (phonesMatch(reg.phone, trimmed)) return true;
      return false;
    });

    if (!matched) {
      return 'No registration found for that email or phone number. Please submit Owner Sign-Up first.';
    }

    if (matched.status === 'pending') {
      return `Villa #${String(matched.villaNumber).padStart(3, '0')} is awaiting Admin approval. You can log in once approved by Admin.`;
    }

    if (matched.status === 'rejected') {
      return 'This registration was returned by Admin. Please update your details under Owner Sign-Up.';
    }

    if (!matched.passwordSalt || !matched.passwordHash) {
      return 'This account uses Google Sign-In. Please click "Google / Admin Login" below.';
    }

    const ok = await verifyPasswordWithSalt(password, matched.passwordSalt, matched.passwordHash);
    if (!ok) {
      return 'Incorrect password. Please try again.';
    }

    if (user) {
      await signOut(auth);
    }
    setActiveAdminUid(null);
    saveActiveAdminUid(null);
    setActiveOwnerUid(matched.userId);
    saveActiveOwnerUid(matched.userId);
    setLastSubmittedRegUid(matched.userId);
    setLoginQuoteIndex((prev) => advanceLoginQuoteIndex(prev));
    showToast(`Welcome back, ${matched.fullName} · Villa #${String(matched.villaNumber).padStart(3, '0')}`);
    return null;
  };

  const handleLogout = async () => {
    setActiveOwnerUid(null);
    saveActiveOwnerUid(null);
    setActiveAdminUid(null);
    saveActiveAdminUid(null);
    setLastSubmittedRegUid(null);
    if (user) {
      await signOut(auth);
    }
    showToast('Logged out of Nalluri Home');
  };

  const handleRegisterLocalOrCloud = async (
    reg: VillaRegistration,
    _isCloudUser: boolean
  ) => {
    const nextLocal = upsertLocalRegistration(reg);
    setLocalRegistrations(nextLocal);
    setLastSubmittedRegUid(reg.userId);
  };

  const handleAdminUpdateRegistration = async (
    updated: VillaRegistration,
    adminNote: string
  ) => {
    if (!isAdmin) return;
    const nextLocal = upsertLocalRegistration({ ...updated, adminNote });
    setLocalRegistrations(nextLocal);

    const baseVilla = BASE_231_VILLAS[updated.villaNumber - 1];
    const villaSyncPayload: VillaDirectorySync = {
      villaNumber: updated.villaNumber,
      villaCode: baseVilla?.villaCode || `Villa #${String(updated.villaNumber).padStart(3, '0')}`,
      ownerName: updated.fullName,
      street: baseVilla?.street || 'Boulevard Walk',
      intercomExt: baseVilla?.intercomExt || `Ext. ${1000 + updated.villaNumber}`,
      emergencyLine: updated.phone,
      occupancyStatus:
        updated.status === 'approved'
          ? 'Approved'
          : baseVilla?.occupancyStatus || 'Occupied',
      ownerUid: updated.userId,
    };

    if (updated.status === 'approved') {
      setLocalSyncedVillas((prev) => {
        const next = { ...prev, [updated.villaNumber]: villaSyncPayload };
        try {
          window.localStorage.setItem(LOCAL_VILLAS_SYNC_KEY, JSON.stringify(next));
        } catch {
          // Ignore quota errors
        }
        return next;
      });
    }

    const isCloudDoc = cloudRegistrations.some((r) => r.userId === updated.userId);
    if (user && isCloudDoc) {
      const batch = writeBatch(db);
      const regRef = doc(db, 'registrations', updated.userId);
      batch.update(regRef, {
        fullName: updated.fullName,
        phone: updated.phone,
        villaNumber: updated.villaNumber,
        emergencyContactName: updated.emergencyContactName || '',
        emergencyContactPhone: updated.emergencyContactPhone || '',
        address: updated.address || DEFAULT_COMMUNITY_ADDRESS,
        status: updated.status,
        adminNote,
        reviewedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      if (updated.status === 'approved') {
        const villaRef = doc(db, 'villas_directory', String(updated.villaNumber));
        batch.set(
          villaRef,
          {
            ...villaSyncPayload,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `registrations/${updated.userId}`);
      }
    }
  };

  const handleUpdateEmergencyDesk = async (desk: EmergencyDesk) => {
    if (!isAdmin) return;
    setLocalEmergencyDesks((prev) => {
      const next = { ...prev, [desk.id]: desk };
      try {
        window.localStorage.setItem(LOCAL_EMERGENCY_DESKS_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
      return next;
    });

    if (user) {
      try {
        await setDoc(
          doc(db, 'emergency_desks', desk.id),
          { ...desk, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `emergency_desks/${desk.id}`);
      }
    }
    showToast(`Updated ${desk.title}`);
  };

  const handleUpdateVillaRecord = async (villa: VillaRecord) => {
    if (!isAdmin) return;
    const syncPayload: VillaDirectorySync = {
      villaNumber: villa.villaNumber,
      villaCode: villa.villaCode,
      ownerName: villa.ownerName,
      street: villa.street,
      intercomExt: villa.intercomExt,
      emergencyLine: villa.emergencyLine,
      occupancyStatus: villa.occupancyStatus,
    };

    setLocalSyncedVillas((prev) => {
      const next = { ...prev, [villa.villaNumber]: syncPayload };
      try {
        window.localStorage.setItem(LOCAL_VILLAS_SYNC_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
      return next;
    });

    if (user) {
      try {
        await setDoc(
          doc(db, 'villas_directory', String(villa.villaNumber)),
          { ...syncPayload, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `villas_directory/${villa.villaNumber}`);
      }
    }
    showToast(`Saved contact details for ${villa.villaCode}`);
  };

  const handleUpdateAvatar = async (avatarDataUrl: string | undefined) => {
    const key = activeProfile.uid || 'guest';
    saveProfileOverride(key, { avatarDataUrl: avatarDataUrl || '' });
    setProfileOverrides(loadProfileOverrides());

    if (activeCredentialOwner) {
      const updated: VillaRegistration = {
        ...activeCredentialOwner,
        avatarDataUrl,
      };
      setLocalRegistrations(upsertLocalRegistration(updated));
    }

    if (user && myCloudRegistration) {
      try {
        await updateDoc(doc(db, 'registrations', user.uid), {
          avatarDataUrl: avatarDataUrl || '',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `registrations/${user.uid}`);
      }
    }
    showToast(avatarDataUrl ? 'Profile photo updated' : 'Profile photo reset to initials');
  };

  const handleUpdateAppLogo = async (logoDataUrl: string | null) => {
    if (!isAdmin) return;
    setLocalAppLogoUrl(logoDataUrl);
    saveAppLogoLocally(logoDataUrl);

    if (user) {
      try {
        if (logoDataUrl) {
          await setDoc(doc(db, 'app_settings', 'branding'), {
            id: 'branding',
            logoDataUrl,
            updatedBy: user.uid,
            updatedAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(doc(db, 'app_settings', 'branding'));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'app_settings/branding');
      }
    }
    showToast(logoDataUrl ? 'Application logo updated for Nalluri Home' : 'Reset application logo to default');
  };

  const handleCreateAdmin = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    villaNumber?: number;
    password: string;
    uid?: string;
  }): Promise<string | null> => {
    if (!isAdmin) return 'Admin clearance required.';
    const emailLower = payload.email.trim().toLowerCase();
    if (allAdminAccounts.some((a) => a.email.toLowerCase() === emailLower)) {
      return 'An Admin with this email already exists.';
    }

    const { salt, hash } = await hashPasswordWithSalt(payload.password);
    const adminUid = payload.uid?.trim() || `admin-${Date.now()}`;
    const newAdmin: AdminAccount = {
      uid: adminUid,
      fullName: payload.fullName.trim(),
      email: emailLower,
      phone: payload.phone.trim(),
      ...(payload.villaNumber ? { villaNumber: payload.villaNumber } : {}),
      passwordSalt: salt,
      passwordHash: hash,
      addedBy: activeProfile.uid || user?.uid || 'admin-secretariat',
    };

    setLocalAdmins(upsertLocalAdmin(newAdmin));
    if (user) {
      try {
        await setDoc(doc(db, 'admins', adminUid), {
          ...newAdmin,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `admins/${adminUid}`);
      }
    }
    showToast(`Added ${newAdmin.fullName} as Enclave Co-Admin`);
    return null;
  };

  const handlePromoteRegistrationToAdmin = async (reg: VillaRegistration) => {
    if (!isAdmin) return;
    if (allAdminAccounts.some((a) => a.email.toLowerCase() === reg.email.toLowerCase())) {
      showToast(`${reg.fullName} is already an Admin`);
      return;
    }

    const newAdmin: AdminAccount = {
      uid: reg.userId,
      fullName: reg.fullName,
      email: reg.email.toLowerCase(),
      phone: reg.phone,
      villaNumber: reg.villaNumber,
      ...(reg.passwordSalt ? { passwordSalt: reg.passwordSalt } : {}),
      ...(reg.passwordHash ? { passwordHash: reg.passwordHash } : {}),
      addedBy: activeProfile.uid || user?.uid || 'admin-secretariat',
    };

    setLocalAdmins(upsertLocalAdmin(newAdmin));
    if (user) {
      try {
        await setDoc(doc(db, 'admins', newAdmin.uid), {
          ...newAdmin,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `admins/${newAdmin.uid}`);
      }
    }
    showToast(`Promoted ${reg.fullName} to Co-Admin`);
  };

  const handleRemoveAdmin = async (uid: string) => {
    if (!isAdmin) return;
    const target = allAdminAccounts.find((a) => a.uid === uid);
    if (!target || target.isPrimary || target.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showToast('Primary Admin Balakrishna Reddy cannot be removed.');
      return;
    }
    setLocalAdmins(removeLocalAdmin(uid));
    if (user) {
      try {
        await deleteDoc(doc(db, 'admins', uid));
      } catch {
        // Ignore if only present locally
      }
    }
    showToast(`Removed Admin privileges for ${target.fullName}`);
  };

  const navigateToScreen = (next: ScreenId) => {
    setNavPulse((prev) => ({
      ...prev,
      [next]: (prev[next] || 0) + 1,
    }));
    if (next !== activeScreen) {
      const currentIdx = NAV_ITEMS.findIndex((item) => item.id === activeScreen);
      const nextIdx = NAV_ITEMS.findIndex((item) => item.id === next);
      setNavDirection(nextIdx >= currentIdx ? 1 : -1);
      setActiveScreen(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDirectoryTab = (tab: DirectorySubTab) => {
    setDirectoryTab(tab);
    navigateToScreen('directory');
  };

  const handleCopyPass = (pass: GuestPass) => {
    const shareText = `Nalluri Home FastPass · ${pass.guestName} · Token ${pass.tokenCode} · ${pass.gate} (${pass.windowLabel})`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopiedPassId(pass.id);
    showToast(`Encrypted FastPass copied for ${pass.guestName}`);
    window.setTimeout(() => {
      setCopiedPassId((curr) => (curr === pass.id ? null : curr));
    }, 1800);
  };

  const handleCreatePass = (newPassData: Omit<GuestPass, 'id' | 'tokenCode' | 'status'>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const created: GuestPass = {
      ...newPassData,
      id: `pass-${Date.now()}`,
      tokenCode: `NE-${activeProfile.villaNumber}-${randomNum}`,
      status: 'APPROVED',
    };
    setPasses((prev) => [created, ...prev]);
    setModalState({ open: true, mode: 'view', pass: created });
    showToast(`FastPass ${created.tokenCode} authorized at ${created.gate}`);
  };

  const handleRevokePass = (id: string) => {
    setPasses((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'EXPIRED' } : p))
    );
    setModalState((prev) =>
      prev.pass?.id === id && prev.pass
        ? { ...prev, pass: { ...prev.pass, status: 'EXPIRED' } }
        : prev
    );
    showToast('Gate authorization revoked');
  };

  const handleToggleVehicleStatus = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const nextStatus = v.status === 'ON-PREMISE' ? 'OFF-SITE' : 'ON-PREMISE';
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        return {
          ...v,
          status: nextStatus,
          lastGateEvent: `${nextStatus === 'ON-PREMISE' ? 'Entered' : 'Departed'} North Pavilion · ${hh}:${mm}`,
        };
      })
    );
  };

  const handleBookSlot = (facility: AmenityFacility, dateLabel: string, timeSlot: string) => {
    const token = `CP-${activeProfile.villaNumber}-${Math.floor(100 + Math.random() * 900)}A`;
    const booking: AmenityBooking = {
      id: `bk-${Date.now()}`,
      amenityId: facility.id,
      amenityName: facility.name,
      dateLabel,
      timeSlot,
      reservedFor: activeProfile.isLoggedIn
        ? activeProfile.fullName
        : RESIDENT_PROFILE.primaryResident,
      tokenCode: token,
      status: 'Ready',
      dayTag: dateLabel.split(' · ')[0].toUpperCase(),
    };
    setBookings((prev) => [booking, ...prev]);
    showToast(`Turnstile pass issued for ${facility.name} (${timeSlot})`);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showToast('Amenity pass cancelled');
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  };

  const handleAddComment = (postId: string, body: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c-${Date.now()}`,
                  author: activeProfile.fullName,
                  villa: `Villa #${String(activeProfile.villaNumber).padStart(3, '0')}`,
                  initials: activeProfile.initials,
                  avatarUrl: activeProfile.avatarDataUrl,
                  body,
                  timestamp: 'Just now',
                },
              ],
            }
          : p
      )
    );
  };

  const handleToggleJoinMatch = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.matchDetails) return p;
        const nextJoined = !p.matchDetails.joinedByMe;
        return {
          ...p,
          matchDetails: {
            ...p.matchDetails,
            joinedByMe: nextJoined,
            slotsFilled: nextJoined
              ? Math.min(p.matchDetails.slotsTotal, p.matchDetails.slotsFilled + 1)
              : Math.max(1, p.matchDetails.slotsFilled - 1),
          },
        };
      })
    );
    showToast('Badminton court match status updated');
  };

  const handleCreatePost = (payload: {
    body: string;
    type: CommunityPost['type'];
    categoryTag: CommunityCategoryTag;
    occupationBadge?: string;
    mediaType?: 'image' | 'video';
    mediaUrl?: string;
  }) => {
    const visualTheme =
      payload.type === 'festival' || payload.type === 'video'
        ? 'sankranti-reel'
        : payload.type === 'occupation'
        ? 'solar-walk'
        : payload.mediaUrl || payload.type === 'photo'
        ? 'ridge'
        : undefined;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      type: payload.type,
      categoryTag: payload.categoryTag,
      occupationBadge: payload.occupationBadge,
      author: activeProfile.fullName,
      villa: `Villa #${String(activeProfile.villaNumber).padStart(3, '0')}`,
      street: activeProfile.street,
      timestamp: 'Just now',
      initials: activeProfile.initials,
      avatarTone: 'bg-[#0B3529] text-[#F7DDA4]',
      authorAvatarUrl: activeProfile.avatarDataUrl,
      body: payload.body,
      mediaType: payload.mediaType,
      mediaUrl: payload.mediaUrl,
      videoDuration: payload.mediaType === 'video' ? '00:54' : undefined,
      visualTheme,
      visualCaption:
        payload.mediaType === 'video'
          ? `${activeProfile.street} · Community Reel`
          : payload.mediaUrl
          ? `${activeProfile.villaLabel} Highlight`
          : undefined,
      likes: 1,
      likedByMe: true,
      sharesCount: 0,
      bookmarked: false,
      seenByCount: 1,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    showToast('Published to Nalluri Home Community Insights');
  };

  const handleSharePost = (post: CommunityPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );
    const shareText = `Nalluri Home · ${post.author} (${post.villa}): ${post.body}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    showToast(`Shared ${post.author}’s community insight`);
  };

  const handleAdjustTemp = (zoneId: string, delta: number) => {
    setClimateZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const next = Math.min(27, Math.max(11, Number((z.targetTemp + delta).toFixed(1))));
        return { ...z, targetTemp: next };
      })
    );
  };

  const handleChangeZoneMode = (zoneId: string, mode: 'Auto' | 'Eco' | 'Away') => {
    setClimateZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, mode } : z))
    );
  };

  const handleActivateScene = (sceneId: string) => {
    setLightingScenes((prev) =>
      prev.map((s) => ({ ...s, active: s.id === sceneId }))
    );
  };

  const handleToggleIrrigation = (zoneId: string) => {
    setIrrigationZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, enabled: !z.enabled } : z))
    );
  };

  const handleCollectParcel = (parcelId: string) => {
    setParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? { ...p, collected: true } : p))
    );
    showToast(`White-glove porter dispatched to ${activeProfile.villaLabel}`);
  };

  const handleSendMessage = (body: string) => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const userMsg: ConciergeMessage = {
      id: `msg-${Date.now()}`,
      sender: 'resident',
      author: activeProfile.fullName,
      role: activeProfile.villaLabel,
      timestamp,
      body,
    };
    setMessages((prev) => [...prev, userMsg]);

    window.setTimeout(() => {
      const replyMsg: ConciergeMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'concierge',
        author: RESIDENT_PROFILE.estateDirector,
        role: 'Estate Director',
        timestamp,
        body: `Received for ${activeProfile.villaLabel}. Our concierge desk is coordinating your request and will confirm shortly.`,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 650);
  };

  const handleCallContact = (contact: DirectoryContact) => {
    showToast(`Connecting encrypted audio to ${contact.name} (${contact.extensionOrStreet})`);
  };

  const pendingRegistrationsCount = allRegistrations.filter((r) => r.status === 'pending').length;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`estate-canvas-bg ${SCREEN_THEME_CLASS[activeScreen]} min-h-screen text-[#141E1B]`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-[#E2DDD2]/85 bg-white/80 backdrop-blur-xl">
          {/* Animated Top Page Theme Accent Line */}
          <motion.div
            key={`bar-${activeScreen}`}
            initial={{ scaleX: 0, opacity: 0.4 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: navDirection > 0 ? 0 : 1 }}
            className={`h-[3px] w-full ${
              NAV_ITEMS.find((n) => n.id === activeScreen)?.accentBarClass || 'bg-[#0B3529]'
            }`}
          />
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => navigateToScreen('home')}
              className="min-w-0 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B48]"
            >
              <NalluriHomesEmblem
                logoUrl={resolvedAppLogoUrl}
                isAdmin={isAdmin}
                onEditLogo={() => openDirectoryTab('admin')}
              />
            </button>

            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-1 rounded-2xl border border-[#E2DDD2]/80 bg-[#F7F8F4]/75 p-1 backdrop-blur-sm lg:flex xl:gap-1.5"
            >
              {NAV_ITEMS.map((item) => {
                const active = activeScreen === item.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => navigateToScreen(item.id)}
                    className={`relative flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 xl:px-3 xl:text-sm ${
                      active
                        ? item.activeTextClass
                        : 'text-[#414B47] hover:text-[#141E1B]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktopNavPill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.85 }}
                        className="absolute inset-0 rounded-xl border border-[#C59B48]/45 bg-white shadow-xs"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <TrendyNavIcon
                        id={item.id}
                        active={active}
                        pulseKey={navPulse[item.id]}
                      />
                      <span>{item.label}</span>
                    </span>
                    {active && (
                      <motion.span
                        layoutId="topNavIndicator"
                        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                        className={`absolute inset-x-3 -bottom-[2px] z-10 h-[2.5px] rounded-full ${item.accentBarClass}`}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
              {isAdmin && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => openDirectoryTab('admin')}
                  className="hidden md:inline-flex h-[38px] items-center gap-1.5 rounded-full border border-[#C59B48] bg-gradient-to-r from-[#FEF3C7] to-[#F7DDA4] px-3 text-[11px] font-bold text-[#85631E] shadow-xs hover:brightness-95 whitespace-nowrap"
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Admin ({pendingRegistrationsCount})
                  </span>
                </motion.button>
              )}

              {activeProfile.isLoggedIn ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthModal({ open: true, mode: 'profile' })}
                    title="View profile & change photo"
                    className="flex items-center gap-2 rounded-full border border-[#C59B48]/55 bg-white py-1 pl-1 pr-1 sm:pr-3 transition-colors hover:bg-[#ECF2ED]"
                  >
                    <UserAvatar
                      name={activeProfile.fullName}
                      initials={activeProfile.initials}
                      avatarUrl={activeProfile.avatarDataUrl}
                      size="sm"
                    />
                    <div className="hidden text-left leading-tight sm:block">
                      <span className="block max-w-[150px] truncate text-[11px] font-bold text-[#141E1B]">
                        {activeProfile.fullName}
                      </span>
                      <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#85631E]">
                        {activeProfile.villaLabel}
                      </span>
                    </div>
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Logout"
                    className="inline-flex h-[38px] items-center gap-1.5 rounded-xl border border-[#BA1A1A]/30 bg-[#FFDAD6]/35 px-3 text-xs font-semibold text-[#93000A] transition-colors hover:bg-[#FFDAD6]/65 whitespace-nowrap"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Logout</span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setAuthModal({ open: true, mode: 'login' })}
                    className="inline-flex h-[38px] items-center gap-1.5 rounded-xl border border-[#C59B48] bg-white px-3 text-xs font-semibold text-[#0B3529] transition-colors hover:bg-[#ECF2ED] whitespace-nowrap"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-[#85631E]" />
                    <span>Login</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => openDirectoryTab('signup')}
                    className="hidden sm:inline-flex h-[38px] items-center gap-1.5 rounded-xl bg-[#0B3529] px-3.5 text-xs font-semibold text-[#FBF9F5] transition-colors hover:bg-[#00241A] whitespace-nowrap"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-[#F7DDA4]" />
                    <span>Sign-Up</span>
                  </motion.button>
                </div>
              )}

              {(() => {
                const unreadCount = INITIAL_ENCLAVE_ALERTS.filter(
                  (a) => !readAlertIds.includes(a.id)
                ).length;
                const readCount = INITIAL_ENCLAVE_ALERTS.length - unreadCount;
                const visibleAlerts = INITIAL_ENCLAVE_ALERTS.filter((a) => {
                  const isRead = readAlertIds.includes(a.id);
                  if (notifFilter === 'unread') return !isRead;
                  if (notifFilter === 'read') return isRead;
                  return true;
                });

                const persistReadIds = (next: string[]) => {
                  setReadAlertIds(next);
                  try {
                    window.localStorage.setItem(LOCAL_READ_ALERTS_KEY, JSON.stringify(next));
                  } catch {
                    // Ignore storage error
                  }
                };

                const markAlertRead = (id: string) => {
                  if (readAlertIds.includes(id)) return;
                  persistReadIds([...readAlertIds, id]);
                };

                const toggleAlertRead = (id: string) => {
                  if (readAlertIds.includes(id)) {
                    persistReadIds(readAlertIds.filter((item) => item !== id));
                  } else {
                    persistReadIds([...readAlertIds, id]);
                  }
                };

                const markAllRead = () => {
                  persistReadIds(INITIAL_ENCLAVE_ALERTS.map((a) => a.id));
                };

                const markAllUnread = () => {
                  persistReadIds([]);
                };

                return (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNotifOpen((prev) => !prev)}
                      aria-label={`Toggle enclave notifications (${unreadCount} unread)`}
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2DDD2] bg-white text-[#141E1B] transition-colors hover:bg-[#ECF2ED]"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <motion.span
                          key={unreadCount}
                          initial={{ scale: 0.65 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 480, damping: 22 }}
                          className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-[#BA1A1A] px-1 text-[10px] font-bold leading-none text-white shadow-xs tabular-nums"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notifOpen && (
                        <>
                          <div
                            aria-hidden="true"
                            onClick={() => setNotifOpen(false)}
                            className="fixed inset-0 z-30"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute right-0 z-40 mt-2 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#E2DDD2] bg-white shadow-2xl"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-[#E5ECE6] bg-[#F8FAF7] px-4 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                                  ENCLAVE ALERTS
                                </p>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                                    unreadCount > 0
                                      ? 'bg-[#BA1A1A] text-white'
                                      : 'bg-[#E5ECE6] text-[#0B3529]'
                                  }`}
                                >
                                  {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {unreadCount > 0 ? (
                                  <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#0B3529] hover:bg-[#ECF2ED]"
                                  >
                                    <CheckCheck className="h-3 w-3" />
                                    <span>Mark all read</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={markAllUnread}
                                    className="rounded-lg px-2 py-1 text-[10px] font-bold text-[#85631E] hover:bg-[#ECF2ED]"
                                  >
                                    Mark unread
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setNotifOpen(false)}
                                  aria-label="Close notifications"
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#414B47] hover:bg-[#ECF2ED]"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* All / Unread / Read Filter Pills */}
                            <div className="flex items-center gap-1.5 border-b border-[#E5ECE6] px-3.5 py-2">
                              {(
                                [
                                  { id: 'all', label: `All (${INITIAL_ENCLAVE_ALERTS.length})` },
                                  { id: 'unread', label: `Unread (${unreadCount})` },
                                  { id: 'read', label: `Read (${readCount})` },
                                ] as const
                              ).map((tab) => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setNotifFilter(tab.id)}
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors tabular-nums ${
                                    notifFilter === tab.id
                                      ? 'bg-[#0B3529] text-[#F7DDA4]'
                                      : 'bg-[#F4F6F1] text-[#414B47] hover:bg-[#ECF2ED]'
                                  }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            <div className="max-h-[60vh] divide-y divide-[#E5ECE6] overflow-y-auto text-xs">
                              {visibleAlerts.length === 0 ? (
                                <div className="px-4 py-6 text-center text-xs text-[#414B47]">
                                  {notifFilter === 'unread'
                                    ? 'You have read all enclave alerts.'
                                    : 'No read notifications yet.'}
                                </div>
                              ) : (
                                visibleAlerts.map((alert) => {
                                  const isRead = readAlertIds.includes(alert.id);
                                  return (
                                    <div
                                      key={alert.id}
                                      onClick={() => markAlertRead(alert.id)}
                                      className={`cursor-pointer px-4 py-3 transition-colors ${
                                        isRead
                                          ? 'bg-white hover:bg-[#F8FAF7]'
                                          : 'bg-[#ECF2ED]/75 hover:bg-[#E2EDE5]'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2.5">
                                        <span
                                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                            isRead ? 'bg-[#C9D2CB]' : 'bg-[#C59B48]'
                                          }`}
                                        />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-start justify-between gap-2">
                                            <p
                                              className={`leading-snug ${
                                                isRead
                                                  ? 'font-medium text-[#414B47]'
                                                  : 'font-bold text-[#141E1B]'
                                              }`}
                                            >
                                              {alert.title}
                                            </p>
                                            <span className="shrink-0 text-[10px] text-[#414B47]/80 tabular-nums">
                                              {alert.timeLabel}
                                            </span>
                                          </div>
                                          <p className="mt-0.5 leading-relaxed text-[#414B47]">
                                            {alert.description}
                                          </p>
                                          <div
                                            className="mt-2 flex flex-wrap items-center gap-2"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <button
                                              type="button"
                                              onClick={() => toggleAlertRead(alert.id)}
                                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                                                isRead
                                                  ? 'border-[#E2DDD2] bg-white text-[#414B47] hover:bg-[#F4F6F1]'
                                                  : 'border-[#0B3529]/25 bg-white text-[#0B3529] hover:bg-[#ECF2ED]'
                                              }`}
                                            >
                                              <Check className="h-2.5 w-2.5" />
                                              <span>{isRead ? 'Mark unread' : 'Mark read'}</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                markAlertRead(alert.id);
                                                if (alert.targetDirectoryTab) {
                                                  openDirectoryTab(alert.targetDirectoryTab);
                                                } else {
                                                  navigateToScreen(alert.targetScreen);
                                                }
                                                setNotifOpen(false);
                                              }}
                                              className="rounded-md bg-[#0B3529]/10 px-2 py-0.5 text-[10px] font-bold text-[#0B3529] hover:bg-[#0B3529] hover:text-[#F7DDA4]"
                                            >
                                              Open
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}
            </div>
          </div>
        </header>

        {/* Main Content Canvas with Smooth GPU-Accelerated Directional Page Transitions */}
        <main className="mx-auto max-w-7xl px-4 pt-6 pb-32 sm:px-6 lg:px-8 lg:pt-8 lg:pb-14">
          <AnimatePresence mode="wait" custom={navDirection}>
            <motion.div
              key={activeScreen}
              custom={navDirection}
              variants={{
                enter: (dir: number) => ({
                  opacity: 0,
                  x: dir * 24,
                  y: 6,
                  scale: 0.988,
                }),
                center: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                },
                exit: (dir: number) => ({
                  opacity: 0,
                  x: dir * -18,
                  y: -4,
                  scale: 0.992,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="will-change-transform"
            >
              {activeScreen === 'home' && (
                <OverviewScreen
                  activeProfile={activeProfile}
                  loginQuote={currentLoginQuote}
                  onNextQuote={() => setLoginQuoteIndex((prev) => advanceLoginQuoteIndex(prev))}
                  passes={passes}
                  climateZones={climateZones}
                  irrigationZones={irrigationZones}
                  parcels={parcels}
                  bookings={bookings}
                  posts={posts}
                  intercomActive={intercomActive}
                  intercomSeconds={intercomSeconds}
                  copiedPassId={copiedPassId}
                  onToggleIntercom={() => setIntercomActive((prev) => !prev)}
                  onCopyPass={handleCopyPass}
                  onOpenPass={(pass) => setModalState({ open: true, mode: 'view', pass })}
                  onOpenCreatePass={() =>
                    setModalState({ open: true, mode: 'create', pass: null })
                  }
                  onNavigate={navigateToScreen}
                  onOpenDirectoryTab={openDirectoryTab}
                  onOpenLogin={() => setAuthModal({ open: true, mode: 'login' })}
                  onOpenProfile={() => setAuthModal({ open: true, mode: 'profile' })}
                  onLogout={handleLogout}
                  onNotify={showToast}
                />
              )}

              {activeScreen === 'gate' && (
                <GateAccessScreen
                  villaLabel={activeProfile.villaLabel}
                  passes={passes}
                  vehicles={vehicles}
                  copiedPassId={copiedPassId}
                  onOpenPass={(pass) => setModalState({ open: true, mode: 'view', pass })}
                  onOpenCreatePass={() =>
                    setModalState({ open: true, mode: 'create', pass: null })
                  }
                  onCopyPass={handleCopyPass}
                  onRevokePass={handleRevokePass}
                  onToggleVehicleStatus={handleToggleVehicleStatus}
                />
              )}

              {activeScreen === 'amenities' && (
                <AmenitiesScreen
                  villaLabel={activeProfile.villaLabel}
                  bookings={bookings}
                  onBookSlot={handleBookSlot}
                  onCancelBooking={handleCancelBooking}
                  intercomActive={intercomActive}
                  intercomSeconds={intercomSeconds}
                  onToggleIntercom={() => setIntercomActive((prev) => !prev)}
                />
              )}

              {activeScreen === 'community' && (
                <CommunityScreen
                  activeProfile={activeProfile}
                  posts={posts}
                  attendingGazette={attendingGazette}
                  onToggleGazetteRsvp={() => {
                    setAttendingGazette((prev) => !prev);
                    showToast(
                      !attendingGazette
                        ? `Confirmed ${activeProfile.villaLabel} attendance for Sankranti Festival`
                        : 'Updated RSVP status'
                    );
                  }}
                  onToggleLike={handleToggleLike}
                  onToggleBookmark={handleToggleBookmark}
                  onAddComment={handleAddComment}
                  onToggleJoinMatch={handleToggleJoinMatch}
                  onCreatePost={handleCreatePost}
                  onSharePost={handleSharePost}
                />
              )}

              {activeScreen === 'directory' && (
                <DirectoryScreen
                  activeSubTab={directoryTab}
                  onChangeSubTab={setDirectoryTab}
                  user={user}
                  isAdmin={isAdmin}
                  isLoggedIn={activeProfile.isLoggedIn}
                  activeProfile={activeProfile}
                  myRegistration={myRegistration}
                  allRegistrations={allRegistrations}
                  adminAccounts={allAdminAccounts}
                  appLogoUrl={resolvedAppLogoUrl}
                  emergencyDesks={emergencyDesks}
                  syncedVillas={syncedVillas}
                  onRegisterLocalOrCloud={handleRegisterLocalOrCloud}
                  onAdminUpdateRegistration={handleAdminUpdateRegistration}
                  onUpdateAppLogo={handleUpdateAppLogo}
                  onCreateAdmin={handleCreateAdmin}
                  onPromoteRegistrationToAdmin={handlePromoteRegistrationToAdmin}
                  onRemoveAdmin={handleRemoveAdmin}
                  onUpdateEmergencyDesk={handleUpdateEmergencyDesk}
                  onUpdateVillaRecord={handleUpdateVillaRecord}
                  onOpenLogin={() => setAuthModal({ open: true, mode: 'login' })}
                  onOpenProfile={() => setAuthModal({ open: true, mode: 'profile' })}
                  onGoogleSignIn={handleGoogleSignIn}
                  onLogout={handleLogout}
                  onNotify={showToast}
                  climateZones={climateZones}
                  lightingScenes={lightingScenes}
                  irrigationZones={irrigationZones}
                  parcels={parcels}
                  messages={messages}
                  onAdjustTemp={handleAdjustTemp}
                  onChangeZoneMode={handleChangeZoneMode}
                  onActivateScene={handleActivateScene}
                  onToggleIrrigation={handleToggleIrrigation}
                  onCollectParcel={handleCollectParcel}
                  onSendMessage={handleSendMessage}
                  onCallContact={handleCallContact}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Community Address & Admin / Copyrights Footer */}
          <footer className="mt-12 space-y-3 rounded-2xl border border-[#E2DDD2] bg-white/75 px-5 py-6 text-center text-xs text-[#414B47] backdrop-blur-sm">
            <div className="inline-flex items-center gap-1.5 font-semibold text-[#0B3529]">
              <MapPin className="h-3.5 w-3.5 text-[#85631E]" />
              <span>Nalluri Home · Gated Villa Community</span>
            </div>
            <p>{DEFAULT_COMMUNITY_ADDRESS}</p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 border-t border-[#E5ECE6] pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C59B48]/55 bg-gradient-to-r from-[#0B3529] to-[#184839] px-3.5 py-1 text-[11px] font-bold text-[#F7DDA4] shadow-xs">
                <Crown className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span>Admin: Balakrishna Reddy</span>
              </span>
              <span className="text-[11px] font-semibold text-[#141E1B]">
                © {new Date().getFullYear()} Balakrishna Reddy · All Rights Reserved
              </span>
            </div>
          </footer>
        </main>

        {/* Floating Glassmorphic Mobile Bottom Dock with Smooth Gliding Pill & Animated Classic Icons */}
        <nav
          aria-label="Mobile navigation"
          className="pointer-events-none fixed bottom-3 inset-x-3 z-40 mx-auto max-w-md lg:hidden"
        >
          <div className="pointer-events-auto relative grid h-[76px] grid-cols-5 items-center gap-1 rounded-[28px] border border-[#C59B48]/45 bg-white/88 p-1.5 shadow-[0_18px_42px_-10px_rgba(11,53,41,0.28),0_4px_16px_-4px_rgba(197,155,72,0.22)] ring-1 ring-white/80 backdrop-blur-2xl">
            {NAV_ITEMS.map((item) => {
              const active = activeScreen === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateToScreen(item.id)}
                  className={`relative flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-0.5 transition-colors ${
                    active ? item.activeTextClass : 'text-[#414B47] hover:text-[#141E1B]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="mobileDockActivePill"
                      transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.85 }}
                      className="absolute inset-0 rounded-[22px] border border-[#C59B48]/45 bg-gradient-to-b from-[#ECF2ED]/95 to-[#F7DDA4]/35 shadow-xs"
                    />
                  )}
                  {active && (
                    <motion.span
                      layoutId="mobileNavIndicator"
                      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                      className={`absolute top-[2px] z-10 h-[3px] w-7 rounded-full ${item.accentBarClass}`}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                    <TrendyNavIcon
                      id={item.id}
                      active={active}
                      pulseKey={navPulse[item.id]}
                      compact
                    />
                    <motion.span
                      animate={{ scale: active ? 1.03 : 1 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-full text-center text-[10px] leading-none tracking-tight ${
                        active ? 'font-bold' : 'font-semibold'
                      }`}
                    >
                      {item.mobileLabel}
                    </motion.span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Auth & Profile Photo Modal */}
        <AnimatePresence>
          {authModal.open && (
            <AuthAndProfileModal
              mode={authModal.mode}
              activeProfile={activeProfile}
              onClose={() => setAuthModal((prev) => ({ ...prev, open: false }))}
              onCredentialLogin={handleCredentialLogin}
              onGoogleSignIn={handleGoogleSignIn}
              onGoToSignup={() => openDirectoryTab('signup')}
              onUpdateAvatar={handleUpdateAvatar}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>

        {/* FastPass Modal */}
        <AnimatePresence>
          {modalState.open && (
            <FastPassModal
              mode={modalState.mode}
              pass={modalState.pass}
              onClose={() => setModalState({ open: false, mode: 'create', pass: null })}
              onCreatePass={handleCreatePass}
              onRevokePass={handleRevokePass}
              onCopyPass={handleCopyPass}
            />
          )}
        </AnimatePresence>

        {/* Animated Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#C59B48]/45 bg-[#0B3529] px-5 py-2.5 text-xs font-semibold text-[#FBF9F5] shadow-xl lg:bottom-6"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
