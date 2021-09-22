import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import parse from 'node-html-parser';
import { firstValueFrom, Observable } from 'rxjs';
import { ProductModel } from './product.model';

const parceOptions = {
  lowerCaseTagName: false,
  comment: false,
  blockTextElements: {
    script: true,
    noscript: true,
    style: true,
    pre: true,
  },
};

@Injectable()
export class ProductService {
  constructor(
    // @Inject(ProductModel)
    // private readonly productModel: ProductModel,
    private readonly httpService: HttpService,
  ) {}

  async getProductInfo(uri: string) {
    const { data: iherbRaw } = await firstValueFrom(this.httpService.get(uri));
    const document = parse(iherbRaw, parceOptions);
    return {
      name: document.querySelector('#name').textContent,
      brand: document.querySelector('#breadCrumbs').childNodes[3].textContent,
      price: document.querySelector('#price').textContent,
    };
  }
}
