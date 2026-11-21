import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Camera,
  Check,
  Crown,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { ActiveSessionProfile } from '../types/estate';
import { DEFAULT_APP_LOGO_URL, readFileAsDataUrl } from '../utils/ownerAuth';
import { ImageCropperModal } from './ImageCropperModal';
import { UserAvatar } from './ui/EstatePrimitives';

interface AuthAndProfileModalProps {
  mode: 'login' | 'profile';
  activeProfile: ActiveSessionProfile;
  onClose: () => void;
  onCredentialLogin: (identifier: string, password: string) => Promise<string | null>;
  onGoogleSignIn: () => Promise<void>;
  onGoToSignup: () => void;
  onUpdateAvatar: (avatarDataUrl: string | undefined) => Promise<void>;
  onLogout: () => Promise<void>;
}

function renderCrestDataUrl(variant: 'emerald' | 'champagne', initials: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 240, 240);
  if (variant === 'emerald') {
    grad.addColorStop(0, '#0B3529');
    grad.addColorStop(0.55, '#175442');
    grad.addColorStop(1, '#85631E');
  } else {
    grad.addColorStop(0, '#85631E');
    grad.addColorStop(0.5, '#C59B48');
    grad.addColorStop(1, '#0B3529');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 240, 240);

  ctx.strokeStyle = 'rgba(247, 221, 164, 0.72)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(120, 120, 96, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#F7DDA4';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((initials || 'NH').slice(0, 2).toUpperCase(), 120, 126);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const AuthAndProfileModal: React.FC<AuthAndProfileModalProps> = ({
  mode,
  activeProfile,
  onClose,
  onCredentialLogin,
  onGoogleSignIn,
  onGoToSignup,
  onUpdateAvatar,
  onLogout,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [villaThumbFailed, setVillaThumbFailed] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!identifier.trim() || !password) {
      setLoginError('Please enter your registered email or phone number and password.');
      return;
    }
    setBusy(true);
    try {
      const err = await onCredentialLogin(identifier.trim(), password);
      if (err) {
        setLoginError(err);
      } else {
        onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMessage(null);
    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      setCropSourceUrl(rawDataUrl);
    } catch (err) {
      setAvatarMessage(err instanceof Error ? err.message : 'Could not load image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmCroppedAvatar = async (croppedDataUrl: string) => {
    setAvatarBusy(true);
    try {
      await onUpdateAvatar(croppedDataUrl);
      setAvatarMessage('Cropped & updated profile photo.');
      setCropSourceUrl(null);
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end justify-center bg-[#141E1B]/55 backdrop-blur-xs sm:items-center sm:p-6"
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[#E2DDD2] bg-white shadow-2xl sm:rounded-2xl"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5ECE6] bg-white px-6 pb-4 pt-5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                NALLURI HOME · GATED VILLA COMMUNITY
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium text-[#141E1B]">
                {mode === 'login' ? 'Resident & Admin Sign-In' : 'Resident Profile & Photo'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2DDD2] bg-[#F4F6F1] text-[#141E1B] hover:bg-[#ECF2ED]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
          {mode === 'login' ? (
            <div className="space-y-5">
              <p className="text-xs leading-[19px] text-[#414B47]">
                Approved villa owners and authorized enclave admins can sign in using their{' '}
                <span className="font-semibold text-[#141E1B]">Email or Phone Number</span> and
                password.
              </p>

              {loginError && (
                <div className="rounded-xl border border-[#BA1A1A]/35 bg-[#FFDAD6]/45 px-4 py-3 text-xs font-semibold text-[#93000A]">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="owner@domain.com or +91 98490 00108"
                    className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-4 text-sm text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-[48px] w-full rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] pl-4 pr-11 text-sm text-[#141E1B] focus:border-[#0B3529] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C59B48]/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#414B47] hover:text-[#141E1B]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={busy}
                  className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#0B3529] px-5 text-sm font-semibold text-[#FBF9F5] transition-colors hover:bg-[#00241A] disabled:opacity-60"
                >
                  <KeyRound className="h-4 w-4 text-[#F7DDA4]" />
                  <span>{busy ? 'Verifying Credentials...' : 'Login to Nalluri Home'}</span>
                </motion.button>
              </form>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-[#E5ECE6]" />
                <span className="mx-3 shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                  Or Admin / Google Auth
                </span>
                <div className="flex-grow border-t border-[#E5ECE6]" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={async () => {
                    await onGoogleSignIn();
                    onClose();
                  }}
                  className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-[#C59B48] bg-[#F4F6F1] px-4 text-xs font-semibold text-[#0B3529] hover:bg-[#ECF2ED]"
                >
                  <LogIn className="h-4 w-4 text-[#85631E]" />
                  <span>Google / Admin Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToSignup();
                  }}
                  className="flex h-[46px] items-center justify-center gap-2 rounded-xl border border-[#E2DDD2] bg-white px-4 text-xs font-semibold text-[#141E1B] hover:bg-[#ECF2ED]"
                >
                  <UserPlus className="h-4 w-4 text-[#0B3529]" />
                  <span>New Owner Sign-Up</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* User Header Summary */}
              <div className="flex items-center gap-4 rounded-2xl bg-[#ECF2ED] p-4">
                <UserAvatar
                  name={activeProfile.fullName}
                  initials={activeProfile.initials}
                  avatarUrl={activeProfile.avatarDataUrl}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-serif text-lg font-semibold text-[#141E1B]">
                      {activeProfile.fullName}
                    </h3>
                    <span className="rounded-full bg-[#0B3529] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F7DDA4]">
                      {activeProfile.isAdmin ? 'Admin' : activeProfile.villaLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#414B47]">{activeProfile.email}</p>
                  {activeProfile.phone && (
                    <p className="mt-0.5 font-mono text-xs text-[#0B3529] tabular-nums">
                      {activeProfile.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Profile Photo Editor */}
              <div className="space-y-3 rounded-2xl border border-[#E2DDD2] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.06em] text-[#85631E]">
                    Upload, Crop & Adjust Profile Photo
                  </p>
                  {avatarMessage && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B3529]">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>{avatarMessage}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5] whitespace-nowrap transition-colors hover:bg-[#00241A]">
                    <Camera className="h-4 w-4 shrink-0 text-[#F7DDA4]" />
                    <span>{avatarBusy ? 'Saving...' : 'Upload & Crop Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                      disabled={avatarBusy}
                    />
                  </label>

                  {activeProfile.avatarDataUrl && (
                    <button
                      type="button"
                      onClick={() => setCropSourceUrl(activeProfile.avatarDataUrl || null)}
                      className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#C59B48] bg-[#F4F6F1] px-3.5 text-xs font-semibold text-[#0B3529] whitespace-nowrap hover:bg-[#ECF2ED]"
                    >
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#85631E]" />
                      <span>Re-Crop</span>
                    </button>
                  )}

                  {activeProfile.avatarDataUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateAvatar(undefined);
                        setAvatarMessage('Reverted to initials.');
                      }}
                      className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl border border-[#E2DDD2] bg-[#F4F6F1] px-3.5 text-xs font-semibold text-[#414B47] whitespace-nowrap hover:text-[#141E1B]"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[11px] text-[#414B47]">Or choose an estate crest avatar:</p>
                  <div className="grid grid-cols-3 gap-3 sm:max-w-[280px]">
                    <button
                      type="button"
                      onClick={async () => {
                        await onUpdateAvatar(DEFAULT_APP_LOGO_URL);
                        setAvatarMessage('Selected Nalluri Villa photo.');
                      }}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <div
                        className={`flex h-11 w-11 aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-[#0B3529] transition-transform hover:scale-105 ${
                          activeProfile.avatarDataUrl === DEFAULT_APP_LOGO_URL
                            ? 'border-[#C59B48]'
                            : 'border-[#E2DDD2]'
                        }`}
                      >
                        {!villaThumbFailed ? (
                          <img
                            src={DEFAULT_APP_LOGO_URL}
                            alt="Nalluri Villa"
                            onError={() => setVillaThumbFailed(true)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Home className="h-5 w-5 text-[#F7DDA4]" />
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-[#414B47]">Nalluri Villa</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const url = renderCrestDataUrl('emerald', activeProfile.initials);
                        if (url) await onUpdateAvatar(url);
                        setAvatarMessage('Selected Emerald Crest.');
                      }}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <div className="flex h-11 w-11 aspect-square shrink-0 items-center justify-center rounded-full border-2 border-[#E2DDD2] bg-gradient-to-br from-[#0B3529] via-[#175442] to-[#85631E] text-xs font-bold text-[#F7DDA4] transition-transform hover:scale-105">
                        {activeProfile.initials}
                      </div>
                      <span className="text-[10px] font-medium text-[#414B47]">Emerald Crest</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const url = renderCrestDataUrl('champagne', activeProfile.initials);
                        if (url) await onUpdateAvatar(url);
                        setAvatarMessage('Selected Champagne Gold.');
                      }}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <div className="flex h-11 w-11 aspect-square shrink-0 items-center justify-center rounded-full border-2 border-[#E2DDD2] bg-gradient-to-br from-[#85631E] via-[#C59B48] to-[#0B3529] text-[#FBF9F5] transition-transform hover:scale-105">
                        <Crown className="h-4 w-4 text-[#F7DDA4]" />
                      </div>
                      <span className="text-[10px] font-medium text-[#414B47]">Gold Seal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Read-only Default Community Address & Contact Governance Notice */}
              <div className="space-y-2.5 rounded-2xl bg-[#ECF2ED] p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#85631E]" />
                  <div>
                    <p className="font-bold text-[#141E1B]">Community Address</p>
                    <p className="mt-0.5 leading-[18px] text-[#414B47]">{activeProfile.address}</p>
                  </div>
                </div>
                {!activeProfile.isAdmin && (
                  <div className="flex items-start gap-2.5 border-t border-[#D6DFD8] pt-2.5 text-[11px] text-[#414B47]">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0B3529]" />
                    <span>
                      Contact phone numbers and emergency contacts are locked to Secretariat Admin verification.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    await onLogout();
                    onClose();
                  }}
                  className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#BA1A1A]/35 bg-[#FFDAD6]/35 px-5 text-xs font-bold text-[#93000A] transition-colors hover:bg-[#FFDAD6]/65"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout from Nalluri Home</span>
                </button>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {cropSourceUrl && (
          <ImageCropperModal
            imageSrc={cropSourceUrl}
            aspectShape="circle"
            outputWidth={256}
            outputHeight={256}
            title="Crop Profile Picture"
            subtitle="Drag, zoom, and rotate so your face fits cleanly inside the circular frame."
            onCancel={() => setCropSourceUrl(null)}
            onConfirm={handleConfirmCroppedAvatar}
          />
        )}
      </AnimatePresence>
    </>
  );
};
