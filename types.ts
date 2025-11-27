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
  EDIT_POST = 'EDIT_POST',
  DETAIL = 'DETAIL',
  PROFILE = 'PROFILE',
  SALES = 'SALES',
  WATCHLIST = 'WATCHLIST',
  CHAT = 'CHAT',
  CHAT_DETAIL = 'CHAT_DETAIL'
}

export interface ChatRoom {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  participants: string[];
  participantNames: { [uid: string]: string }; // Map uid to name for display
  lastMessage: string;
  lastMessageTime: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}