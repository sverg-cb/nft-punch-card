'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStampCard } from '@/app/lib/stampCards';
import { WheelSpinner } from '@/app/components/WheelSpinner';

interface RewardsPageProps {
  params: { id: string };
}

// Confetti component
function Confetti() {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#ff6b9d', '#7c3aed', '#06b6d4', '#fbbf24', '#10b981', '#f97316'];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }));
    setConfetti(pieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}

export default function RewardsPage({ params }: RewardsPageProps) {
  const { id } = params;
  const card = getStampCard(id);
  const [result, setResult] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSpinComplete = (value: number) => {
    setResult(value);
    setShowConfetti(true);
    
    // Stop confetti after a few seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

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

  return (
    <div className="min-h-screen bg-playful flex flex-col">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            🎰 Spin to Win!
          </h1>
          <p className="text-gray-500">
            {card.name} • {card.merchantName}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {result === null ? (
          /* Wheel Spinner */
          <WheelSpinner onSpinComplete={handleSpinComplete} />
        ) : (
          /* Result Display */
          <div className="text-center bounce-in">
            <div className="mb-8">
              <div className="text-8xl mb-4">🎊</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                You Won!
              </h2>
              <div className="inline-block bg-gradient-to-r from-primary to-secondary text-white text-6xl font-extrabold px-8 py-4 rounded-2xl shadow-lg mb-4">
                {result}
              </div>
              <p className="text-xl text-gray-600">
                Bonus Points!
              </p>
            </div>

            <div className="stamp-card p-6 mb-8 max-w-sm">
              <h3 className="text-lg font-bold text-foreground mb-2">
                🎁 Your Reward
              </h3>
              <p className="text-gray-600 mb-4">{card.rewardDescription}</p>
              <p className="text-sm text-gray-400">
                Plus {result} bonus points added to your account!
              </p>
            </div>

            <Link href={`/stamp/${card.id}`} className="btn-secondary inline-block">
              ← Back to {card.name}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
