export interface NailService {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number; // Duration in minutes for scheduling
  category: string;
  image?: string;
  isActive: boolean;
  translations?: {
    de?: {
      name: string;
      description: string;
    };
    es?: {
      name: string;
      description: string;
    };
  };
}

export interface NailServiceFormData {
  name: string;
  description: string;
  price: number;
  durationMinutes: number; 
  category: string;
  image?: string;
  isActive: boolean;
  nameDE?: string;
  descriptionDE?: string;
  nameES?: string;
  descriptionES?: string;
}
