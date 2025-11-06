import apiClient, { buildQueryString } from "../client";
import type {
  ApiResponse,
  PaginatedResponse,
  Car,
  CarMake,
  CarModel,
  CarColor,
  CarVariant,
  CarCreateRequest,
  CarFilterParams,
  PaginationParams,
  normalizeListResponse,
} from "../types";
import { normalizeListResponse } from "../types";

/**
 * Cars Service
 * Handles all car-related API operations
 */
export const carsService = {
  // ========== Car Makes ==========
  /**
   * Get all car makes with pagination
   */
  async getMakes(params?: PaginationParams): Promise<PaginatedResponse<CarMake>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CarMake>>>(
      `/admin/car/makes${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new car make
   */
  async createMake(data: { name: string; slug: string }): Promise<CarMake> {
    const response = await apiClient.post<ApiResponse<CarMake>>(
      "/admin/car/makes",
      data
    );
    return response.data.data!;
  },

  // ========== Car Models ==========
  /**
   * Get all car models with pagination
   */
  async getModels(params?: PaginationParams & { makeId?: number }): Promise<PaginatedResponse<CarModel>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CarModel>>>(
      `/admin/car/models${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new car model
   */
  async createModel(data: { name: string; makeId: number }): Promise<CarModel> {
    const response = await apiClient.post<ApiResponse<CarModel>>(
      "/admin/car/models",
      data
    );
    return response.data.data!;
  },

  // ========== Car Colors ==========
  /**
   * Get all car colors with pagination
   */
  async getColors(params?: PaginationParams): Promise<PaginatedResponse<CarColor>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CarColor>>>(
      `/admin/car/colors${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new car color
   */
  async createColor(data: { name: string; colorCode?: string }): Promise<CarColor> {
    const response = await apiClient.post<ApiResponse<CarColor>>(
      "/admin/car/colors",
      data
    );
    return response.data.data!;
  },

  // ========== Car Variants ==========
  /**
   * Get all car variants with pagination
   */
  async getVariants(params?: PaginationParams & { modelId?: number }): Promise<PaginatedResponse<CarVariant>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CarVariant>>>(
      `/admin/car/variants${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new car variant
   */
  async createVariant(data: { name: string; modelId: number }): Promise<CarVariant> {
    const response = await apiClient.post<ApiResponse<CarVariant>>(
      "/admin/car/variants",
      data
    );
    return response.data.data!;
  },

  // ========== Full Car Entities ==========
  /**
   * Get all cars with pagination and filters
   */
  async getCars(params?: CarFilterParams): Promise<PaginatedResponse<Car>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/admin/cars${queryString}`
    );
    return normalizeListResponse<Car>(response.data.data!);
  },

  /**
   * Get single car by ID
   */
  async getCar(id: number): Promise<Car> {
    const response = await apiClient.get<ApiResponse<Car>>(`/admin/cars/${id}`);
    return response.data.data!;
  },

  /**
   * Create new car
   */
  async createCar(data: CarCreateRequest): Promise<Car> {
    const response = await apiClient.post<ApiResponse<Car>>("/admin/cars", data);
    return response.data.data!;
  },

  /**
   * Update car by ID
   */
  async updateCar(id: number, data: Partial<CarCreateRequest>): Promise<Car> {
    const response = await apiClient.put<ApiResponse<Car>>(
      `/admin/cars/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete car by ID
   */
  async deleteCar(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/cars/${id}`);
  },
};
