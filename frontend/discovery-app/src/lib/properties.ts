export interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  lotSize: string;
  type: string;
  description: string;
  features: string[];
  thumbnail: string;
}

export const PROPERTIES: Property[] = [
  {
    id: 1,
    address: "428 Maple Grove Lane",
    city: "Portland",
    state: "OR",
    price: 685000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2140,
    yearBuilt: 1998,
    lotSize: "0.32 acres",
    type: "Single Family",
    description:
      "Charming craftsman with original hardwood floors, updated kitchen with quartz countertops, and a spacious backyard perfect for entertaining. Walking distance to local farmers market and cafes.",
    features: [
      "Hardwood floors",
      "Updated kitchen",
      "Fenced backyard",
      "Two-car garage",
      "Built-in bookshelves",
      "Fireplace",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  },
  {
    id: 2,
    address: "1847 Riverside Drive",
    city: "Asheville",
    state: "NC",
    price: 542000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2580,
    yearBuilt: 2005,
    lotSize: "0.48 acres",
    type: "Single Family",
    description:
      "Mountain view home with wrap-around porch, vaulted ceilings, and abundant natural light. Master suite on main level, finished basement with home office potential.",
    features: [
      "Mountain views",
      "Wrap-around porch",
      "Vaulted ceilings",
      "Main floor master",
      "Finished basement",
      "Natural stone accents",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  },
  {
    id: 3,
    address: "92 Willow Creek Court",
    city: "Santa Fe",
    state: "NM",
    price: 725000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1890,
    yearBuilt: 2012,
    lotSize: "0.25 acres",
    type: "Single Family",
    description:
      "Adobe-style home with southwestern charm, exposed beam ceilings, and a private courtyard. Custom tile work throughout, chef's kitchen with professional appliances.",
    features: [
      "Adobe architecture",
      "Courtyard",
      "Exposed beams",
      "Custom tile work",
      "Chef's kitchen",
      "Kiva fireplace",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  },
  {
    id: 4,
    address: "3156 Oak Haven Boulevard",
    city: "Austin",
    state: "TX",
    price: 598000,
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 2340,
    yearBuilt: 2018,
    lotSize: "0.18 acres",
    type: "Single Family",
    description:
      "Modern farmhouse with open floor plan, shiplap accent walls, and large windows. Updated smart home features, energy-efficient appliances, and covered patio.",
    features: [
      "Open floor plan",
      "Smart home tech",
      "Covered patio",
      "Energy efficient",
      "Walk-in closets",
      "Pantry",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: 5,
    address: "612 Heritage Lane",
    city: "Savannah",
    state: "GA",
    price: 475000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1680,
    yearBuilt: 1925,
    lotSize: "0.15 acres",
    type: "Single Family",
    description:
      "Historic bungalow lovingly restored with period details intact. Original crown molding, refinished pine floors, updated systems. Front porch with swing overlooks tree-lined street.",
    features: [
      "Historic charm",
      "Original details",
      "Front porch",
      "Updated systems",
      "Garden space",
      "Clawfoot tub",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  },
  {
    id: 6,
    address: "2901 Canyon Ridge Road",
    city: "Sedona",
    state: "AZ",
    price: 890000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2210,
    yearBuilt: 2015,
    lotSize: "0.55 acres",
    type: "Single Family",
    description:
      "Contemporary desert retreat with floor-to-ceiling windows framing red rock views. Sustainable design with solar panels, native landscaping, and rainwater collection.",
    features: [
      "Red rock views",
      "Solar panels",
      "Floor-to-ceiling windows",
      "Native landscaping",
      "Open concept",
      "Meditation garden",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80",
  },
  {
    id: 7,
    address: "758 Birch Street",
    city: "Burlington",
    state: "VT",
    price: 515000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    yearBuilt: 1988,
    lotSize: "0.28 acres",
    type: "Single Family",
    description:
      "Cozy New England colonial with wood-burning fireplace, eat-in kitchen, and mudroom. Mature trees, perennial gardens, and a quiet neighborhood perfect for families.",
    features: [
      "Wood-burning fireplace",
      "Eat-in kitchen",
      "Mudroom",
      "Mature landscaping",
      "Storage shed",
      "Quiet neighborhood",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800&q=80",
  },
  {
    id: 8,
    address: "1423 Magnolia Drive",
    city: "Charleston",
    state: "SC",
    price: 635000,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2450,
    yearBuilt: 2010,
    lotSize: "0.22 acres",
    type: "Single Family",
    description:
      "Lowcountry charmer with wide front porch, high ceilings, and classic architectural details. Chef's kitchen opens to family room, screened porch overlooks private yard.",
    features: [
      "Wide front porch",
      "High ceilings",
      "Screened porch",
      "Chef's kitchen",
      "Crown molding",
      "Plantation shutters",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
  },
  {
    id: 9,
    address: "334 Pine Crest Avenue",
    city: "Boulder",
    state: "CO",
    price: 825000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2090,
    yearBuilt: 2019,
    lotSize: "0.20 acres",
    type: "Single Family",
    description:
      "Mountain modern home with clean lines, natural materials, and passive solar design. Gourmet kitchen, main floor office, deck with Flatirons views.",
    features: [
      "Mountain views",
      "Passive solar",
      "Natural materials",
      "Main floor office",
      "Deck",
      "Radiant heat",
    ],
    thumbnail:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  },
];
