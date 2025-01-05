import { Product } from '../models/product.model';

export interface ScrapperClient {
  scrap(searchTerm: string): Promise<Product[]>;
  specificScrap(): Promise<void>;
}
