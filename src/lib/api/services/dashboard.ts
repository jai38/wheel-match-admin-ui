import apiClient from "../client";

export interface DashboardStats {
  cars: {
    total: number;
    totalModels: number;
    active: number;
  };
  alloys: {
    total: number;
    active: number;
  };
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<{ success: boolean; data: DashboardStats }>("/admin/dashboard/stats");
    return data.data;
  },
};
