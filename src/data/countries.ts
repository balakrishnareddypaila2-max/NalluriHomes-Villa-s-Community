export interface CountryDialInfo {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  minDigits: number;
  maxDigits: number;
  startsWith?: RegExp;
  ruleHint: string;
  example: string;
}

export const COUNTRIES: CountryDialInfo[] = [
  {
    iso: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^[6-9]/,
    ruleHint: '10 digits starting with 6–9',
    example: '9849000108',
  },
  {
    iso: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^[2-9]/,
    ruleHint: '10 digits (area code starts with 2–9)',
    example: '4155550199',
  },
  {
    iso: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^5/,
    ruleHint: '9 digits starting with 5',
    example: '501234567',
  },
  {
    iso: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^7/,
    ruleHint: '10 digits starting with 7',
    example: '7700900123',
  },
  {
    iso: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^[89]/,
    ruleHint: '8 digits starting with 8 or 9',
    example: '81234567',
  },
  {
    iso: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^4/,
    ruleHint: '9 digits starting with 4',
    example: '412345678',
  },
  {
    iso: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^[2-9]/,
    ruleHint: '10 digits (area code starts with 2–9)',
    example: '6475550144',
  },
  {
    iso: 'SA',
    name: 'Saudi Arabia',
    dialCode: '+966',
    flag: '🇸🇦',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^5/,
    ruleHint: '9 digits starting with 5',
    example: '501234567',
  },
  {
    iso: 'QA',
    name: 'Qatar',
    dialCode: '+974',
    flag: '🇶🇦',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^[3567]/,
    ruleHint: '8 digits starting with 3, 5, 6, or 7',
    example: '55123456',
  },
  {
    iso: 'KW',
    name: 'Kuwait',
    dialCode: '+965',
    flag: '🇰🇼',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^[569]/,
    ruleHint: '8 digits starting with 5, 6, or 9',
    example: '50012345',
  },
  {
    iso: 'OM',
    name: 'Oman',
    dialCode: '+968',
    flag: '🇴🇲',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^[79]/,
    ruleHint: '8 digits starting with 7 or 9',
    example: '91234567',
  },
  {
    iso: 'BH',
    name: 'Bahrain',
    dialCode: '+973',
    flag: '🇧🇭',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^3/,
    ruleHint: '8 digits starting with 3',
    example: '36123456',
  },
  {
    iso: 'DE',
    name: 'Germany',
    dialCode: '+49',
    flag: '🇩🇪',
    minDigits: 10,
    maxDigits: 11,
    startsWith: /^1/,
    ruleHint: '10–11 digits starting with 1',
    example: '15112345678',
  },
  {
    iso: 'FR',
    name: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^[67]/,
    ruleHint: '9 digits starting with 6 or 7',
    example: '612345678',
  },
  {
    iso: 'NL',
    name: 'Netherlands',
    dialCode: '+31',
    flag: '🇳🇱',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^6/,
    ruleHint: '9 digits starting with 6',
    example: '612345678',
  },
  {
    iso: 'CH',
    name: 'Switzerland',
    dialCode: '+41',
    flag: '🇨🇭',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^7/,
    ruleHint: '9 digits starting with 7',
    example: '791234567',
  },
  {
    iso: 'IE',
    name: 'Ireland',
    dialCode: '+353',
    flag: '🇮🇪',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^8/,
    ruleHint: '9 digits starting with 8',
    example: '851234567',
  },
  {
    iso: 'NZ',
    name: 'New Zealand',
    dialCode: '+64',
    flag: '🇳🇿',
    minDigits: 8,
    maxDigits: 10,
    startsWith: /^2/,
    ruleHint: '8–10 digits starting with 2',
    example: '211234567',
  },
  {
    iso: 'MY',
    name: 'Malaysia',
    dialCode: '+60',
    flag: '🇲🇾',
    minDigits: 9,
    maxDigits: 10,
    startsWith: /^1/,
    ruleHint: '9–10 digits starting with 1',
    example: '123456789',
  },
  {
    iso: 'JP',
    name: 'Japan',
    dialCode: '+81',
    flag: '🇯🇵',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^[789]/,
    ruleHint: '10 digits starting with 7, 8, or 9',
    example: '9012345678',
  },
  {
    iso: 'KR',
    name: 'South Korea',
    dialCode: '+82',
    flag: '🇰🇷',
    minDigits: 9,
    maxDigits: 10,
    startsWith: /^1/,
    ruleHint: '9–10 digits starting with 1',
    example: '1012345678',
  },
  {
    iso: 'HK',
    name: 'Hong Kong',
    dialCode: '+852',
    flag: '🇭🇰',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^[569]/,
    ruleHint: '8 digits starting with 5, 6, or 9',
    example: '91234567',
  },
  {
    iso: 'TH',
    name: 'Thailand',
    dialCode: '+66',
    flag: '🇹🇭',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^[689]/,
    ruleHint: '9 digits starting with 6, 8, or 9',
    example: '812345678',
  },
  {
    iso: 'ID',
    name: 'Indonesia',
    dialCode: '+62',
    flag: '🇮🇩',
    minDigits: 9,
    maxDigits: 12,
    startsWith: /^8/,
    ruleHint: '9–12 digits starting with 8',
    example: '81234567890',
  },
  {
    iso: 'PH',
    name: 'Philippines',
    dialCode: '+63',
    flag: '🇵🇭',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^9/,
    ruleHint: '10 digits starting with 9',
    example: '9171234567',
  },
  {
    iso: 'VN',
    name: 'Vietnam',
    dialCode: '+84',
    flag: '🇻🇳',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^[35789]/,
    ruleHint: '9 digits starting with 3, 5, 7, 8, or 9',
    example: '912345678',
  },
  {
    iso: 'LK',
    name: 'Sri Lanka',
    dialCode: '+94',
    flag: '🇱🇰',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^7/,
    ruleHint: '9 digits starting with 7',
    example: '771234567',
  },
  {
    iso: 'NP',
    name: 'Nepal',
    dialCode: '+977',
    flag: '🇳🇵',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^9/,
    ruleHint: '10 digits starting with 9',
    example: '9841234567',
  },
  {
    iso: 'BD',
    name: 'Bangladesh',
    dialCode: '+880',
    flag: '🇧🇩',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^1/,
    ruleHint: '10 digits starting with 1',
    example: '1712345678',
  },
  {
    iso: 'IT',
    name: 'Italy',
    dialCode: '+39',
    flag: '🇮🇹',
    minDigits: 9,
    maxDigits: 10,
    startsWith: /^3/,
    ruleHint: '9–10 digits starting with 3',
    example: '3123456789',
  },
  {
    iso: 'ES',
    name: 'Spain',
    dialCode: '+34',
    flag: '🇪🇸',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^[67]/,
    ruleHint: '9 digits starting with 6 or 7',
    example: '612345678',
  },
  {
    iso: 'PT',
    name: 'Portugal',
    dialCode: '+351',
    flag: '🇵🇹',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^9/,
    ruleHint: '9 digits starting with 9',
    example: '912345678',
  },
  {
    iso: 'SE',
    name: 'Sweden',
    dialCode: '+46',
    flag: '🇸🇪',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^7/,
    ruleHint: '9 digits starting with 7',
    example: '701234567',
  },
  {
    iso: 'NO',
    name: 'Norway',
    dialCode: '+47',
    flag: '🇳🇴',
    minDigits: 8,
    maxDigits: 8,
    startsWith: /^[49]/,
    ruleHint: '8 digits starting with 4 or 9',
    example: '41234567',
  },
  {
    iso: 'DK',
    name: 'Denmark',
    dialCode: '+45',
    flag: '🇩🇰',
    minDigits: 8,
    maxDigits: 8,
    ruleHint: '8 digits',
    example: '20123456',
  },
  {
    iso: 'FI',
    name: 'Finland',
    dialCode: '+358',
    flag: '🇫🇮',
    minDigits: 9,
    maxDigits: 10,
    startsWith: /^4/,
    ruleHint: '9–10 digits starting with 4',
    example: '401234567',
  },
  {
    iso: 'BE',
    name: 'Belgium',
    dialCode: '+32',
    flag: '🇧🇪',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^4/,
    ruleHint: '9 digits starting with 4',
    example: '470123456',
  },
  {
    iso: 'AT',
    name: 'Austria',
    dialCode: '+43',
    flag: '🇦🇹',
    minDigits: 10,
    maxDigits: 11,
    startsWith: /^6/,
    ruleHint: '10–11 digits starting with 6',
    example: '6641234567',
  },
  {
    iso: 'PL',
    name: 'Poland',
    dialCode: '+48',
    flag: '🇵🇱',
    minDigits: 9,
    maxDigits: 9,
    ruleHint: '9 digits',
    example: '501234567',
  },
  {
    iso: 'ZA',
    name: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^[678]/,
    ruleHint: '9 digits starting with 6, 7, or 8',
    example: '821234567',
  },
  {
    iso: 'NG',
    name: 'Nigeria',
    dialCode: '+234',
    flag: '🇳🇬',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^[789]/,
    ruleHint: '10 digits starting with 7, 8, or 9',
    example: '8012345678',
  },
  {
    iso: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    flag: '🇰🇪',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^[17]/,
    ruleHint: '9 digits starting with 1 or 7',
    example: '712345678',
  },
  {
    iso: 'EG',
    name: 'Egypt',
    dialCode: '+20',
    flag: '🇪🇬',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^1/,
    ruleHint: '10 digits starting with 1',
    example: '1001234567',
  },
  {
    iso: 'IL',
    name: 'Israel',
    dialCode: '+972',
    flag: '🇮🇱',
    minDigits: 9,
    maxDigits: 9,
    startsWith: /^5/,
    ruleHint: '9 digits starting with 5',
    example: '501234567',
  },
  {
    iso: 'TR',
    name: 'Turkey',
    dialCode: '+90',
    flag: '🇹🇷',
    minDigits: 10,
    maxDigits: 10,
    startsWith: /^5/,
    ruleHint: '10 digits starting with 5',
    example: '5321234567',
  },
  {
    iso: 'BR',
    name: 'Brazil',
    dialCode: '+55',
    flag: '🇧🇷',
    minDigits: 11,
    maxDigits: 11,
    ruleHint: '11 digits (with area code)',
    example: '11987654321',
  },
  {
    iso: 'MX',
    name: 'Mexico',
    dialCode: '+52',
    flag: '🇲🇽',
    minDigits: 10,
    maxDigits: 10,
    ruleHint: '10 digits',
    example: '5512345678',
  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India (+91)

export function findCountryByIso(iso: string): CountryDialInfo {
  return COUNTRIES.find((c) => c.iso === iso) || DEFAULT_COUNTRY;
}

export function parseCountryPhoneValue(value: string): {
  country: CountryDialInfo;
  nationalDigits: string;
} {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { country: DEFAULT_COUNTRY, nationalDigits: '' };
  }

  // Match longest dial code first so +971 is checked before +91/+1, etc.
  const sortedByDialLength = [...COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const c of sortedByDialLength) {
    if (trimmed.startsWith(c.dialCode)) {
      const rest = trimmed.slice(c.dialCode.length).replace(/\D+/g, '');
      return { country: c, nationalDigits: rest };
    }
  }

  const digits = trimmed.replace(/\D+/g, '');
  return { country: DEFAULT_COUNTRY, nationalDigits: digits };
}

export interface PhoneValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  cleanedDigits: string;
  formattedE164: string;
  error: string | null;
}

