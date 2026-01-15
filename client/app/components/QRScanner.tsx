'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'initializing' | 'scanning' | 'error'>('initializing');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // Html5QrcodeScannerState.SCANNING
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    // Extract address from QR code
    // Could be raw address or ethereum: URI
    let address = decodedText;
    
    // Handle ethereum: URI format
    if (decodedText.startsWith('ethereum:')) {
      address = decodedText.replace('ethereum:', '').split('@')[0].split('?')[0];
    }

    // Validate Ethereum address
    if (address.startsWith('0x') && address.length === 42) {
      await stopScanner();
      onScan(address);
    } else {
      setError('Invalid QR code. Please scan a valid Ethereum address.');
    }
  }, [stopScanner, onScan]);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      if (!isScanning || !mounted) return;

      try {
        // Wait for DOM element to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const container = document.getElementById(scannerContainerId);
        if (!container || !mounted) return;

        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (mounted) {
              handleScanSuccess(decodedText);
            }
          },
          () => {
            // QR code not detected - this is called frequently, no need to handle
          }
        );

        if (mounted) {
          setScanStatus('scanning');
        }
      } catch (err) {
        console.error('Scanner error:', err);
        if (mounted) {
          setScanStatus('error');
          setError('Camera access denied or not available. Please enter address manually.');
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isScanning, handleScanSuccess, stopScanner]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      const address = manualInput.trim();
      if (address.startsWith('0x') && address.length === 42) {
        await stopScanner();
        onScan(address);
      } else {
        setError('Please enter a valid Ethereum address (0x...)');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-110 transition-all z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-foreground mb-4 text-center">
          📸 Scan Customer QR Code
        </h3>

        {/* Camera View */}
        {isScanning && (
          <div className="relative mb-4">
            <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden relative">
              {/* QR Scanner Container */}
              <div 
                id={scannerContainerId} 
                className="w-full h-full"
                style={{ 
                  position: 'relative',
                }}
              />
              
              {/* Scanner overlay corners */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>

              {/* Status indicator */}
              {scanStatus === 'initializing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm">Starting camera...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Scanning status */}
            {scanStatus === 'scanning' && (
              <p className="mt-2 text-center text-sm text-gray-500">
                📱 Position QR code within the frame
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-sm text-gray-500">or enter manually</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Manual Input */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Customer Wallet Address
            </label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                setError(null);
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Confirm Address
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Scan the QR code displayed on customer&apos;s phone or enter their wallet address
        </p>
      </div>
    </div>
  );
}
