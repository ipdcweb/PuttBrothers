"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search } from "lucide-react"

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

const countries: Country[] = [
  { code: "AF", name: "Afghanistan", dialCode: "+93", flag: "🇦🇫" },
  { code: "AL", name: "Albania", dialCode: "+355", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", dialCode: "+213", flag: "🇩🇿" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "BY", name: "Belarus", dialCode: "+375", flag: "🇧🇾" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴" },
  { code: "BA", name: "Bosnia and Herzegovina", dialCode: "+387", flag: "🇧🇦" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "BG", name: "Bulgaria", dialCode: "+359", flag: "🇧🇬" },
  { code: "CM", name: "Cameroon", dialCode: "+237", flag: "🇨🇲" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷" },
  { code: "HR", name: "Croatia", dialCode: "+385", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺" },
  { code: "CY", name: "Cyprus", dialCode: "+357", flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", dialCode: "+420", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "DO", name: "Dominican Republic", dialCode: "+1", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
  { code: "EG", name: "Egypt", dialCode: "+20", flag: "🇪🇬" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻" },
  { code: "EE", name: "Estonia", dialCode: "+372", flag: "🇪🇪" },
  { code: "ET", name: "Ethiopia", dialCode: "+251", flag: "🇪🇹" },
  { code: "FI", name: "Finland", dialCode: "+358", flag: "🇫🇮" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "GR", name: "Greece", dialCode: "+30", flag: "🇬🇷" },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", dialCode: "+36", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", dialCode: "+354", flag: "🇮🇸" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "IR", name: "Iran", dialCode: "+98", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", dialCode: "+964", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "IL", name: "Israel", dialCode: "+972", flag: "🇮🇱" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", dialCode: "+962", flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7", flag: "🇰🇿" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "LA", name: "Laos", dialCode: "+856", flag: "🇱🇦" },
  { code: "LB", name: "Lebanon", dialCode: "+961", flag: "🇱🇧" },
  { code: "LT", name: "Lithuania", dialCode: "+370", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", dialCode: "+352", flag: "🇱🇺" },
  { code: "LV", name: "Latvia", dialCode: "+371", flag: "🇱🇻" },
  { code: "MK", name: "North Macedonia", dialCode: "+389", flag: "🇲🇰" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "MT", name: "Malta", dialCode: "+356", flag: "🇲🇹" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "MD", name: "Moldova", dialCode: "+373", flag: "🇲🇩" },
  { code: "MN", name: "Mongolia", dialCode: "+976", flag: "🇲🇳" },
  { code: "ME", name: "Montenegro", dialCode: "+382", flag: "🇲🇪" },
  { code: "MA", name: "Morocco", dialCode: "+212", flag: "🇲🇦" },
  { code: "MM", name: "Myanmar", dialCode: "+95", flag: "🇲🇲" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾" },
  { code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "RS", name: "Serbia", dialCode: "+381", flag: "🇷🇸" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "SK", name: "Slovakia", dialCode: "+421", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", dialCode: "+386", flag: "🇸🇮" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", dialCode: "+886", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "TN", name: "Tunisia", dialCode: "+216", flag: "🇹🇳" },
  { code: "TR", name: "Türkiye", dialCode: "+90", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", dialCode: "+380", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "YE", name: "Yemen", dialCode: "+967", flag: "🇾🇪" },
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", dialCode: "+263", flag: "🇿🇼" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  required?: boolean
}

export function PhoneInput({ value, onChange, onFocus, onBlur, required }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((country) => country.code === "US") ?? countries[0],
  )
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/[^\d]/g, "") // Only allow digits
    onChange(phoneNumber)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-stretch border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-[#41059a] focus-within:border-[#41059a] overflow-hidden h-12">
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors border-r border-gray-300 min-w-[80px] sm:min-w-[100px] flex-shrink-0"
        >
          <span className="text-xl sm:text-2xl">{selectedCountry.flag}</span>
          <span className="text-xs sm:text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
          <ChevronDown
            className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Phone Number Input */}
        <input
          type="tel"
          required={required}
          value={value}
          onChange={handlePhoneChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Phone number"
          className="flex-1 px-3 py-2 outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base min-w-0"
          maxLength={15}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 sm:p-3 border-b border-gray-200 bg-[#41059a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-10 pr-3 py-2 rounded-md text-sm
             bg-transparent border border-[#ffcc00]
             text-[#ffcc00] placeholder:text-[#ffcc00]/80 caret-[#ffcc00]
             focus:outline-none focus:ring-2 focus:ring-[#ffcc00] focus:border-[#ffcc00]"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-64 smooth-scroll">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#41059a] hover:text-white transition-colors text-left"
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">{country.flag}</span>
                  <span className="flex-1 text-xs sm:text-sm font-medium truncate">{country.name}</span>
                  <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">{country.dialCode}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
