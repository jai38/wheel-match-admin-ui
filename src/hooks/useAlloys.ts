import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alloysService } from "@/lib/api";
import type {
  AlloyFilterParams,
  AlloyCreateRequest,
  PaginationParams,
} from "@/lib/api";
import { toast } from "sonner";

/**
 * React Query hooks for alloys management
 */

// ========== Alloy Master Data Hooks ==========

export const useAlloyDesigns = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["alloy-designs", params],
    queryFn: () => alloysService.getDesigns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAlloyPCDs = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["alloy-pcds", params],
    queryFn: () => alloysService.getPCDs(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAlloyFinishes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["alloy-finishes", params],
    queryFn: () => alloysService.getFinishes(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAlloySizes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ["alloy-sizes", params],
    queryFn: () => alloysService.getSizes(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ========== Full Alloy Entity Hooks ==========

export const useAlloys = (params?: AlloyFilterParams) => {
  return useQuery({
    queryKey: ["alloys", params],
    queryFn: () => alloysService.getAlloys(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAlloy = (id: number | undefined) => {
  return useQuery({
    queryKey: ["alloy", id],
    queryFn: () => alloysService.getAlloy(id!),
    enabled: !!id && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAlloy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AlloyCreateRequest) => alloysService.createAlloy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloys"] });
      toast.success("Alloy created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create alloy");
    },
  });
};

export const useUpdateAlloy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AlloyCreateRequest> }) =>
      alloysService.updateAlloy(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["alloys"] });
      queryClient.invalidateQueries({ queryKey: ["alloy", variables.id] });
      toast.success("Alloy updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to update alloy");
    },
  });
};

export const useDeleteAlloy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => alloysService.deleteAlloy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloys"] });
      toast.success("Alloy deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to delete alloy");
    },
  });
};

// ========== Create Master Data Hooks ==========

export const useCreateAlloyDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      alloysService.createDesign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloy-designs"] });
      toast.success("Alloy design created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create alloy design");
    },
  });
};

export const useCreateAlloyPCD = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { value: string }) => alloysService.createPCD(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloy-pcds"] });
      toast.success("PCD created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create PCD");
    },
  });
};

export const useCreateAlloyFinish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      alloysService.createFinish(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloy-finishes"] });
      toast.success("Alloy finish created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create alloy finish");
    },
  });
};

export const useCreateAlloySize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      diameter: number;
      width: number;
      offset: number;
      specs: string;
    }) => alloysService.createSize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloy-sizes"] });
      toast.success("Alloy size created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create alloy size");
    },
  });
};
