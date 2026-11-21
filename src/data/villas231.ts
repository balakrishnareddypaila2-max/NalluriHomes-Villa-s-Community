export interface VillaRecord {
  villaNumber: number;
  villaCode: string;
  ownerName: string;
  street: string;
  sectorGate: 'North Pavilion Gate' | 'South Cypress Gate';
  intercomExt: string;
  emergencyLine: string;
  occupancyStatus: 'Occupied' | 'Approved' | 'Available';
}

export interface EmergencyDesk {
  id: string;
  title: string;
  detail: string;
  number: string;
  ext: string;
}

export const ENCLAVE_EMERGENCY_DESKS: EmergencyDesk[] = [
  {
    id: 'emg-guardhouse',
    title: '24/7 Master Guardhouse & Patrol',
    detail: 'North Pavilion Command · Armed Rapid Response',
    number: '+91 40 2980 9911',
    ext: 'Ext. 900',
  },
  {
    id: 'emg-medical',
    title: 'Enclave Medical & Ambulance Desk',
    detail: 'Resident Clinic · 3-Minute Villa Triage',
    number: '+91 40 2980 9108',
    ext: 'Ext. 911',
  },
  {
    id: 'emg-fire',
    title: 'Fire & Technical Utility Dispatch',
    detail: 'Substation, Gas & Perimeter Maintenance',
    number: '+91 40 2980 9222',
    ext: 'Ext. 922',
  },
];

const STREETS = [
  'Boulevard Walk',
  'Jacaranda Drive',
  'Cypress Promenade',
  'Olive Grove Avenue',
  'East Hill Ridge',
  'Lotus Courtyard',
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Anand', 'Ananya', 'Arjun', 'Deepak', 'Divya', 'Gautam',
  'Harish', 'Ishaan', 'Kavitha', 'Kiran', 'Lakshmi', 'Madhav', 'Meera', 'Nandini',
  'Nikhil', 'Padma', 'Pranav', 'Priya', 'Raghav', 'Rajesh', 'Rohan', 'Sanjay',
  'Shruti', 'Siddharth', 'Sneha', 'Surya', 'Tarun', 'Uma', 'Varun', 'Vikram',
  'Vivek', 'Yamini', 'Zoya',
];

const LAST_NAMES = [
  'Reddy', 'Rao', 'Varma', 'Sharma', 'Nair', 'Menon', 'Patel', 'Kulkarni',
  'Desai', 'Choudhary', 'Iyer', 'Subramanian', 'Bhatia', 'Kapoor', 'Malhotra',
  'Singhal', 'Agarwal', 'Krishnan', 'Naidu', 'Murthy', 'Gowda', 'Srinivasan',
];

const NAMED_OVERRIDES: Record<number, { ownerName: string; street: string }> = {
  12: { ownerName: 'Vikram & Anjali Singh', street: 'Cypress Promenade' },
  42: { ownerName: 'Dr. Anand Mahindra', street: 'Jacaranda Drive' },
  44: { ownerName: 'Kavitha & Srinivas Reddy', street: 'Jacaranda Drive' },
  89: { ownerName: 'Arjun & Priya Rao', street: 'Olive Grove Avenue' },
  108: { ownerName: 'Rajesh & Sneha Varma', street: 'Boulevard Walk' },
};

export const BASE_231_VILLAS: VillaRecord[] = Array.from({ length: 231 }, (_, index) => {
  const num = index + 1;
  const padded = String(num).padStart(3, '0');
  const override = NAMED_OVERRIDES[num];

  const firstA = FIRST_NAMES[(num * 7) % FIRST_NAMES.length];
  const firstB = FIRST_NAMES[(num * 13 + 5) % FIRST_NAMES.length];
  const last = LAST_NAMES[(num * 11) % LAST_NAMES.length];

  const isAvailable = num % 19 === 0 && !override;
  const ownerName = override
    ? override.ownerName
    : isAvailable
    ? 'Unassigned · Sanctuary Allocation'
    : `${firstA} & ${firstB} ${last}`;

  const street = override ? override.street : STREETS[index % STREETS.length];
  const sectorGate = num <= 120 ? 'North Pavilion Gate' : 'South Cypress Gate';

  const lineSuffix = String(1000 + num);
  return {
    villaNumber: num,
    villaCode: `Villa #${padded}`,
    ownerName,
    street,
    sectorGate,
    intercomExt: `Ext. ${lineSuffix}`,
    emergencyLine: `+91 40 2980 ${lineSuffix}`,
    occupancyStatus: isAvailable ? 'Available' : 'Occupied',
  };
});
