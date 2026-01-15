'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { getStampCard, isCardComplete } from '@/app/lib/stampCards';
import { QRCode } from '@/app/components/QRCode';

interface StampPageProps {
  params: { id: string };
}

export default function StampPage({ params }: StampPageProps) {
  const { id } = params;
  const card = getStampCard(id);
  const { address, isConnected } = useAccount();

  if (!card) {
    return (
      <div className="min-h-screen bg-playful flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Card not found</h1>
        <p className="text-gray-500 mb-6">This stamp card doesn&apos;t exist.</p>
        <Link href="/" className="btn-secondary">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const complete = isCardComplete(card);

  return (
    <div className="min-h-screen bg-playful">
      {/* Back Button */}
      <div className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-secondary font-semibold hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cards
        </Link>
      </div>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-lg mx-auto">
          {/* Card Image Display */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 mb-8 text-center bounce-in">
            <div className="w-40 h-40 mx-auto mb-4 rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={card.image}
                alt={card.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">{card.name}</h1>
            <p className="text-lg text-gray-500">{card.merchantName}</p>
          </div>

          {/* Progress Section */}
          <div className="stamp-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {card.currentStamps}/{card.totalStamps}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${(card.currentStamps / card.totalStamps) * 100}%`,
                  background: card.isRedeemed 
                    ? 'linear-gradient(135deg, var(--success) 0%, #059669 100%)'
                    : complete 
                      ? 'linear-gradient(135deg, var(--accent) 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
                }}
              />
            </div>

            {/* Stamp Grid */}
            <div className="flex flex-wrap gap-3 justify-center">
              {Array.from({ length: card.totalStamps }).map((_, i) => (
                <div 
                  key={i}
                  className={`stamp ${i < card.currentStamps ? 'stamp-filled' : 'stamp-empty'} ${
                    i < card.currentStamps && !card.isRedeemed ? 'stamp-pulse' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {i < card.currentStamps ? '★' : (i + 1)}
                </div>
              ))}
            </div>
          </div>

          {/* Reward Info */}
          <div className="stamp-card p-6 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-2">🎁 Reward</h2>
            <p className="text-gray-600">{card.rewardDescription}</p>
          </div>

          {/* Conditional Bottom Section */}
          <div className="flex flex-col items-center">
            {card.isRedeemed ? (
              /* Redeemed State */
              <div className="text-center bounce-in">
                <div className="inline-flex items-center gap-2 bg-success/10 text-success px-6 py-4 rounded-2xl mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xl font-bold">Redeemed Rewards</span>
                </div>
                <p className="text-gray-500">
                  You&apos;ve already claimed your reward. Start collecting again!
                </p>
              </div>
            ) : complete ? (
              /* Complete - Ready to Redeem */
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Congratulations!
                </h3>
                <p className="text-gray-500 mb-6">
                  You&apos;ve collected all stamps. Spin the wheel for your reward!
                </p>
                <Link href={`/rewards/${card.id}`} className="btn-primary inline-block">
                  🎰 Redeem Reward
                </Link>
              </div>
            ) : (
              /* In Progress - Show QR Code */
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Earn Your Next Stamp
                </h3>
                {isConnected && address ? (
                  <>
                    <QRCode 
                      value={address}
                      title="Show at checkout" 
                      size={200}
                    />
                    <p className="text-xs text-gray-400 mt-4 max-w-xs">
                      The merchant will scan this QR code to process your purchase and add stamps to your card
                    </p>
                  </>
                ) : (
                  <div className="p-6 bg-gray-100 rounded-2xl">
                    <p className="text-gray-500">
                      Connect your wallet to generate a QR code
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
