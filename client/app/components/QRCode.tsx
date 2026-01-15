'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value?: string;
  size?: number;
  title?: string;
}

export function QRCode({ value = 'placeholder', size = 200, title }: QRCodeProps) {
  return (
    <div className="qr-container flex flex-col items-center gap-4 bounce-in">
      {title && (
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      )}
      <div className="p-4 bg-white rounded-2xl shadow-inner">
        <QRCodeSVG 
          value={value} 
          size={size}
          level="H"
          includeMargin
          bgColor="#ffffff"
          fgColor="#2d1b4e"
        />
      </div>
      <p className="text-sm text-gray-500 text-center max-w-[200px]">
        Scan this QR code at the merchant to earn a stamp
      </p>
    </div>
  );
}

