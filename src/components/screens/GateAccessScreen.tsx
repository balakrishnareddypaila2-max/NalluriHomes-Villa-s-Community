import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CarFront, Check, Copy, Plus, QrCode, Search, ShieldX } from 'lucide-react';
import { GuestPass, HouseholdVehicle, PassStatus } from '../../types/estate';
import { QrTokenMatrix, StatusBadge } from '../ui/EstatePrimitives';

interface GateAccessScreenProps {
  villaLabel?: string;
  passes: GuestPass[];
  vehicles: HouseholdVehicle[];
  copiedPassId: string | null;
  onOpenPass: (pass: GuestPass) => void;
  onOpenCreatePass: () => void;
  onCopyPass: (pass: GuestPass) => void;
  onRevokePass: (id: string) => void;
  onToggleVehicleStatus: (id: string) => void;
}

export const GateAccessScreen: React.FC<GateAccessScreenProps> = ({
  villaLabel = 'VILLA #108',
  passes,
  vehicles,
  copiedPassId,
  onOpenPass,
  onOpenCreatePass,
  onCopyPass,
  onRevokePass,
  onToggleVehicleStatus,
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PassStatus>('ALL');

  const filteredPasses = useMemo(() => {
    return passes.filter((p) => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.guestName.toLowerCase().includes(q) ||
        p.vehiclePlate.toLowerCase().includes(q) ||
        p.tokenCode.toLowerCase().includes(q) ||
        p.gate.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [passes, query, statusFilter]);

  const filters: Array<{ id: 'ALL' | PassStatus; label: string }> = [
    { id: 'ALL', label: 'All Passes' },
    { id: 'EN ROUTE', label: 'En Route' },
    { id: 'ON-PREMISE', label: 'On-Premise' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 border-b border-[#D5E3E8] pb-6 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E0F2FE] to-[#CCFBF1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0369A1]">
            <QrCode className="h-3.5 w-3.5 text-[#0284C7]" />
            GATE & PERIMETER COMMAND
          </span>
          <h1 className="mt-2 font-serif text-[28px] font-medium leading-[34px] tracking-[-0.01em] text-[#141E1B] md:text-[34px]">
            FastPass & Visitor Ledger
          </h1>
          <p className="mt-1.5 text-[14px] text-[#414B47]">
            Pre-authorize guests, monitor gate arrivals, and manage villa transponders.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onOpenCreatePass}
          className="inline-flex h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B3529] to-[#0F766E] px-5 text-xs font-semibold tracking-[0.02em] text-[#FBF9F5] shadow-md transition-all hover:shadow-lg whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 text-[#7DD3FC]" />
          <span>Issue FastPass</span>
        </motion.button>
      </section>

      {/* Search & Segmented Status Filter */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0284C7]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, plate, or pass ID"
            className="h-[48px] w-full rounded-xl border border-[#CBE0E6] bg-white pl-10 pr-4 text-sm text-[#141E1B] placeholder:text-[#414B47]/60 focus:border-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/25"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-[#CBE0E6] bg-[#E6F2F5] p-1 lg:w-auto">
          {filters.map((f) => (
            <motion.button
              key={f.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setStatusFilter(f.id)}
              className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === f.id
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0B3529] text-[#FBF9F5] shadow-sm'
                  : 'text-[#414B47] hover:text-[#141E1B]'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pass Cards Grid */}
      {filteredPasses.length === 0 ? (
        <div className="estate-card rounded-2xl p-10 text-center">
          <p className="font-serif text-lg font-medium text-[#141E1B]">
            No gate clearances match your filter
          </p>
          <p className="mt-1 text-sm text-[#414845]">
            Adjust your search query or authorize a new guest FastPass for today.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatusFilter('ALL');
            }}
            className="mt-5 inline-flex h-[44px] items-center rounded-xl border border-[#C5A059] px-4 text-xs font-semibold text-[#00241A] hover:bg-[#EBF6F1]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredPasses.map((pass, idx) => (
            <motion.div
              key={pass.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className={`rounded-2xl p-6 transition-shadow hover:shadow-lg ${
                pass.status === 'EN ROUTE' ? 'estate-card-prestige' : 'estate-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#0369A1]">
                    {pass.category} · {pass.gate}
                  </p>
                  <h2 className="mt-1 font-serif text-[18px] font-semibold leading-[24px] text-[#141E1B] break-words">
                    {pass.guestName}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#414845]">{pass.companyOrRelation}</p>
                </div>
                <StatusBadge status={pass.status} />
              </div>

              <div className="mt-5 flex flex-col items-start gap-4 border-t border-[#E5F0EB] pt-5 sm:flex-row sm:items-center sm:gap-5">
                <button
                  type="button"
                  onClick={() => onOpenPass(pass)}
                  className="shrink-0 rounded-xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
                  aria-label={`Open QR pass for ${pass.guestName}`}
                >
                  <QrTokenMatrix code={pass.tokenCode} size={86} />
                </button>

                <div className="w-full min-w-0 flex-1 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0 text-xs text-[#414845]">Token</span>
                    <span className="font-mono text-xs font-semibold text-[#00241A] tabular-nums text-right">
                      {pass.tokenCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0 text-xs text-[#414845]">Plate</span>
                    <span className="font-mono text-xs font-semibold text-[#141E1B] tabular-nums text-right">
                      {pass.vehiclePlate}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-xs text-[#414845]">Window</span>
                    <span className="text-right text-xs font-medium text-[#141E1B] tabular-nums">
                      {pass.validDate} · {pass.windowLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-[#E5F0EB] pt-4">
                <button
                  type="button"
                  onClick={() => onOpenPass(pass)}
                  className="inline-flex h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#00241A] px-3.5 text-xs font-semibold text-[#F1FCF7] transition-colors hover:bg-[#0D3B2E] whitespace-nowrap"
                >
                  <QrCode className="h-3.5 w-3.5 text-[#FED488]" />
                  <span>View Placard</span>
                </button>
                <button
                  type="button"
                  onClick={() => onCopyPass(pass)}
                  className="inline-flex h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#DAE5E0] bg-[#EBF6F1] px-3.5 text-xs font-semibold text-[#141E1B] transition-colors hover:bg-[#DFEBE6] whitespace-nowrap"
                >
                  {copiedPassId === pass.id ? (
                    <Check className="h-3.5 w-3.5 text-[#00241A]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#414845]" />
                  )}
                  <span>{copiedPassId === pass.id ? 'Copied' : 'Share'}</span>
                </button>
                {pass.status !== 'EXPIRED' && (
                  <button
                    type="button"
                    onClick={() => onRevokePass(pass.id)}
                    aria-label={`Revoke pass for ${pass.guestName}`}
                    className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-[#DAE5E0] text-[#414845] transition-colors hover:border-[#BA1A1A]/40 hover:bg-[#FFDAD6]/40 hover:text-[#BA1A1A]"
                  >
                    <ShieldX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Household Vehicles */}
      <section className="estate-card rounded-2xl p-6">
        <div className="pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
            {villaLabel.toUpperCase()} FLEET
          </p>
          <h2 className="mt-0.5 font-serif text-[18px] font-semibold text-[#141E1B]">
            Registered Vehicles & RFID Transponders
          </h2>
        </div>

        <div className="divide-y divide-[#E5F0EB]">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF6F1] text-[#00241A]">
                  <CarFront className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-[#141E1B]">{veh.label}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[#414845] tabular-nums">
                    <span className="font-mono font-medium text-[#141E1B]">{veh.plate}</span> ·{' '}
                    Transponder <span className="font-mono">{veh.transponderId}</span> ·{' '}
                    {veh.lastGateEvent}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 self-stretch sm:self-center shrink-0">
                <StatusBadge status={veh.status} />
                <button
                  type="button"
                  onClick={() => onToggleVehicleStatus(veh.id)}
                  className="min-h-[40px] rounded-xl border border-[#DAE5E0] bg-[#EBF6F1] px-3 text-xs font-semibold text-[#00241A] transition-colors hover:bg-[#DFEBE6] whitespace-nowrap"
                >
                  {veh.status === 'ON-PREMISE' ? 'Log Departure' : 'Log Arrival'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