export function validateCountryPhone(
  country: CountryDialInfo,
  rawDigits: string,
  required = true
): PhoneValidationResult {
  let digits = (rawDigits || '').replace(/\D+/g, '');
  const dialDigits = country.dialCode.replace(/\D+/g, '');

  // If user pasted full international number with country code into local input, strip dial prefix
  if (
    digits.length > country.maxDigits &&
    dialDigits &&
    digits.startsWith(dialDigits)
  ) {
    digits = digits.slice(dialDigits.length);
  }

  if (!digits) {
    return {
      isValid: !required,
      isEmpty: true,
      cleanedDigits: '',
      formattedE164: '',
      error: required
        ? `Please enter a valid ${country.name} (${country.dialCode}) mobile number.`
        : null,
    };
  }

  if (digits.length < country.minDigits || digits.length > country.maxDigits) {
    const expectedLen =
      country.minDigits === country.maxDigits
        ? `${country.minDigits}`
        : `${country.minDigits}–${country.maxDigits}`;
    return {
      isValid: false,
      isEmpty: false,
      cleanedDigits: digits,
      formattedE164: `${country.dialCode} ${digits}`,
      error: `${country.name} (${country.dialCode}) requires ${expectedLen} digits (${digits.length} entered).`,
    };
  }

  if (country.startsWith && !country.startsWith.test(digits)) {
    return {
      isValid: false,
      isEmpty: false,
      cleanedDigits: digits,
      formattedE164: `${country.dialCode} ${digits}`,
      error: `Invalid ${country.name} mobile format: must be ${country.ruleHint}.`,
    };
  }

  // Reject obvious fake repeated sequences like 0000000000 or 9999999999
  if (/^(\d)\1{6,}$/.test(digits)) {
    return {
      isValid: false,
      isEmpty: false,
      cleanedDigits: digits,
      formattedE164: `${country.dialCode} ${digits}`,
      error: 'Please enter a genuine mobile number (repeated digits not allowed).',
    };
  }

  const formatted = `${country.dialCode} ${digits}`;
  return {
    isValid: true,
    isEmpty: false,
    cleanedDigits: digits,
    formattedE164: formatted,
    error: null,
  };
}
