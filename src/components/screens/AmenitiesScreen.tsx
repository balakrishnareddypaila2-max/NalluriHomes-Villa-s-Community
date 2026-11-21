import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Calendar,
  Check,
  Clock,
  Info,
  PhoneCall,
  PhoneOff,
  QrCode,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { AMENITY_FACILITIES, RESIDENT_PROFILE } from '../../data/initialEstateData';
import { AmenityBooking, AmenityCategory, AmenityFacility } from '../../types/estate';
import { AmenityShowcaseVisual, OccupancyRing, QrTokenMatrix } from '../ui/EstatePrimitives';

interface AmenitiesScreenProps {
  villaLabel?: string;
  bookings: AmenityBooking[];
  onBookSlot: (facility: AmenityFacility, dateLabel: string, timeSlot: string) => void;
  onCancelBooking: (bookingId: string) => void;
  intercomActive: boolean;
  intercomSeconds: number;
  onToggleIntercom: () => void;
}

const DAYS = [
  { id: 'Today', sub: 'Oct 24' },
  { id: 'Tomorrow', sub: 'Oct 25' },
  { id: 'Saturday', sub: 'Oct 26' },
];

const CATEGORIES: Array<{ id: AmenityCategory; label: string }> = [
  { id: 'gym', label: 'Clubhouse & Gym' },
  { id: 'courts', label: 'Badminton & Tennis' },
  { id: 'spa', label: 'Thermal Spa & Pool' },
  { id: 'dining', label: 'Private Dining' },
];

