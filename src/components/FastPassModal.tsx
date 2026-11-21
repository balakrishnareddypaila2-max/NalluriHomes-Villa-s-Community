import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ShieldCheck, X } from 'lucide-react';
import { EntryCategory, GuestPass } from '../types/estate';
import { QrTokenMatrix, StatusBadge } from './ui/EstatePrimitives';

interface FastPassModalProps {
  mode: 'view' | 'create';
  pass?: GuestPass | null;
  onClose: () => void;
  onCreatePass: (newPass: Omit<GuestPass, 'id' | 'tokenCode' | 'status'>) => void;
  onRevokePass?: (id: string) => void;
  onCopyPass: (pass: GuestPass) => void;
}

export const FastPassModal: React.FC<FastPassModalProps> = ({
  mode,
  pass,
  onClose,
  onCreatePass,
  onRevokePass,
  onCopyPass,
}) => {
  const [guestName, setGuestName] = useState('');
  const [companyOrRelation, setCompanyOrRelation] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [gate, setGate] = useState<'North Pavilion Gate' | 'South Cypress Gate'>('North Pavilion Gate');
  const [windowLabel, setWindowLabel] = useState('16:00 – 22:00');
  const [category, setCategory] = useState<EntryCategory>('Private Guest');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = (target: GuestPass) => {
    onCopyPass(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    onCreatePass({
      guestName: guestName.trim(),
      companyOrRelation: companyOrRelation.trim() || category,
      vehiclePlate: (vehiclePlate.trim() || 'UNASSIGNED').toUpperCase(),
      vehicleModel: vehicleModel.trim() || 'Private Arrival Vehicle',
      gate,
      windowLabel,
      validDate: 'Today, Oct 24',
      category,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#141E1B]/45 backdrop-blur-xs sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'view' ? 'FastPass Gate Clearance' : 'Issue Gate FastPass'}
    >
      <motion.div
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 28, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[#DAE5E0] bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="shrink-0 border-b border-[#E5F0EB] bg-white px-5 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#C0C8C3] sm:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#775A19]">
                {mode === 'view' ? 'FASTPASS GATE PLACARD' : 'GATE AUTHORIZATION'}
              </p>
              <h2 className="mt-1 font-serif text-[22px] font-medium leading-[28px] text-[#141E1B] break-words">
                {mode === 'view' && pass ? pass.guestName : 'Issue Guest FastPass'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DAE5E0] bg-[#F4F6F1] text-[#141E1B] transition-colors hover:bg-[#EBF6F1]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mode === 'view' && pass ? (
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            <div className="flex flex-col items-center rounded-2xl border border-[#C5A059]/40 bg-[#F1FCF7] p-5 text-center sm:p-6">
              <div className="mb-4 flex w-full items-center justify-between gap-2">
                <span className="font-mono text-xs font-medium tracking-wider text-[#414845] tabular-nums">
                  {pass.tokenCode}
                </span>
                <StatusBadge status={pass.status} />
              </div>

              <QrTokenMatrix code={pass.tokenCode} size={148} />

              <div className="mt-4 space-y-1">
                <p className="font-mono text-base font-semibold tracking-wide text-[#141E1B] tabular-nums">
                  {pass.vehiclePlate}
                </p>
                <p className="text-sm text-[#414845]">{pass.vehicleModel}</p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#414845]">
                  Gate Assignment
                </dt>
                <dd className="mt-1 font-medium text-[#141E1B]">{pass.gate}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#414845]">
                  Arrival Window
                </dt>
                <dd className="mt-1 font-medium text-[#141E1B] tabular-nums">
                  {pass.validDate} · {pass.windowLabel}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#414845]">
                  Clearance Type
                </dt>
                <dd className="mt-1 font-medium text-[#141E1B]">{pass.category}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#414845]">
                  Affiliation
                </dt>
                <dd className="mt-1 font-medium text-[#141E1B]">{pass.companyOrRelation}</dd>
              </div>
            </dl>

            {pass.notes && (
              <div className="rounded-xl bg-[#EBF6F1] px-4 py-3 text-sm text-[#414845]">
                <span className="font-semibold text-[#141E1B]">Guardhouse Note: </span>
                {pass.notes}
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleCopy(pass)}
                  className="flex h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00241A] px-5 text-sm font-semibold text-[#F1FCF7] transition-transform active:scale-[0.98] hover:bg-[#0D3B2E] sm:w-auto sm:flex-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4 shrink-0 text-[#FED488]" />
                  ) : (
                    <Copy className="h-4 w-4 shrink-0 text-[#FED488]" />
                  )}
                  <span className="whitespace-nowrap">
                    {copied ? 'Encrypted Pass Copied' : 'Share Encrypted Pass'}
                  </span>
                </button>
                {pass.status !== 'EXPIRED' && onRevokePass && (
                  <button
                    type="button"
                    onClick={() => onRevokePass(pass.id)}
                    className="flex h-[48px] w-full shrink-0 items-center justify-center rounded-xl border border-[#C5A059] px-5 text-sm font-semibold text-[#00241A] transition-colors hover:bg-[#EBF6F1] whitespace-nowrap sm:w-auto"
                  >
                    Revoke Pass
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-[44px] w-full items-center justify-center rounded-xl border border-[#DAE5E0] bg-[#F4F6F1] px-5 text-xs font-semibold text-[#414845] transition-colors hover:bg-[#EBF6F1] hover:text-[#141E1B]"
              >
                Close Gate Pass
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                Guest or Courier Name
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Alistair Montgomery"
                className="h-[50px] w-full rounded-xl border border-[#DAE5E0] bg-white px-4 text-[15px] text-[#141E1B] placeholder:text-[#414845]/60 focus:border-[#00241A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                  Vehicle Registration
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="TS · 09 RP 4100"
                  className="h-[50px] w-full rounded-xl border border-[#DAE5E0] bg-white px-4 font-mono text-sm text-[#141E1B] placeholder:text-[#414845]/60 focus:border-[#00241A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                  Vehicle Marque & Color
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Aston Martin · Slate"
                  className="h-[50px] w-full rounded-xl border border-[#DAE5E0] bg-white px-4 text-[15px] text-[#141E1B] placeholder:text-[#414845]/60 focus:border-[#00241A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                  Clearance Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EntryCategory)}
                  className="h-[50px] w-full rounded-xl border border-[#DAE5E0] bg-white px-3.5 text-[15px] text-[#141E1B] focus:border-[#00241A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25"
                >
                  <option value="Private Guest">Private Guest</option>
                  <option value="VIP Escort">VIP Escort</option>
                  <option value="Valet Courier">Valet Courier</option>
                  <option value="Household Staff">Household Staff</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                  Arrival Window
                </label>
                <select
                  value={windowLabel}
                  onChange={(e) => setWindowLabel(e.target.value)}
                  className="h-[50px] w-full rounded-xl border border-[#DAE5E0] bg-white px-3.5 text-[15px] text-[#141E1B] focus:border-[#00241A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25"
                >
                  <option value="12:00 – 16:00">Today · 12:00 – 16:00</option>
                  <option value="16:00 – 22:00">Today · 16:00 – 22:00</option>
                  <option value="19:00 – 23:30">Tonight · 19:00 – 23:30</option>
                  <option value="24-Hour Clearance">24-Hour Full Access</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                Assigned Enclave Gate
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['North Pavilion Gate', 'South Cypress Gate'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGate(option)}
                    className={`h-[48px] rounded-xl border px-3 text-xs font-semibold transition-colors ${
                      gate === option
                        ? 'border-[#00241A] bg-[#00241A] text-[#F1FCF7]'
                        : 'border-[#DAE5E0] bg-[#EBF6F1] text-[#141E1B] hover:bg-[#DFEBE6]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414845]">
                Guardhouse Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escort to Villa #108 courtyard or hold parcel"
                className="h-[50px] w-full rounded-xl border border-[#DAE5E0] bg-white px-4 text-[15px] text-[#141E1B] placeholder:text-[#414845]/60 focus:border-[#00241A] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/25"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#00241A] px-6 text-sm font-semibold text-[#F1FCF7] transition-transform active:scale-[0.98] hover:bg-[#0D3B2E]"
              >
                <ShieldCheck className="h-4 w-4 text-[#FED488]" />
                <span>Authorize & Generate QR Token</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};
