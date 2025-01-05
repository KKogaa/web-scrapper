import { Controller, Get, Query } from '@nestjs/common';
import { ScrapperService } from 'src/core/application/services/scrapper.service';
import { Product } from 'src/core/domain/models/product.model';

export class SearchQueryDto {
  constructor(public searchTerm: string) {}
}

@Controller('scrapper')
export class ScrapperController {
  constructor(private scrapperService: ScrapperService) {}

  @Get()
  public async search(@Query() query: SearchQueryDto): Promise<Product[]> {
    return this.scrapperService.scrap(query.searchTerm);
  }
}
