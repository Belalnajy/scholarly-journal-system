import { Module } from '@nestjs/common';
import { QRCodeService } from './qrcode.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [QRCodeService],
  exports: [QRCodeService],
})
export class QRCodeModule {}
