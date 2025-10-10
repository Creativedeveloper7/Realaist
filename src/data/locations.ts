export interface Location {
  id: string;
  name: string;
  type: 'country' | 'region' | 'city';
  country?: string;
  region?: string;
  searchTerms: string[];
}

export const locations: Location[] = [
  // Countries
  { id: 'kenya', name: 'Kenya', type: 'country', searchTerms: ['kenya', 'ke'] },
  { id: 'uganda', name: 'Uganda', type: 'country', searchTerms: ['uganda', 'ug'] },
  { id: 'tanzania', name: 'Tanzania', type: 'country', searchTerms: ['tanzania', 'tz'] },
  { id: 'rwanda', name: 'Rwanda', type: 'country', searchTerms: ['rwanda', 'rw'] },
  { id: 'ethiopia', name: 'Ethiopia', type: 'country', searchTerms: ['ethiopia', 'et'] },
  { id: 'south-africa', name: 'South Africa', type: 'country', searchTerms: ['south africa', 'za', 'sa'] },
  { id: 'nigeria', name: 'Nigeria', type: 'country', searchTerms: ['nigeria', 'ng'] },
  { id: 'ghana', name: 'Ghana', type: 'country', searchTerms: ['ghana', 'gh'] },
  { id: 'egypt', name: 'Egypt', type: 'country', searchTerms: ['egypt', 'eg'] },
  { id: 'morocco', name: 'Morocco', type: 'country', searchTerms: ['morocco', 'ma'] },
  { id: 'united-states', name: 'United States', type: 'country', searchTerms: ['united states', 'usa', 'us', 'america'] },
  { id: 'united-kingdom', name: 'United Kingdom', type: 'country', searchTerms: ['united kingdom', 'uk', 'britain', 'england'] },
  { id: 'canada', name: 'Canada', type: 'country', searchTerms: ['canada', 'ca'] },
  { id: 'australia', name: 'Australia', type: 'country', searchTerms: ['australia', 'au'] },
  { id: 'germany', name: 'Germany', type: 'country', searchTerms: ['germany', 'de'] },
  { id: 'france', name: 'France', type: 'country', searchTerms: ['france', 'fr'] },
  { id: 'italy', name: 'Italy', type: 'country', searchTerms: ['italy', 'it'] },
  { id: 'spain', name: 'Spain', type: 'country', searchTerms: ['spain', 'es'] },
  { id: 'netherlands', name: 'Netherlands', type: 'country', searchTerms: ['netherlands', 'nl', 'holland'] },
  { id: 'switzerland', name: 'Switzerland', type: 'country', searchTerms: ['switzerland', 'ch'] },
  { id: 'singapore', name: 'Singapore', type: 'country', searchTerms: ['singapore', 'sg'] },
  { id: 'japan', name: 'Japan', type: 'country', searchTerms: ['japan', 'jp'] },
  { id: 'china', name: 'China', type: 'country', searchTerms: ['china', 'cn'] },
  { id: 'india', name: 'India', type: 'country', searchTerms: ['india', 'in'] },
  { id: 'uae', name: 'United Arab Emirates', type: 'country', searchTerms: ['uae', 'united arab emirates', 'ae'] },

  // Kenyan Regions/Counties
  { id: 'nairobi', name: 'Nairobi', type: 'region', country: 'Kenya', searchTerms: ['nairobi', 'nrb'] },
  { id: 'mombasa', name: 'Mombasa', type: 'region', country: 'Kenya', searchTerms: ['mombasa', 'mbs'] },
  { id: 'kisumu', name: 'Kisumu', type: 'region', country: 'Kenya', searchTerms: ['kisumu', 'ksm'] },
  { id: 'nakuru', name: 'Nakuru', type: 'region', country: 'Kenya', searchTerms: ['nakuru', 'nkr'] },
  { id: 'eldoret', name: 'Eldoret', type: 'region', country: 'Kenya', searchTerms: ['eldoret', 'eld'] },
  { id: 'thika', name: 'Thika', type: 'region', country: 'Kenya', searchTerms: ['thika', 'thk'] },
  { id: 'malindi', name: 'Malindi', type: 'region', country: 'Kenya', searchTerms: ['malindi', 'mld'] },
  { id: 'kitale', name: 'Kitale', type: 'region', country: 'Kenya', searchTerms: ['kitale', 'ktl'] },
  { id: 'garissa', name: 'Garissa', type: 'region', country: 'Kenya', searchTerms: ['garissa', 'grs'] },
  { id: 'kakamega', name: 'Kakamega', type: 'region', country: 'Kenya', searchTerms: ['kakamega', 'kkm'] },

  // Kenyan Cities/Areas
  { id: 'westlands', name: 'Westlands', type: 'city', country: 'Kenya', region: 'Nairobi', searchTerms: ['westlands', 'westlands nairobi'] },
  { id: 'kilimani', name: 'Kilimani', type: 'city', country: 'Kenya', region: 'Nairobi', searchTerms: ['kilimani', 'kilimani nairobi'] },
  { id: 'karen', name: 'Karen', type: 'city', country: 'Kenya', region: 'Nairobi', searchTerms: ['karen', 'karen nairobi'] },
  { id: 'runda', name: 'Runda', type: 'city', country: 'Kenya', region: 'Nairobi', searchTerms: ['runda', 'runda nairobi'] },
  { id: 'lavington', name: 'Lavington', type: 'city', country: 'Kenya', region: 'Nairobi', searchTerms: ['lavington', 'lavington nairobi'] },
  { id: 'kileleshwa', name: 'Kileleshwa', type: 'city', country: 'Kenya', region: 'Nairobi', searchTerms: ['kileleshwa', 'kileleshwa nairobi'] },
  { id: 'nyali', name: 'Nyali', type: 'city', country: 'Kenya', region: 'Mombasa', searchTerms: ['nyali', 'nyali mombasa'] },
  { id: 'diani', name: 'Diani', type: 'city', country: 'Kenya', region: 'Mombasa', searchTerms: ['diani', 'diani mombasa'] },
  { id: 'bamburi', name: 'Bamburi', type: 'city', country: 'Kenya', region: 'Mombasa', searchTerms: ['bamburi', 'bamburi mombasa'] },

  // Other African Cities
  { id: 'kampala', name: 'Kampala', type: 'city', country: 'Uganda', searchTerms: ['kampala', 'kampala uganda'] },
  { id: 'dar-es-salaam', name: 'Dar es Salaam', type: 'city', country: 'Tanzania', searchTerms: ['dar es salaam', 'dar', 'tanzania'] },
  { id: 'kigali', name: 'Kigali', type: 'city', country: 'Rwanda', searchTerms: ['kigali', 'kigali rwanda'] },
  { id: 'addis-ababa', name: 'Addis Ababa', type: 'city', country: 'Ethiopia', searchTerms: ['addis ababa', 'ethiopia'] },
  { id: 'cape-town', name: 'Cape Town', type: 'city', country: 'South Africa', searchTerms: ['cape town', 'south africa'] },
  { id: 'johannesburg', name: 'Johannesburg', type: 'city', country: 'South Africa', searchTerms: ['johannesburg', 'joburg', 'south africa'] },
  { id: 'lagos', name: 'Lagos', type: 'city', country: 'Nigeria', searchTerms: ['lagos', 'lagos nigeria'] },
  { id: 'accra', name: 'Accra', type: 'city', country: 'Ghana', searchTerms: ['accra', 'accra ghana'] },
  { id: 'cairo', name: 'Cairo', type: 'city', country: 'Egypt', searchTerms: ['cairo', 'cairo egypt'] },
  { id: 'casablanca', name: 'Casablanca', type: 'city', country: 'Morocco', searchTerms: ['casablanca', 'morocco'] },

  // Major International Cities
  { id: 'new-york', name: 'New York', type: 'city', country: 'United States', searchTerms: ['new york', 'nyc', 'manhattan', 'usa'] },
  { id: 'los-angeles', name: 'Los Angeles', type: 'city', country: 'United States', searchTerms: ['los angeles', 'la', 'usa'] },
  { id: 'london', name: 'London', type: 'city', country: 'United Kingdom', searchTerms: ['london', 'uk', 'england'] },
  { id: 'toronto', name: 'Toronto', type: 'city', country: 'Canada', searchTerms: ['toronto', 'canada'] },
  { id: 'sydney', name: 'Sydney', type: 'city', country: 'Australia', searchTerms: ['sydney', 'australia'] },
  { id: 'berlin', name: 'Berlin', type: 'city', country: 'Germany', searchTerms: ['berlin', 'germany'] },
  { id: 'paris', name: 'Paris', type: 'city', country: 'France', searchTerms: ['paris', 'france'] },
  { id: 'rome', name: 'Rome', type: 'city', country: 'Italy', searchTerms: ['rome', 'italy'] },
  { id: 'madrid', name: 'Madrid', type: 'city', country: 'Spain', searchTerms: ['madrid', 'spain'] },
  { id: 'amsterdam', name: 'Amsterdam', type: 'city', country: 'Netherlands', searchTerms: ['amsterdam', 'netherlands'] },
  { id: 'zurich', name: 'Zurich', type: 'city', country: 'Switzerland', searchTerms: ['zurich', 'switzerland'] },
  { id: 'singapore-city', name: 'Singapore', type: 'city', country: 'Singapore', searchTerms: ['singapore', 'sg'] },
  { id: 'tokyo', name: 'Tokyo', type: 'city', country: 'Japan', searchTerms: ['tokyo', 'japan'] },
  { id: 'beijing', name: 'Beijing', type: 'city', country: 'China', searchTerms: ['beijing', 'china'] },
  { id: 'mumbai', name: 'Mumbai', type: 'city', country: 'India', searchTerms: ['mumbai', 'india'] },
  { id: 'dubai', name: 'Dubai', type: 'city', country: 'United Arab Emirates', searchTerms: ['dubai', 'uae'] },
];

export const searchLocations = (query: string): Location[] => {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return locations
    .filter(location => 
      location.name.toLowerCase().includes(lowercaseQuery) ||
      location.searchTerms.some(term => term.toLowerCase().includes(lowercaseQuery))
    )
    .sort((a, b) => {
      // Prioritize exact matches
      const aExactMatch = a.name.toLowerCase() === lowercaseQuery;
      const bExactMatch = b.name.toLowerCase() === lowercaseQuery;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Then prioritize by type: city > region > country
      const typeOrder = { city: 0, region: 1, country: 2 };
      const typeDiff = typeOrder[a.type] - typeOrder[b.type];
      if (typeDiff !== 0) return typeDiff;
      
      // Finally sort alphabetically
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10); // Limit to 10 results
};

export const getLocationDisplayName = (location: Location): string => {
  if (location.type === 'city' && location.region && location.country) {
    return `${location.name}, ${location.region}, ${location.country}`;
  } else if (location.type === 'region' && location.country) {
    return `${location.name}, ${location.country}`;
  } else {
    return location.name;
  }
};
