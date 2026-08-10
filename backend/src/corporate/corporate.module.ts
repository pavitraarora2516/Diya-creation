import { Module } from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { CorporateController } from './corporate.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CorporateService],
  controllers: [CorporateController],
  exports: [CorporateService],
})
export class CorporateModule {}
