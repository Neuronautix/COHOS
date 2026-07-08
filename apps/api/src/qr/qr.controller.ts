import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { qrScanRequestSchema, type QRScanRequestDto } from './dto.js';
import { QRService } from './qr.service.js';

@Controller('qr')
export class QRController {
  constructor(private readonly qrService: QRService) {}

  @Get('tokens')
  listTokens() {
    return this.qrService.listTokens();
  }

  @Get('tokens/:tokenId')
  getToken(@Param('tokenId') tokenId: string) {
    return this.qrService.getToken(tokenId);
  }

  @Post('scan')
  scanToken(
    @Body(new ZodValidationPipe(qrScanRequestSchema))
    scanRequest: QRScanRequestDto,
  ) {
    return this.qrService.scanToken(scanRequest);
  }
}
