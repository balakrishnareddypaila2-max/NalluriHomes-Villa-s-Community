import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  PhoneCall,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldPlus,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  BASE_231_VILLAS,
  EmergencyDesk,
  VillaRecord,
} from '../data/villas231';
import {
  DEFAULT_COUNTRY,
  parseCountryPhoneValue,
  validateCountryPhone,
} from '../data/countries';
import { ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import { AdminAccount, VillaDirectorySync, VillaRegistration } from '../types/estate';
import {
  DEFAULT_APP_LOGO_URL,
  DEFAULT_COMMUNITY_ADDRESS,
  hashPasswordWithSalt,
  readFileAsDataUrl,
} from '../utils/ownerAuth';
import { CountryPhoneInput } from './CountryPhoneInput';
import { ImageCropperModal } from './ImageCropperModal';
import { NalluriHomesEmblem, UserAvatar } from './ui/EstatePrimitives';

function validateVillaNumberInput(
  raw: string,
  required = true
): { valid: boolean; value?: number; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return required
      ? { valid: false, error: 'Villa number is required (1 to 231).' }
      : { valid: true, value: undefined };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid villa number between 1 and 231.' };
  }
  const num = Number(trimmed);
  if (num === 0) {
    return {
      valid: false,
      error: 'Villa number cannot be 0. Please enter a villa number from 1 to 231.',
    };
  }
  if (num < 1 || num > 231) {
    return {
      valid: false,
      error: `Villa #${num} is out of range. Nalluri Home only has 231 villas (1 – 231).`,
    };
  }
  return { valid: true, value: num };
}

interface VillaSignupCardProps {
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  myRegistration: VillaRegistration | null;
  onRegisterLocalOrCloud: (reg: VillaRegistration, isCloudUser: boolean) => Promise<void>;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  onNotify: (msg: string) => void;
}

