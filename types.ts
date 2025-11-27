export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  location: string;
  createdAt: number;
  likes: number;
  sellerName: string;
  isSold: boolean;
}

export enum ViewState {
  FEED = 'FEED',
  POST = 'POST',
  DETAIL = 'DETAIL',
  PROFILE = 'PROFILE'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
