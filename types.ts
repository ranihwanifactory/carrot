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
  sellerId: string; // Added to track ownership
  isSold: boolean;
}

export enum ViewState {
  FEED = 'FEED',
  POST = 'POST',
  EDIT_POST = 'EDIT_POST', // New
  DETAIL = 'DETAIL',
  PROFILE = 'PROFILE',
  SALES = 'SALES', // New
  WATCHLIST = 'WATCHLIST', // New
  CHAT = 'CHAT', // New
  CHAT_DETAIL = 'CHAT_DETAIL' // New
}

export interface ChatRoom {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}