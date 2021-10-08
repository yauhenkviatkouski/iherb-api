import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { JSDOM, VirtualConsole } from 'jsdom';
import { firstValueFrom } from 'rxjs';
import { addByToUri } from 'src/utils/utils';

type ParsedDocument = {
  rawHtml: string;
  type: 'cart' | 'showcase';
};

export type IherbProductInfo = {
  link: string;
  name: string;
  brand?: string;
  regularPrice?: number;
  superPrice?: number;
  warning?: string;
};

@Injectable()
export class IherbService {
  constructor(private readonly httpService: HttpService) {}

  private async getHtmlPage(uri: string): Promise<ParsedDocument | null> {
    const fixedUri = addByToUri(uri);
    try {
      const { data, request }: AxiosResponse = await firstValueFrom(
        this.httpService.get(fixedUri),
      );
      const iherbUriType =
        (request.res.responseUrl.includes('iherb.com/cart/') && 'cart') ||
        (request.res.responseUrl.includes('iherb.com/pr/') && 'showcase') ||
        null;

      if (!iherbUriType) {
        return null;
      }
      return {
        type: iherbUriType,
        rawHtml: data,
      };
    } catch {
      return null;
    }
  }

  async getProductsInfo(uri: string): Promise<IherbProductInfo[] | null> {
    const page = await this.getHtmlPage(uri);
    if (!page) {
      return null;
    }
    if (page.type === 'cart') {
      const productsConcise = this.getProductsFromCart(page.rawHtml);
      return Promise.all(
        productsConcise.map(async (product) => {
          const productPage = await this.getHtmlPage(product.link);
          if (!productPage) {
            return {
              ...product,
              warning: 'remaining data is not available',
            };
          }
          if (productPage.type !== 'showcase') {
            return null;
          }
          return {
            ...this.getProductFromShowcase(productPage.rawHtml),
            link: product.link,
          };
        }),
      );
    } else {
      return [this.getProductFromShowcase(page.rawHtml)];
    }
  }

  getProductsFromCart(cartPageHtml: string) {
    const dom = new JSDOM(cartPageHtml, { virtualConsole: new VirtualConsole() });
    const document = dom.window.document;
    const productRows = Array.from(
      document.querySelectorAll('[data-qa-element="product-cell"]'),
    );
    return productRows.map((productRow) => {
      const linkElement = Array.from(productRow.querySelectorAll('a')).filter(
        (linkElement) =>
          linkElement.getAttribute('href')?.includes('iherb.com/pr/') &&
          linkElement.querySelector('div'),
      )[0];

      const qty = Array.from(productRow.childNodes).filter((node) => {
        return node.nodeName === 'DIV';
      })[3].firstChild.textContent;

      return {
        name: linkElement.firstChild.textContent,
        link: addByToUri(linkElement.getAttribute('href')),
        qty,
      };
    });
  }

  getProductFromShowcase(showcasePageHtml: string) {
    const dom = new JSDOM(showcasePageHtml, { virtualConsole: new VirtualConsole() });
    const document = dom.window.document;

    const brand = document.querySelector('#breadCrumbs').childNodes[3].textContent;
    const name = document.querySelector('#name').textContent.replace(`${brand}, `, '');

    const regularPriceString = document
      .querySelector('#price')
      .textContent.replace(/\sBr/, '');

    const superPriceString = document
      .querySelector('#super-special-price')
      ?.querySelector('b')
      ?.textContent.replace(/Br/, '');

    return {
      link: showcasePageHtml,
      name: name.charAt(0).toLocaleUpperCase() + name.slice(1),
      brand,
      regularPrice: Math.round(Number(regularPriceString) * 100),
      superPrice: Math.round(Number(superPriceString) * 100) || null,
    };
  }
}