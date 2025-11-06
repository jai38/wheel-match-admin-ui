// API Response Types based on backend API_ROUTES.md

export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items?: T[];
  cars?: T[];
  alloys?: T[];
  pagination: PaginationMeta;
}

// Helper to normalize response structure
export const normalizeListResponse = <T,>(data: Record<string, unknown>): { items: T[]; pagination: PaginationMeta } => {
  const items = (data.items || data.cars || data.alloys || []) as T[];
  return { items, pagination: data.pagination as PaginationMeta };
};

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Car Master Data Types
export interface CarMake {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarModel {
  id: number;
  name: string;
  makeId: number;
  make?: CarMake;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarColor {
  id: number;
  name: string;
  colorCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarVariant {
  id: number;
  name: string;
  modelId: number;
  model?: CarModel;
  createdAt?: string;
  updatedAt?: string;
}

// Full Car Entity
export interface Car {
  id: number;
  variantId: number;
  colorId: number;
  carImage?: string; // Single image from backend
  isActive?: boolean;
  variant?: CarVariant & { model?: CarModel & { make?: CarMake } };
  color?: CarColor;
  wheelCoordinates?: WheelCoordinates;
  createdAt?: string;
  updatedAt?: string;
  // For creation/update
  makeId?: number;
  modelId?: number;
  make?: CarMake;
  model?: CarModel;
  carImages?: string[];
}

export interface WheelCoordinates {
  front?: { x: number; y: number; width: number; height: number };
  side?: { x: number; y: number; width: number; height: number };
  rear?: { x: number; y: number; width: number; height: number };
  threeFourth?: { x: number; y: number; width: number; height: number };
}

export interface CarCreateRequest {
  makeId: number;
  modelId: number;
  colorId: number;
  variantId: number;
  carImages?: string[];
  wheelCoordinates?: WheelCoordinates;
  isActive?: boolean;
}

export interface CarFilterParams extends PaginationParams {
  makeId?: number;
  modelId?: number;
  colorId?: number;
  variantId?: number;
}

// Alloy Master Data Types
export interface AlloyDesign {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlloyPCD {
  id: number;
  name: string; // e.g., "5x112"
  createdAt?: string;
  updatedAt?: string;
}

export interface AlloyFinish {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlloySize {
  id: number;
  diameter: number; // 10-30 inches
  width: number; // 5-20 inches
  offset: number; // -50 to 100
  specs: string; // Display format (e.g., "17x8 ET35")
  createdAt?: string;
  updatedAt?: string;
}

// Full Alloy Entity
export interface Alloy {
  id: number;
  name: string; // Auto-generated: "{specs} {design} {pcd} {finish}"
  designId: number;
  pcdId: number;
  finishId: number;
  sizeId: number;
  design?: AlloyDesign;
  pcd?: AlloyPCD;
  finish?: AlloyFinish;
  size?: AlloySize;
  alloyImages?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlloyCreateRequest {
  designId: number;
  pcdId: number;
  finishId: number;
  sizeId: number;
  alloyImages?: string[];
  isActive?: boolean;
}

export interface AlloyFilterParams extends PaginationParams {
  designId?: number;
  pcdId?: number;
  finishId?: number;
  sizeId?: number;
  diameter?: number;
  isActive?: boolean;
}

// Dashboard Stats (to be implemented in backend later)
export interface DashboardStats {
  totalCars: number;
  totalAlloys: number;
  activeListings: number;
  totalRevenue?: number;
}
