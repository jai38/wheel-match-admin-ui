export interface Car {
  id: string;
  company: string;
  model: string;
  colors: string[];
  images: number;
  enabled: boolean;
}

export interface Alloy {
  id: string;
  name: string;
  size: string;
  compatibleCars: number;
  enabled: boolean;
  pcd: string;
  offset: string;
}

export const mockCars: Car[] = [
  { id: "1", company: "BMW", model: "M3", colors: ["Black", "White", "Blue"], images: 8, enabled: true },
  { id: "2", company: "Mercedes", model: "C-Class", colors: ["Silver", "Black"], images: 6, enabled: true },
  { id: "3", company: "Audi", model: "A4", colors: ["Red", "White", "Gray"], images: 7, enabled: false },
  { id: "4", company: "Tesla", model: "Model 3", colors: ["White", "Black", "Blue"], images: 5, enabled: true },
  { id: "5", company: "Porsche", model: "911", colors: ["Yellow", "Red", "Silver"], images: 10, enabled: true },
];

export const mockAlloys: Alloy[] = [
  { id: "1", name: "Sport Alloy 18\"", size: "18\"", compatibleCars: 12, enabled: true, pcd: "5x120", offset: "+35" },
  { id: "2", name: "Chrome Deluxe 20\"", size: "20\"", compatibleCars: 8, enabled: true, pcd: "5x112", offset: "+40" },
  { id: "3", name: "Matte Black 19\"", size: "19\"", compatibleCars: 15, enabled: false, pcd: "5x114.3", offset: "+38" },
  { id: "4", name: "Silver Sport 17\"", size: "17\"", compatibleCars: 20, enabled: true, pcd: "5x100", offset: "+42" },
  { id: "5", name: "Gloss Black 21\"", size: "21\"", compatibleCars: 6, enabled: true, pcd: "5x130", offset: "+50" },
];
