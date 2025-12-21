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
   * Upload images for an alloy using Presigned URLs
   */
  async uploadAlloyImages(id: number, images: File[]): Promise<void> {
    // Process each image sequentially (or parallel if desired, but sequential is safer for ordering/errors)
    for (const image of images) {
      // Step 1: Get Upload URL
      const uploadUrlResponse = await apiClient.post<
        ApiResponse<{ uploadUrl: string; key: string }>
      >("/admin/alloys/images/upload-url", {
        fileName: image.name,
        fileType: image.type,
      });

      const { uploadUrl, key } = uploadUrlResponse.data.data!;

      // Step 2: Upload to S3 directly (using raw axios to skip API interceptors)
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
    }
  },

  // ========== Alloy - Car Mappings ==========

