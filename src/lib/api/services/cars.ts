import axios from "axios";
import apiClient, { buildQueryString } from "../client";
import type {
  ApiResponse,
  PaginatedResponse,
  Car,
  CarMake,
  CarModel,
  CarColor,
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
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/admin/car/makes${queryString}`
    );
    return normalizeListResponse<CarMake>(response.data.data!);
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

  /**
   * Update car make
   */
  async updateMake(id: number, data: { name?: string; logoUrl?: string; isActive?: boolean }): Promise<CarMake> {
    const response = await apiClient.put<ApiResponse<CarMake>>(
      `/admin/car/makes/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete car make
   */
  async deleteMake(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/car/makes/${id}`);
  },

  // ========== Car Models ==========
  /**
   * Get all car models with pagination
   */
  async getModels(params?: PaginationParams & { makeId?: number }): Promise<PaginatedResponse<CarModel>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/admin/car/models${queryString}`
    );
    return normalizeListResponse<CarModel>(response.data.data!);
  },

  /**
   * Create new car model
   */
  async createModel(data: { name: string; makeId: number; defaultAlloySize?: number }): Promise<CarModel> {
    const response = await apiClient.post<ApiResponse<CarModel>>(
      "/admin/car/models",
      data
    );
    return response.data.data!;
  },

  /**
   * Update car model
   */
  async updateModel(id: number, data: { name?: string; makeId?: number; defaultAlloySize?: number; isActive?: boolean }): Promise<CarModel> {
    const response = await apiClient.put<ApiResponse<CarModel>>(
      `/admin/car/models/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete car model
   */
  async deleteModel(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/car/models/${id}`);
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

  /**
   * Update car color
   */
  async updateColor(id: number, data: { name?: string; colorCode?: string; isActive?: boolean }): Promise<CarColor> {
    const response = await apiClient.put<ApiResponse<CarColor>>(
      `/admin/car/colors/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete car color
   */
  async deleteColor(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/car/colors/${id}`);
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
   * Upload car images using Presigned URLs
   */
  async uploadCarImages(id: number, images: File[]): Promise<void> {
    for (const image of images) {
      // Step 1: Get Upload URL
      const uploadUrlResponse = await apiClient.post<
        ApiResponse<{ uploadUrl: string; key: string }>
      >("/admin/cars/images/upload-url", {
        fileName: image.name,
        fileType: image.type,
      });

      const { uploadUrl, key } = uploadUrlResponse.data.data!;

      // Step 2: Upload to S3 directly
      await axios.put(uploadUrl, image, {
        headers: {
          "Content-Type": image.type,
        },
      });

      // Step 3: Save Record Metadata
      await apiClient.post<ApiResponse<unknown>>(
        `/admin/cars/${id}/images/metadata`,
        { key }
      );
    }
  },

  /**
   * Delete car by ID
   */
  async deleteCar(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/cars/${id}`);
  },
};
