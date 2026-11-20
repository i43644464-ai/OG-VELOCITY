import React from 'react';
import { Coins, Mic, Plus } from 'lucide-react';
import { getCharmLevelInfo } from '../data/zayroData';
import { CharmBadgeArt, VipBadgeArt } from '../graphics/SpriteArtwork';
import type { NavSection } from '../types';

interface TopBarProps {
  coins: number;
  charm: number;
  vipLevel: number;
  hasCreatedRoom: boolean;
  onNavigate: (section: NavSection) => void;
  onOpenCreateRoom: () => void;
  onJumpToMyRoom: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  coins,
  charm,
  vipLevel,
  hasCreatedRoom,
  onNavigate,
  onOpenCreateRoom,
  onJumpToMyRoom,
}) => {
  const { current: charmInfo } = getCharmLevelInfo(charm);

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-500/15 bg-[#070B14]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:text-2xl"
          >
            OG VELOCITY
          </button>

          <button
            type="button"
            onClick={() => onNavigate('me')}
            className="hidden items-center gap-2 rounded-xl border border-cyan-500/20 bg-[#0D1526] px-2.5 py-1 transition-colors hover:border-cyan-400/50 sm:inline-flex"
            title="View VIP & Charm Badges"
          >
            <VipBadgeArt level={vipLevel} size={28} />
            <CharmBadgeArt level={charmInfo.level} size={26} />
            <span className="font-mono-tabular text-[11px] font-bold text-rose-300">
              {charm.toLocaleString()} Charm
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('me')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 font-mono-tabular text-xs font-bold text-amber-300 hover:bg-amber-500/20"
          >
            <Coins className="h-3.5 w-3.5" />
            <span>{coins.toLocaleString()}</span>
          </button>

          {hasCreatedRoom ? (
            <button
              type="button"
              onClick={onJumpToMyRoom}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors hover:from-cyan-400 hover:to-teal-300 whitespace-nowrap shrink-0"
            >
              <Mic className="h-3.5 w-3.5" />
              My Room
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateRoom}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors hover:from-cyan-400 hover:to-teal-300 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Room (500)
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
