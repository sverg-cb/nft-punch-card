'use client';

import Image from 'next/image';
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
        className="stamp-card p-5 cursor-pointer stagger-item"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Card Image - Primary Element */}
        <div className="relative mb-4">
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-md">
            <Image
              src={card.image}
              alt={card.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Status Badge */}
          {card.isRedeemed ? (
            <span className="badge-redeemed absolute top-3 right-3">✓ Redeemed</span>
          ) : complete ? (
            <span className="badge-complete absolute top-3 right-3">🎉 Ready!</span>
          ) : null}
        </div>
        
        {/* Card Info */}
        <h3 className="text-lg font-bold text-foreground mb-3">{card.name}</h3>
        
        {/* Stamp Preview */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: card.totalStamps }).map((_, i) => (
              <div 
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                  i < card.currentStamps 
                    ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-sm' 
                    : 'bg-gray-200 border-2 border-dashed border-gray-300'
                }`}
              >
                {i < card.currentStamps ? '★' : ''}
              </div>
            ))}
          </div>
          <span className="text-sm font-bold text-primary">
            {card.currentStamps}/{card.totalStamps}
          </span>
        </div>
      </div>
    </Link>
  );
}
