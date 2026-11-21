import React from 'react';
import { motion } from 'motion/react';
import { BookUser, Home, Landmark, Pencil, QrCode, Users } from 'lucide-react';
import { PassStatus } from '../../types/estate';
import { DEFAULT_APP_LOGO_URL } from '../../utils/ownerAuth';

export const NalluriHomesEmblem: React.FC<{
  logoUrl?: string;
  isAdmin?: boolean;
  onEditLogo?: () => void;
}> = ({ logoUrl, isAdmin = false, onEditLogo }) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const resolvedLogo = logoUrl || DEFAULT_APP_LOGO_URL;

  React.useEffect(() => {
    setImgFailed(false);
  }, [resolvedLogo]);

  return (
    <div className="group flex items-center gap-2.5 sm:gap-3">
      <div className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12">
        <div className="h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#F7DDA4] via-[#C59B48] to-[#0B3529] p-[2px] shadow-[0_6px_18px_-3px_rgba(11,53,41,0.28)] transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-[0_10px_24px_-4px_rgba(197,155,72,0.42)]">
          <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[#0B3529]">
            {!imgFailed ? (
              <img
                src={resolvedLogo}
                alt="Nalluri Home gated villa facade"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                onLoad={(e) => {
                  if (e.currentTarget.naturalWidth === 0) setImgFailed(true);
                }}
                className="h-full w-full object-cover object-center contrast-[1.12] saturate-[1.16] brightness-[1.04] transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <svg viewBox="0 0 36 36" className="h-full w-full p-1" aria-hidden="true">
                <path
                  d="M11 26V16.5C11 12.634 14.134 9.5 18 9.5C21.866 9.5 25 12.634 25 16.5V26"
                  fill="none"
                  stroke="#F7DDA4"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00241A]/35 via-transparent to-[#F7DDA4]/18" />
            <div className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/20" />
          </div>
        </div>

        {isAdmin && onEditLogo && (
          <span
            role="button"
            tabIndex={0}
            title="Edit Application Logo (Admin Only)"
            aria-label="Edit Application Logo"
            onClick={(e) => {
              e.stopPropagation();
              onEditLogo();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onEditLogo();
              }
            }}
            className="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-[#FBF9F5] bg-[#0B3529] text-[#F7DDA4] shadow-md transition-transform hover:scale-110"
          >
            <Pencil className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      <div className="leading-none text-left min-w-0">
        <span className="block font-serif text-[16px] font-semibold tracking-[-0.015em] text-[#0B3529] whitespace-nowrap sm:text-[18px]">
          Nalluri Home
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.11em] text-[#85631E] whitespace-nowrap sm:text-[10px]">
          Gated Villa Community
        </span>
      </div>
    </div>
  );
};

export const EnhancedVillaHeroImage: React.FC = () => {
  const [imgFailed, setImgFailed] = React.useState(false);

  return (
    <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#C59B48]/45 bg-[#0B3529] shadow-[0_16px_38px_-10px_rgba(11,53,41,0.24)]">
      {!imgFailed ? (
        <img
          src="/assets/aistudio/Image_09f287d5.jpeg"
          alt="Nalluri Home gated villa community twilight entrance"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover object-center contrast-[1.1] saturate-[1.18] brightness-[1.04] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0B3529] to-[#00241A] text-[#F7DDA4]">
          <span className="font-serif text-lg">Nalluri Home</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00241A]/85 via-[#00241A]/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#F7DDA4]/25 rounded-2xl" />
      <div className="absolute bottom-3.5 left-4 right-4 flex flex-wrap items-end justify-between gap-2.5 text-[#FBF9F5] sm:bottom-4 sm:left-5 sm:right-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#F7DDA4]">
            NALLURI HOME · 231 PRIVATE VILLAS
          </p>
          <p className="mt-1 font-serif text-lg font-medium leading-tight">
            Gated Villa Community
          </p>
        </div>
        <span className="rounded-full border border-[#F7DDA4]/40 bg-[#00241A]/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#F7DDA4] backdrop-blur-xs whitespace-nowrap">
          North & South Gates Active
        </span>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: PassStatus | 'CONFIRMED' | 'PENDING' | 'OFF-SITE' | 'ACTIVE' | 'Ready' | 'Confirmed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const upper = status.toUpperCase();
  const styles: Record<string, string> = {
    APPROVED: 'bg-[#E5ECE6] border-[#0B3529]/20 text-[#0B3529]',
    'ON-PREMISE': 'bg-[#E5ECE6] border-[#0B3529]/20 text-[#0B3529]',
    CONFIRMED: 'bg-[#E5ECE6] border-[#0B3529]/20 text-[#0B3529]',
    ACTIVE: 'bg-[#E5ECE6] border-[#0B3529]/20 text-[#0B3529]',
    READY: 'bg-[#E5ECE6] border-[#0B3529]/20 text-[#0B3529]',
    'EN ROUTE': 'bg-[#F7DDA4]/65 border-[#C59B48]/45 text-[#85631E]',
    PENDING: 'bg-[#F7DDA4]/65 border-[#C59B48]/45 text-[#85631E]',
    EXPIRED: 'bg-[#DEE6DF] border-[#C9D2CB] text-[#414B47]',
    'OFF-SITE': 'bg-[#DEE6DF] border-[#C9D2CB] text-[#414B47]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 ${
        styles[upper] || styles.EXPIRED
      }`}
    >
      {status}
    </span>
  );
};

interface OccupancyRingProps {
  current: number;
  max: number;
}

export const OccupancyRing: React.FC<OccupancyRingProps> = ({ current, max }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, Math.max(0, current / Math.max(1, max)));
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#D6DFD8"
          strokeWidth="7"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#85631E"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold leading-none text-[#141E1B] tabular-nums">
          {current}
        </span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#414B47] tabular-nums">
          / {max} MAX
        </span>
      </div>
    </div>
  );
};

interface EstateSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}

export const EstateSwitch: React.FC<EstateSwitchProps> = ({
  checked,
  onChange,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F6F1] ${
        checked ? 'bg-[#0B3529]' : 'bg-[#D6DFD8]'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow-sm ${
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
};

interface QrTokenMatrixProps {
  code: string;
  size?: number;
}

export const QrTokenMatrix: React.FC<QrTokenMatrixProps> = ({ code, size = 112 }) => {
  const grid = 15;
  const cells: boolean[] = [];

  let seed = 0;
  for (let i = 0; i < code.length; i += 1) {
    seed = (seed * 31 + code.charCodeAt(i)) % 999983;
  }

  const isFinder = (r: number, c: number) => {
    const inTopLeft = r < 5 && c < 5;
    const inTopRight = r < 5 && c >= grid - 5;
    const inBottomLeft = r >= grid - 5 && c < 5;
    if (!inTopLeft && !inTopRight && !inBottomLeft) return null;

    const lr = r >= grid - 5 ? r - (grid - 5) : r;
    const lc = c >= grid - 5 ? c - (grid - 5) : c;
    if (lr === 0 || lr === 4 || lc === 0 || lc === 4) return true;
    if (lr === 2 && lc === 2) return true;
    return false;
  };

  for (let r = 0; r < grid; r += 1) {
    for (let c = 0; c < grid; c += 1) {
      const finder = isFinder(r, c);
      if (finder !== null) {
        cells.push(finder);
      } else {
        const val = (seed + r * 37 + c * 53 + r * c * 11) % 7;
        cells.push(val === 0 || val === 2 || val === 5);
      }
    }
  }

  return (
    <div
      className="inline-flex items-center justify-center rounded-xl border border-[#DAE5E0] bg-white p-2.5"
      style={{ width: size, height: size }}
      aria-label={`Gate pass QR token ${code}`}
    >
      <svg
        viewBox={`0 0 ${grid} ${grid}`}
        className="h-full w-full"
        shapeRendering="crispEdges"
      >
        {cells.map((filled, idx) => {
          if (!filled) return null;
          const r = Math.floor(idx / grid);
          const c = idx % grid;
          return (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={0.92}
              height={0.92}
              rx={0.14}
              fill="#00241A"
            />
          );
        })}
      </svg>
    </div>
  );
};

interface AmenityShowcaseVisualProps {
  theme: 'gym' | 'pool' | 'dining' | 'tennis';
  title: string;
}

export const AmenityShowcaseVisual: React.FC<AmenityShowcaseVisualProps> = ({ theme, title }) => {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#0D3B2E]"
      role="img"
      aria-label={title}
    >
      {theme === 'gym' && (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="gymSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A3D0BE" />
              <stop offset="50%" stopColor="#EBF6F1" />
              <stop offset="100%" stopColor="#FED488" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="gymWood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5C3D24" />
              <stop offset="100%" stopColor="#775A19" />
            </linearGradient>
          </defs>
          {/* Exterior courtyard pool view */}
          <rect width="640" height="360" fill="url(#gymSky)" />
          <rect x="0" y="210" width="290" height="90" fill="#3C6658" fillOpacity="0.55" />
          {/* Timber ceiling */}
          <polygon points="0,0 640,0 640,95 270,62 0,80" fill="url(#gymWood)" />
          {[60, 140, 220, 300, 380, 460, 540].map((x) => (
            <line key={x} x1={x} y1="0" x2={x - 30} y2="75" stroke="#3D2614" strokeWidth="2" strokeOpacity="0.4" />
          ))}
          {/* Glass Mullions */}
          <line x1="160" y1="70" x2="160" y2="300" stroke="#141E1B" strokeWidth="3" strokeOpacity="0.45" />
          <line x1="300" y1="62" x2="300" y2="300" stroke="#141E1B" strokeWidth="3" strokeOpacity="0.45" />
          {/* Interior Timber Wall */}
          <rect x="300" y="62" width="340" height="238" fill="#1D2B26" />
          <rect x="300" y="62" width="340" height="238" fill="url(#gymWood)" fillOpacity="0.28" />
          {/* Floor */}
          <polygon points="0,295 640,295 640,360 0,360" fill="#141E1B" />
          {/* Technogym equipment silhouettes */}
          <g fill="#0D3B2E" stroke="#C5A059" strokeWidth="1.2" strokeOpacity="0.55">
            <rect x="75" y="245" width="76" height="44" rx="6" />
            <path d="M90 245 L108 195 L138 195" fill="none" strokeWidth="4" stroke="#141E1B" />
            <rect x="195" y="245" width="76" height="44" rx="6" />
            <path d="M210 245 L228 195 L258 195" fill="none" strokeWidth="4" stroke="#141E1B" />
            <rect x="355" y="210" width="90" height="82" rx="4" fill="#0A1A15" />
            <circle cx="515" cy="240" r="24" fill="#00241A" />
            <rect x="485" y="264" width="60" height="28" rx="4" />
          </g>
          {/* Warm architectural pendant glows */}
          <circle cx="380" cy="115" r="14" fill="#FED488" fillOpacity="0.28" />
          <circle cx="510" cy="115" r="14" fill="#FED488" fillOpacity="0.28" />
        </svg>
      )}
      {theme === 'dining' && (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <rect width="640" height="360" fill="#0D3B2E" />
          <path d="M90 360 V130 A110 110 0 0 1 310 130 V360" fill="none" stroke="#C5A059" strokeWidth="1.6" strokeOpacity="0.65" />
          <path d="M330 360 V130 A110 110 0 0 1 550 130 V360" fill="none" stroke="#C5A059" strokeWidth="1.6" strokeOpacity="0.65" />
          <circle cx="200" cy="145" r="26" fill="#FED488" fillOpacity="0.16" stroke="#D4AF37" strokeWidth="1.2" />
          <circle cx="440" cy="145" r="26" fill="#FED488" fillOpacity="0.16" stroke="#D4AF37" strokeWidth="1.2" />
          <rect x="160" y="232" width="320" height="48" rx="6" fill="#141E1B" fillOpacity="0.65" stroke="#C5A059" strokeOpacity="0.5" />
        </svg>
      )}
      {theme === 'pool' && (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <rect width="640" height="360" fill="#143A2F" />
          <rect x="64" y="60" width="512" height="140" fill="#EBF6F1" fillOpacity="0.08" stroke="#C5A059" strokeOpacity="0.4" />
          <rect x="88" y="216" width="464" height="92" rx="6" fill="#2D5A4C" stroke="#A3D0BE" strokeWidth="1.3" strokeOpacity="0.65" />
          {[140, 230, 320, 410, 500].map((x) => (
            <line key={x} x1={x} y1="60" x2={x} y2="200" stroke="#C5A059" strokeWidth="1.2" strokeOpacity="0.45" />
          ))}
        </svg>
      )}
      {theme === 'tennis' && (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <rect width="640" height="360" fill="#1C362D" />
          <rect x="96" y="76" width="448" height="208" fill="#8A5A44" fillOpacity="0.45" stroke="#E8E2D7" strokeWidth="1.5" strokeOpacity="0.7" />
          <rect x="96" y="106" width="448" height="148" fill="none" stroke="#E8E2D7" strokeWidth="1" strokeOpacity="0.45" />
          <line x1="320" y1="64" x2="320" y2="296" stroke="#C5A059" strokeWidth="2" strokeOpacity="0.9" />
          <line x1="200" y1="106" x2="200" y2="254" stroke="#E8E2D7" strokeWidth="1" strokeOpacity="0.45" />
          <line x1="440" y1="106" x2="440" y2="254" stroke="#E8E2D7" strokeWidth="1" strokeOpacity="0.45" />
        </svg>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00241A]/85 via-[#00241A]/15 to-transparent" />
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-[#F1FCF7]">
        <span className="text-xs font-semibold tracking-tight">{title}</span>
      </div>
    </div>
  );
};

export const RidgeSunriseVisual: React.FC<{ caption?: string }> = ({ caption = 'East Hill Ridge View' }) => (
  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1A2421]">
    <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6A96E" />
          <stop offset="45%" stopColor="#F4D7A7" />
          <stop offset="100%" stopColor="#9AB5AA" />
        </linearGradient>
        <linearGradient id="mistLayer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F1FCF7" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#FFDEA5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F1FCF7" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#dawnSky)" />
      <circle cx="430" cy="115" r="44" fill="#FFF3D6" fillOpacity="0.7" />
      {/* Far mountain ridge */}
      <path d="M0 175 Q110 118 220 155 T450 120 T640 165 L640 360 L0 360 Z" fill="#3D5A50" />
      {/* Valley mist */}
      <ellipse cx="320" cy="215" rx="340" ry="38" fill="url(#mistLayer)" />
      {/* Mid ridge */}
      <path d="M0 225 Q160 170 310 212 T640 192 L640 360 L0 360 Z" fill="#1D3D33" />
      {/* Foreground terrace & architecture */}
      <polygon points="410,60 640,20 640,285 410,255" fill="#2A3330" />
      <polygon points="435,95 620,65 620,235 435,215" fill="#FED488" fillOpacity="0.22" stroke="#C5A059" strokeWidth="1.2" />
      <polygon points="0,275 430,248 640,280 640,360 0,360" fill="#141E1B" />
      {/* Bougainvillea blossoms */}
      <circle cx="72" cy="292" r="24" fill="#8E2457" fillOpacity="0.88" />
      <circle cx="115" cy="306" r="20" fill="#A83268" fillOpacity="0.9" />
      <circle cx="155" cy="318" r="22" fill="#8E2457" fillOpacity="0.85" />
      <circle cx="205" cy="332" r="18" fill="#B54074" fillOpacity="0.85" />
    </svg>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00241A]/55 via-transparent to-transparent" />
    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-[#141E1B]/75 px-2.5 py-1 text-[11px] font-medium text-[#F1FCF7] backdrop-blur-xs">
      <span>{caption}</span>
    </div>
  </div>
);

export const UserAvatar: React.FC<{
  name: string;
  initials: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  toneClass?: string;
  className?: string;
}> = ({
  name,
  initials,
  avatarUrl,
  size = 'md',
  toneClass = 'bg-gradient-to-br from-[#0B3529] via-[#165341] to-[#85631E] text-[#F7DDA4]',
  className = '',
}) => {
  const [failed, setFailed] = React.useState(false);
  const cleanUrl = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';

  React.useEffect(() => {
    setFailed(false);
  }, [cleanUrl]);

  const dims =
    size === 'sm'
      ? 'h-8 w-8 min-w-[2rem] min-h-[2rem] text-[10px]'
      : size === 'lg'
      ? 'h-16 w-16 min-w-[4rem] min-h-[4rem] text-lg'
      : 'h-10 w-10 min-w-[2.5rem] min-h-[2.5rem] text-xs';

  return (
    <div
      className={`relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#C59B48]/55 font-bold shadow-xs select-none ${toneClass} ${dims} ${className}`}
    >
      {cleanUrl && !failed ? (
        <img
          src={cleanUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth === 0) setFailed(true);
          }}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <span className="leading-none tracking-tight">{initials || 'NH'}</span>
      )}
    </div>
  );
};

export const CommunityMediaVisual: React.FC<{
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  visualTheme?:
    | 'ridge'
    | 'gardens'
    | 'court'
    | 'sankranti-reel'
    | 'diwali-villa'
    | 'medical-camp'
    | 'chef-table'
    | 'solar-walk';
  caption?: string;
  videoDuration?: string;
}> = ({
  mediaType = 'image',
  mediaUrl,
  visualTheme = 'ridge',
  caption,
  videoDuration = '01:15',
}) => {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(24);
  const [muted, setMuted] = React.useState(false);
  const [imgErr, setImgErr] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 180);
    return () => window.clearInterval(id);
  }, [playing]);

  const isVideo = mediaType === 'video';

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-[#E2DDD2] bg-[#0B3529] shadow-sm">
      {mediaUrl && !imgErr ? (
        <img
          src={mediaUrl}
          alt={caption || 'Community insight'}
          referrerPolicy="no-referrer"
          onError={() => setImgErr(true)}
          className={`h-full w-full object-cover transition-transform duration-700 ${
            playing ? 'scale-[1.06]' : 'group-hover:scale-[1.03]'
          } ${
            visualTheme === 'diwali-villa'
              ? 'contrast-[1.12] saturate-[1.22] brightness-[1.02]'
              : ''
          }`}
        />
      ) : visualTheme === 'sankranti-reel' ? (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sankrantiSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F4B254" />
              <stop offset="55%" stopColor="#FCE0A6" />
              <stop offset="100%" stopColor="#6AA394" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#sankrantiSky)" />
          <circle cx="520" cy="86" r="46" fill="#FFF2CE" fillOpacity="0.82" />
          {/* Kites with animated bobbing */}
          <g className={playing ? 'animate-pulse' : ''}>
            <polygon points="180,62 214,96 180,132 146,96" fill="#BA1A1A" stroke="#F7DDA4" strokeWidth="2" />
            <line x1="180" y1="132" x2="164" y2="210" stroke="#141E1B" strokeOpacity="0.45" strokeWidth="1.5" />
            <polygon points="325,44 352,72 325,102 298,72" fill="#0B3529" stroke="#F7DDA4" strokeWidth="2" />
            <line x1="325" y1="102" x2="310" y2="195" stroke="#141E1B" strokeOpacity="0.45" strokeWidth="1.5" />
            <polygon points="435,96 458,118 435,142 412,118" fill="#85631E" stroke="#FFF" strokeWidth="1.5" />
          </g>
          {/* Central Lawns pavilion */}
          <path d="M0 246 Q180 218 360 242 T640 232 L640 360 L0 360 Z" fill="#0B3529" />
          <path d="M0 286 Q220 264 460 292 T640 280 L640 360 L0 360 Z" fill="#00241A" />
          {/* Rangoli mandala accents */}
          <circle cx="210" cy="316" r="24" fill="none" stroke="#F7DDA4" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="210" cy="316" r="10" fill="#BA1A1A" />
          <circle cx="430" cy="322" r="20" fill="none" stroke="#F7DDA4" strokeWidth="2" strokeDasharray="3 4" />
        </svg>
      ) : visualTheme === 'medical-camp' ? (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="medBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0B3529" />
              <stop offset="60%" stopColor="#144939" />
              <stop offset="100%" stopColor="#265A4B" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#medBg)" />
          <circle cx="320" cy="158" r="96" fill="#F7DDA4" fillOpacity="0.09" stroke="#C59B48" strokeOpacity="0.45" strokeWidth="1.5" />
          <path
            d="M110 168 H220 L248 118 L276 214 L306 140 L330 182 L352 168 H530"
            fill="none"
            stroke="#F7DDA4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M320 96 C306 84 294 75 294 64 C294 56 300 50 308 50 C313 50 318 53 320 57 C322 53 327 50 332 50 C340 50 346 56 346 64 C346 75 334 84 320 96 Z"
            fill="#F7DDA4"
          />
          <rect x="76" y="254" width="488" height="62" rx="14" fill="#00241A" fillOpacity="0.72" stroke="#C59B48" strokeOpacity="0.35" />
          <text x="104" y="290" fill="#FBF9F5" fontSize="16" fontFamily="serif">
            Villa #44 Cardiac Wellness & Community First-Aid Workshop
          </text>
        </svg>
      ) : visualTheme === 'solar-walk' ? (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="solarSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#194B3D" />
              <stop offset="65%" stopColor="#4F7E6F" />
              <stop offset="100%" stopColor="#DCE8E1" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#solarSky)" />
          <circle cx="520" cy="76" r="36" fill="#F7DDA4" fillOpacity="0.88" />
          {/* Architectural solar villa roof */}
          <polygon points="120,196 340,118 520,196" fill="#0B3529" stroke="#F7DDA4" strokeWidth="2" />
          <polygon points="154,196 340,130 486,196" fill="#1D4B63" stroke="#9ED0E6" strokeWidth="1.4" />
          <line x1="240" y1="164" x2="240" y2="196" stroke="#9ED0E6" strokeWidth="1" />
          <line x1="340" y1="130" x2="340" y2="196" stroke="#9ED0E6" strokeWidth="1" />
          <line x1="415" y1="162" x2="415" y2="196" stroke="#9ED0E6" strokeWidth="1" />
          <rect x="148" y="196" width="344" height="114" fill="#F4F1EA" />
          <rect x="200" y="222" width="94" height="62" rx="4" fill="#0B3529" fillOpacity="0.85" stroke="#C59B48" />
          <rect x="336" y="222" width="110" height="88" rx="4" fill="#85631E" fillOpacity="0.88" />
          <rect x="0" y="310" width="640" height="50" fill="#0B3529" />
        </svg>
      ) : visualTheme === 'chef-table' ? (
        <svg viewBox="0 0 640 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <rect width="640" height="360" fill="#183D32" />
          <path d="M80 360 V132 A110 110 0 0 1 300 132 V360" fill="none" stroke="#C59B48" strokeWidth="2" strokeOpacity="0.6" />
          <path d="M340 360 V132 A110 110 0 0 1 560 132 V360" fill="none" stroke="#C59B48" strokeWidth="2" strokeOpacity="0.6" />
          <circle cx="190" cy="140" r="24" fill="#F7DDA4" fillOpacity="0.3" />
          <circle cx="450" cy="140" r="24" fill="#F7DDA4" fillOpacity="0.3" />
          <rect x="110" y="225" width="420" height="62" rx="12" fill="#FBF9F5" fillOpacity="0.94" />
          <circle cx="205" cy="256" r="16" fill="#0B3529" />
          <circle cx="320" cy="256" r="18" fill="#85631E" />
          <circle cx="435" cy="256" r="16" fill="#BA1A1A" fillOpacity="0.85" />
        </svg>
      ) : (
        <RidgeSunriseVisual caption={caption} />
      )}

      {/* Cinematic Scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#00241A]/80 via-[#00241A]/15 to-transparent" />

      {/* Video Controls Overlay */}
      {isVideo && (
        <>
          <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00241A]/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#F7DDA4] backdrop-blur-xs">
              <span className={`h-2 w-2 rounded-full ${playing ? 'bg-[#BA1A1A]' : 'bg-[#F7DDA4]'}`} />
              <span>{playing ? 'PLAYING REEL' : 'VIDEO REEL'}</span>
            </span>
            <span className="rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] font-semibold text-white tabular-nums backdrop-blur-xs">
              {videoDuration}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause community video reel' : 'Play community video reel'}
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#F7DDA4]/60 bg-[#0B3529]/85 text-[#F7DDA4] shadow-xl backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute reel audio' : 'Mute reel audio'}
            className="absolute right-3.5 top-3.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-xs hover:bg-black/75"
          >
            {muted ? 'Muted' : 'Audio On'}
          </button>
        </>
      )}

      {/* Bottom Caption & Interactive Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 px-4 pb-3 pt-6">
        {caption && (
          <p className="text-xs font-semibold text-[#FBF9F5] drop-shadow-xs">{caption}</p>
        )}
        {isVideo && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-[#F7DDA4] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#F7DDA4] tabular-nums">
              {playing ? 'HD · Live' : 'Tap Play'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const StoryThumbVisual: React.FC<{
  theme: 'sankranti' | 'ugadi' | 'gardens' | 'tennis' | 'diwali' | 'occupation';
}> = ({ theme }) => {
  if (theme === 'sankranti') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill="#F3B963" />
        <polygon points="32,12 44,24 32,38 20,24" fill="#BA1A1A" />
        <polygon points="18,22 25,29 18,37 11,29" fill="#0B3529" />
        <path d="M0 48 Q32 42 64 50 L64 64 L0 64 Z" fill="#0D3B2E" />
      </svg>
    );
  }
  if (theme === 'occupation') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill="#0B3529" />
        <circle cx="32" cy="32" r="21" fill="#1C4E3F" stroke="#F7DDA4" strokeWidth="1.5" />
        <path
          d="M32 45 C23 38 18 33 18 26.5 C18 22.5 21 19.5 24.8 19.5 C27.5 19.5 30 21 32 23.5 C34 21 36.5 19.5 39.2 19.5 C43 19.5 46 22.5 46 26.5 C46 33 41 38 32 45 Z"
          fill="#F7DDA4"
        />
      </svg>
    );
  }
  if (theme === 'ugadi') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill="#3D2614" />
        <circle cx="32" cy="34" r="16" fill="#C59B48" />
        <circle cx="32" cy="34" r="11" fill="#F5F1EA" />
        <path d="M12 14 Q32 22 52 14" stroke="#79A694" strokeWidth="4" fill="none" />
      </svg>
    );
  }
  if (theme === 'gardens') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill="#1C3D31" />
        <rect x="20" y="18" width="24" height="28" rx="2" fill="#F7DDA4" fillOpacity="0.7" />
        <path d="M0 46 Q32 34 64 46 L64 64 L0 64 Z" fill="#0B3529" />
      </svg>
    );
  }
  if (theme === 'tennis') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill="#2D5A4C" />
        <rect x="14" y="16" width="36" height="32" fill="#8A5A44" stroke="#F1FCF7" strokeWidth="1.5" />
        <line x1="32" y1="16" x2="32" y2="48" stroke="#F7DDA4" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <rect width="64" height="64" fill="#141E1B" />
      <circle cx="24" cy="28" r="6" fill="#F7DDA4" />
      <circle cx="42" cy="22" r="5" fill="#C59B48" />
      <circle cx="34" cy="40" r="7" fill="#FFDEA5" />
    </svg>
  );
};

export type TrendyNavTabId = 'home' | 'gate' | 'amenities' | 'community' | 'directory';

const NAV_ICON_PALETTES: Record<
  TrendyNavTabId,
  {
    activeGradient: string;
    idleBg: string;
    idleIconColor: string;
    ringColor: string;
    glowShadow: string;
  }
> = {
  home: {
    activeGradient: 'from-[#0B3529] via-[#124E3C] to-[#1D6B53]',
    idleBg: 'bg-[#F6F8F4] border-[#D6DFD8]',
    idleIconColor: 'text-[#0B3529]',
    ringColor: 'border-[#C59B48]',
    glowShadow: 'shadow-[0_6px_16px_-3px_rgba(11,53,41,0.42)]',
  },
  gate: {
    activeGradient: 'from-[#0B3529] via-[#0E5468] to-[#0284C7]',
    idleBg: 'bg-[#F4F8FA] border-[#CFE0E8]',
    idleIconColor: 'text-[#0369A1]',
    ringColor: 'border-[#38BDF8]',
    glowShadow: 'shadow-[0_6px_16px_-3px_rgba(2,132,199,0.38)]',
  },
  amenities: {
    activeGradient: 'from-[#0B3529] via-[#115E59] to-[#0D9488]',
    idleBg: 'bg-[#F3FAF8] border-[#CDE3DF]',
    idleIconColor: 'text-[#0F766E]',
    ringColor: 'border-[#C59B48]',
    glowShadow: 'shadow-[0_6px_16px_-3px_rgba(13,148,136,0.38)]',
  },
  community: {
    activeGradient: 'from-[#0B3529] via-[#7F1D3A] to-[#B45309]',
    idleBg: 'bg-[#FAF5F6] border-[#E8D5DA]',
    idleIconColor: 'text-[#9F1239]',
    ringColor: 'border-[#F43F5E]',
    glowShadow: 'shadow-[0_6px_16px_-3px_rgba(190,18,60,0.34)]',
  },
  directory: {
    activeGradient: 'from-[#0B3529] via-[#27387A] to-[#4338CA]',
    idleBg: 'bg-[#F5F6FA] border-[#D5DAF0]',
    idleIconColor: 'text-[#3730A3]',
    ringColor: 'border-[#818CF8]',
    glowShadow: 'shadow-[0_6px_16px_-3px_rgba(67,56,202,0.36)]',
  },
};

const ICON_CLICK_KEYFRAMES: Record<
  TrendyNavTabId,
  {
    scale?: number[];
    rotate?: number[];
    y?: number[];
  }
> = {
  home: { y: [0, -5, 1, 0], scale: [1, 1.26, 0.94, 1] },
  gate: { rotate: [0, -14, 12, -5, 0], scale: [1, 1.24, 0.96, 1] },
  amenities: { y: [0, -4, 1, 0], scale: [1, 1.25, 0.95, 1] },
  community: { rotate: [0, 10, -10, 4, 0], scale: [1, 1.24, 0.95, 1] },
  directory: { rotate: [0, -12, 8, 0], scale: [1, 1.24, 0.96, 1] },
};

export const TrendyNavIcon: React.FC<{
  id: TrendyNavTabId;
  active: boolean;
  pulseKey?: number;
  compact?: boolean;
}> = ({ id, active, pulseKey = 0, compact = false }) => {
  const palette = NAV_ICON_PALETTES[id];
  const boxClass = compact ? 'h-9 w-9 rounded-full' : 'h-7 w-7 rounded-full';
  const iconSizeClass = compact ? 'h-[18px] w-[18px]' : 'h-[15px] w-[15px]';
  const strokeW = active ? 2.15 : 1.75;

  return (
    <div className="relative flex items-center justify-center">
      {/* Soft Resting Aura behind Active Medallion */}
      {active && (
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1.24, opacity: 0.32 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-none absolute inset-0 rounded-full border ${palette.ringColor}`}
        />
      )}

      {/* Expanding Classic Halo Ripple on Click */}
      {pulseKey > 0 && (
        <motion.span
          key={`ring-${id}-${pulseKey}`}
          initial={{ scale: 0.72, opacity: 0.9 }}
          animate={{ scale: 2.05, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-none absolute inset-0 rounded-full border-2 ${palette.ringColor}`}
        />
      )}

      <motion.div
        animate={{
          scale: active ? (compact ? 1.1 : 1.06) : 1,
          y: active ? (compact ? -2.5 : -1) : 0,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 24, mass: 0.8 }}
        className={`relative flex items-center justify-center overflow-hidden transition-colors duration-300 ${boxClass} ${
          active
            ? `bg-gradient-to-br ${palette.activeGradient} text-[#F7DDA4] ring-1 ring-[#C59B48]/85 ${palette.glowShadow}`
            : `border ${palette.idleBg} ${palette.idleIconColor} shadow-2xs`
        }`}
      >
        {/* Champagne Gold Sheen Sweep on Click */}
        {pulseKey > 0 && (
          <motion.span
            key={`sheen-${id}-${pulseKey}`}
            initial={{ x: '-150%', opacity: 0.85 }}
            animate={{ x: '170%', opacity: 0 }}
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-y-0 w-4 -skew-x-12 bg-gradient-to-r from-transparent via-[#F7DDA4]/75 to-transparent"
          />
        )}

        {/* Animated Classic Architectural Line Icon */}
        <motion.div
          key={`glyph-${id}-${pulseKey}`}
          initial={false}
          animate={pulseKey > 0 ? ICON_CLICK_KEYFRAMES[id] : { scale: 1, rotate: 0, y: 0 }}
          transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
        >
          {id === 'home' && <Home className={iconSizeClass} strokeWidth={strokeW} />}
          {id === 'gate' && <QrCode className={iconSizeClass} strokeWidth={strokeW} />}
          {id === 'amenities' && <Landmark className={iconSizeClass} strokeWidth={strokeW} />}
          {id === 'community' && <Users className={iconSizeClass} strokeWidth={strokeW} />}
          {id === 'directory' && <BookUser className={iconSizeClass} strokeWidth={strokeW} />}
        </motion.div>
      </motion.div>
    </div>
  );
};

