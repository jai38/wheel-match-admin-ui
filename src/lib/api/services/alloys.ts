import axios from "axios";
import apiClient, { buildQueryString } from "../client";
import type {
  ApiResponse,
  PaginatedResponse,
  Alloy,
  AlloyDesign,
  AlloyPCD,
  AlloyFinish,
  AlloySize,
  AlloyCreateRequest,
  AlloyFilterParams,
  PaginationParams,
  Car,
} from "../types";
import { normalizeListResponse } from "../types";

/**
 * Alloys Service
 * Handles all alloy-related API operations
 */
export const alloysService = {
  // ========== Alloy Designs ==========
  /**
   * Get all alloy designs with pagination
   */
  async getDesigns(params?: PaginationParams): Promise<PaginatedResponse<AlloyDesign>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AlloyDesign>>>(
      `/admin/alloy/designs${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new alloy design
   */
  async createDesign(data: { name: string; description?: string }): Promise<AlloyDesign> {
    const response = await apiClient.post<ApiResponse<AlloyDesign>>(
      "/admin/alloy/designs",
      data
    );
    return response.data.data!;
  },

  /**
   * Update alloy design
   */
  async updateDesign(id: number, data: { name?: string; description?: string; isActive?: boolean }): Promise<AlloyDesign> {
    const response = await apiClient.put<ApiResponse<AlloyDesign>>(
      `/admin/alloy/designs/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete alloy design
   */
  async deleteDesign(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloy/designs/${id}`);
  },

  // ========== Alloy PCDs ==========
  /**
   * Get all PCDs with pagination
   */
  async getPCDs(params?: PaginationParams): Promise<PaginatedResponse<AlloyPCD>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AlloyPCD>>>(
      `/admin/alloy/pcds${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new PCD
   */
  async createPCD(data: { name: string }): Promise<AlloyPCD> {
    const response = await apiClient.post<ApiResponse<AlloyPCD>>(
      "/admin/alloy/pcds",
      data
    );
    return response.data.data!;
  },

  /**
   * Update PCD
   */
  async updatePCD(id: number, data: { name?: string; isActive?: boolean }): Promise<AlloyPCD> {
    const response = await apiClient.put<ApiResponse<AlloyPCD>>(
      `/admin/alloy/pcds/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete PCD
   */
  async deletePCD(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloy/pcds/${id}`);
  },

  // ========== Alloy Finishes ==========
  /**
   * Get all finishes with pagination
   */
  async getFinishes(params?: PaginationParams): Promise<PaginatedResponse<AlloyFinish>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AlloyFinish>>>(
      `/admin/alloy/finishes${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new finish
   */
  async createFinish(data: { name: string; description?: string }): Promise<AlloyFinish> {
    const response = await apiClient.post<ApiResponse<AlloyFinish>>(
      "/admin/alloy/finishes",
      data
    );
    return response.data.data!;
  },

  /**
   * Update finish
   */
  async updateFinish(id: number, data: { name?: string; description?: string; isActive?: boolean }): Promise<AlloyFinish> {
    const response = await apiClient.put<ApiResponse<AlloyFinish>>(
      `/admin/alloy/finishes/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete finish
   */
  async deleteFinish(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloy/finishes/${id}`);
  },

  // ========== Alloy Sizes ==========
  /**
   * Get all sizes with pagination
   */
  async getSizes(params?: PaginationParams): Promise<PaginatedResponse<AlloySize>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AlloySize>>>(
      `/admin/alloy/sizes${queryString}`
    );
    return response.data.data!;
  },

  /**
   * Create new size
   */
  async createSize(data: {
    diameter: number;
    width: number;
    offset: number;
    specs: string;
  }): Promise<AlloySize> {
    const response = await apiClient.post<ApiResponse<AlloySize>>(
      "/admin/alloy/sizes",
      data
    );
    return response.data.data!;
  },

  /**
   * Update size
   */
  async updateSize(id: number, data: {
    diameter?: number;
    width?: number;
    offset?: number;
    specs?: string;
    isActive?: boolean;
  }): Promise<AlloySize> {
    const response = await apiClient.put<ApiResponse<AlloySize>>(
      `/admin/alloy/sizes/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete size
   */
  async deleteSize(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloy/sizes/${id}`);
  },

  // ========== Full Alloy Entities ==========
  /**
   * Get all alloys with pagination and filters
   */
  async getAlloys(params?: AlloyFilterParams): Promise<PaginatedResponse<Alloy>> {
    const queryString = params ? buildQueryString(params) : "";
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/admin/alloys${queryString}`
    );
    return normalizeListResponse<Alloy>(response.data.data!);
  },

  /**
   * Get single alloy by ID
   */
  async getAlloy(id: number): Promise<Alloy> {
    const response = await apiClient.get<ApiResponse<Alloy>>(`/admin/alloys/${id}`);
    return response.data.data!;
  },

  /**
   * Create new alloy product
   */
  async createAlloy(data: AlloyCreateRequest): Promise<Alloy> {
    const response = await apiClient.post<ApiResponse<Alloy>>("/admin/alloys", data);
    return response.data.data!;
  },

  /**
   * Update alloy by ID
   */
  async updateAlloy(id: number, data: Partial<AlloyCreateRequest>): Promise<Alloy> {
    const response = await apiClient.put<ApiResponse<Alloy>>(
      `/admin/alloys/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete alloy by ID (if supported by backend)
   */
  async deleteAlloy(id: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloys/${id}`);
  },

  /**
   * Upload image for an alloy using Presigned URLs
   * Replaces existing image if any
   */
  async uploadAlloyImage(id: number, image: File): Promise<void> {
    // Step 1: Get Upload URL
    const uploadUrlResponse = await apiClient.post<
      ApiResponse<{ uploadUrl: string; key: string }>
    >("/admin/alloys/images/upload-url", {
      fileName: image.name,
      fileType: image.type,
      alloyId: id,
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
      `/admin/alloys/${id}/images/metadata`,
      { key }
    );
  },

  /**
   * Delete an alloy image
   */
  async deleteAlloyImage(alloyId: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloys/${alloyId}/images`);
  },

  // ========== Alloy - Car Mappings ==========

  /**
   * Get all cars mapped to a specific alloy
   */
  async getAlloyCars(alloyId: number): Promise<Car[]> {
    const response = await apiClient.get<ApiResponse<{ cars: Car[] }>>(`/admin/alloys/${alloyId}/cars`);
    return response.data.data!.cars;
  },

  /**
   * Add a car to an alloy
   */
  async addCarsToAlloy(alloyId: number, carIds: number[]): Promise<void> {
    await apiClient.post<ApiResponse>(`/admin/alloys/${alloyId}/cars`, { carIds });
  },

  /**
   * Remove a car from an alloy
   */
  async removeCarFromAlloy(alloyId: number, carId: number): Promise<void> {
    await apiClient.delete<ApiResponse>(`/admin/alloys/${alloyId}/cars/${carId}`);
  },
};