export const VillaSignupCard: React.FC<VillaSignupCardProps> = ({
  user,
  isAdmin,
  isLoggedIn,
  myRegistration,
  onRegisterLocalOrCloud,
  onOpenLogin,
  onOpenProfile,
  onGoogleSignIn,
  onLogout,
  onNotify,
}) => {
  const [fullName, setFullName] = useState(
    myRegistration?.fullName || user?.displayName || ''
  );
  const [email, setEmail] = useState(myRegistration?.email || user?.email || '');
  const [phone, setPhone] = useState(myRegistration?.phone || '');
  const [villaNumberInput, setVillaNumberInput] = useState<string>(
    String(myRegistration?.villaNumber || 108)
  );
  const [villaTouched, setVillaTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState(
    myRegistration?.emergencyContactName || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    myRegistration?.emergencyContactPhone || ''
  );
  const [address, setAddress] = useState(
    myRegistration?.address || DEFAULT_COMMUNITY_ADDRESS
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [phoneCountry, setPhoneCountry] = useState(() =>
    parseCountryPhoneValue(myRegistration?.phone || '').country || DEFAULT_COUNTRY
  );
  const [emergencyCountry, setEmergencyCountry] = useState(() =>
    parseCountryPhoneValue(myRegistration?.emergencyContactPhone || '').country || DEFAULT_COUNTRY
  );

  React.useEffect(() => {
    if (myRegistration) {
      setFullName(myRegistration.fullName);
      setEmail(myRegistration.email);
      setPhone(myRegistration.phone);
      setPhoneCountry(parseCountryPhoneValue(myRegistration.phone).country);
      setVillaNumberInput(String(myRegistration.villaNumber));
      setEmergencyContactName(myRegistration.emergencyContactName || '');
      setEmergencyContactPhone(myRegistration.emergencyContactPhone || '');
      setEmergencyCountry(
        parseCountryPhoneValue(myRegistration.emergencyContactPhone || '').country
      );
      setAddress(myRegistration.address || DEFAULT_COMMUNITY_ADDRESS);
    } else if (user) {
      setFullName((prev) => prev || user.displayName || '');
      setEmail((prev) => prev || user.email || '');
    }
  }, [myRegistration, user]);

  const villaValidation = useMemo(
    () => validateVillaNumberInput(villaNumberInput, true),
    [villaNumberInput]
  );

  const showVillaError =
    !villaValidation.valid && (villaTouched || villaNumberInput.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setVillaTouched(true);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedAddress = address.trim() || DEFAULT_COMMUNITY_ADDRESS;

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setFormError('Please enter your full registration name (2–100 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 160) {
      setFormError('Please enter a valid registration email address.');
      return;
    }

    const parsedPrimary = parseCountryPhoneValue(phone);
    const activePrimaryCountry = phone.trim() ? parsedPrimary.country : phoneCountry;
    const primaryValidation = validateCountryPhone(
      activePrimaryCountry,
      parsedPrimary.nationalDigits,
      true
    );
    if (!primaryValidation.isValid) {
      setFormError(primaryValidation.error || 'Please enter a valid mobile number for your selected country.');
      return;
    }
    const trimmedPhone = primaryValidation.formattedE164;

    if (!villaValidation.valid || !villaValidation.value) {
      setFormError(villaValidation.error || 'Villa number must be between 1 and 231.');
      return;
    }
    const num = villaValidation.value;

    const needsPassword = !myRegistration?.passwordHash || password.length > 0;
    if (needsPassword) {
      if (password.length < 6) {
        setFormError('Please choose a login password of at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Password and Confirm Password do not match.');
        return;
      }
    }

    const trimmedEmgName = emergencyContactName.trim();
    const parsedEmergency = parseCountryPhoneValue(emergencyContactPhone);
    const activeEmergencyCountry = emergencyContactPhone.trim()
      ? parsedEmergency.country
      : emergencyCountry;
    const emergencyValidation = validateCountryPhone(
      activeEmergencyCountry,
      parsedEmergency.nationalDigits,
      false
    );
    if (trimmedEmgName && (trimmedEmgName.length < 2 || trimmedEmgName.length > 100)) {
      setFormError('Emergency contact name must be 2–100 characters.');
      return;
    }
    if (!emergencyValidation.isValid) {
      setFormError(
        `Emergency phone: ${emergencyValidation.error || 'Invalid mobile format for selected country.'}`
      );
      return;
    }
    const trimmedEmgPhone = emergencyValidation.formattedE164;

    setSubmitting(true);
    try {
      let salt = myRegistration?.passwordSalt;
      let hash = myRegistration?.passwordHash;
      if (password.length >= 6) {
        const hashed = await hashPasswordWithSalt(password);
        salt = hashed.salt;
        hash = hashed.hash;
      }

      const targetUid =
        myRegistration?.userId ||
        (user && !isAdmin ? user.uid : `owner-${num}-${Date.now()}`);
      const canWriteOwnCloudDoc = Boolean(user && targetUid === user.uid);

      const registrationRecord: VillaRegistration = {
        userId: targetUid,
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        villaNumber: num,
        address: trimmedAddress,
        status: 'pending',
        ...(trimmedEmgName ? { emergencyContactName: trimmedEmgName } : {}),
        ...(trimmedEmgPhone ? { emergencyContactPhone: trimmedEmgPhone } : {}),
        ...(salt ? { passwordSalt: salt } : {}),
        ...(hash ? { passwordHash: hash } : {}),
        ...(myRegistration?.avatarDataUrl ? { avatarDataUrl: myRegistration.avatarDataUrl } : {}),
      };

      await onRegisterLocalOrCloud(registrationRecord, canWriteOwnCloudDoc);

      if (canWriteOwnCloudDoc && user) {
        const path = `registrations/${user.uid}`;
        const ref = doc(db, 'registrations', user.uid);
        try {
          if (myRegistration) {
            const updatePayload: Record<string, unknown> = {
              fullName: trimmedName,
              email: trimmedEmail,
              phone: trimmedPhone,
              villaNumber: num,
              address: trimmedAddress,
              status: 'pending',
              updatedAt: serverTimestamp(),
            };
            if (trimmedEmgName) updatePayload.emergencyContactName = trimmedEmgName;
            if (trimmedEmgPhone) updatePayload.emergencyContactPhone = trimmedEmgPhone;
            if (salt) updatePayload.passwordSalt = salt;
            if (hash) updatePayload.passwordHash = hash;
            await updateDoc(ref, updatePayload);
          } else {
            const createPayload: Record<string, unknown> = {
              userId: user.uid,
              fullName: trimmedName,
              email: trimmedEmail,
              phone: trimmedPhone,
              villaNumber: num,
              address: trimmedAddress,
              status: 'pending',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            if (trimmedEmgName) createPayload.emergencyContactName = trimmedEmgName;
            if (trimmedEmgPhone) createPayload.emergencyContactPhone = trimmedEmgPhone;
            if (salt) createPayload.passwordSalt = salt;
            if (hash) createPayload.passwordHash = hash;
            await setDoc(ref, createPayload);
          }
        } catch (err) {
          handleFirestoreError(err, myRegistration ? OperationType.UPDATE : OperationType.CREATE, path);
        }
      }

      setPassword('');
      setConfirmPassword('');
      onNotify(
        `Registration submitted for Villa #${String(num).padStart(3, '0')} · Awaiting Admin Approval`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="estate-card-prestige rounded-2xl p-6 lg:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5ECE6] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
              NALLURI HOME ONBOARDING · 231 RESIDENCES
            </p>
            <h2 className="mt-1 font-serif text-[22px] font-medium text-[#141E1B]">
              Villa Owner Registration & Access
            </h2>
            <p className="mt-1 text-xs text-[#414B47]">
              Register with your name, Villa #, email, phone number, and password. Once Admin approves, login with Email or Phone + Password.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0B3529] px-3.5 text-xs font-semibold text-[#FBF9F5] hover:bg-[#00241A]"
              >
                <KeyRound className="h-3.5 w-3.5 text-[#F7DDA4]" />
                <span>Owner Login</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#BA1A1A]/30 bg-[#FFDAD6]/30 px-3 text-xs font-semibold text-[#93000A] hover:bg-[#FFDAD6]/60"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {myRegistration?.status === 'approved' && isLoggedIn && !isAdmin ? (
          <div className="mt-6 space-y-5 rounded-2xl bg-[#ECF2ED] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B3529] text-[#F7DDA4]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B3529]">
                    ADMIN APPROVED OWNER
                  </p>
                  <h3 className="font-serif text-xl font-medium text-[#141E1B]">
                    Villa #{String(myRegistration.villaNumber).padStart(3, '0')} · {myRegistration.fullName}
                  </h3>
                </div>
              </div>
              <span className="rounded-full bg-[#0B3529] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7DDA4]">
                APPROVED
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-4 border-t border-[#D6DFD8] pt-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-[#414B47]">Registration Email (Username)</dt>
                <dd className="mt-1 font-semibold text-[#141E1B]">{myRegistration.email}</dd>
              </div>
              <div>
                <dt className="text-[#414B47]">Primary Phone (Username)</dt>
                <dd className="mt-1 font-mono font-semibold text-[#141E1B] tabular-nums">
                  {myRegistration.phone}
                </dd>
              </div>
              {myRegistration.emergencyContactName && (
                <div>
                  <dt className="text-[#414B47]">Emergency Contact</dt>
                  <dd className="mt-1 font-semibold text-[#141E1B]">
                    {myRegistration.emergencyContactName} ({myRegistration.emergencyContactPhone})
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-[#414B47]">Residence Address</dt>
                <dd className="mt-1 font-medium text-[#141E1B]">
                  {myRegistration.address || DEFAULT_COMMUNITY_ADDRESS}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D6DFD8] pt-4">
              <div className="flex items-center gap-2 text-[11px] text-[#414B47]">
                <Lock className="h-3.5 w-3.5 text-[#0B3529]" />
                <span>Contact & emergency numbers are locked and editable only by Admin.</span>
              </div>
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5] hover:bg-[#00241A]"
              >
                <Camera className="h-3.5 w-3.5 text-[#F7DDA4]" />
                <span>Change Profile Image</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {myRegistration && !isAdmin && (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 text-xs ${
                  myRegistration.status === 'rejected'
                    ? 'border-[#BA1A1A]/35 bg-[#FFDAD6]/40 text-[#93000A]'
                    : 'border-[#C59B48]/45 bg-[#F7DDA4]/45 text-[#85631E]'
                }`}
              >
                {myRegistration.status === 'rejected' ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>
                  <p className="font-bold uppercase tracking-[0.06em]">
                    {myRegistration.status === 'rejected'
                      ? 'Registration Returned by Admin'
                      : 'Pending Admin Approval'}
                  </p>
                  <p className="mt-1 leading-[18px]">
                    {myRegistration.status === 'rejected'
                      ? myRegistration.adminNote ||
                        'Please verify your villa number and contact details below, then resubmit.'
                      : `Registration for Villa #${String(myRegistration.villaNumber).padStart(
                          3,
                          '0'
                        )} is awaiting Admin approval. Once approved, you can sign in with your email or phone number and password.`}
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <div className="rounded-xl border border-[#BA1A1A]/35 bg-[#FFDAD6]/45 px-4 py-3 text-xs font-semibold text-[#93000A]">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Registration Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Varma"
                  className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-white px-4 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Villa Number (1 – 231) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={villaNumberInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                    setVillaNumberInput(cleaned);
                  }}
                  onBlur={() => setVillaTouched(true)}
                  placeholder="1 to 231"
                  aria-invalid={showVillaError}
                  className={`h-[48px] w-full rounded-xl border bg-white px-4 font-mono text-sm text-[#141E1B] tabular-nums focus:outline-none focus:ring-2 ${
                    showVillaError
                      ? 'border-[#BA1A1A] focus:border-[#BA1A1A] focus:ring-[#BA1A1A]/20'
                      : 'border-[#E2DDD2] focus:border-[#0B3529] focus:ring-[#C59B48]/25'
                  }`}
                />
                {showVillaError ? (
                  <p className="mt-1.5 flex items-start gap-1 text-[11px] font-semibold text-[#BA1A1A]">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{villaValidation.error}</span>
                  </p>
                ) : villaValidation.valid && villaValidation.value ? (
                  <p className="mt-1.5 text-[11px] font-medium text-[#0B3529]">
                    ✓ Villa #{String(villaValidation.value).padStart(3, '0')} ·{' '}
                    {BASE_231_VILLAS[villaValidation.value - 1]?.street || 'Nalluri Home'}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Registration Email (Username) *
                </label>
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@domain.com"
                  className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-white px-4 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                />
              </div>

              <div>
                <CountryPhoneInput
                  id="signup-primary-phone"
                  label="Mobile Number (Username) *"
                  required
                  value={phone}
                  onChange={setPhone}
                  onCountryChange={setPhoneCountry}
                  helperText="Select country & enter valid mobile digits"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Login Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!myRegistration?.passwordHash}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-white pl-4 pr-10 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414B47]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!myRegistration?.passwordHash || password.length > 0}
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-white px-4 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Sneha Varma"
                  className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-white px-4 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                />
              </div>

              <div>
                <CountryPhoneInput
                  id="signup-emergency-phone"
                  label="Emergency Contact Phone"
                  required={false}
                  value={emergencyContactPhone}
                  onChange={setEmergencyContactPhone}
                  onCountryChange={setEmergencyCountry}
                  helperText="Optional: select country & enter emergency mobile"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                Default Community Address
              </label>
              <input
                type="text"
                maxLength={240}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-4 text-xs font-medium text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B3529] px-6 text-sm font-semibold text-[#FBF9F5] transition-colors hover:bg-[#00241A] disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4 text-[#F7DDA4]" />
                <span>
                  {submitting
                    ? 'Submitting to Secretariat...'
                    : 'Submit Registration for Admin Approval'}
                </span>
              </motion.button>

              {!user && (
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border border-[#C59B48] bg-white px-4 text-xs font-semibold text-[#0B3529] hover:bg-[#ECF2ED] whitespace-nowrap"
                >
                  <LogIn className="h-4 w-4 text-[#85631E]" />
                  <span>Google Link</span>
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      {/* Approval Process Guide */}
      <section className="estate-card rounded-2xl p-6 lg:col-span-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
          GOVERNANCE WORKFLOW
        </p>
        <h2 className="mt-1 font-serif text-[20px] font-medium text-[#141E1B]">
          Registration & Login Flow
        </h2>
        <div className="mt-5 space-y-3.5">
          {[
            {
              step: '01',
              title: 'Villa Owner Sign-Up',
              copy: 'Submit your legal name, Villa # (1–231), email, mobile number, and password. Your account enters Pending review.',
            },
            {
              step: '02',
              title: 'Admin Approval & Verification',
              copy: 'Only the Enclave Admin can approve registrations and edit verified villa contact & emergency numbers.',
            },
            {
              step: '03',
              title: 'Owner Sign-In with Email or Phone',
              copy: 'Once approved, sign in anytime with your Email OR Phone Number + Password, customize your profile photo, and access the enclave.',
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3.5 rounded-xl bg-[#ECF2ED] p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B3529] font-mono text-[11px] font-bold text-[#F7DDA4]">
                {item.step}
              </span>
              <div>
                <p className="text-xs font-bold text-[#141E1B]">{item.title}</p>
                <p className="mt-1 text-xs leading-[18px] text-[#414B47]">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] p-4 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#85631E]" />
            <div>
              <p className="font-bold text-[#141E1B]">Nalluri Homes Default Address</p>
              <p className="mt-0.5 leading-[18px] text-[#414B47]">{DEFAULT_COMMUNITY_ADDRESS}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-4 rounded-xl border border-[#C59B48]/45 bg-[#F7DDA4]/40 p-4 text-xs text-[#85631E]">
            <span className="font-bold">Admin Session Active:</span> You can approve incoming registrations and edit any villa or emergency contact details.
          </div>
        )}
      </section>
    </div>
  );
};

interface AdminApprovalsPanelProps {
  user: User | null;
  isAdmin: boolean;
  registrations: VillaRegistration[];
  adminAccounts: AdminAccount[];
  appLogoUrl?: string;
  onGoogleSignIn: () => void;
  onAdminUpdateRegistration: (updated: VillaRegistration, adminNote: string) => Promise<void>;
  onUpdateAppLogo: (logoDataUrl: string | null) => Promise<void>;
  onCreateAdmin: (payload: {
    fullName: string;
    email: string;
    phone: string;
    villaNumber?: number;
    password: string;
    uid?: string;
  }) => Promise<string | null>;
  onPromoteRegistrationToAdmin: (reg: VillaRegistration) => Promise<void>;
  onRemoveAdmin: (uid: string) => Promise<void>;
  onNotify: (msg: string) => void;
}

export const AdminApprovalsPanel: React.FC<AdminApprovalsPanelProps> = ({
  user,
  isAdmin,
  registrations,
  adminAccounts,
  appLogoUrl,
  onGoogleSignIn,
  onAdminUpdateRegistration,
  onUpdateAppLogo,
  onCreateAdmin,
  onPromoteRegistrationToAdmin,
  onRemoveAdmin,
  onNotify,
}) => {
  const [adminSection, setAdminSection] = useState<'approvals' | 'admins' | 'logo'>('approvals');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    fullName: string;
    phone: string;
    villaNumber: number;
    emergencyContactName: string;
    emergencyContactPhone: string;
    address: string;
  }>({
    fullName: '',
    phone: '',
    villaNumber: 1,
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: DEFAULT_COMMUNITY_ADDRESS,
  });

  // Multiple Admins creation state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminVilla, setNewAdminVilla] = useState<string>('1');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // App Logo Cropper state
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);

  const filtered = useMemo(() => {
    return registrations.filter((r) => filter === 'all' || r.status === filter);
  }, [filter, registrations]);

  const counts = useMemo(
    () => ({
      pending: registrations.filter((r) => r.status === 'pending').length,
      approved: registrations.filter((r) => r.status === 'approved').length,
      rejected: registrations.filter((r) => r.status === 'rejected').length,
    }),
    [registrations]
  );

  const startEdit = (reg: VillaRegistration) => {
    setEditingUid(reg.userId);
    setEditDraft({
      fullName: reg.fullName,
      phone: reg.phone,
      villaNumber: reg.villaNumber,
      emergencyContactName: reg.emergencyContactName || '',
      emergencyContactPhone: reg.emergencyContactPhone || '',
      address: reg.address || DEFAULT_COMMUNITY_ADDRESS,
    });
  };

  const handleSaveAdminEdit = async (reg: VillaRegistration) => {
    if (!isAdmin) return;
    setBusyUid(reg.userId);
    try {
      const updated: VillaRegistration = {
        ...reg,
        fullName: editDraft.fullName.trim() || reg.fullName,
        phone: editDraft.phone.trim() || reg.phone,
        villaNumber: Math.min(231, Math.max(1, Number(editDraft.villaNumber) || reg.villaNumber)),
        emergencyContactName: editDraft.emergencyContactName.trim() || undefined,
        emergencyContactPhone: editDraft.emergencyContactPhone.trim() || undefined,
        address: editDraft.address.trim() || DEFAULT_COMMUNITY_ADDRESS,
      };
      await onAdminUpdateRegistration(updated, adminNotes[reg.userId] ?? reg.adminNote ?? '');
      setEditingUid(null);
      onNotify(`Updated owner contact & emergency details for Villa #${String(updated.villaNumber).padStart(3, '0')}`);
    } finally {
      setBusyUid(null);
    }
  };

  const handleDecision = async (
    reg: VillaRegistration,
    decision: 'approved' | 'rejected'
  ) => {
    if (!isAdmin) return;
    setBusyUid(reg.userId);
    const note =
      (adminNotes[reg.userId] || '').trim() ||
      (decision === 'approved'
        ? 'Verified by Enclave Secretariat'
        : 'Please verify villa allocation details and resubmit');

    try {
      const updated: VillaRegistration = {
        ...reg,
        status: decision,
        adminNote: note,
        reviewedBy: user?.uid || 'admin-secretariat',
      };
      await onAdminUpdateRegistration(updated, note);
      onNotify(
        decision === 'approved'
          ? `Approved ${reg.fullName} for Villa #${String(reg.villaNumber).padStart(3, '0')}`
          : `Rejected registration for ${reg.fullName}`
      );
    } finally {
      setBusyUid(null);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError(null);
    if (newAdminName.trim().length < 2) {
      setAdminFormError('Admin full name must be at least 2 characters.');
      return;
    }
    if (!newAdminEmail.trim().includes('@')) {
      setAdminFormError('Please enter a valid admin email address.');
      return;
    }
    const parsedAdmPhone = parseCountryPhoneValue(newAdminPhone);
    const admPhoneCheck = validateCountryPhone(
      parsedAdmPhone.country,
      parsedAdmPhone.nationalDigits,
      true
    );
    if (!admPhoneCheck.isValid) {
      setAdminFormError(admPhoneCheck.error || 'Please enter a valid admin mobile number.');
      return;
    }
    if (newAdminPassword.length < 6) {
      setAdminFormError('Password must be at least 6 characters.');
      return;
    }

    const adminVillaCheck = validateVillaNumberInput(newAdminVilla, false);
    if (!adminVillaCheck.valid) {
      setAdminFormError(adminVillaCheck.error || 'Villa number must be between 1 and 231.');
      return;
    }

    setCreatingAdmin(true);
    try {
      const err = await onCreateAdmin({
        fullName: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        phone: admPhoneCheck.formattedE164,
        villaNumber: adminVillaCheck.value,
        password: newAdminPassword,
        uid: newAdminUid.trim() || undefined,
      });
      if (err) {
        setAdminFormError(err);
      } else {
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPhone('');
        setNewAdminPassword('');
        setNewAdminUid('');
      }
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleLogoFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      setLogoCropSrc(rawDataUrl);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to read logo image');
    } finally {
      e.target.value = '';
    }
  };

  if (!isAdmin && !user) {
    return (
      <div className="estate-card rounded-2xl p-8 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-[#0B3529]" />
        <h2 className="mt-3 font-serif text-xl font-medium text-[#141E1B]">
          Admin Authentication Required
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-[#414B47]">
          Sign in with an Enclave Administrator account to approve registrations, manage multiple admins, update the app logo, and edit villa & emergency contacts.
        </p>
        <button
          type="button"
          onClick={onGoogleSignIn}
          className="mt-5 inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#0B3529] px-5 text-xs font-semibold text-[#FBF9F5]"
        >
          <LogIn className="h-4 w-4 text-[#F7DDA4]" />
          <span>Sign In as Admin</span>
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="estate-card rounded-2xl p-8 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-[#85631E]" />
        <h2 className="mt-3 font-serif text-xl font-medium text-[#141E1B]">
          Secretariat Admin Clearance Required
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[#414B47]">
          Signed in as <span className="font-semibold text-[#141E1B]">{user?.email}</span>. Only authorized Enclave Administrators can approve registrations, manage admins, edit the app logo, or edit emergency & villa contact numbers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Admin Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="estate-card rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
            AWAITING REVIEW
          </p>
          <p className="mt-2 font-serif text-3xl font-medium text-[#141E1B] tabular-nums">
            {counts.pending}
          </p>
          <p className="mt-0.5 text-xs text-[#414B47]">Pending owner sign-ups</p>
        </div>
        <div className="estate-card rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#0B3529]">
            VERIFIED OWNERS
          </p>
          <p className="mt-2 font-serif text-3xl font-medium text-[#141E1B] tabular-nums">
            {counts.approved}
          </p>
          <p className="mt-0.5 text-xs text-[#414B47]">Synced to 231 Villas Registry</p>
        </div>
        <div className="estate-card rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#BA1A1A]">
            RETURNED
          </p>
          <p className="mt-2 font-serif text-3xl font-medium text-[#141E1B] tabular-nums">
            {counts.rejected}
          </p>
          <p className="mt-0.5 text-xs text-[#414B47]">Requires owner revision</p>
        </div>
        <div className="estate-card rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">
            ACTIVE ADMINS
          </p>
          <p className="mt-2 font-serif text-3xl font-medium text-[#141E1B] tabular-nums">
            {adminAccounts.length}
          </p>
          <p className="mt-0.5 text-xs text-[#414B47]">Enclave Secretariat Roster</p>
        </div>
      </div>

      {/* Admin Governance Section Switcher */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {[
          { id: 'approvals' as const, label: 'Owner Approvals', icon: UserCheck },
          { id: 'admins' as const, label: `Manage Multiple Admins (${adminAccounts.length})`, icon: Users },
          { id: 'logo' as const, label: 'App Logo Studio (Admin Only)', icon: ImageIcon },
        ].map((sec) => {
          const Icon = sec.icon;
          const active = adminSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setAdminSection(sec.id)}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#0B3529] text-[#FBF9F5] shadow-sm'
                  : 'border border-[#E2DDD2] bg-white text-[#141E1B] hover:bg-[#ECF2ED]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[#F7DDA4]' : 'text-[#85631E]'}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {adminSection === 'approvals' && (
        <div className="space-y-5">
          <div className="flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-[#E2DDD2] bg-[#ECF2ED] p-1 sm:w-fit">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`min-h-[38px] flex-1 rounded-lg px-4 text-xs font-semibold capitalize transition-colors sm:flex-initial ${
                  filter === tab
                    ? 'bg-[#0B3529] text-[#FBF9F5]'
                    : 'text-[#414B47] hover:text-[#141E1B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="estate-card rounded-2xl p-10 text-center">
              <UserCheck className="mx-auto h-9 w-9 text-[#0B3529]" />
              <p className="mt-3 font-serif text-lg font-medium text-[#141E1B]">
                No {filter === 'all' ? '' : filter} villa registrations
              </p>
              <p className="mt-1 text-xs text-[#414B47]">
                New villa owner sign-ups appear here in real time for Admin verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((reg) => {
                const isEditing = editingUid === reg.userId;
                const alreadyAdmin = adminAccounts.some(
                  (a) =>
                    a.uid === reg.userId ||
                    a.email.toLowerCase() === reg.email.toLowerCase()
                );

                return (
                  <motion.div
                    key={reg.userId}
                    layout
                    className="estate-card rounded-2xl p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-lg bg-[#0B3529] px-2.5 py-1 font-mono text-xs font-bold text-[#F7DDA4] tabular-nums">
                            Villa #{String(reg.villaNumber).padStart(3, '0')}
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-[#141E1B]">
                            {reg.fullName}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              reg.status === 'approved'
                                ? 'bg-[#E5ECE6] text-[#0B3529]'
                                : reg.status === 'rejected'
                                ? 'bg-[#FFDAD6] text-[#93000A]'
                                : 'bg-[#FFDEA5] text-[#85631E]'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-[#414B47] sm:grid-cols-3">
                          <span>
                            <strong className="text-[#141E1B]">Email:</strong> {reg.email}
                          </span>
                          <span className="font-mono tabular-nums">
                            <strong className="font-sans text-[#141E1B]">Phone:</strong> {reg.phone}
                          </span>
                          {reg.emergencyContactPhone && (
                            <span className="font-mono tabular-nums">
                              <strong className="font-sans text-[#141E1B]">Emergency:</strong>{' '}
                              {reg.emergencyContactName || 'Contact'} ({reg.emergencyContactPhone})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {reg.status === 'approved' && !alreadyAdmin && (
                          <button
                            type="button"
                            onClick={() => onPromoteRegistrationToAdmin(reg)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#4F46E5]/35 bg-[#E0E7FF]/55 px-3 text-xs font-semibold text-[#3730A3] hover:bg-[#E0E7FF]"
                          >
                            <ShieldPlus className="h-3.5 w-3.5" />
                            <span>Make Admin</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingUid(null) : startEdit(reg))}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#C59B48]/60 bg-[#F4F6F1] px-3 text-xs font-semibold text-[#0B3529] hover:bg-[#ECF2ED]"
                        >
                          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                          <span>{isEditing ? 'Cancel' : 'Edit Contact'}</span>
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#C59B48]/40 bg-[#F4F6F1] p-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                            Owner Name
                          </label>
                          <input
                            type="text"
                            value={editDraft.fullName}
                            onChange={(e) => setEditDraft((d) => ({ ...d, fullName: e.target.value }))}
                            className="h-10 w-full rounded-lg border border-[#E2DDD2] bg-white px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                            Primary Phone
                          </label>
                          <input
                            type="tel"
                            value={editDraft.phone}
                            onChange={(e) => setEditDraft((d) => ({ ...d, phone: e.target.value }))}
                            className="h-10 w-full rounded-lg border border-[#E2DDD2] bg-white px-3 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                            Emergency Contact Name
                          </label>
                          <input
                            type="text"
                            value={editDraft.emergencyContactName}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, emergencyContactName: e.target.value }))
                            }
                            className="h-10 w-full rounded-lg border border-[#E2DDD2] bg-white px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                            Emergency Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={editDraft.emergencyContactPhone}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, emergencyContactPhone: e.target.value }))
                            }
                            className="h-10 w-full rounded-lg border border-[#E2DDD2] bg-white px-3 font-mono text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <button
                            type="button"
                            disabled={busyUid === reg.userId}
                            onClick={() => handleSaveAdminEdit(reg)}
                            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5]"
                          >
                            <Check className="h-3.5 w-3.5 text-[#F7DDA4]" />
                            <span>Save Contact Changes</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3 border-t border-[#E5ECE6] pt-4 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        maxLength={300}
                        value={adminNotes[reg.userId] ?? reg.adminNote ?? ''}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({ ...prev, [reg.userId]: e.target.value }))
                        }
                        placeholder="Optional secretariat review note..."
                        className="h-[42px] flex-1 rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-3.5 text-xs text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none"
                      />

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          disabled={busyUid === reg.userId || reg.status === 'approved'}
                          onClick={() => handleDecision(reg, 'approved')}
                          className="inline-flex h-[42px] items-center gap-1.5 rounded-xl bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5] transition-colors hover:bg-[#00241A] disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5 text-[#F7DDA4]" />
                          <span>{reg.status === 'approved' ? 'Approved' : 'Approve & Sync'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={busyUid === reg.userId || reg.status === 'rejected'}
                          onClick={() => handleDecision(reg, 'rejected')}
                          className="inline-flex h-[42px] items-center gap-1.5 rounded-xl border border-[#BA1A1A]/35 bg-white px-4 text-xs font-semibold text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/40 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {adminSection === 'admins' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Create Secondary Admin Form */}
          <form onSubmit={handleCreateAdminSubmit} className="estate-card-prestige rounded-2xl p-6 lg:col-span-5 space-y-4">
            <div className="border-b border-[#E5ECE6] pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                MULTI-ADMIN PROVISIONING
              </p>
              <h3 className="mt-1 font-serif text-xl font-medium text-[#141E1B]">
                Create Additional Admin
              </h3>
              <p className="mt-1 text-xs text-[#414B47]">
                New admins can log in with their Email or Phone + Password to approve owners, edit contacts, or customize the app logo.
              </p>
            </div>

            {adminFormError && (
              <div className="rounded-xl border border-[#BA1A1A]/35 bg-[#FFDAD6]/45 px-3.5 py-2.5 text-xs font-semibold text-[#93000A]">
                {adminFormError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#414B47]">
                Admin Full Name *
              </label>
              <input
                type="text"
                required
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="e.g. Srinivas Reddy"
                className="h-11 w-full rounded-xl border border-[#E2DDD2] bg-white px-3.5 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#414B47]">
                Admin Email *
              </label>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin2@nallurihome.com"
                className="h-11 w-full rounded-xl border border-[#E2DDD2] bg-white px-3.5 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <CountryPhoneInput
                  id="create-admin-phone"
                  label="Mobile Number *"
                  required
                  compact
                  value={newAdminPhone}
                  onChange={setNewAdminPhone}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                  Villa # (1 – 231)
                </label>
                {(() => {
                  const admVillaRes = validateVillaNumberInput(newAdminVilla, false);
                  const hasErr = !admVillaRes.valid && newAdminVilla.trim().length > 0;
                  return (
                    <>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newAdminVilla}
                        onChange={(e) =>
                          setNewAdminVilla(e.target.value.replace(/[^\d]/g, '').slice(0, 4))
                        }
                        placeholder="Optional (1–231)"
                        aria-invalid={hasErr}
                        className={`h-[42px] w-full rounded-xl border bg-white px-3 font-mono text-xs text-[#141E1B] focus:outline-none ${
                          hasErr
                            ? 'border-[#BA1A1A] ring-2 ring-[#BA1A1A]/15'
                            : 'border-[#E2DDD2] focus:border-[#0B3529]'
                        }`}
                      />
                      {hasErr && (
                        <p className="mt-1 text-[10px] font-semibold text-[#BA1A1A]">
                          {admVillaRes.error}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-[#414B47]">
                Admin Login Password *
              </label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="h-11 w-full rounded-xl border border-[#E2DDD2] bg-white pl-3.5 pr-10 text-sm text-[#141E1B] focus:border-[#0B3529] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414B47]"
                >
                  {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-[#414B47]">
                Firebase Google UID (Optional)
              </label>
              <input
                type="text"
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                placeholder="Optional: link Google Auth UID"
                className="h-10 w-full rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-3 font-mono text-xs text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={creatingAdmin}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3529] px-5 text-xs font-semibold text-[#FBF9F5] hover:bg-[#00241A] disabled:opacity-60"
            >
              <ShieldPlus className="h-4 w-4 text-[#F7DDA4]" />
              <span>{creatingAdmin ? 'Provisioning Admin...' : 'Add New Admin'}</span>
            </motion.button>
          </form>

          {/* Active Admins Roster */}
          <section className="estate-card rounded-2xl p-6 lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5ECE6] pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                  GOVERNANCE ROSTER
                </p>
                <h3 className="mt-0.5 font-serif text-xl font-medium text-[#141E1B]">
                  Authorized Nalluri Home Admins
                </h3>
              </div>
              <span className="rounded-full bg-[#ECF2ED] px-3 py-1 text-xs font-bold text-[#0B3529] tabular-nums">
                {adminAccounts.length} Active
              </span>
            </div>

            <div className="divide-y divide-[#E5ECE6]">
              {adminAccounts.map((adm) => {
                const isPrimary =
                  adm.isPrimary || adm.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                const initials = adm.fullName
                  .trim()
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={adm.uid}
                    className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UserAvatar name={adm.fullName} initials={initials || 'AD'} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-[#141E1B] break-words">{adm.fullName}</p>
                          {isPrimary ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0B3529] to-[#184839] px-2.5 py-0.5 text-[10px] font-bold text-[#F7DDA4]">
                              <Crown className="h-3 w-3 text-[#FBBF24]" />
                              Primary Admin
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#E0E7FF] px-2.5 py-0.5 text-[10px] font-bold text-[#3730A3]">
                              Co-Admin
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[#414B47] break-all">{adm.email}</p>
                        {adm.phone && (
                          <p className="mt-0.5 font-mono text-[11px] text-[#0B3529] tabular-nums">
                            {adm.phone}
                            {adm.villaNumber ? ` · Villa #${String(adm.villaNumber).padStart(3, '0')}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => onRemoveAdmin(adm.uid)}
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#BA1A1A]/35 bg-[#FFDAD6]/30 px-3 text-xs font-semibold text-[#93000A] hover:bg-[#FFDAD6]/60 self-end sm:self-center"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {adminSection === 'logo' && (
        <section className="estate-card-prestige rounded-2xl p-6 space-y-5">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E5ECE6] pb-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                BRANDING GOVERNANCE · ADMIN ONLY
              </p>
              <h3 className="mt-1 font-serif text-xl font-medium text-[#141E1B]">
                Application Logo Studio
              </h3>
              <p className="mt-1 text-xs text-[#414B47]">
                Only Admins can update, crop, or reset the Nalluri Home emblem displayed across the portal header.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B3529] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7DDA4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Restricted
            </span>
          </div>

          <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="w-full shrink-0 rounded-2xl border border-[#E2DDD2] bg-[#F4F6F1] p-4 sm:w-auto sm:p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#414B47]">
                Live Header Preview
              </p>
              <NalluriHomesEmblem logoUrl={appLogoUrl} isAdmin={false} />
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5] whitespace-nowrap hover:bg-[#00241A] sm:px-5">
                  <Camera className="h-4 w-4 shrink-0 text-[#F7DDA4]" />
                  <span>{logoBusy ? 'Updating Logo...' : 'Upload & Crop New Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFilePick}
                    className="sr-only"
                    disabled={logoBusy}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setLogoCropSrc(appLogoUrl || DEFAULT_APP_LOGO_URL)}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#C59B48] bg-white px-4 text-xs font-semibold text-[#0B3529] whitespace-nowrap hover:bg-[#ECF2ED]"
                >
                  <Edit3 className="h-3.5 w-3.5 shrink-0 text-[#85631E]" />
                  <span>Adjust Current Logo</span>
                </button>

                {appLogoUrl && appLogoUrl !== DEFAULT_APP_LOGO_URL && (
                  <button
                    type="button"
                    onClick={async () => {
                      setLogoBusy(true);
                      try {
                        await onUpdateAppLogo(null);
                      } finally {
                        setLogoBusy(false);
                      }
                    }}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-4 text-xs font-semibold text-[#414B47] whitespace-nowrap hover:text-[#141E1B]"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span>Reset Default Logo</span>
                  </button>
                )}
              </div>
              <p className="text-xs leading-relaxed text-[#414B47]">
                Recommended square framing (1:1). Use the interactive cropper to zoom, center, and rotate your logo cleanly.
              </p>
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {logoCropSrc && (
          <ImageCropperModal
            imageSrc={logoCropSrc}
            aspectShape="square"
            outputWidth={256}
            outputHeight={256}
            title="Crop Application Logo"
            subtitle="Frame the Nalluri Home emblem inside the square border."
            onCancel={() => setLogoCropSrc(null)}
            onConfirm={async (croppedDataUrl) => {
              setLogoBusy(true);
              try {
                await onUpdateAppLogo(croppedDataUrl);
                setLogoCropSrc(null);
              } finally {
                setLogoBusy(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface Villas231DirectoryPanelProps {
  isAdmin: boolean;
  emergencyDesks: EmergencyDesk[];
  syncedVillas: Record<number, VillaDirectorySync>;
  onUpdateEmergencyDesk: (desk: EmergencyDesk) => Promise<void>;
  onUpdateVillaRecord: (villa: VillaRecord) => Promise<void>;
  onCopyNumber: (label: string, number: string) => void;
}

export const Villas231DirectoryPanel: React.FC<Villas231DirectoryPanelProps> = ({
  isAdmin,
  emergencyDesks,
  syncedVillas,
  onUpdateEmergencyDesk,
  onUpdateVillaRecord,
  onCopyNumber,
}) => {
  const [search, setSearch] = useState('');
  const [streetFilter, setStreetFilter] = useState<string>('All');
  const [showAll, setShowAll] = useState(false);

  const [editingDeskId, setEditingDeskId] = useState<string | null>(null);
  const [deskDraft, setDeskDraft] = useState<EmergencyDesk | null>(null);

  const [editingVillaNum, setEditingVillaNum] = useState<number | null>(null);
  const [villaDraft, setVillaDraft] = useState<VillaRecord | null>(null);

  const mergedVillas: VillaRecord[] = useMemo(() => {
    return BASE_231_VILLAS.map((v) => {
      const synced = syncedVillas[v.villaNumber];
      if (!synced) return v;
      return {
        ...v,
        ownerName: synced.ownerName,
        street: synced.street,
        intercomExt: synced.intercomExt,
        emergencyLine: synced.emergencyLine,
        occupancyStatus: synced.occupancyStatus,
      };
    });
  }, [syncedVillas]);

  const streets = useMemo(() => {
    const uniq = Array.from(new Set(BASE_231_VILLAS.map((v) => v.street)));
    return ['All', ...uniq];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mergedVillas.filter((v) => {
      const streetMatch = streetFilter === 'All' || v.street === streetFilter;
      const queryMatch =
        !q ||
        v.villaCode.toLowerCase().includes(q) ||
        String(v.villaNumber) === q ||
        v.ownerName.toLowerCase().includes(q) ||
        v.street.toLowerCase().includes(q) ||
        v.emergencyLine.toLowerCase().includes(q) ||
        v.intercomExt.toLowerCase().includes(q);
      return streetMatch && queryMatch;
    });
  }, [mergedVillas, search, streetFilter]);

  const visibleVillas = showAll ? filtered : filtered.slice(0, 30);

  return (
    <div className="space-y-6">
      {/* Default Community Address Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2DDD2] bg-white px-5 py-3.5 text-xs">
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-[#85631E]" />
          <span className="font-semibold text-[#141E1B]">{DEFAULT_COMMUNITY_ADDRESS}</span>
        </div>
        {isAdmin ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0B3529] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7DDA4]">
            <ShieldCheck className="h-3 w-3" />
            Admin Edit Mode Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECF2ED] px-3 py-1 text-[10px] font-semibold text-[#414B47]">
            <Lock className="h-3 w-3" />
            Verified Directory (Read-Only)
          </span>
        )}
      </div>

      {/* Enclave Emergency Rapid-Response Numbers */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {emergencyDesks.map((desk) => {
          const isEditingDesk = isAdmin && editingDeskId === desk.id && deskDraft;
          return (
            <div
              key={desk.id}
              className="estate-card-prestige flex flex-col justify-between rounded-2xl p-5"
            >
              {isEditingDesk ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                      EDIT EMERGENCY DESK
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDeskId(null);
                        setDeskDraft(null);
                      }}
                      className="text-xs font-semibold text-[#414B47]"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={deskDraft.title}
                    onChange={(e) => setDeskDraft({ ...deskDraft, title: e.target.value })}
                    placeholder="Desk Title"
                    className="h-9 w-full rounded-lg border border-[#E2DDD2] bg-white px-2.5 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={deskDraft.detail}
                    onChange={(e) => setDeskDraft({ ...deskDraft, detail: e.target.value })}
                    placeholder="Details"
                    className="h-9 w-full rounded-lg border border-[#E2DDD2] bg-white px-2.5 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={deskDraft.ext}
                      onChange={(e) => setDeskDraft({ ...deskDraft, ext: e.target.value })}
                      placeholder="Ext."
                      className="h-9 rounded-lg border border-[#E2DDD2] bg-white px-2.5 font-mono text-xs"
                    />
                    <input
                      type="tel"
                      value={deskDraft.number}
                      onChange={(e) => setDeskDraft({ ...deskDraft, number: e.target.value })}
                      placeholder="Phone"
                      className="h-9 rounded-lg border border-[#E2DDD2] bg-white px-2.5 font-mono text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await onUpdateEmergencyDesk(deskDraft);
                      setEditingDeskId(null);
                      setDeskDraft(null);
                    }}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B3529] text-xs font-semibold text-[#FBF9F5]"
                  >
                    <Check className="h-3.5 w-3.5 text-[#F7DDA4]" />
                    <span>Save Desk</span>
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#BA1A1A]">
                        EMERGENCY DISPATCH · {desk.ext}
                      </p>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDeskId(desk.id);
                            setDeskDraft({ ...desk });
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-[#C59B48]/50 bg-[#F4F6F1] px-2 py-0.5 text-[10px] font-bold text-[#0B3529] hover:bg-[#ECF2ED]"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                    <h3 className="mt-1 font-serif text-base font-semibold text-[#141E1B]">
                      {desk.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#414B47]">{desk.detail}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E5ECE6] pt-3">
                    <span className="font-mono text-sm font-bold text-[#0B3529] tabular-nums">
                      {desk.number}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onCopyNumber(desk.title, desk.number)}
                        aria-label={`Copy ${desk.title} number`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2DDD2] bg-[#ECF2ED] text-[#0B3529] hover:bg-[#E5ECE6]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={`tel:${desk.number.replace(/\s+/g, '')}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#BA1A1A] px-3 text-xs font-semibold text-white hover:bg-[#93000A]"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Dial</span>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* 231 Villas Filter & Search Controls */}
      <section className="estate-card rounded-2xl p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5ECE6] pb-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
              COMPLETE ENCLAVE ROSTER · 231 VILLAS
            </p>
            <h2 className="mt-1 font-serif text-[22px] font-medium text-[#141E1B]">
              231 Villas Directory & Emergency Contact Lines
            </h2>
            <p className="mt-1 text-xs text-[#414B47] tabular-nums">
              Showing {visibleVillas.length} of {filtered.length} matching residences (Total 231 Villas)
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#414B47]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Villa #, name, or number"
                className="h-[44px] w-full rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] pl-9 pr-3 text-xs text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="h-[44px] rounded-xl border border-[#C59B48] bg-white px-4 text-xs font-semibold text-[#0B3529] hover:bg-[#ECF2ED] whitespace-nowrap"
            >
              {showAll ? 'Show Compact (30)' : `Load All ${filtered.length} Villas`}
            </button>
          </div>
        </div>

        {/* Avenue Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pb-1">
          {streets.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStreetFilter(st)}
              className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                streetFilter === st
                  ? 'bg-[#0B3529] text-[#FBF9F5]'
                  : 'bg-[#ECF2ED] text-[#414B47] hover:text-[#141E1B]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* 231 Villas Table / Mobile List */}
        <div className="mt-4 divide-y divide-[#E5ECE6]">
          {visibleVillas.map((villa) => {
            const isEditingVilla =
              isAdmin && editingVillaNum === villa.villaNumber && villaDraft;

            return (
              <div key={villa.villaNumber} className="py-3.5">
                {isEditingVilla ? (
                  <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#C59B48]/45 bg-[#F4F6F1] p-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                        Owner Name ({villa.villaCode})
                      </label>
                      <input
                        type="text"
                        value={villaDraft.ownerName}
                        onChange={(e) =>
                          setVillaDraft({ ...villaDraft, ownerName: e.target.value })
                        }
                        className="h-9 w-full rounded-lg border border-[#E2DDD2] bg-white px-2.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={villaDraft.emergencyLine}
                        onChange={(e) =>
                          setVillaDraft({ ...villaDraft, emergencyLine: e.target.value })
                        }
                        className="h-9 w-full rounded-lg border border-[#E2DDD2] bg-white px-2.5 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-[#414B47]">
                        Intercom & Avenue
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={villaDraft.intercomExt}
                          onChange={(e) =>
                            setVillaDraft({ ...villaDraft, intercomExt: e.target.value })
                          }
                          className="h-9 w-24 rounded-lg border border-[#E2DDD2] bg-white px-2 font-mono text-xs"
                        />
                        <input
                          type="text"
                          value={villaDraft.street}
                          onChange={(e) =>
                            setVillaDraft({ ...villaDraft, street: e.target.value })
                          }
                          className="h-9 flex-1 rounded-lg border border-[#E2DDD2] bg-white px-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateVillaRecord(villaDraft);
                          setEditingVillaNum(null);
                          setVillaDraft(null);
                        }}
                        className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-[#0B3529] px-3 text-xs font-semibold text-[#FBF9F5]"
                      >
                        <Check className="h-3.5 w-3.5 text-[#F7DDA4]" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVillaNum(null);
                          setVillaDraft(null);
                        }}
                        className="flex h-9 items-center justify-center rounded-lg border border-[#E2DDD2] bg-white px-3 text-xs font-semibold text-[#414B47]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-xl bg-[#0B3529] font-mono text-xs font-bold text-[#F7DDA4] tabular-nums">
                        #{String(villa.villaNumber).padStart(3, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-[#141E1B] break-words">
                            {villa.ownerName}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                              villa.occupancyStatus === 'Approved'
                                ? 'bg-[#0B3529] text-[#F7DDA4]'
                                : villa.occupancyStatus === 'Occupied'
                                ? 'bg-[#E5ECE6] text-[#0B3529]'
                                : 'bg-[#FFDEA5]/65 text-[#85631E]'
                            }`}
                          >
                            {villa.occupancyStatus}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#414B47]">
                          {villa.villaCode} · {villa.street} · {villa.sectorGate} ·{' '}
                          <span className="font-mono">{villa.intercomExt}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 self-stretch sm:self-center shrink-0">
                      <span className="font-mono text-xs font-semibold text-[#0B3529] tabular-nums">
                        {villa.emergencyLine}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVillaNum(villa.villaNumber);
                            setVillaDraft({ ...villa });
                          }}
                          aria-label={`Edit ${villa.villaCode} details`}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#C59B48]/50 bg-[#F4F6F1] px-2.5 text-[11px] font-semibold text-[#0B3529] hover:bg-[#ECF2ED]"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onCopyNumber(villa.villaCode, villa.emergencyLine)}
                        aria-label={`Copy emergency contact for ${villa.villaCode}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2DDD2] bg-[#ECF2ED] text-[#0B3529] hover:bg-[#E5ECE6]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={`tel:${villa.emergencyLine.replace(/\s+/g, '')}`}
                        aria-label={`Call emergency line for ${villa.villaCode}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#0B3529] px-3 text-xs font-semibold text-[#FBF9F5] hover:bg-[#00241A]"
                      >
                        <Phone className="h-3.5 w-3.5 text-[#F7DDA4]" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!showAll && filtered.length > 30 && (
          <div className="mt-5 border-t border-[#E5ECE6] pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex h-[44px] items-center rounded-xl bg-[#0B3529] px-6 text-xs font-semibold text-[#FBF9F5] hover:bg-[#00241A]"
            >
              View Remaining {filtered.length - 30} Villas (All 231)
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
