export type OrderItem = {
  productUri: string;
  qty: number;
}

export class OrderDto {
  items: OrderItem[];

}