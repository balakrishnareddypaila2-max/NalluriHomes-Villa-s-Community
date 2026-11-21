import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { User } from 'firebase/auth';
import {
  Check,
  Droplets,
  Lightbulb,
  Package,
  PhoneCall,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
} from 'lucide-react';
import { DIRECTORY_CONTACTS, RESIDENT_PROFILE } from '../../data/initialEstateData';
import { EmergencyDesk, VillaRecord } from '../../data/villas231';
import {
  ActiveSessionProfile,
  AdminAccount,
  ClimateZone,
  ConciergeMessage,
  DirectoryContact,
  IrrigationZone,
  LightingScene,
  ParcelItem,
  VillaDirectorySync,
  VillaRegistration,
} from '../../types/estate';
import { EstateSwitch, StatusBadge, UserAvatar } from '../ui/EstatePrimitives';
import {
  AdminApprovalsPanel,
  Villas231DirectoryPanel,
  VillaSignupCard,
} from '../VillaAuthAndAdmin';

export type DirectorySubTab = 'villas231' | 'signup' | 'admin' | 'concierge';

interface DirectoryScreenProps {
  activeSubTab: DirectorySubTab;
  onChangeSubTab: (tab: DirectorySubTab) => void;
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  activeProfile: ActiveSessionProfile;
  myRegistration: VillaRegistration | null;
  allRegistrations: VillaRegistration[];
  adminAccounts: AdminAccount[];
  appLogoUrl?: string;
  emergencyDesks: EmergencyDesk[];
  syncedVillas: Record<number, VillaDirectorySync>;
  onRegisterLocalOrCloud: (reg: VillaRegistration, isCloudUser: boolean) => Promise<void>;
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
  onUpdateEmergencyDesk: (desk: EmergencyDesk) => Promise<void>;
  onUpdateVillaRecord: (villa: VillaRecord) => Promise<void>;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  onNotify: (msg: string) => void;
  climateZones: ClimateZone[];
  lightingScenes: LightingScene[];
  irrigationZones: IrrigationZone[];
  parcels: ParcelItem[];
  messages: ConciergeMessage[];
  onAdjustTemp: (zoneId: string, delta: number) => void;
  onChangeZoneMode: (zoneId: string, mode: 'Auto' | 'Eco' | 'Away') => void;
  onActivateScene: (sceneId: string) => void;
  onToggleIrrigation: (zoneId: string) => void;
  onCollectParcel: (parcelId: string) => void;
  onSendMessage: (body: string) => void;
  onCallContact: (contact: DirectoryContact) => void;
}

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  activeSubTab,
  onChangeSubTab,
  user,
  isAdmin,
  isLoggedIn,
  activeProfile,
  myRegistration,
  allRegistrations,
  adminAccounts,
  appLogoUrl,
  emergencyDesks,
  syncedVillas,
  onRegisterLocalOrCloud,
  onAdminUpdateRegistration,
  onUpdateAppLogo,
  onCreateAdmin,
  onPromoteRegistrationToAdmin,
  onRemoveAdmin,
  onUpdateEmergencyDesk,
  onUpdateVillaRecord,
  onOpenLogin,
  onOpenProfile,
  onGoogleSignIn,
  onLogout,
  onNotify,
  climateZones,
  lightingScenes,
  irrigationZones,
  parcels,
  messages,
  onAdjustTemp,
  onChangeZoneMode,
  onActivateScene,
  onToggleIrrigation,
  onCollectParcel,
  onSendMessage,
  onCallContact,
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'All' | DirectoryContact['department']>('All');
  const [draft, setDraft] = useState('');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [holdProgress, setHoldProgress] = useState(0);
  const [dispatchSent, setDispatchSent] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
    };
  }, []);

  const pendingCount = useMemo(
    () => allRegistrations.filter((r) => r.status === 'pending').length,
    [allRegistrations]
  );

  const filteredContacts = useMemo(() => {
    return DIRECTORY_CONTACTS.filter((c) => {
      const deptMatch = deptFilter === 'All' || c.department === deptFilter;
      const q = search.trim().toLowerCase();
      const qMatch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.roleOrVilla.toLowerCase().includes(q) ||
        c.extensionOrStreet.toLowerCase().includes(q);
      return deptMatch && qMatch;
    });
  }, [deptFilter, search]);

  const startHold = () => {
    if (dispatchSent) return;
    if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
    const start = Date.now();
    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / 1400) * 100));
      setHoldProgress(pct);
      if (pct >= 100) {
        if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        setDispatchSent(true);
      }
    }, 30);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!dispatchSent) setHoldProgress(0);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft('');
  };

  const handleCopyNumber = (label: string, number: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(number).catch(() => {});
    }
    onNotify(`Copied ${label} number: ${number}`);
  };

  const subTabs: Array<{ id: DirectorySubTab; label: string; count?: number }> = [
    { id: 'villas231', label: '231 Villas & Emergency' },
    { id: 'signup', label: 'Owner Sign-Up' },
    { id: 'admin', label: 'Admin Approvals', count: isAdmin ? pendingCount : undefined },
    { id: 'concierge', label: 'Concierge & Villa' },
  ];

  return (
    <div className="space-y-7">
      <section className="space-y-4 border-b border-[#E2DDD2] pb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#85631E]">
            NALLURI HOME DIRECTORY · OWNER SIGN-UP · ADMIN GOVERNANCE
          </p>
          <h1 className="mt-1.5 font-serif text-[28px] font-medium leading-[34px] text-[#141E1B] md:text-[34px]">
            231 Villas, Registration & Concierge
          </h1>
          <p className="mt-1.5 text-[14px] text-[#414B47]">
            Browse all 231 villas and emergency helplines, register a villa owner account, or manage Admin approvals.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {subTabs.map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onChangeSubTab(tab.id)}
                className={`relative inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'text-[#FBF9F5]'
                    : 'border border-[#E2DDD2] bg-white text-[#141E1B] hover:bg-[#ECF2ED]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="directorySubTabBg"
                    transition={{ type: 'spring', stiffness: 440, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[#0B3529]"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      active ? 'bg-[#F7DDA4] text-[#261900]' : 'bg-[#FFDEA5] text-[#85631E]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeSubTab === 'villas231' && (
            <Villas231DirectoryPanel
              isAdmin={isAdmin}
              emergencyDesks={emergencyDesks}
              syncedVillas={syncedVillas}
              onUpdateEmergencyDesk={onUpdateEmergencyDesk}
              onUpdateVillaRecord={onUpdateVillaRecord}
              onCopyNumber={handleCopyNumber}
            />
          )}

          {activeSubTab === 'signup' && (
            <VillaSignupCard
              user={user}
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              myRegistration={myRegistration}
              onRegisterLocalOrCloud={onRegisterLocalOrCloud}
              onOpenLogin={onOpenLogin}
              onOpenProfile={onOpenProfile}
              onGoogleSignIn={onGoogleSignIn}
              onLogout={onLogout}
              onNotify={onNotify}
            />
          )}

          {activeSubTab === 'admin' && (
            <AdminApprovalsPanel
              user={user}
              isAdmin={isAdmin}
              registrations={allRegistrations}
              adminAccounts={adminAccounts}
              appLogoUrl={appLogoUrl}
              onGoogleSignIn={onGoogleSignIn}
              onAdminUpdateRegistration={onAdminUpdateRegistration}
              onUpdateAppLogo={onUpdateAppLogo}
              onCreateAdmin={onCreateAdmin}
              onPromoteRegistrationToAdmin={onPromoteRegistrationToAdmin}
              onRemoveAdmin={onRemoveAdmin}
              onNotify={onNotify}
            />
          )}

          {activeSubTab === 'concierge' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Enclave Contacts + Concierge Messaging */}
          <div className="space-y-6 lg:col-span-7">
            <section className="estate-card rounded-2xl p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                    KEY CONTACTS
                  </p>
                  <h2 className="mt-0.5 font-serif text-[20px] font-medium text-[#141E1B]">
                    Governance & Concierge Extensions
                  </h2>
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#414845]" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search contact"
                    className="h-[42px] w-full rounded-xl border border-[#DAE5E0] bg-[#F1FCF7] pl-9 pr-3 text-xs text-[#141E1B] focus:border-[#00241A] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 pb-1">
                {(['All', 'Concierge', 'Security', 'Governance', 'Neighbors'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeptFilter(d)}
                    className={`min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      deptFilter === d
                        ? 'bg-[#00241A] text-[#F1FCF7]'
                        : 'bg-[#EBF6F1] text-[#414845] hover:text-[#141E1B]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="mt-4 divide-y divide-[#E5F0EB]">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1 sm:items-center">
                      <UserAvatar
                        name={contact.name}
                        initials={contact.initials}
                        toneClass="bg-[#FFDEA5]/85 text-[#775A19]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#141E1B] break-words">{contact.name}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[#414845] break-words">
                          {contact.roleOrVilla} · {contact.extensionOrStreet}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCallContact(contact)}
                      className="inline-flex h-[40px] shrink-0 self-end items-center gap-1.5 rounded-xl bg-[#EBF6F1] px-3.5 text-xs font-semibold text-[#00241A] transition-colors hover:bg-[#00241A] hover:text-[#F1FCF7] sm:self-center"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Connect</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="estate-card rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-[#E5F0EB] pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                    PRIVATE RESIDENCE DESK
                  </p>
                  <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                    {RESIDENT_PROFILE.estateDirector} · Estate Director
                  </h2>
                </div>
                <span className="rounded-full bg-[#E5F0EB] px-3 py-1 text-[10px] font-bold uppercase text-[#00241A]">
                  On Duty
                </span>
              </div>

              <div className="my-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const isRes = msg.sender === 'resident';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isRes ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-[19px] ${
                          isRes
                            ? 'bg-[#00241A] text-[#F1FCF7]'
                            : 'bg-[#EBF6F1] text-[#141E1B]'
                        }`}
                      >
                        {msg.body}
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-[#414845] tabular-nums">
                        {msg.author} · {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Message Estate Director..."
                  className="h-[46px] flex-1 rounded-xl border border-[#DAE5E0] bg-[#F1FCF7] px-4 text-sm text-[#141E1B] focus:border-[#00241A] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#00241A] text-[#FED488] hover:bg-[#0D3B2E]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </section>
          </div>

          {/* Right Column: Villa #108 Smart Systems + Rapid Security Dispatch */}
          <div className="space-y-6 lg:col-span-5">
            <section className="estate-card rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                    {activeProfile.villaLabel.toUpperCase()} SYSTEMS
                  </p>
                  <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                    Climate & Lighting Scenes
                  </h2>
                </div>
                <Thermometer className="h-5 w-5 text-[#00241A]" />
              </div>

              <div className="divide-y divide-[#E5F0EB]">
                {climateZones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-xs font-bold text-[#141E1B]">{zone.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {(['Auto', 'Eco', 'Away'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => onChangeZoneMode(zone.id, m)}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              zone.mode === m
                                ? 'bg-[#00241A] text-[#F1FCF7]'
                                : 'bg-[#EBF6F1] text-[#414845]'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#DAE5E0] bg-[#F1FCF7] px-1.5 py-1">
                      <button
                        type="button"
                        onClick={() => onAdjustTemp(zone.id, -0.5)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold hover:bg-white"
                      >
                        −
                      </button>
                      <span className="min-w-[3rem] text-center text-xs font-bold text-[#00241A] tabular-nums">
                        {zone.targetTemp.toFixed(1)}°C
                      </span>
                      <button
                        type="button"
                        onClick={() => onAdjustTemp(zone.id, 0.5)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold hover:bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[#E5F0EB] pt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#141E1B]">
                  <Lightbulb className="h-4 w-4 text-[#775A19]" />
                  <span>Architectural Lighting</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {lightingScenes.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => onActivateScene(scene.id)}
                      className={`rounded-xl border p-2.5 text-left text-xs transition-colors ${
                        scene.active
                          ? 'border-[#C5A059] bg-[#FFDEA5]/45 font-bold text-[#141E1B]'
                          : 'border-[#DAE5E0] bg-[#EBF6F1] text-[#414845]'
                      }`}
                    >
                      <span className="block leading-snug">{scene.name}</span>
                      <span className="mt-0.5 block text-[10px] tabular-nums">{scene.level}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="estate-card rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[18px] font-semibold text-[#141E1B]">
                  Grounds & Parcel Vault
                </h2>
                <Droplets className="h-4 w-4 text-[#00241A]" />
              </div>

              <div className="space-y-3">
                {irrigationZones.map((irr) => (
                  <div key={irr.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#EBF6F1] p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#141E1B]">{irr.name}</p>
                      <p className="text-[11px] text-[#414845] tabular-nums">
                        Moisture {irr.moisturePct}% · {irr.nextCycle}
                      </p>
                    </div>
                    <EstateSwitch
                      checked={irr.enabled}
                      onChange={() => onToggleIrrigation(irr.id)}
                      ariaLabel={`Toggle irrigation for ${irr.name}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 border-t border-[#E5F0EB] pt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#141E1B]">
                  <Package className="h-4 w-4 text-[#775A19]" />
                  <span>Receiving Vault</span>
                </div>
                {parcels.map((prc) => (
                  <div key={prc.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#EBF6F1] p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-[#141E1B]">{prc.carrier}</p>
                        <StatusBadge status={prc.collected ? 'EXPIRED' : 'APPROVED'} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#414845] break-words">
                        {prc.lockerCode} · {prc.arrivedAt}
                      </p>
                    </div>
                    {!prc.collected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedPins((prev) => ({ ...prev, [prc.id]: !prev[prc.id] }))
                          }
                          className="rounded-lg border border-[#C5A059] bg-white px-2.5 py-1.5 font-mono text-[10px] font-bold text-[#00241A]"
                        >
                          {revealedPins[prc.id] ? prc.pin : 'PIN'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onCollectParcel(prc.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00241A] text-[#F1FCF7]"
                          aria-label={`Mark ${prc.carrier} parcel delivered`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="estate-card rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFDAD6] text-[#BA1A1A]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#BA1A1A]">
                    RAPID SECURITY RESPONSE
                  </p>
                  <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
                    {activeProfile.villaLabel} Emergency Dispatch
                  </h2>
                  <p className="mt-1 text-xs leading-[18px] text-[#414845]">
                    Press and hold 1.5s to summon enclave patrol and medical standby.
                  </p>
                </div>
              </div>

              {dispatchSent ? (
                <div className="mt-4 space-y-3 rounded-xl border border-[#BA1A1A]/30 bg-[#FFDAD6]/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#BA1A1A]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Patrol Unit 02 Dispatched · ETA 90s</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDispatchSent(false);
                      setHoldProgress(0);
                    }}
                    className="h-10 w-full rounded-xl border border-[#DAE5E0] bg-white text-xs font-semibold text-[#141E1B]"
                  >
                    Stand Down / Reset Alert
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  className="relative mt-4 flex h-[50px] w-full select-none items-center justify-center overflow-hidden rounded-xl bg-[#BA1A1A] px-5 text-xs font-semibold text-white transition-transform active:scale-[0.98]"
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 bg-[#93000A] transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>
                      {holdProgress > 0
                        ? `Confirming Dispatch (${holdProgress}%)`
                        : 'Hold 1.5s to Dispatch Security'}
                    </span>
                  </span>
                </button>
              )}
            </section>
          </div>
        </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
