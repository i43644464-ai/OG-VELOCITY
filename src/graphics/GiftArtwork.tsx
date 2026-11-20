import React from 'react';
import { Gift } from 'lucide-react';
import type { GiftId, VirtualGift } from '../types';

interface GiftArtworkProps {
  giftId: GiftId;
  gift?: VirtualGift;
  size?: number;
  className?: string;
}

export const GiftArtwork: React.FC<GiftArtworkProps> = ({
  gift,
  size = 64,
  className = '',
}) => {
  if (gift?.customVideoUrl) {
    return (
      <video
        src={gift.customVideoUrl}
        autoPlay
        loop
        muted
        playsInline
        style={{ height: size, width: size }}
        className={`shrink-0 rounded-xl bg-black/40 object-cover select-none ${className}`}
      />
    );
  }
  if (gift?.customArtworkUrl) {
    return (
      <img
        src={gift.customArtworkUrl}
        alt={gift.name}
        style={{ height: size, width: size }}
        className={`shrink-0 rounded-xl bg-transparent object-contain select-none ${className}`}
        draggable={false}
      />
    );
  }
  return (
    <div
      style={{
        height: size,
        width: size,
        background: gift
          ? `linear-gradient(135deg, ${gift.primaryColor}33, ${gift.secondaryColor}33)`
          : 'rgba(6, 182, 212, 0.16)',
        borderColor: gift?.primaryColor || 'rgba(34, 211, 238, 0.45)',
      }}
      className={`flex shrink-0 items-center justify-center rounded-xl border select-none ${className}`}
    >
      <Gift
        style={{
          height: Math.round(size * 0.52),
          width: Math.round(size * 0.52),
          color: gift?.secondaryColor || '#22D3EE',
        }}
      />
    </div>
  );
};
