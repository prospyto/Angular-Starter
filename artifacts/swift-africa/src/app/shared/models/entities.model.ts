export type UUID = string;
export type OrderStatus = 'pending' | 'accepted' | 'pickup' | 'delivered' | 'cancelled';
export type MaterialType = 'wood' | 'leather' | 'fabric';
export type UserRole = 'buyer' | 'seller' | 'driver';

export interface User {
  id: UUID;
  name: string;
  phone: string;
  status: string;
  trust_score: number;
  role: UserRole;
}

export interface Buyer extends User {
  address: string;
  landmarks: string;
  voice_note?: string;
}

export interface Seller extends User {
  store_name: string;
  store_description: string;
  wallet_balance: number;
}

export interface Driver extends User {
  location: { lat: number; lng: number };
  earnings_wallet: number;
  is_available: boolean;
}

export interface Product {
  id: UUID;
  name: string;
  price: number;
  material: MaterialType;
  image_url: string;
  seller_id: UUID;
}

export interface Order {
  id: UUID;
  buyer_id: UUID;
  product_id: UUID;
  driver_id?: UUID;
  status: OrderStatus;
  created_at: string;
}
