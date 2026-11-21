import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Camera,
  Check,
  Copy,
  Droplets,
  Film,
  Heart,
  KeyRound,
  Lock,
  LogOut,
  MapPin,
  Package,
  PhoneCall,
  PhoneOff,
  Plus,
  Sparkles,
  Thermometer,
  Trophy,
  Users,
} from 'lucide-react';
import { RESIDENT_PROFILE } from '../../data/initialEstateData';
import {
  ActiveSessionProfile,
  AmenityBooking,
  ClimateZone,
  CommunityPost,
  EmotionalQuote,
  GuestPass,
  IrrigationZone,
  ParcelItem,
  ScreenId,
} from '../../types/estate';
import { DEFAULT_COMMUNITY_ADDRESS, getTimeOfDayGreeting } from '../../utils/ownerAuth';
import {
  EnhancedVillaHeroImage,
  OccupancyRing,
  QrTokenMatrix,
  StatusBadge,
  UserAvatar,
} from '../ui/EstatePrimitives';

interface OverviewScreenProps {
  activeProfile: ActiveSessionProfile;
  loginQuote: EmotionalQuote;
  onNextQuote?: () => void;
  passes: GuestPass[];
  climateZones: ClimateZone[];
  irrigationZones: IrrigationZone[];
  parcels: ParcelItem[];
  bookings: AmenityBooking[];
  posts: CommunityPost[];
  intercomActive: boolean;
  intercomSeconds: number;
  copiedPassId: string | null;
  onToggleIntercom: () => void;
  onCopyPass: (pass: GuestPass) => void;
  onOpenPass: (pass: GuestPass) => void;
  onOpenCreatePass: () => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenDirectoryTab: (tab: 'villas231' | 'signup' | 'admin' | 'concierge') => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onNotify: (msg: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  activeProfile,
  loginQuote,
  onNextQuote,
  passes,
  climateZones,
  irrigationZones,
  parcels,
  bookings,
  posts,
  intercomActive,
  intercomSeconds,
  copiedPassId,
  onToggleIntercom,
  onCopyPass,
  onOpenPass,
  onOpenCreatePass,
  onNavigate,
  onOpenDirectoryTab,
  onOpenLogin,
  onOpenProfile,
  onLogout,
  onNotify,
}) => {
  const featuredPass =
    passes.find((p) => p.status === 'EN ROUTE') ||
    passes.find((p) => p.status === 'APPROVED') ||
    passes[0];

  const mainZone = climateZones[0];
  const activeIrrigationCount = irrigationZones.filter((z) => z.enabled).length;
  const pendingParcels = parcels.filter((p) => !p.collected).length;
  const greeting = getTimeOfDayGreeting();
  const displayAddress = activeProfile.address || DEFAULT_COMMUNITY_ADDRESS;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Editorial Header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4 border-b border-[#E2DDD2] pb-6"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="flex items-start gap-4">
            {activeProfile.isLoggedIn && (
              <button
                type="button"
                onClick={onOpenProfile}
                title="Change profile photo"
                className="group relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B48]"
              >
                <UserAvatar
                  name={activeProfile.fullName}
                  initials={activeProfile.initials}
                  avatarUrl={activeProfile.avatarDataUrl}
                  size="lg"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0B3529] text-[#F7DDA4] shadow-sm transition-transform group-hover:scale-110">
                  <Camera className="h-3 w-3" />
                </span>
              </button>
            )}

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                {activeProfile.isLoggedIn
                  ? `${activeProfile.villaLabel} · ${activeProfile.street} · ${activeProfile.tier} · ${RESIDENT_PROFILE.enclaveTotal}`
                  : `NALLURI HOME · GATED VILLA COMMUNITY · ${RESIDENT_PROFILE.enclaveTotal}`}
              </p>
              <h1 className="mt-1.5 font-serif text-[28px] font-normal leading-[36px] tracking-[-0.01em] text-[#141E1B] md:text-[36px] md:leading-[44px]">
                {activeProfile.isLoggedIn
                  ? `${greeting}, ${activeProfile.fullName}`
                  : `${greeting}, Welcome to Nalluri Home`}
              </h1>

              {/* Emotional / Lovable / Motivational Quote Card (Updates Every Login) */}
              <motion.div
                key={loginQuote.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-3 max-w-2xl rounded-2xl border border-[#C59B48]/40 bg-gradient-to-r from-[#FFFDF7] via-[#F7DDA4]/22 to-[#ECF2ED]/80 px-4 py-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                    <Heart className="h-3 w-3 fill-[#E11D48] text-[#E11D48]" />
                    <span>Daily Blessing · {loginQuote.mood}</span>
                  </span>
                  {onNextQuote && (
                    <button
                      type="button"
                      onClick={onNextQuote}
                      className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-semibold text-[#0B3529] ring-1 ring-[#E2DDD2] transition-colors hover:bg-[#ECF2ED]"
                    >
                      <Sparkles className="h-2.5 w-2.5 text-[#85631E]" />
                      <span>Next Thought</span>
                    </button>
                  )}
                </div>
                <p className="mt-1.5 font-serif text-[15px] italic leading-[22px] text-[#141E1B]">
                  “{loginQuote.quote}”
                </p>
                <p className="mt-1 text-xs text-[#414B47]">{loginQuote.subtitle}</p>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeProfile.isLoggedIn ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onOpenProfile}
                  className="inline-flex h-[44px] items-center gap-2 rounded-xl border border-[#C59B48] bg-white px-4 text-xs font-semibold text-[#0B3529] transition-colors hover:bg-[#ECF2ED] whitespace-nowrap shrink-0"
                >
                  <Camera className="h-3.5 w-3.5 text-[#85631E]" />
                  <span>Profile Photo</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-[44px] items-center gap-1.5 rounded-xl border border-[#BA1A1A]/30 bg-[#FFDAD6]/30 px-4 text-xs font-semibold text-[#93000A] transition-colors hover:bg-[#FFDAD6]/60 whitespace-nowrap shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onOpenLogin}
                className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#C59B48] bg-white px-4 text-xs font-semibold text-[#0B3529] transition-colors hover:bg-[#ECF2ED] whitespace-nowrap shrink-0"
              >
                <KeyRound className="h-4 w-4 text-[#85631E]" />
                <span>Owner Login</span>
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onOpenCreatePass}
              className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#0B3529] px-5 text-xs font-semibold tracking-[0.02em] text-[#FBF9F5] transition-colors hover:bg-[#00241A] whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 text-[#F7DDA4]" />
              <span>Issue Gate Pass</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onOpenDirectoryTab('villas231')}
              className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#E2DDD2] bg-[#ECF2ED] px-4 text-xs font-semibold text-[#0B3529] transition-colors hover:bg-[#E5ECE6] whitespace-nowrap shrink-0"
            >
              <Users className="h-4 w-4 text-[#85631E]" />
              <span>231 Villas & Emergency</span>
            </motion.button>
          </div>
        </div>

        {/* Default Community Address Strip */}
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#E2DDD2] bg-white/85 px-4 py-3 text-xs sm:flex-row sm:items-center">
          <div className="flex items-start gap-2.5 min-w-0 flex-1 sm:items-center">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#85631E] sm:mt-0" />
            <span className="font-medium leading-relaxed text-[#141E1B] break-words">
              {displayAddress}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(displayAddress).catch(() => {});
              }
              onNotify('Copied Nalluri Homes community address');
            }}
            className="inline-flex items-center gap-1 self-end rounded-lg bg-[#ECF2ED] px-2.5 py-1.5 text-[11px] font-semibold text-[#0B3529] hover:bg-[#E5ECE6] shrink-0 sm:self-center"
          >
            <Copy className="h-3 w-3" />
            <span>Copy Address</span>
          </button>
        </div>
      </motion.section>

      {/* Primary Two-Column Command Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-7">
          {featuredPass && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              className="estate-card-prestige rounded-2xl p-6 transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5ECE6] pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                    ACTIVE FASTPASS CLEARANCE
                  </p>
                  <h2 className="mt-1 font-serif text-[22px] font-medium leading-[28px] text-[#141E1B]">
                    {featuredPass.guestName}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#414B47]">
                    {featuredPass.companyOrRelation} · {featuredPass.gate}
                  </p>
                </div>
                <StatusBadge status={featuredPass.status} />
              </div>

              <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => onOpenPass(featuredPass)}
                  className="shrink-0 rounded-xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B48]"
                  title="Expand FastPass QR placard"
                >
                  <QrTokenMatrix code={featuredPass.tokenCode} size={118} />
                </button>

                <div className="w-full min-w-0 flex-1 space-y-4">
                  <div className="grid grid-cols-1 gap-3.5 rounded-xl bg-[#ECF2ED] p-4 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                        Vehicle Tag
                      </span>
                      <span className="mt-1 block font-mono text-xs font-semibold text-[#141E1B] tabular-nums">
                        {featuredPass.vehiclePlate}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                        Pass Token
                      </span>
                      <span className="mt-1 block font-mono text-xs font-semibold text-[#0B3529] tabular-nums">
                        {featuredPass.tokenCode}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                        Arrival Window
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-[#141E1B] tabular-nums">
                        {featuredPass.windowLabel}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                        Vehicle
                      </span>
                      <span className="mt-1 block text-xs leading-snug text-[#414B47] break-words">
                        {featuredPass.vehicleModel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onCopyPass(featuredPass)}
                      className="inline-flex h-[44px] items-center gap-2 rounded-xl bg-[#0B3529] px-4 text-xs font-semibold text-[#FBF9F5] transition-transform active:scale-[0.98] hover:bg-[#00241A]"
                    >
                      {copiedPassId === featuredPass.id ? (
                        <Check className="h-3.5 w-3.5 text-[#F7DDA4]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-[#F7DDA4]" />
                      )}
                      <span>
                        {copiedPassId === featuredPass.id ? 'Pass Link Copied' : 'Share Encrypted Pass'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenPass(featuredPass)}
                      className="inline-flex h-[44px] items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-[#0B3529] transition-colors hover:bg-[#ECF2ED]"
                    >
                      <span>Inspect Placard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Community Insights & Festival Reels Preview */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.09, ease: [0.22, 1, 0.36, 1] }}
            className="estate-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                  COMMUNITY INSIGHTS · FESTIVALS & SPOTLIGHTS
                </p>
                <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                  Video Reels & Neighbor Feeds
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('community')}
                className="inline-flex min-h-[40px] items-center gap-1 text-xs font-bold text-[#0B3529] hover:underline"
              >
                <span>Open Feed</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {posts.slice(0, 2).map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="flex flex-col justify-between rounded-xl border border-[#E2DDD2] bg-[#ECF2ED] p-4 text-left transition-colors hover:bg-[#E5ECE6]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0B3529] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F7DDA4]">
                        {post.mediaType === 'video' ? (
                          <Film className="h-2.5 w-2.5" />
                        ) : (
                          <Sparkles className="h-2.5 w-2.5" />
                        )}
                        <span>{post.categoryTag || 'Insight'}</span>
                      </span>
                      {post.videoDuration && (
                        <span className="font-mono text-[10px] font-semibold text-[#414B47] tabular-nums">
                          {post.videoDuration}
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 line-clamp-2 text-xs font-bold text-[#141E1B]">
                      {post.visualCaption || post.body}
                    </p>
                    <p className="mt-1 text-[11px] text-[#414B47]">
                      {post.author} · {post.villa}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-[#0B3529] tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-[#BA1A1A] text-[#BA1A1A]" />
                      {post.likes}
                    </span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Clubhouse Live Glance */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="estate-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                  CLUBHOUSE TELEMETRY
                </p>
                <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                  Fitness Center & Tonight’s Court
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('amenities')}
                className="inline-flex min-h-[40px] items-center gap-1 text-xs font-bold text-[#0B3529] hover:underline"
              >
                <span>Amenity Reserve</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onNavigate('amenities')}
                className="flex items-center gap-4 rounded-xl bg-[#ECF2ED] p-4 text-left transition-colors hover:bg-[#E5ECE6]"
              >
                <OccupancyRing current={14} max={20} />
                <div>
                  <span className="rounded bg-[#FFDEA5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#85631E]">
                    70% PEAK
                  </span>
                  <p className="mt-1.5 text-sm font-bold text-[#141E1B]">Fitness Center</p>
                  <p className="mt-0.5 text-xs text-[#414B47]">6 slots open · 21.5°C</p>
                </div>
              </button>

              {bookings[0] && (
                <button
                  type="button"
                  onClick={() => onNavigate('amenities')}
                  className="flex flex-col justify-between rounded-xl bg-[#0B3529] p-4 text-left text-[#FBF9F5] transition-transform hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <Trophy className="h-4 w-4 text-[#F7DDA4]" />
                    <span className="rounded-full bg-[#F7DDA4] px-2.5 py-0.5 text-[9px] font-bold uppercase text-[#261900]">
                      {bookings[0].dayTag}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-serif text-base font-medium">{bookings[0].amenityName}</p>
                    <p className="mt-0.5 text-xs text-[#A3D0BE] tabular-nums">
                      {bookings[0].timeSlot} · {bookings[0].status}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* Gate Arrival Ledger */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="estate-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                  PERIMETER LEDGER
                </p>
                <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                  Today’s Gate Authorizations
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('gate')}
                className="inline-flex min-h-[40px] items-center gap-1 text-xs font-bold text-[#0B3529] hover:underline"
              >
                <span>All Passes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#E5ECE6]">
              {passes.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenPass(item)}
                  className="flex w-full items-start justify-between gap-3 py-3.5 text-left transition-colors hover:bg-[#F4F6F1] sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#141E1B] break-words">
                      {item.guestName}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#414B47] tabular-nums">
                      {item.category} · {item.gate} · {item.windowLabel}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-5">
          {/* Enhanced Villa Architecture Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <EnhancedVillaHeroImage />
          </motion.div>

          {/* Villa Telemetry Glance (2x2 Grid) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="estate-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                  {activeProfile.villaLabel} TELEMETRICS
                </p>
                <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                  Residence Systems Glance
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenDirectoryTab('concierge')}
                className="inline-flex min-h-[40px] items-center gap-1 text-xs font-bold text-[#0B3529] hover:underline"
              >
                <span>Controls</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onOpenDirectoryTab('concierge')}
                className="flex flex-col justify-between rounded-xl bg-[#ECF2ED] p-4 text-left transition-colors hover:bg-[#E5ECE6]"
              >
                <div className="flex items-center justify-between text-[#0B3529]">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                    HVAC
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-[#141E1B] tabular-nums">
                    {mainZone.currentTemp.toFixed(1)}°C
                  </p>
                  <p className="mt-0.5 text-xs text-[#414B47] tabular-nums">
                    {mainZone.mode} · {mainZone.consumptionKw} kW
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenDirectoryTab('concierge')}
                className="flex flex-col justify-between rounded-xl bg-[#ECF2ED] p-4 text-left transition-colors hover:bg-[#E5ECE6]"
              >
                <div className="flex items-center justify-between text-[#0B3529]">
                  <Droplets className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                    Grounds
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-[#141E1B] tabular-nums">
                    {activeIrrigationCount}/{irrigationZones.length} Active
                  </p>
                  <p className="mt-0.5 text-xs text-[#414B47]">Soil moisture 64%</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOpenDirectoryTab('concierge')}
                className="flex flex-col justify-between rounded-xl bg-[#ECF2ED] p-4 text-left transition-colors hover:bg-[#E5ECE6]"
              >
                <div className="flex items-center justify-between text-[#85631E]">
                  <Package className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                    Parcels
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-[#141E1B] tabular-nums">
                    {pendingParcels} Awaiting
                  </p>
                  <p className="mt-0.5 text-xs text-[#414B47]">Vault B-04 & Desk</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('gate')}
                className="flex flex-col justify-between rounded-xl bg-[#ECF2ED] p-4 text-left transition-colors hover:bg-[#E5ECE6]"
              >
                <div className="flex items-center justify-between text-[#0B3529]">
                  <Lock className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#414B47]">
                    Security
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-[#141E1B]">Armed</p>
                  <p className="mt-0.5 text-xs text-[#414B47]">Perimeter Stay</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Guardhouse Intercom Row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="estate-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
                  DIRECT AUDIO LINK
                </p>
                <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                  Master Guardhouse Intercom
                </h2>
                <p className="mt-1 text-xs text-[#414B47]">
                  {intercomActive
                    ? `Encrypted channel open · ${formatTimer(intercomSeconds)}`
                    : 'North Pavilion Desk · Instant voice dispatch'}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={onToggleIntercom}
                className={`flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors ${
                  intercomActive
                    ? 'bg-[#BA1A1A] text-white'
                    : 'bg-[#0B3529] text-[#FBF9F5] hover:bg-[#00241A]'
                }`}
              >
                {intercomActive ? (
                  <>
                    <PhoneOff className="h-4 w-4" />
                    <span>End Link</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4 text-[#F7DDA4]" />
                    <span>Connect</span>
                  </>
                )}
              </motion.button>
            </div>

            {intercomActive && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#ECF2ED] px-4 py-3">
                <span className="text-xs font-semibold text-[#0B3529]">
                  Officer Mercer listening
                </span>
                <div className="flex h-5 items-end gap-1" aria-hidden="true">
                  {[45, 85, 60, 95, 50, 75, 40, 88, 55].map((height, idx) => (
                    <span
                      key={idx}
                      className="w-1 rounded-full bg-[#0B3529] transition-all duration-150"
                      style={{
                        height: `${Math.max(25, (height + intercomSeconds * 19 + idx * 13) % 100)}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
