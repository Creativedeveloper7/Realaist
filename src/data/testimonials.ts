export interface Testimonial {
  id: number;
  name: string;
  location: string;
  testimonial: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Investor 1",
    location: "Nairobi, KE",
    testimonial: "REALAIST helped me access a pre-launch opportunity with transparent numbers. Performance has matched the projections."
  },
  {
    id: 2,
    name: "Investor 2", 
    location: "Mombasa, KE",
    testimonial: "The team's expertise in luxury real estate is unmatched. They guided me through every step of the investment process."
  },
  {
    id: 3,
    name: "Investor 3",
    location: "Diani, KE", 
    testimonial: "Outstanding returns on my beachfront property investment. REALAIST's market insights are invaluable."
  }
];

