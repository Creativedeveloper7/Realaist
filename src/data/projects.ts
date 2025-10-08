export interface Project {
  id: string;
  name: string;
  price: string;
  location: string;
  summary: string;
  facts: string[];
  factLabels: string[];
  hero: string;
  gallery: string[];
}

export const offPlanProjects: Project[] = [
  {
    id: "project-escada",
    name: "Escada",
    price: "KSh 3.7M",
    location: "Gigiri / Westlands",
    summary:
      "Curated 1–2 bed residences minutes from the city's social and entertainment hub. Designed for dependable yields and elevated living.",
    facts: ["2", "2", "1,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  {
    id: "project-azure-bay",
    name: "Azure Bay Villas",
    price: "KSh 28M",
    location: "Diani Beach",
    summary:
      "Ocean-view villas with private terraces and access to a lifestyle concierge. Strong short-let demand profile.",
    facts: ["4", "3", "20,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
];

export const completedProjects: Project[] = [
  {
    id: "project-the-grove",
    name: "The Grove",
    price: "KSh 42M",
    location: "Karen – Gated Community",
    summary:
      "Townhouses wrapped in greenery with clubhouse amenities and strong family rental demand.",
    facts: ["4", "3", "25,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  {
    id: "project-skyline-heights",
    name: "Skyline Heights",
    price: "KSh 18M",
    location: "Westlands",
    summary:
      "Luxury apartments with panoramic city views and premium amenities. Perfect for urban professionals.",
    facts: ["3", "2", "1,800 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
];

