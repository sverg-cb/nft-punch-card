'use client';

import Link from 'next/link';
import { StampCard as StampCardType, isCardComplete } from '@/app/lib/stampCards';

interface StampCardProps {
  card: StampCardType;
  index: number;
}

export function StampCard({ card, index }: StampCardProps) {
  const complete = isCardComplete(card);
  
  return (
    <Link href={`/stamp/${card.id}`}>
      <div 
        className="stamp-card p-6 cursor-pointer stagger-item"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Card Header with Emoji and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl">{card.image}</div>
          {card.isRedeemed ? (
            <span className="badge-redeemed">✓ Redeemed</span>
          ) : complete ? (
            <span className="badge-complete">🎉 Ready!</span>
          ) : null}
        </div>
        
        {/* Card Info */}
        <h3 className="text-xl font-bold text-foreground mb-1">{card.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{card.merchantName}</p>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-secondary">Progress</span>
            <span className="font-bold text-primary">
              {card.currentStamps}/{card.totalStamps}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
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
        </div>
        
        {/* Stamp Preview */}
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: card.totalStamps }).map((_, i) => (
            <div 
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                i < card.currentStamps 
                  ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-sm' 
                  : 'bg-gray-200 border-2 border-dashed border-gray-300'
              }`}
            >
              {i < card.currentStamps ? '★' : ''}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

