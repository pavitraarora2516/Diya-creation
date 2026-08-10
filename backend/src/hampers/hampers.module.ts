import { Module } from '@nestjs/common';
import { HampersService } from './hampers.service';
import { HampersController } from './hampers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [HampersService],
  controllers: [HampersController],
  exports: [HampersService],
})
export class HampersModule {}