export const AmenitiesScreen: React.FC<AmenitiesScreenProps> = ({
  villaLabel = 'Villa #108',
  bookings,
  onBookSlot,
  onCancelBooking,
  intercomActive,
  intercomSeconds,
  onToggleIntercom,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AmenityCategory>('gym');
  const [selectedDay, setSelectedDay] = useState<string>('Today');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('06:30 PM');
  const [turnstileBooking, setTurnstileBooking] = useState<AmenityBooking | null>(null);
  const [confirmedFlash, setConfirmedFlash] = useState(false);

  const facility = useMemo(
    () => AMENITY_FACILITIES.find((f) => f.category === selectedCategory) || AMENITY_FACILITIES[0],
    [selectedCategory]
  );

  const activeSlot = useMemo(() => {
    const match = facility.slots.find((s) => s.id === selectedSlotId && !s.disabled);
    if (match) return match;
    return facility.slots.find((s) => !s.disabled) || facility.slots[0];
  }, [facility, selectedSlotId]);

  const handleCategoryChange = (cat: AmenityCategory) => {
    setSelectedCategory(cat);
    const nextFacility = AMENITY_FACILITIES.find((f) => f.category === cat);
    if (nextFacility) {
      const firstOpen = nextFacility.slots.find((s) => !s.disabled);
      if (firstOpen) setSelectedSlotId(firstOpen.id);
    }
  };

  const handleConfirm = () => {
    const dayObj = DAYS.find((d) => d.id === selectedDay) || DAYS[0];
    onBookSlot(facility, `${dayObj.id} · ${dayObj.sub}`, activeSlot.time);
    setConfirmedFlash(true);
    window.setTimeout(() => setConfirmedFlash(false), 1800);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
            CLUB PRIVÉ · NALLURI HOME CONCIERGE
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C59B48]/45 bg-[#F7DDA4]/45 px-3 py-1 text-[11px] font-semibold text-[#85631E]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{villaLabel} Tier 1</span>
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-[28px] font-medium leading-[34px] tracking-[-0.01em] text-[#141E1B] md:text-[34px]">
            Amenity Reserve
          </h1>
          <span className="text-xs font-medium text-[#414B47]">Live Clubhouse Feed</span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pb-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleCategoryChange(cat.id)}
                className={`relative min-h-[42px] rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'text-[#FBF9F5]'
                    : 'border border-[#CBE4DF] bg-white text-[#141E1B] hover:bg-[#E6F7F4]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="amenityCategoryBg"
                    transition={{ type: 'spring', stiffness: 440, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0D9488] via-[#0B3529] to-[#0891B2] shadow-md"
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Confirmed Pass + Real-Time Telemetry */}
        <div className="space-y-6 lg:col-span-7">
          {/* Confirmed Passes Stack */}
          <AnimatePresence initial={false}>
            {bookings.map((bk) => (
              <motion.div
                key={bk.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="estate-card-prestige rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FDE68A] to-[#F59E0B]/35 text-[#85631E]">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#0D9488]">
                        CONFIRMED PASS
                      </p>
                      <h2 className="font-serif text-[18px] font-semibold leading-[24px] text-[#141E1B]">
                        {bk.amenityName}
                      </h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FFDEA5]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                    {bk.dayTag}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-[#ECF7F5] p-3.5 text-left sm:grid-cols-3">
                  <div>
                    <span className="block text-[10px] font-semibold text-[#414B47]">Time Slot</span>
                    <span className="mt-0.5 block text-xs font-bold text-[#141E1B] tabular-nums">
                      {bk.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-[#414B47]">Reserved For</span>
                    <span className="mt-0.5 block text-xs font-bold text-[#141E1B] break-words">
                      {bk.reservedFor}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold text-[#414B47]">Status</span>
                    <span className="mt-0.5 block text-xs font-bold text-[#0D9488]">
                      {bk.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setTurnstileBooking(bk)}
                    className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B3529] to-[#0D9488] px-4 text-xs font-semibold text-[#FBF9F5] transition-all hover:shadow-md"
                  >
                    <QrCode className="h-4 w-4 text-[#F7DDA4]" />
                    <span>Access Turnstile Pass</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={() => onCancelBooking(bk.id)}
                    aria-label={`Cancel ${bk.amenityName} reservation`}
                    className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl border border-[#E2DDD2] bg-[#ECF2ED] text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Real-Time Telemetry Card */}
          <motion.section
            key={facility.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="estate-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#0D9488]">
                  {facility.kicker}
                </p>
                <h2 className="mt-1 font-serif text-[22px] font-medium leading-[28px] text-[#141E1B]">
                  {facility.name}
                </h2>
                <p className="mt-1 text-xs text-[#414845]">{facility.location}</p>
              </div>
              <span className="shrink-0 rounded-full bg-gradient-to-r from-[#FFDEA5] to-[#FED7AA] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9A3412] tabular-nums">
                {facility.peakLabel}
              </span>
            </div>

            {/* Occupancy Ring Summary Box */}
            <div className="mt-5 flex flex-col items-center gap-5 rounded-xl bg-gradient-to-r from-[#E6F7F4] to-[#ECF2ED] p-4 sm:flex-row">
              <OccupancyRing
                current={facility.currentOccupancy}
                max={facility.maxCapacity}
              />
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#00241A]">
                  <Users className="h-4 w-4 text-[#0D9488]" />
                  <span>{facility.statusHeadline}</span>
                </div>
                <p className="mt-1.5 text-xs leading-[18px] text-[#414845]">
                  {facility.statusDescription}
                </p>
              </div>
            </div>

            {/* 3 Mini Metric Tiles */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#BAE6FD]/60 bg-[#F0F9FF] p-3.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0284C7]">
                  <Thermometer className="h-3.5 w-3.5 shrink-0" />
                  <span>Temp</span>
                </div>
                <p className="mt-2 text-base font-bold text-[#141E1B] tabular-nums">
                  {facility.tempLabel}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#414845]">{facility.tempSub}</p>
              </div>

              <div className="rounded-xl border border-[#99F6E4]/70 bg-[#F0FDFA] p-3.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0D9488]">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Hours</span>
                </div>
                <p className="mt-2 text-base font-bold text-[#141E1B] tabular-nums">
                  {facility.hoursLabel}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#414845]">{facility.hoursSub}</p>
              </div>

              <div className="rounded-xl border border-[#FDE68A]/80 bg-[#FFFBEB] p-3.5">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D97706]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>Coach</span>
                </div>
                <p className="mt-2 text-base font-bold text-[#141E1B]">
                  {facility.stewardLabel}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#414845] break-words">
                  {facility.stewardSub}
                </p>
              </div>
            </div>

            {/* Visual Banner */}
            <div className="mt-4">
              <AmenityShowcaseVisual
                theme={facility.visualTheme}
                title={facility.visualTitle}
              />
            </div>
          </motion.section>
        </div>

        {/* Right Column: Time Slot Selection + House Rules + Concierge */}
        <div className="space-y-6 lg:col-span-5">
          {/* Time Slot Selection Card */}
          <section className="estate-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                  RESERVE YOUR SESSION
                </p>
                <h2 className="mt-1 font-serif text-[22px] font-medium text-[#141E1B]">
                  Time Slot Selection
                </h2>
              </div>
              <span className="rounded-full bg-[#FFDEA5]/75 px-3 py-1 text-[10px] font-bold text-[#775A19]">
                1 Pass Left Today
              </span>
            </div>

            {/* Day Selector Tabs */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {DAYS.map((day) => {
                const active = selectedDay === day.id;
                return (
                  <motion.button
                    key={day.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDay(day.id)}
                    className={`rounded-xl border px-3 py-2.5 text-center transition-colors ${
                      active
                        ? 'border-[#0B3529] bg-[#0B3529] text-[#FBF9F5]'
                        : 'border-[#E2DDD2] bg-[#ECF2ED] text-[#141E1B] hover:bg-[#E5ECE6]'
                    }`}
                  >
                    <span className="block text-xs font-bold">{day.id}</span>
                    <span
                      className={`mt-0.5 block text-[11px] ${
                        active ? 'text-[#A3D0BE]' : 'text-[#414B47]'
                      }`}
                    >
                      {day.sub}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* 2x2 Slot Grid */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {facility.slots.map((slot) => {
                const selected = !slot.disabled && activeSlot.id === slot.id;
                return (
                  <motion.button
                    key={slot.id}
                    type="button"
                    whileTap={slot.disabled ? undefined : { scale: 0.97 }}
                    disabled={slot.disabled}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      slot.disabled
                        ? 'cursor-not-allowed border-[#E2DDD2] bg-[#ECF2ED]/70 opacity-60'
                        : selected
                        ? 'border-[#0B3529] bg-[#0B3529] text-[#FBF9F5] shadow-md'
                        : 'border-[#E2DDD2] bg-[#ECF2ED] text-[#141E1B] hover:border-[#0B3529]/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          slot.disabled ? 'line-through text-[#414B47]' : ''
                        }`}
                      >
                        {slot.time}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] shrink-0 ${
                          selected
                            ? 'bg-[#F7DDA4] text-[#261900]'
                            : slot.availabilityTone === 'low'
                            ? 'bg-[#FFDEA5] text-[#85631E]'
                            : 'bg-[#DEE6DF] text-[#414B47]'
                        }`}
                      >
                        {selected ? 'SELECTED' : slot.availabilityLabel}
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-[11px] ${
                        selected ? 'text-[#A3D0BE]' : 'text-[#414B47]'
                      }`}
                    >
                      {slot.subtitle}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Allowance Info Box */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#ECF2ED] p-3.5 text-xs leading-[18px] text-[#414B47]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0B3529]" />
              <p>
                <span className="font-bold text-[#141E1B]">{villaLabel} Allowance:</span> 1 active
                slot per day for peak periods. Cancellations are cost-free up to 45 minutes prior.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleConfirm}
              className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0B3529] px-5 text-sm font-semibold text-[#FBF9F5] transition-colors hover:bg-[#00241A]"
            >
              {confirmedFlash ? (
                <>
                  <Check className="h-4 w-4 text-[#F7DDA4]" />
                  <span>Turnstile Pass Issued</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 text-[#F7DDA4]" />
                  <span>Confirm Slot ({activeSlot.time})</span>
                </>
              )}
            </motion.button>
          </section>

          {/* House Rules & Etiquette */}
          <section className="estate-card rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                  COMMUNITY STANDARDS
                </p>
                <h2 className="mt-0.5 font-serif text-[20px] font-medium text-[#141E1B]">
                  House Rules & Etiquette
                </h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#775A19]" />
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Non-Marking Footwear',
                  copy: 'Pure gum-rubber or designated indoor athletic shoes are mandatory on both wooden squash/badminton floors and gym mats.',
                },
                {
                  title: 'Resident Guest Policy',
                  copy: 'A maximum of two accompanied external guests permitted per villa. Digital visitor access pass required at gate security.',
                },
                {
                  title: 'Hospitality & Sanitization',
                  copy: 'Chilled organic eucalyptus towels and fresh microfiber wipes are provided at both entry points. Please sanitize equipment post-routine.',
                },
              ].map((rule) => (
                <div key={rule.title} className="rounded-xl bg-[#EBF6F1] p-4">
                  <p className="text-xs font-bold text-[#141E1B]">{rule.title}</p>
                  <p className="mt-1 text-xs leading-[18px] text-[#414845]">{rule.copy}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Clubhouse Concierge Row */}
          <section className="estate-card flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#141E1B]">Clubhouse Concierge</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#414845]">
                {intercomActive
                  ? `Connected to Desk Ext. 201 · ${formatTimer(intercomSeconds)}`
                  : 'Dial ext. 201 for trainer or court setup'}
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleIntercom}
              className={`inline-flex h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors sm:w-auto ${
                intercomActive
                  ? 'bg-[#BA1A1A] text-white'
                  : 'bg-[#00241A] text-[#F1FCF7] hover:bg-[#0D3B2E]'
              }`}
            >
              {intercomActive ? (
                <>
                  <PhoneOff className="h-3.5 w-3.5" />
                  <span>End Call</span>
                </>
              ) : (
                <>
                  <PhoneCall className="h-3.5 w-3.5 text-[#FED488]" />
                  <span>Call Desk</span>
                </>
              )}
            </button>
          </section>
        </div>
      </div>

      {/* Turnstile QR Pass Modal */}
      <AnimatePresence>
        {turnstileBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#141E1B]/45 backdrop-blur-xs sm:items-center sm:p-6"
            onClick={() => setTurnstileBooking(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-[#DAE5E0] bg-white shadow-2xl sm:rounded-2xl"
            >
              <div className="shrink-0 border-b border-[#E5F0EB] px-6 pb-4 pt-3 sm:pt-5">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#C0C8C3] sm:hidden" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                      CLUBHOUSE TURNSTILE TOKEN
                    </p>
                    <h3 className="mt-1 font-serif text-[22px] font-medium text-[#141E1B]">
                      {turnstileBooking.amenityName}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#414845] tabular-nums">
                      {turnstileBooking.dateLabel} · {turnstileBooking.timeSlot}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTurnstileBooking(null)}
                    aria-label="Close turnstile pass"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DAE5E0] bg-[#F4F6F1] text-[#141E1B] hover:bg-[#EBF6F1]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 text-center">
                <div className="mb-6 flex flex-col items-center rounded-2xl border border-[#C5A059]/40 bg-[#F1FCF7] p-6">
                  <QrTokenMatrix code={turnstileBooking.tokenCode} size={156} />
                  <span className="mt-4 font-mono text-sm font-semibold text-[#00241A] tabular-nums">
                    {turnstileBooking.tokenCode}
                  </span>
                  <span className="mt-1 text-xs text-[#414845]">
                    Holder: {turnstileBooking.reservedFor} · {RESIDENT_PROFILE.villaNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setTurnstileBooking(null)}
                  className="h-[48px] w-full rounded-xl bg-[#00241A] text-sm font-semibold text-[#F1FCF7] hover:bg-[#0D3B2E]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
