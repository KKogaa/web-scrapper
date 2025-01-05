import { Inject, Injectable } from '@nestjs/common';
import { Product } from 'src/core/domain/models/product.model';
import { ScrapperClient } from 'src/core/domain/ports/scrapper.client';

@Injectable()
export class ScrapperService {
  constructor(
    @Inject('ScrapperClient') private readonly scrapperClient: ScrapperClient,
  ) {}

  public async scrap(searchTerm: string): Promise<Product[]> {
    return this.scrapperClient.scrap(searchTerm);
  }
}
