import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { GiftArtwork } from '../graphics/GiftArtwork';
import { ZayroCoinArt } from '../graphics/SpriteArtwork';
import type { VirtualGift } from '../types';

interface GiftVaultProps {
  coins: number;
  charm: number;
  gifts: VirtualGift[];
  defaultRecipient: string;
  onSendGift: (gift: VirtualGift, recipientName: string) => void;
  onAddCoins: (amount: number) => void;
}

export const GiftVault: React.FC<GiftVaultProps> = ({
  coins,
  charm,
  gifts,
  defaultRecipient,
  onSendGift,
  onAddCoins,
}) => {
  const [filter, setFilter] = useState<'All' | VirtualGift['rarity']>('All');

  const visibleGifts = filter === 'All' ? gifts : gifts.filter((g) => g.rarity === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0D1526]/90 p-6 backdrop-blur-md sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Gift Vault ({gifts.length} Gifts)
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sending any gift awards Charm (e.g., 50 Coins → 10 Charm, 100 Coins → 20 Charm) plus Random Coins!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-pink-400/25 bg-pink-500/10 px-3.5 py-2 font-mono-tabular text-sm font-semibold text-pink-300">
            <Heart className="h-4 w-4" />
            <span>{charm.toLocaleString()} Charm</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-2 font-mono-tabular text-sm font-semibold text-amber-300">
            <ZayroCoinArt size={16} />
            <span>{coins.toLocaleString()} Coins</span>
          </div>
          <button
            type="button"
            onClick={() => onAddCoins(500)}
            className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 whitespace-nowrap shrink-0"
          >
            Claim +500 Daily Coins
          </button>
        </div>
      </div>

      {/* Interactive Rarity Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Standard', 'Signature', 'Mythic'] as const).map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => setFilter(tier)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              filter === tier
                ? 'bg-amber-500 text-slate-950'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Gift Cards Grid (All 36 Gifts from the Gift Sheet) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {visibleGifts.map((gift) => {
          const canAfford = coins >= gift.cost;
          return (
            <div
              key={gift.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0D1526]/90 p-3.5 shadow-lg transition-colors hover:border-cyan-400/40"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{gift.rarity}</span>
                  <span className="font-mono-tabular font-bold text-amber-300">
                    {gift.cost.toLocaleString()}
                  </span>
                </div>

                <div className="my-3 flex justify-center">
                  <GiftArtwork giftId={gift.id} size={74} />
                </div>

                <h2 className="font-display truncate text-center text-base font-bold text-white">
                  {gift.name}
                </h2>
                <div className="mt-1.5 space-y-0.5 text-center font-mono-tabular text-[10px]">
                  <div className="text-pink-300">+{gift.charmValue.toLocaleString()} Charm</div>
                  <div className="text-emerald-300">
                    +{gift.randomCoinsMin.toLocaleString()}–{gift.randomCoinsMax.toLocaleString()} Coins
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canAfford}
                onClick={() => onSendGift(gift, defaultRecipient)}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[11px] font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-3 w-3" />
                Send
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
