
export interface ProductIn {
  _id: string;
  name: string;
  description: string,
  category: string,
  price: number;
  quantity: number;
  orderItems: { sku: string; size: string; quantity: number; _id: string }[];
  files: string[];
}

export interface OrderItemIn {
    size: string;
    quantity: number;
    sku: string;
}