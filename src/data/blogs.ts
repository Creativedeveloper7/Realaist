export interface Blog {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: number;
}

export const blogs: Blog[] = [
  {
    id: 1,
    title: "Kenya's Real Estate Market: 2024 Investment Opportunities",
    excerpt: "Discover the top investment opportunities in Kenya's booming real estate market. From Nairobi's urban developments to coastal luxury properties, find out where smart money is flowing.",
    author: "REALAIST Team",
    date: "March 15, 2024",
    category: "Market",
    readTime: 5
  },
  {
    id: 2,
    title: "Off-Plan vs Completed Properties: Which Offers Better Returns?",
    excerpt: "Compare the pros and cons of investing in off-plan versus completed properties. Learn which strategy aligns with your investment goals and risk tolerance.",
    author: "Investment Analyst",
    date: "March 10, 2024",
    category: "Guide",
    readTime: 7
  },
  {
    id: 3,
    title: "Luxury Real Estate Trends in East Africa",
    excerpt: "Explore the latest trends in luxury real estate across East Africa. From sustainable design to smart home technology, see what's driving the market.",
    author: "Market Expert",
    date: "March 5, 2024",
    category: "Trends",
    readTime: 6
  }
];

