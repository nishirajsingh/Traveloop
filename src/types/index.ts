export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: Date;
}

export interface Trip {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  coverImage?: string | null;
  isPublic: boolean;
  totalBudget: number;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  stops?: Stop[];
  user?: Pick<User, "id" | "name" | "email">;
  _count?: { stops: number };
}

export interface Stop {
  id: string;
  city: string;
  country: string;
  arrivalDate: Date | string;
  departureDate: Date | string;
  order: number;
  tripId: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  cost: number;
  duration?: string | null;
  category: string;
  imageUrl?: string | null;
  stopId: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  isPacked: boolean;
  tripId: string;
  createdAt: Date | string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  tripId: string;
}

export type ActivityCategory = "Hotel" | "Transport" | "Food" | "Activities";
export type PackingCategory = "Clothing" | "Electronics" | "Documents" | "Essentials";

export interface BudgetBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface CitySearchResult {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  regionCode?: string;
  population?: number;
  latitude?: number;
  longitude?: number;
}
