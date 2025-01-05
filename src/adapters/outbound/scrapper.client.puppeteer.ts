import puppeteer, { Browser, Page } from 'puppeteer';
import { Product } from 'src/core/domain/models/product.model';
import { ScrapperClient } from 'src/core/domain/ports/scrapper.client';

interface RawProductData {
  subTitle: string | null;
  price: string | null;
  originalPrice: string | null;
  discount: string | null;
}

export class ScrapperClientPuppeteer implements ScrapperClient {
  private readonly DEFAULT_VIEWPORT = { width: 1920, height: 1080 };
  private readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
  private readonly SELECTORS = {
    PRODUCTS_CONTAINER: '#testId-searchResults-products',
    PRODUCT_POD: 'div[pod-layout="4_GRID"]',
    SUBTITLE: '[id*="displaySubTitle"]',
    PRICES_CONTAINER: '[id*="testId-pod-prices"]',
    CURRENT_PRICE: '[class*="copy10 primary medium"]',
    ORIGINAL_PRICE: '[class*="copy3 primary medium"]',
    DISCOUNT: '[class*="copy5 primary"]',
  };
  private readonly URL =
    'https://www.falabella.com.pe/falabella-pe/search?Ntt=';

  private async instanceBrowser(): Promise<Browser> {
    return puppeteer.launch({
      headless: true,
      defaultViewport: this.DEFAULT_VIEWPORT,
    });
  }

  private async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.setUserAgent(this.USER_AGENT);
    return page;
  }

  private async extractProductData(page: Page): Promise<RawProductData[]> {
    return await page.evaluate(() => {
      const gridContainer = document.querySelector(
        '#testId-searchResults-products',
      );

      if (!gridContainer) {
        return [];
      }

      const productPods = document.querySelectorAll('div[pod-layout="4_GRID"]');

      return Array.from(productPods).map((productPod) => {
        const subTitle = productPod.querySelector(
          '[id*="displaySubTitle"]',
        )?.textContent;

        const prices = productPod.querySelector('[id*="testId-pod-prices"]');

        if (!prices) {
          return null;
        }

        const price = prices
          .querySelector('[class*="copy10 primary medium"]')
          ?.textContent.trim();

        const originalPrice = prices
          .querySelector('[class*="copy3 primary medium"]')
          ?.textContent.trim();

        const discount = prices
          .querySelector('[class*="copy5 primary"]')
          ?.textContent.trim();

        return {
          subTitle: subTitle,
          price: price,
          originalPrice: originalPrice,
          discount: discount,
        };
      });
    });
  }

  private createProduct(rawProduct: RawProductData): Product {
    if (!rawProduct) {
      return null;
    }

    const price = this.parsePriceString(rawProduct.price);
    const originalPrice = this.parsePriceString(rawProduct.originalPrice);

    return new Product(
      rawProduct.subTitle,
      price.price,
      price.currency,
      this.extractPercentage(rawProduct.discount),
      !originalPrice.price ? originalPrice.price : price.price,
      !originalPrice.currency ? originalPrice.currency : price.currency,
    );
  }

  public async scrap(searchTerm: string): Promise<Product[]> {
    try {
      const browser = await this.instanceBrowser();
      const page = await this.setupPage(browser);

      await page.goto(`${this.URL}${searchTerm}`);

      await page.waitForSelector(this.SELECTORS.PRODUCTS_CONTAINER);

      const rawProducts = await this.extractProductData(page);

      return rawProducts
        .map((rawProduct: RawProductData) => this.createProduct(rawProduct))
        .filter((product: Product) => product !== null);
    } catch (error) {
      console.error('Error scraping with Puppeteer', error);
      throw new Error('Error scraping with Puppeteer');
    }
  }

  public async specificScrap(): Promise<void> {
    return null;
  }

  private extractPercentage(text: string): number {
    return !text ? 0 : parseInt(text.match(/-?\d+/)[0]);
  }

  private parsePriceString(priceText: string): {
    currency: string;
    price: number;
  } {
    if (!priceText) {
      return {
        currency: null,
        price: 0,
      };
    }

    const currency = priceText.match(/[^\d\s,]+/)[0];
    const priceStr = priceText.replace(/[^\d,]/g, '');
    const price = parseInt(priceStr.replace(/,/g, ''));

    return {
      currency: currency,
      price: price,
    };
  }
}
