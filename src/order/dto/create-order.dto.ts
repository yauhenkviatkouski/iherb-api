import { IsArray, IsDataURI, IsNumber, IsString } from "class-validator";

class OrderItem {
  @IsDataURI()
  productUri: string;

  @IsNumber()
  qty: number;
}

export class CreateOrderDto {
  @IsArray()
  items: OrderItem[];

  @IsString()
  customer: string;

}