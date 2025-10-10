export const realEstateInterests = [
  // Property Types
  'Apartments',
  'Houses',
  'Condos',
  'Townhouses',
  'Villas',
  'Penthouses',
  'Duplexes',
  'Studio Apartments',
  'Commercial Properties',
  'Office Spaces',
  'Retail Spaces',
  'Warehouses',
  'Land',
  'Plots',
  'Farms',
  'Ranch Properties',
  
  // Investment & Finance
  'Real Estate Investment',
  'Property Investment',
  'Rental Properties',
  'Buy to Let',
  'Property Flipping',
  'Real Estate Development',
  'Property Management',
  'Real Estate Finance',
  'Mortgage',
  'Home Loans',
  'Property Financing',
  'Real Estate ROI',
  'Property Appreciation',
  'Real Estate Portfolio',
  
  // Lifestyle & Location
  'Luxury Living',
  'Premium Properties',
  'Gated Communities',
  'Waterfront Properties',
  'Beach Properties',
  'Mountain Properties',
  'City Living',
  'Suburban Living',
  'Rural Properties',
  'Golf Course Properties',
  'Resort Properties',
  'Historic Properties',
  'Modern Properties',
  'Eco-Friendly Homes',
  'Smart Homes',
  
  // Demographics & Life Stages
  'First Time Buyers',
  'Young Professionals',
  'Families',
  'Retirees',
  'Expats',
  'Students',
  'Empty Nesters',
  'Growing Families',
  'Downsizing',
  'Upsizing',
  'Relocation',
  
  // Features & Amenities
  'Swimming Pool',
  'Garden',
  'Balcony',
  'Terrace',
  'Parking',
  'Security',
  'Gym',
  'Spa',
  'Concierge',
  'Pet Friendly',
  'Furnished',
  'Unfurnished',
  'Air Conditioning',
  'Heating',
  'Fireplace',
  'High Ceilings',
  'Open Plan',
  'Modern Kitchen',
  'Walk-in Closet',
  'Home Office',
  
  // Market Segments
  'Affordable Housing',
  'Mid-Market Properties',
  'High-End Properties',
  'Ultra-Luxury',
  'Budget Properties',
  'Premium Properties',
  'Investment Grade',
  'Distressed Properties',
  'New Construction',
  'Resale Properties',
  'Off-Plan Properties',
  
  // Business & Commercial
  'Real Estate Business',
  'Property Development',
  'Construction',
  'Architecture',
  'Interior Design',
  'Real Estate Marketing',
  'Property Sales',
  'Real Estate Consulting',
  'Property Valuation',
  'Real Estate Law',
  'Property Insurance',
  
  // Technology & Innovation
  'PropTech',
  'Real Estate Technology',
  'Virtual Tours',
  'Online Property Search',
  'Real Estate Apps',
  'Property Management Software',
  'Real Estate Analytics',
  'Property Data',
  'Real Estate AI',
  'Blockchain Real Estate',
  
  // Regional & Cultural
  'Nairobi Properties',
  'Mombasa Properties',
  'Coastal Properties',
  'Rift Valley Properties',
  'Western Kenya Properties',
  'Central Kenya Properties',
  'Eastern Kenya Properties',
  'Northern Kenya Properties',
  'Kenyan Real Estate',
  'East African Properties',
  'African Real Estate',
  
  // Market Trends
  'Property Market Trends',
  'Real Estate News',
  'Market Analysis',
  'Property Prices',
  'Market Research',
  'Real Estate Reports',
  'Property Statistics',
  'Market Forecasts',
  'Real Estate Insights',
  'Property Trends'
];

export const getFilteredInterests = (query: string, existingTags: string[] = []): string[] => {
  if (!query || query.length < 1) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return realEstateInterests
    .filter(interest => 
      interest.toLowerCase().includes(lowercaseQuery) &&
      !existingTags.includes(interest)
    )
    .sort((a, b) => {
      // Prioritize exact matches
      const aExactMatch = a.toLowerCase() === lowercaseQuery;
      const bExactMatch = b.toLowerCase() === lowercaseQuery;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Then prioritize starts with
      const aStartsWith = a.toLowerCase().startsWith(lowercaseQuery);
      const bStartsWith = b.toLowerCase().startsWith(lowercaseQuery);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Finally sort alphabetically
      return a.localeCompare(b);
    })
    .slice(0, 8); // Limit to 8 suggestions
};
