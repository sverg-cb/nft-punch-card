'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface WheelSegment {
  value: number;
  color: string;
}

interface WheelSpinnerProps {
  onSpinComplete: (value: number) => void;
}

const segments: WheelSegment[] = [
  { value: 10, color: '#ff6b9d' },
  { value: 25, color: '#7c3aed' },
  { value: 50, color: '#06b6d4' },
  { value: 100, color: '#fbbf24' },
  { value: 15, color: '#10b981' },
  { value: 75, color: '#f97316' },
  { value: 30, color: '#ec4899' },
  { value: 200, color: '#8b5cf6' },
];

const SEGMENT_ANGLE = 360 / segments.length;

export function WheelSpinner({ onSpinComplete }: WheelSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = useCallback(() => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);

    // Random number of full rotations (5-8) plus random segment
    const fullRotations = 5 + Math.floor(Math.random() * 4);
    const randomSegmentIndex = Math.floor(Math.random() * segments.length);
    const segmentOffset = randomSegmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    
    // Calculate total rotation (we need to land with pointer at top, so adjust)
    const totalRotation = fullRotations * 360 + (360 - segmentOffset);
    
    setRotation(totalRotation);

    // Call onSpinComplete after animation
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      onSpinComplete(segments[randomSegmentIndex].value);
    }, 4000);
  }, [isSpinning, hasSpun, onSpinComplete]);

  // Auto-spin on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      spin();
    }, 500);
    return () => clearTimeout(timer);
  }, [spin]);

  return (
    <div className="flex flex-col items-center">
      <div className="wheel-container mb-8">
        {/* Pointer */}
        <div className="wheel-pointer" />
        
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning 
              ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' 
              : 'none',
          }}
        >
          {/* Segments */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {segments.map((segment, index) => {
              const startAngle = index * SEGMENT_ANGLE;
              const endAngle = startAngle + SEGMENT_ANGLE;
              
              // Convert to radians
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              // Calculate arc points
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              // Large arc flag
              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
              
              // Path for segment
              const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              // Text position (middle of segment)
              const textAngle = startAngle + SEGMENT_ANGLE / 2;
              const textRad = (textAngle - 90) * (Math.PI / 180);
              const textX = 50 + 32 * Math.cos(textRad);
              const textY = 50 + 32 * Math.sin(textRad);
              
              return (
                <g key={index}>
                  <path 
                    d={path} 
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth="0.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize="8"
                    fontWeight="bold"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {segment.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Center circle */}
        <div className="wheel-center">
          🎰
        </div>
      </div>

      {/* Spin button (only show if hasn't spun yet) */}
      {!hasSpun && !isSpinning && (
        <button
          onClick={spin}
          className="btn-primary text-xl px-8 py-4"
        >
          🎲 Spin to Win!
        </button>
      )}

      {isSpinning && (
        <p className="text-xl font-bold text-secondary animate-pulse">
          Spinning...
        </p>
      )}
    </div>
  );
}

