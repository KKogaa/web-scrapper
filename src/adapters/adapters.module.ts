import { Module } from '@nestjs/common';
import { ScrapperController } from './inbound/scrapper.controller';
import { ApplicationModule } from 'src/core/application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [ScrapperController],
})
export class AdaptersModule {}
