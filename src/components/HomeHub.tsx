import React, { useState } from 'react';
import {
  Bell,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Crown,
  Lock,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  AVATAR_ROSTER,
  SHOP_ITEMS,
  getCharmLevelInfo,
  getVipNameStyle,
} from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import {
  CharmBadgeArt,
  ChatFrameSpriteArt,
  RingSpriteArt,
  RoomLevelBadgeArt,
  SeatFrameSpriteArt,
  VipBadgeArt,
  ZayroCoinArt,
} from '../graphics/SpriteArtwork';
import type {
  AvatarConfig,
  DailyTaskItem,
  FriendRecord,
  PublicUserProfile,
  ShopCategory,
  ShopItem,
  VoiceRoom,
} from '../types';
import { GamesSection } from './GamesSection';
import { RankingSection } from './RankingSection';

interface HomeHubProps {
  userProfile: AvatarConfig;
  coins: number;
  charm: number;
  vipLevel: number;
  vipGrowth: number;
  vipLabel: string | null;
  userGiftsGivenCoins?: number;
  ownedItemIds?: string[];
  equippedItems: Partial<Record<ShopCategory, string>>;
  dailyTasks: DailyTaskItem[];
  friends: FriendRecord[];
  rooms: VoiceRoom[];
  dailyLoginClaimed?: boolean;
  onOpenMe: () => void;
  onOpenTopUp: () => void;
  onOpenShop: () => void;
  onBuyShopItem?: (item: ShopItem) => void;
  onEquipShopItem?: (item: ShopItem) => void;
  onJoinRoom: (roomId: string) => void;
  onSeeAllRooms: () => void;
  onClaimTask: (taskId: string) => void;
  onAddFriendByUid: (uid: string) => string;
  onInviteFriendToGame?: (friend: FriendRecord, gameTitle: string) => void;
  onEarnCoins: (amount: number, reason: string) => void;
  onInspectUser: (profile: PublicUserProfile) => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  userProfile,
  coins,
  charm,
  vipLevel,
  vipGrowth,
  vipLabel,
  userGiftsGivenCoins = 0,
  ownedItemIds = [],
  equippedItems,
  dailyTasks,
  friends,
  rooms,
  dailyLoginClaimed = false,
  onOpenMe,
  onOpenTopUp,
  onOpenShop,
  onBuyShopItem,
  onEquipShopItem,
  onJoinRoom,
  onSeeAllRooms,
  onClaimTask,
  onAddFriendByUid,
  onInviteFriendToGame,
  onEarnCoins,
  onInspectUser,
}) => {
  const [activeQuickPanel, setActiveQuickPanel] = useState<
    'ranking' | 'tasks' | 'friends' | 'shop' | null
  >(null);
  const [fullShopCat, setFullShopCat] = useState<
    'all' | 'ring' | 'frame' | 'bubble' | 'entry'
  >('all');
  const [shopNotice, setShopNotice] = useState('');
  const [friendSearchUid, setFriendSearchUid] = useState('');
  const [friendNotice, setFriendNotice] = useState('');

  const { current: charmInfo } = getCharmLevelInfo(charm);

  const handleFriendSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearchUid.trim()) return;
    const msg = onAddFriendByUid(friendSearchUid.trim());
    setFriendNotice(msg);
    setFriendSearchUid('');
  };

  const formattedCoins =
    coins >= 1_000_000
      ? `${(coins / 1_000_000).toFixed(2)}M`
      : coins >= 1_000
        ? `${(coins / 1_000).toFixed(1)}K`
        : coins.toLocaleString();

  const fullShopItems = (
    fullShopCat === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((i) => i.category === fullShopCat)
  )
    .slice()
    .sort((a, b) => (a.ringNumber ?? 999) - (b.ringNumber ?? 999));

  return (
    <div className="space-y-5">
      {/* Top Bar inside Home */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenMe}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
        >
          <AvatarArt avatar={userProfile} size={44} frameId={equippedItems.frame} />
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-display text-lg font-bold"
                style={getVipNameStyle(vipLevel)}
              >
                Hi, {userProfile.name}
              </span>
              <VipBadgeArt level={vipLevel} size={26} />
              {charm > 0 && <CharmBadgeArt level={charmInfo.level} size={24} />}
            </div>
            <div className="flex items-center gap-2 font-mono-tabular text-[11px] text-slate-400">
              <span style={vipLevel >= 12 ? getVipNameStyle(vipLevel) : undefined}>
                {vipLabel || `VIP ${vipLevel}`}
              </span>
              <span>·</span>
              <span className="text-rose-300">{charm.toLocaleString()} Charm</span>
              <span>·</span>
              <span>Growth {vipGrowth.toLocaleString()}</span>
            </div>
          </div>
        </button>

        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-[#0D1526] py-1.5 pr-1.5 pl-3">
          <ZayroCoinArt size={22} />
          <span className="font-mono-tabular text-sm font-extrabold text-amber-300">
            {formattedCoins}
          </span>
          <button
            type="button"
            onClick={onOpenTopUp}
            aria-label="Top Up Coins"
            title="Go to Coin Top-Up"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 transition-transform hover:scale-105 hover:bg-amber-300"
          >
            <Plus className="h-4 w-4 stroke-[2.75]" />
          </button>
        </div>
      </div>

      {/* Announcement Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-[#0D1526] px-4 py-3 text-xs text-slate-200">
        <Bell className="h-4 w-4 shrink-0 text-cyan-300" />
        <p className="leading-relaxed">
          <span className="font-bold text-white">Welcome to OG VELOCITY</span>
          <span className="mx-1.5 text-slate-500">·</span>
          {dailyLoginClaimed
            ? 'Daily Login Bonus (+100,000 Coins) credited! Spend 100 Coins = +1 VIP Growth.'
            : 'Live Voice Rooms, Carrom, 8-Ball Pool, Car Racing & Truth or Dare! Spend 100 Coins = +1 VIP Growth.'}
        </p>
      </div>

      {/* Voice Rooms Section (At the Very Top) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-white">Voice Rooms</h2>
          </div>
          <button
            type="button"
            onClick={onSeeAllRooms}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400 hover:text-cyan-300"
          >
            <span>See all</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => {
            const hostAv =
              AVATAR_ROSTER.find((a) => a.name === room.hostName) ?? AVATAR_ROSTER[0];
            return (
              <div
                key={room.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0D1526] p-3.5 transition-colors hover:border-cyan-400/45"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <AvatarArt avatar={hostAv} size={46} />
                    <div className="absolute -right-1 -bottom-1">
                      <RoomLevelBadgeArt level={room.level} size={20} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="truncate text-sm font-bold text-white">{room.title}</h3>
                      {room.isRoomLocked && (
                        <span title="Locked with 4-digit code" className="inline-flex shrink-0">
                          <Lock className="h-3 w-3 text-amber-300" />
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <Users className="h-3 w-3" />
                        {room.listenerCount}
                      </span>
                      <span>·</span>
                      <span className="font-mono-tabular">ID {room.uid}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onJoinRoom(room.id)}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:opacity-95"
                >
                  Join
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ranking, Daily Tasks, Friends, Shop (each opens ONLY on click in Full-Screen Mode) */}
      <section className="grid grid-cols-4 gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => setActiveQuickPanel('ranking')}
          className="flex flex-col items-center gap-2 text-center"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg transition-transform hover:scale-105">
            <Trophy className="h-7 w-7" />
            <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#070B14] bg-[#0D1526] text-[10px] font-bold text-amber-300">
              #1
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-200">Ranking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickPanel('tasks')}
          className="flex flex-col items-center gap-2 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg transition-transform hover:scale-105">
            <CheckSquare className="h-7 w-7" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickPanel('friends')}
          className="flex flex-col items-center gap-2 text-center"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 text-white shadow-lg transition-transform hover:scale-105">
            <Users className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 font-mono-tabular text-[10px] font-extrabold text-slate-950">
              {friends.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-200">Friends</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuickPanel('shop')}
          className="flex flex-col items-center gap-2 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg transition-transform hover:scale-105">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Shop</span>
        </button>
      </section>

      {/* FULL-SCREEN OVERLAY: RANKING */}
      {activeQuickPanel === 'ranking' && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#070B14] text-white">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cyan-400/20 bg-[#0A101D]/95 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveQuickPanel(null)}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-cyan-400/35 bg-[#0D1526] px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span className="font-display text-sm font-extrabold text-white">
                OG VELOCITY Ranking
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-[#0D1526] px-3 py-1 font-mono-tabular text-xs font-bold text-amber-300">
              <ZayroCoinArt size={14} />
              <span>{formattedCoins}</span>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-start p-4 sm:p-6">
            <RankingSection
              userProfile={userProfile}
              userVipLevel={vipLevel}
              userCharm={charm}
              userVipGrowth={vipGrowth}
              userGiftsGivenCoins={userGiftsGivenCoins}
              rooms={rooms}
              onClose={() => setActiveQuickPanel(null)}
              onInspectUser={onInspectUser}
              onJoinRoom={(roomId) => {
                setActiveQuickPanel(null);
                onJoinRoom(roomId);
              }}
              onGetGifts={() => {
                setActiveQuickPanel(null);
                if (rooms[0]) {
                  onJoinRoom(rooms[0].id);
                } else {
                  onOpenShop();
                }
              }}
            />
          </div>
        </div>
      )}

      {/* FULL-SCREEN OVERLAY: DAILY TASKS */}
      {activeQuickPanel === 'tasks' && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#070B14] text-white">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cyan-400/20 bg-[#0A101D]/95 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveQuickPanel(null)}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-cyan-400/35 bg-[#0D1526] px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              <span className="font-display text-sm font-extrabold text-white">Daily Tasks</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-[#0D1526] px-3 py-1 font-mono-tabular text-xs font-bold text-amber-300">
              <ZayroCoinArt size={14} />
              <span>{formattedCoins}</span>
            </div>
          </header>

          <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-4 sm:p-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-[#0D1526] p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Daily Missions</h2>
                  <p className="text-xs text-slate-400">
                    Complete voice room &amp; gifting tasks to claim bonus Coins
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-300">Claim Rewards</span>
              </div>
              <div className="mt-4 space-y-3">
                {dailyTasks.map((task) => {
                  const ready = task.progress >= task.target && !task.claimed;
                  return (
                    <div
                      key={task.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#132038] px-4 py-3.5"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{task.title}</div>
                        <div className="mt-0.5 font-mono-tabular text-xs text-amber-300">
                          +{task.rewardCoins.toLocaleString()} Coins · {task.progress}/{task.target}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => onClaimTask(task.id)}
                        className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-bold ${
                          task.claimed
                            ? 'bg-white/5 text-slate-400'
                            : ready
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {task.claimed ? 'Claimed' : ready ? 'Claim' : 'In Progress'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN OVERLAY: FRIENDS */}
      {activeQuickPanel === 'friends' && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#070B14] text-white">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cyan-400/20 bg-[#0A101D]/95 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveQuickPanel(null)}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-cyan-400/35 bg-[#0D1526] px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-cyan-300" />
              <span className="font-display text-sm font-extrabold text-white">
                Friends ({friends.length})
              </span>
            </div>
            <div className="w-16" />
          </header>

          <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4 sm:p-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-[#0D1526] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Your Friends</h2>
                  <p className="text-xs text-slate-400">
                    Tap any friend to open their Profile Page or add by UID
                  </p>
                </div>
                <form onSubmit={handleFriendSearch} className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={friendSearchUid}
                      onChange={(e) => setFriendSearchUid(e.target.value)}
                      placeholder="Enter User ID (ZAY-...)"
                      className="rounded-xl border border-white/15 bg-[#070B14] py-2 pr-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:opacity-95"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </form>
              </div>
              {friendNotice && <p className="mt-2.5 text-xs text-cyan-300">{friendNotice}</p>}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {friends.map((fr) => {
                  const matchedAv =
                    AVATAR_ROSTER.find((a) => a.id === fr.avatarId) ?? AVATAR_ROSTER[0];
                  return (
                    <button
                      key={fr.uid}
                      type="button"
                      onClick={() =>
                        onInspectUser({
                          avatar: matchedAv,
                          vipLevel: 6,
                          charm: 48_200,
                          cpPartner: matchedAv.cpPartner ?? null,
                          ringNumber: matchedAv.cpPartner?.ringNumber ?? 1,
                          roomId: rooms.find((r) => r.uid === fr.voiceRoomUid)?.id,
                          roomTitle: rooms.find((r) => r.uid === fr.voiceRoomUid)?.title,
                        })
                      }
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#132038] px-4 py-3 text-left transition-colors hover:border-cyan-400/45 hover:bg-[#192946]"
                    >
                      <div className="flex items-center gap-3">
                        <AvatarArt avatar={matchedAv} size={40} />
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <span>{fr.name}</span>
                            {fr.bondTag && <span className="text-xs text-rose-300">{fr.bondTag}</span>}
                          </div>
                          <div className="font-mono-tabular text-[11px] text-cyan-300 underline-offset-2 hover:underline">
                            {fr.uid}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">{fr.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN OVERLAY: SHOP */}
      {activeQuickPanel === 'shop' && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto text-white"
          style={{
            background:
              'radial-gradient(circle at 50% 10%, rgba(6,182,212,0.22) 0%, rgba(11,26,46,0.98) 45%, #060D1A 100%)',
          }}
        >
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cyan-400/25 bg-[#060D1A]/95 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveQuickPanel(null)}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-cyan-400/35 bg-[#0D1526] px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Crown className="h-4 w-4 text-amber-300" />
              <span className="font-display bg-gradient-to-b from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-lg font-black text-transparent">
                OG VELOCITY Shop
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-[#0D1526] px-3 py-1 font-mono-tabular text-xs font-bold text-amber-300">
                <ZayroCoinArt size={14} />
                <span>{formattedCoins}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveQuickPanel(null);
                  onOpenShop();
                }}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:opacity-95"
              >
                Me Shop
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4 sm:p-6">
            {shopNotice && (
              <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-200">
                {shopNotice}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: 'All Items' },
                  { id: 'ring', label: 'Rings' },
                  { id: 'frame', label: 'Frames' },
                  { id: 'bubble', label: 'Chat Bubbles' },
                  { id: 'entry', label: 'Entry Effects' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFullShopCat(cat.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    fullShopCat === cat.id
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.45)]'
                      : 'border border-cyan-400/25 bg-[#0D1526] text-slate-300 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {fullShopItems.map((item) => {
                const owned = ownedItemIds.includes(item.id);
                const equipped = equippedItems[item.category] === item.id;
                const canAfford = coins >= item.priceCoins;
                const isRingOnly = !!item.ringNumber;

                return (
                  <div
                    key={item.id}
                    className={
                      isRingOnly
                        ? 'flex flex-col items-center justify-between rounded-2xl border border-cyan-400/20 bg-[#0B1A2E]/55 p-3 text-center'
                        : 'flex flex-col items-center justify-between rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#0F2744] to-[#081224] p-3 text-center shadow-[0_0_18px_rgba(6,182,212,0.22)]'
                    }
                  >
                    <div className="line-clamp-1 w-full text-xs font-bold text-cyan-100">
                      {item.name}
                    </div>
                    <div className="my-2.5 flex h-16 items-center justify-center bg-transparent">
                      {item.ringNumber ? (
                        <RingSpriteArt ringNumber={item.ringNumber} size={64} alt={item.name} />
                      ) : item.seatFrameNumber ? (
                        <SeatFrameSpriteArt frameNumber={item.seatFrameNumber} size={62} alt={item.name} />
                      ) : item.chatFrameNumber ? (
                        <ChatFrameSpriteArt
                          frameNumber={item.chatFrameNumber}
                          alt={item.name}
                          className="h-11 w-28"
                        />
                      ) : (
                        <Sparkles className="h-8 w-8" style={{ color: item.previewColor }} />
                      )}
                    </div>
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => {
                          onEquipShopItem?.(item);
                          setShopNotice(`Equipped ${item.name}!`);
                        }}
                        className={`w-full rounded-full border py-1.5 text-[11px] font-extrabold ${
                          equipped
                            ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
                            : 'border-cyan-400/45 bg-[#0D1526] text-cyan-100 hover:bg-cyan-500/25'
                        }`}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford || !onBuyShopItem}
                        onClick={() => {
                          if (!onBuyShopItem) {
                            setActiveQuickPanel(null);
                            onOpenShop();
                            return;
                          }
                          onBuyShopItem(item);
                          setShopNotice(`Unlocked ${item.name}!`);
                        }}
                        className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-amber-400/65 bg-[#0A101D] py-1.5 font-mono-tabular text-[11px] font-extrabold text-amber-200 hover:bg-amber-500/20 disabled:opacity-45"
                      >
                        <ZayroCoinArt size={12} />
                        <span>
                          {item.priceCoins >= 1_000_000
                            ? `${item.priceCoins / 1_000_000}M`
                            : `${Math.round(item.priceCoins / 1000)}K`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Play together: Featured Hero + Game Covers + Multiplayer Games + Invite Friends */}
      <GamesSection
        friends={friends}
        onInviteFriend={onInviteFriendToGame}
        onEarnCoins={onEarnCoins}
      />
    </div>
  );
};

