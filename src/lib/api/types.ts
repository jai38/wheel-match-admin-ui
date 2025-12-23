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
  const items = (data.items || data.cars || data.alloys || data.makes || data.models || data.colors || []) as T[];
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
  defaultAlloySize?: number; // Inches
  alloySize?: number; // Pixels
  x_front?: number;
  y_front?: number;
  x_rear?: number;
  y_rear?: number;
  isActive?: boolean;
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

// Full Car Entity
export interface CarImage {
  id: number;
  image_url: string;
  carId: number;
}

export interface Car {
  id: number;
  modelId: number;
  colorId: number;
  images?: CarImage[];
  isActive?: boolean;
  isDefault?: boolean;
  color?: CarColor;
  x_front?: number;
  y_front?: number;
  x_rear?: number;
  y_rear?: number;
  wheelSize?: number;
  createdAt?: string;
  updatedAt?: string;
  // For creation/update
  makeId?: number;
  make?: CarMake;
  model?: CarModel;
}

export interface CarCreateRequest {
  modelId: number;
  colorId: number;
  x_front: number;
  y_front: number;
  x_rear: number;
  y_rear: number;
  wheelSize: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CarFilterParams extends PaginationParams {
  makeId?: number;
  modelId?: number;
  colorId?: number;
  isActive?: boolean;
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
  alloyName: string; // Auto-generated: "{specs} {design} {pcd} {finish}"
  designId: number;
  pcdId: number;
  finishId: number;
  sizeId: number;
  buy_url?: string;
  design?: AlloyDesign;
  pcd?: AlloyPCD;
  finish?: AlloyFinish;
  size?: AlloySize;
  images?: { id: number; image_url: string }[];
  carIds?: number[];
  modelIds?: number[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AlloyCreateRequest {
  name: string; // Auto-generated: "{specs} {design} {pcd} {finish}"
  designId: number;
  pcdId: number;
  finishId: number;
  sizeId: number;
  images?: string[];
  carIds?: number[];
  modelIds?: number[];
  isActive?: boolean;
  buy_url?: string;
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
