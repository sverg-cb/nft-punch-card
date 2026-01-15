'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StampCard } from '@/app/components/StampCard';
import { QRCodeModal } from '@/app/components/QRCodeModal';
import { mockStampCards } from '@/app/lib/stampCards';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function Home() {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { context, isMiniAppReady, setMiniAppReady } = useMiniKit();

  useEffect(() => {
    // Signal to the Base mini app host that our app is ready
    if (!!context && !isMiniAppReady) {
      setMiniAppReady();
    }
  }, [context, isMiniAppReady, setMiniAppReady]);

  return (
    <div className="min-h-screen bg-playful">
      {/* Header */}
      <header className="pt-8 pb-6 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-foreground mb-2">
            My Stamp Cards ✨
          </h1>
          <p className="text-gray-500">
            Collect stamps and unlock rewards from your favorite places
          </p>
        </div>
      </header>

      {/* Stamp Cards Grid */}
      <main className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {mockStampCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No stamp cards yet
              </h2>
              <p className="text-gray-500 max-w-md">
                Tap the + button to scan a QR code and add your first stamp card!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockStampCards.map((card, index) => (
                <StampCard key={card.id} card={card} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsQRModalOpen(true)}
        className="fab fixed bottom-8 right-8 w-16 h-16 flex items-center justify-center text-white text-3xl font-bold z-40"
        aria-label="Add new stamp"
      >
        +
      </button>

      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
      />

      {/* Merchant Dashboard Link */}
      <Link href="/merchants">
        <button className="fixed bottom-8 left-8 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:scale-105 transition-all">
          <span>🏪</span>
          <span className="font-semibold">Merchant</span>
        </button>
      </Link>
    </div>
  );
}
