import axios from "axios";
import { Make, Model } from "./types";

const api = axios.create({
  baseURL: "/api/admin",
});

export interface User {
  name: string;
}

export const authService = {
  login: async () => {
    return { token: "fake-token" };
  },
  logout: async () => {
    return;
  },
  getProfile: async () => {
    return { name: "Admin" };
  },
};

export const alloysService = {
  getAlloys: async () => {
    return [];
  },
};

export const carsService = {
  getCars: async () => {
    return [];
  },
};

export const getMakes = async (): Promise<Make[]> => {
  const response = await api.get("/car/makes");
  return response.data;
};

export const getModelsByMake = async (makeId: string): Promise<Model[]> => {
  const response = await api.get(`/car/models?makeId=${makeId}`);
  return response.data;
};
