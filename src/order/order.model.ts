// ??? 
export type OrderItem = { product: string; qty: number };

export class OrderModel {
  items: OrderItem[];
  createdAt: Date;
}
