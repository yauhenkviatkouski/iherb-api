import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { JSDOM, VirtualConsole } from 'jsdom';
import { firstValueFrom, Observable } from 'rxjs';
import { ProductModel } from './product.model';

const parseOptions = {
  comment: false,
  blockTextElements: {
    script: true,
    noscript: true,
    style: true,
    pre: true,
  },
};

type ParsedDocument = {
  rawHtml: string;
  type: 'cart' | 'product';
};

@Injectable()
export class ProductService {
  constructor(
    // @Inject(ProductModel)
    // private readonly productModel: ProductModel,
    private readonly httpService: HttpService,
  ) {}

  private async getHtmlPage(uri: string): Promise<ParsedDocument | null> {
    const fixedUri = uri.replace(/.+iherb.com/g, 'https://by.iherb.com');
    const { data, request }: AxiosResponse = await firstValueFrom(
      this.httpService.get(fixedUri),
    );
    const iherbUriType =
      (request.res.responseUrl.includes('iherb.com/cart/') && 'cart') ||
      (request.res.responseUrl.includes('iherb.com/pr/') && 'product') ||
      null;

    if (!iherbUriType) {
      return null;
    }
    return {
      type: iherbUriType,
      rawHtml: data,
    };
  }

  async getProductInfo(uri: string) {
    const page = await this.getHtmlPage(uri);
    const dom = new JSDOM(page.rawHtml, { virtualConsole: new VirtualConsole() });
    const document = dom.window.document;
    const productRows = Array.from(
      document.querySelectorAll('[data-qa-element="product-cell"]'),
    );
    return productRows.map((productRow) => {
      const link = Array.from(productRow.querySelectorAll('a')).filter(
        (linkElement) =>
          linkElement.getAttribute('href').includes('iherb.com/pr/') &&
          linkElement.querySelector('div'),
      )[0];

      const qty = Array.from(productRow.childNodes).filter((node) => {
        console.log(node.nodeName);
        return node.nodeName === 'DIV';
      })[3].firstChild.textContent;

      return {
        name: link.firstChild.textContent,
        link: link.getAttribute('href'),
        qty,
      };
    });

    // const $ = cheerioModule.load(page.document);
    // console.log(
    //   '🚀 ~ file: product.service.ts ~ line 54 ~ ProductService ~ getProductInfo ~ $',
    //   Array.from(dom.window.document.querySelectorAll('[data-qa-element="product-cell"]')).map((productRow) => {
    //       const tagA = productRow
    //         .filter((tagA) => tagA.getAttribute('href').includes('iherb.com/pr/'))[0];
    //       const productName = tagA.getAttribute('aria-label');
    //       const productLink = tagA.getAttribute('href');
    //       return productRow.childNodes[3].childNodes[0].toString();
    //       // console.log('🚀', productRow.childNodes[3].childNodes[0]);
    //       // throw new Error();

    //       // name: productRow.childNodes[1].childNodes[2].childNodes[0].textContent;
    //     });
    // );
    // if (!page) {
    //   return false;
    // }

    // if (page.type === 'cart') {
    //   return page.document
    //     .querySelectorAll('[data-qa-element="product-cell"]')
    //     .map((productRow) => {
    //       const tagA = productRow
    //         .querySelectorAll('a')
    //         .filter((tagA) => tagA.getAttribute('href').includes('iherb.com/pr/'))[0];
    //       const productName = tagA.getAttribute('aria-label');
    //       const productLink = tagA.getAttribute('href');
    //       return productRow.childNodes[3].childNodes[0].toString();
    //       // console.log('🚀', productRow.childNodes[3].childNodes[0]);
    //       // throw new Error();

    //       // name: productRow.childNodes[1].childNodes[2].childNodes[0].textContent;
    //     });
    // }

    // return {
    //   name: document.querySelector('#name').textContent,
    //   brand: document.querySelector('#breadCrumbs').childNodes[3].textContent,
    //   price: document.querySelector('#price').textContent,
    // };
  }
}
