import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, Search, X } from 'lucide-react';
import {
  COUNTRIES,
  CountryDialInfo,
  DEFAULT_COUNTRY,
  parseCountryPhoneValue,
  validateCountryPhone,
} from '../data/countries';

interface CountryPhoneInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (formattedValue: string) => void;
  onCountryChange?: (country: CountryDialInfo) => void;
  helperText?: string;
  compact?: boolean;
  id?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  label,
  required = false,
  value,
  onChange,
  onCountryChange,
  helperText,
  compact = false,
  id,
}) => {
  const initialParsed = useMemo(() => parseCountryPhoneValue(value), [value]);
  const [selectedCountry, setSelectedCountry] = useState<CountryDialInfo>(
    initialParsed.country || DEFAULT_COUNTRY
  );
  const [localDigits, setLocalDigits] = useState<string>(initialParsed.nationalDigits);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [touched, setTouched] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync inward only when parent resets or loads a different formatted value externally
  useEffect(() => {
    const parsed = parseCountryPhoneValue(value);
    const currentFormatted = localDigits ? `${selectedCountry.dialCode} ${localDigits}` : '';
    if (value !== currentFormatted) {
      setSelectedCountry(parsed.country);
      setLocalDigits(parsed.nationalDigits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 30);
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [dropdownOpen]);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.dialCode.replace('+', '').startsWith(q.replace('+', ''))
    );
  }, [countryQuery]);

  const validation = useMemo(
    () => validateCountryPhone(selectedCountry, localDigits, required),
    [localDigits, required, selectedCountry]
  );

  const handleDigitsChange = (raw: string) => {
    setTouched(true);
    let cleaned = raw.replace(/\D+/g, '');
    const dialDigits = selectedCountry.dialCode.replace(/\D+/g, '');
    if (
      cleaned.length > selectedCountry.maxDigits &&
      dialDigits &&
      cleaned.startsWith(dialDigits)
    ) {
      cleaned = cleaned.slice(dialDigits.length);
    }
    if (cleaned.length > selectedCountry.maxDigits + 1) {
      cleaned = cleaned.slice(0, selectedCountry.maxDigits + 1);
    }
    setLocalDigits(cleaned);
    onChange(cleaned ? `${selectedCountry.dialCode} ${cleaned}` : '');
  };

  const handleSelectCountry = (country: CountryDialInfo) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
    setDropdownOpen(false);
    setCountryQuery('');
    const trimmedDigits = localDigits.slice(0, country.maxDigits);
    setLocalDigits(trimmedDigits);
    onChange(trimmedDigits ? `${country.dialCode} ${trimmedDigits}` : '');
  };

  const showError = touched && !validation.isValid && (!validation.isEmpty || required);
  const showSuccess = !validation.isEmpty && validation.isValid;
  const heightClass = compact ? 'h-[42px]' : 'h-[48px]';

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-[#414B47]"
      >
        {label}
      </label>

      <div
        className={`flex w-full items-stretch rounded-xl border bg-white transition-all focus-within:ring-2 ${
          showError
            ? 'border-[#BA1A1A] focus-within:border-[#BA1A1A] focus-within:ring-[#BA1A1A]/20'
            : showSuccess
            ? 'border-[#059669] focus-within:border-[#0B3529] focus-within:ring-[#059669]/20'
            : 'border-[#E2DDD2] focus-within:border-[#0B3529] focus-within:ring-[#C59B48]/25'
        }`}
      >
        {/* Searchable Country Trigger */}
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-expanded={dropdownOpen}
          aria-label={`Select country code (${selectedCountry.name} ${selectedCountry.dialCode})`}
          className={`flex ${heightClass} shrink-0 items-center gap-1.5 rounded-l-xl border-r border-[#E2DDD2] bg-[#F4F6F1] px-2.5 text-xs font-semibold text-[#141E1B] transition-colors hover:bg-[#ECF2ED] sm:px-3`}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {selectedCountry.flag}
          </span>
          <span className="font-mono font-bold text-[#0B3529] tabular-nums">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[#414B47] transition-transform ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Numeric Phone Input */}
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required={required}
            value={localDigits}
            onChange={(e) => handleDigitsChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={selectedCountry.example}
            className={`${heightClass} w-full min-w-0 rounded-r-xl bg-transparent pl-3 pr-9 font-mono text-sm text-[#141E1B] tabular-nums placeholder:text-[#414B47]/45 focus:outline-none`}
          />
          {showSuccess && (
            <CheckCircle2
              className="pointer-events-none absolute right-3 h-4 w-4 text-[#059669]"
              aria-label="Valid phone number"
            />
          )}
        </div>
      </div>

      {/* Live Validation / Country Format Status */}
      <div className="mt-1.5 min-h-[16px] text-[11px] leading-snug">
        {showError && validation.error ? (
          <p className="font-semibold text-[#BA1A1A]">{validation.error}</p>
        ) : showSuccess ? (
          <p className="font-semibold text-[#059669]">
            ✓ Valid {selectedCountry.name} mobile ({selectedCountry.dialCode} {localDigits})
          </p>
        ) : (
          <p className="text-[#414B47]">
            {helperText || `${selectedCountry.name}: ${selectedCountry.ruleHint}`}
          </p>
        )}
      </div>

      {/* Searchable Country Picker Dropdown */}
      {dropdownOpen && (
        <div
          role="listbox"
          aria-label="Select country"
          className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-[#C59B48]/55 bg-white shadow-2xl sm:w-[330px]"
        >
          <div className="border-b border-[#E5ECE6] bg-[#F4F6F1] p-2.5">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#85631E]" />
              <input
                ref={searchInputRef}
                type="text"
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder="Type country name or code (e.g. India, +971)"
                className="h-9 w-full rounded-xl border border-[#E2DDD2] bg-white pl-8 pr-8 text-xs text-[#141E1B] placeholder:text-[#414B47]/60 focus:border-[#0B3529] focus:outline-none"
              />
              {countryQuery && (
                <button
                  type="button"
                  onClick={() => setCountryQuery('')}
                  aria-label="Clear country search"
                  className="absolute right-2.5 text-[#414B47] hover:text-[#141E1B]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-[#F0F4F1]">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[#414B47]">
                No country matches “{countryQuery}”.
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.iso === selectedCountry.iso;
                return (
                  <button
                    key={country.iso}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCountry(country)}
                    className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#ECF2ED] font-semibold text-[#0B3529]'
                        : 'text-[#141E1B] hover:bg-[#F4F6F1]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0 text-base leading-none" aria-hidden="true">
                        {country.flag}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{country.name}</p>
                        <p className="text-[10px] text-[#414B47]">{country.ruleHint}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0B3529] tabular-nums">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#059669]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
