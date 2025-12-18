import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { carsService } from "@/lib/api";
import type {
  CarFilterParams,
  CarCreateRequest,
  PaginationParams,
} from "@/lib/api";
import { toast } from "sonner";

/**
 * React Query hooks for cars management
 */

// ========== Car Master Data Hooks ==========

export const useCarMakes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["car-makes", params],
    queryFn: () => carsService.getMakes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCarModels = (params?: PaginationParams & { makeId?: number }) => {
  return useQuery({
    queryKey: ["car-models", params],
    queryFn: () => carsService.getModels(params),
    enabled: !params?.makeId || params.makeId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCarColors = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["car-colors", params],
    queryFn: () => carsService.getColors(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCarVariants = (params?: PaginationParams & { modelId?: number }) => {
  return useQuery({
    queryKey: ["car-variants", params],
    queryFn: () => carsService.getVariants(params),
    enabled: !params?.modelId || params.modelId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// ========== Full Car Entity Hooks ==========

export const useCars = (params?: CarFilterParams) => {
  return useQuery({
    queryKey: ["cars", params],
    queryFn: () => carsService.getCars(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCar = (id: number | undefined) => {
  return useQuery({
    queryKey: ["car", id],
    queryFn: () => carsService.getCar(id!),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CarCreateRequest) => carsService.createCar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Car created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create car");
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CarCreateRequest> }) =>
      carsService.updateCar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car", variables.id] });
      toast.success("Car updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to update car");
    },
  });
};

export const useUploadCarImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, images }: { id: number; images: File[] }) =>
      carsService.uploadCarImages(id, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["car", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Car images uploaded successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to upload car images");
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carsService.deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast.success("Car deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to delete car");
    },
  });
};

// ========== Create Master Data Hooks ==========

export const useCreateCarMake = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug: string }) => carsService.createMake(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-makes"] });
      toast.success("Car make created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create car make");
    },
  });
};

export const useCreateCarModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; makeId: number }) =>
      carsService.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-models"] });
      toast.success("Car model created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create car model");
    },
  });
};

export const useCreateCarColor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; colorCode?: string }) =>
      carsService.createColor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-colors"] });
      toast.success("Car color created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create car color");
    },
  });
};

export const useCreateCarVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; modelId: number }) =>
      carsService.createVariant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-variants"] });
      toast.success("Car variant created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create car variant");
    },
  });
};
