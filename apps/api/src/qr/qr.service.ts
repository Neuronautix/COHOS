import { Injectable, NotFoundException } from '@nestjs/common';

import type { QRScanRequest, QRTokenContract } from '@cohos/domain';
import { validateQrToken } from '@cohos/qr';

import { qrTokenFixtures } from './qr.fixtures.js';

@Injectable()
export class QRService {
  private readonly tokens = new Map<string, QRTokenContract>(
    qrTokenFixtures.map((token) => [token.id, token]),
  );

  listTokens(): QRTokenContract[] {
    return Array.from(this.tokens.values());
  }

  getToken(tokenId: string): QRTokenContract {
    const token = this.tokens.get(tokenId);

    if (token === undefined) {
      throw new NotFoundException(`QR token ${tokenId} was not found.`);
    }

    return token;
  }

  scanToken(scanRequest: QRScanRequest) {
    const token = this.getToken(scanRequest.tokenId);

    return validateQrToken({
      token,
      scannedAt: scanRequest.scannedAt,
    });
  }
}
