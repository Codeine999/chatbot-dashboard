export interface IProduct {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    orderItems: IOrderItem[];
    files: string[];
    createdAt?: string;
    updatedAt?: string;
}


export interface IOrderItem {
    size: string;
    quantity: number;
    sku: string;
}