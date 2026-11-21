export type ScreenId = 'home' | 'gate' | 'amenities' | 'community' | 'directory';

export type PassStatus = 'ON-PREMISE' | 'EN ROUTE' | 'APPROVED' | 'EXPIRED';

export type EntryCategory = 'Private Guest' | 'Valet Courier' | 'Household Staff' | 'VIP Escort';

export interface GuestPass {
  id: string;
  tokenCode: string;
  guestName: string;
  companyOrRelation: string;
  vehiclePlate: string;
  vehicleModel: string;
  gate: 'North Pavilion Gate' | 'South Cypress Gate';
  windowLabel: string;
  validDate: string;
  category: EntryCategory;
  status: PassStatus;
  notes?: string;
}

export interface HouseholdVehicle {
  id: string;
  label: string;
  plate: string;
  transponderId: string;
  status: 'ON-PREMISE' | 'OFF-SITE';
  lastGateEvent: string;
}

export type AmenityCategory = 'gym' | 'courts' | 'spa' | 'dining';

export interface TimeSlotOption {
  id: string;
  time: string;
  availabilityLabel: string;
  availabilityTone: 'full' | 'low' | 'open';
  subtitle: string;
  disabled?: boolean;
}

export interface AmenityFacility {
  id: string;
  category: AmenityCategory;
  categoryLabel: string;
  kicker: string;
  name: string;
  location: string;
  peakLabel: string;
  currentOccupancy: number;
  maxCapacity: number;
  statusHeadline: string;
  statusDescription: string;
  tempLabel: string;
  tempSub: string;
  hoursLabel: string;
  hoursSub: string;
  stewardLabel: string;
  stewardSub: string;
  visualTitle: string;
  visualTheme: 'gym' | 'tennis' | 'pool' | 'dining';
  slots: TimeSlotOption[];
}

export interface AmenityBooking {
  id: string;
  amenityId: string;
  amenityName: string;
  dateLabel: string;
  timeSlot: string;
  reservedFor: string;
  tokenCode: string;
  status: 'Ready' | 'Confirmed';
  dayTag: string;
}

export interface CommunityStory {
  id: string;
  label: string;
  isLive?: boolean;
  isVideo?: boolean;
  theme: 'sankranti' | 'ugadi' | 'gardens' | 'tennis' | 'diwali' | 'occupation';
  author: string;
  villa: string;
  caption: string;
  timestamp: string;
}

export interface CommunityComment {
  id: string;
  author: string;
  villa: string;
  initials: string;
  avatarUrl?: string;
  body: string;
  timestamp: string;
}

export type CommunityCategoryTag =
  | 'Festival Celebration'
  | 'Special Occupation'
  | 'Community Reel'
  | 'Sports & Clubs'
  | 'Township Insight';

export interface CommunityPost {
  id: string;
  type: 'photo' | 'video' | 'match' | 'update' | 'festival' | 'occupation';
  categoryTag?: CommunityCategoryTag;
  occupationBadge?: string;
  author: string;
  villa: string;
  street: string;
  timestamp: string;
  initials: string;
  avatarTone: string;
  authorAvatarUrl?: string;
  body: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  videoDuration?: string;
  visualTheme?:
    | 'ridge'
    | 'gardens'
    | 'court'
    | 'sankranti-reel'
    | 'diwali-villa'
    | 'medical-camp'
    | 'chef-table'
    | 'solar-walk';
  visualCaption?: string;
  likes: number;
  likedByMe: boolean;
  sharesCount: number;
  bookmarked: boolean;
  seenByCount: number;
  comments: CommunityComment[];
  matchDetails?: {
    schedule: string;
    venue: string;
    slotsFilled: number;
    slotsTotal: number;
    pace: string;
    joinedByMe: boolean;
    joinedSummary: string;
  };
}

export interface DirectoryContact {
  id: string;
  name: string;
  roleOrVilla: string;
  department: 'Governance' | 'Concierge' | 'Security' | 'Neighbors';
  extensionOrStreet: string;
  availability: string;
  initials: string;
}

export interface ClimateZone {
  id: string;
  name: string;
  currentTemp: number;
  targetTemp: number;
  humidity: number;
  mode: 'Auto' | 'Eco' | 'Away';
  consumptionKw: number;
}

export interface LightingScene {
  id: string;
  name: string;
  detail: string;
  level: number;
  active: boolean;
}

export interface IrrigationZone {
  id: string;
  name: string;
  moisturePct: number;
  nextCycle: string;
  enabled: boolean;
}

export interface ParcelItem {
  id: string;
  carrier: string;
  description: string;
  arrivedAt: string;
  lockerCode: string;
  pin: string;
  collected: boolean;
}

export interface ConciergeMessage {
  id: string;
  sender: 'resident' | 'concierge';
  author: string;
  role: string;
  timestamp: string;
  body: string;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface VillaRegistration {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  villaNumber: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  avatarDataUrl?: string;
  passwordSalt?: string;
  passwordHash?: string;
  status: RegistrationStatus;
  adminNote?: string;
  reviewedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VillaDirectorySync {
  villaNumber: number;
  villaCode: string;
  ownerName: string;
  street: string;
  intercomExt: string;
  emergencyLine: string;
  occupancyStatus: 'Occupied' | 'Approved' | 'Available';
  ownerUid?: string;
  updatedAt?: unknown;
}

export interface AdminAccount {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  villaNumber?: number;
  passwordSalt?: string;
  passwordHash?: string;
  addedBy?: string;
  isPrimary?: boolean;
  createdAt?: unknown;
}

export interface EmotionalQuote {
  id: string;
  quote: string;
  subtitle: string;
  mood: string;
}

export interface ActiveSessionProfile {
  isLoggedIn: boolean;
  loginMethod: 'credentials' | 'google' | 'guest';
  uid?: string;
  fullName: string;
  email: string;
  phone: string;
  villaNumber: number;
  villaLabel: string;
  street: string;
  tier: string;
  address: string;
  avatarDataUrl?: string;
  initials: string;
  isAdmin: boolean;
  approvalStatus?: RegistrationStatus;
}

