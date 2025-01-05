export class Product {
  constructor(
    public subTitle: string,
    public price: number,
    public priceCurrency: string,
    public discount: number,
    public originalPrice: number,
    public originalPriceCurrency: string,
  ) {}
}
