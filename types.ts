export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export interface Buyer {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  gender: Gender;
}

export interface Product {
  id: string;
  name: string;
  rate: number;
}

export interface BillItem {
  productId: string;
  productName: string;
  rate: number;
  quantity: number;
  amount: number;
}

export interface Bill {
  id:string;
  billNumber: string;
  buyerId: string;
  buyerName: string;
  date: string;
  items: BillItem[];
  totalAmount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
