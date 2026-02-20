import React, { useRef, useEffect, useState } from 'react';

// Minimal type for Google Places Autocomplete when @types/google.maps is not installed
interface GooglePlacesAutocomplete {
  getPlace: () => { formatted_address?: string; address_components?: unknown[] };
  addListener: (event: string, fn: () => void) => unknown;
}
interface GoogleMapsPlaces {
  Autocomplete: new (input: HTMLInputElement, opts?: { types?: string[]; fields?: string[] }) => GooglePlacesAutocomplete;
}
interface GoogleMapsEvent {
  removeListener: (listener: unknown) => void;
}
declare global {
  interface Window {
    google?: {
      maps: {
        places: GoogleMapsPlaces;
        event?: GoogleMapsEvent;
      };
    };
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  isDarkMode?: boolean;
  id?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Start typing your address...',
  disabled = false,
  className = '',
  error = false,
  isDarkMode = false,
  id = 'address-autocomplete',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GooglePlacesAutocomplete | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!API_KEY || scriptLoaded || scriptError) return;

    if (typeof window !== 'undefined' && window.google?.maps?.places?.Autocomplete) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => setScriptError(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [scriptLoaded, scriptError]);

  useEffect(() => {
    if (!scriptLoaded || !inputRef.current || !window.google?.maps?.places?.Autocomplete) return;

    autocompleteRef.current = new window.google!.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'address_components'],
    });

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      const address = place?.formatted_address ?? '';
      if (address) {
        onChange(address);
        onPlaceSelect?.(address);
      }
    });

    return () => {
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }
      autocompleteRef.current = null;
    };
  }, [scriptLoaded, onChange, onPlaceSelect]);

  const inputClassName = `${className} ${
    error ? 'border-red-500' : ''
  } ${
    isDarkMode
      ? 'bg-white/5 border-white/15 text-white placeholder-white/40'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  }`;

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={inputClassName}
      autoComplete="off"
    />
  );
};
