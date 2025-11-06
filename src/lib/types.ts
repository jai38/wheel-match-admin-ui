export interface Make {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  make: Make;
  colors: string[];
  images: number;
  enabled: boolean;
}
