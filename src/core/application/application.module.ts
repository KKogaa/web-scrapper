import { Module } from '@nestjs/common';
import { ScrapperClientPuppeteer } from 'src/adapters/outbound/scrapper.client.puppeteer';
import { ScrapperService } from './services/scrapper.service';

@Module({
  providers: [
    ScrapperService,
    {
      provide: 'ScrapperClient',
      useClass: ScrapperClientPuppeteer,
    },
  ],
  exports: [ScrapperService],
})
export class ApplicationModule {}
