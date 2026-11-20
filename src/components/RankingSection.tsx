import React, { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  Clock,
  Crown,
  Flame,
  Gem,
  Gift,
  Globe,
  Heart,
  HelpCircle,
  Home,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { AVATAR_ROSTER, VIP_TIERS, getVipNameStyle } from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import { RoomLevelBadgeArt, VipBadgeArt } from '../graphics/SpriteArtwork';
import type { AvatarConfig, PublicUserProfile, VoiceRoom } from '../types';

type RankingCategory = 'Popularity' | 'VIP' | 'Room' | 'BFF' | 'Gifts';
type RankingPeriod = 'Today' | 'Yesterday' | 'Celebrity' | 'Annual' | 'Global';

interface LeaderboardRow {
  rank: number;
  uid: string;
  name: string;
  vipLevel: number;
  score: number;
  avatar: AvatarConfig;
  roomId?: string;
  roomTitle?: string;
  roomLevel?: number;
  tagText?: string;
}

interface RankingSectionProps {
  userProfile: AvatarConfig;
  userVipLevel: number;
  userCharm: number;
  userVipGrowth: number;
  userGiftsGivenCoins?: number;
  rooms: VoiceRoom[];
  onClose?: () => void;
  onInspectUser: (profile: PublicUserProfile) => void;
  onJoinRoom: (roomId: string) => void;
  onGetGifts: () => void;
}

const CATEGORIES: Array<{ id: RankingCategory; icon: React.ReactNode }> = [
  { id: 'Popularity', icon: <Flame className="h-3.5 w-3.5 text-amber-300" /> },
  { id: 'VIP', icon: <Gem className="h-3.5 w-3.5 text-sky-300" /> },
  { id: 'Room', icon: <Home className="h-3.5 w-3.5 text-indigo-300" /> },
  { id: 'BFF', icon: <Users className="h-3.5 w-3.5 text-cyan-300" /> },
  { id: 'Gifts', icon: <Gift className="h-3.5 w-3.5 text-rose-300" /> },
];

const PERIODS: Array<{ id: RankingPeriod; icon: React.ReactNode }> = [
  { id: 'Today', icon: <Calendar className="h-3 w-3" /> },
  { id: 'Yesterday', icon: <Clock className="h-3 w-3" /> },
  { id: 'Celebrity', icon: <Star className="h-3 w-3 text-pink-300" /> },
  { id: 'Annual', icon: <Trophy className="h-3 w-3 text-amber-300" /> },
  { id: 'Global', icon: <Globe className="h-3 w-3 text-cyan-300" /> },
];

const NeonPodiumCrown: React.FC<{
  rank: 1 | 2 | 3;
  avatar: AvatarConfig;
  size: number;
}> = ({ rank, avatar, size }) => {
  const palette =
    rank === 1
      ? {
          ring: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 50%, #D97706 100%)',
          glow: '0 0 30px rgba(251, 191, 36, 0.72)',
          medalBg: 'linear-gradient(145deg, #FEF08A, #D97706)',
          medalBorder: '#FFFBEB',
          medalText: '#451A03',
          wingColor: '#FDE047',
          crownFill: '#FACC15',
        }
      : rank === 2
        ? {
            ring: 'linear-gradient(135deg, #E0F2FE 0%, #60A5FA 50%, #2563EB 100%)',
            glow: '0 0 26px rgba(96, 165, 250, 0.65)',
            medalBg: 'linear-gradient(145deg, #E0F2FE, #2563EB)',
            medalBorder: '#BAE6FD',
            medalText: '#FFFFFF',
            wingColor: '#93C5FD',
            crownFill: '#E0F2FE',
          }
        : {
            ring: 'linear-gradient(135deg, #FED7AA 0%, #FB7185 50%, #BE123C 100%)',
            glow: '0 0 26px rgba(251, 113, 133, 0.6)',
            medalBg: 'linear-gradient(145deg, #FDBA74, #E11D48)',
            medalBorder: '#FFE4E6',
            medalText: '#FFFFFF',
            wingColor: '#FDBA74',
            crownFill: '#FDBA74',
          };

  return (
    <div className="relative flex flex-col items-center justify-center pt-3 pb-2">
      {/* Glowing Top Crown */}
      <svg
        width={size * 0.66}
        height={size * 0.36}
        viewBox="0 0 64 34"
        className="-mb-2.5 z-20 drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
        aria-hidden="true"
      >
        <path
          d="M8 28L4 10L20 19L32 4L44 19L60 10L56 28Z"
          fill={palette.crownFill}
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="4" r="3" fill="#FFFFFF" />
        <circle cx="4" cy="10" r="2.2" fill="#FFFFFF" />
        <circle cx="60" cy="10" r="2.2" fill="#FFFFFF" />
      </svg>

      {/* Laurel Wings + Avatar */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size + 36}
          height={size + 20}
          viewBox="0 0 120 104"
          className="pointer-events-none absolute z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
          aria-hidden="true"
        >
          <path
            d="M28 84 C10 72, 6 44, 20 22 C16 44, 20 66, 36 80 Z"
            fill={palette.wingColor}
            opacity="0.95"
          />
          <path
            d="M21 68 C7 54, 7 34, 18 16 C16 36, 18 54, 30 68 Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
          <path
            d="M92 84 C110 72, 114 44, 100 22 C104 44, 100 66, 84 80 Z"
            fill={palette.wingColor}
            opacity="0.95"
          />
          <path
            d="M99 68 C113 54, 113 34, 102 16 C104 36, 102 54, 90 68 Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
        </svg>

        <div
          className="relative z-10 rounded-full p-[3px]"
          style={{ background: palette.ring, boxShadow: palette.glow }}
        >
          <div className="overflow-hidden rounded-full bg-[#070B14]">
            <AvatarArt avatar={avatar} size={size} />
          </div>
        </div>

        {/* Hexagonal Rank Number */}
        <div
          className="absolute -bottom-2.5 z-20 flex h-6 w-6 items-center justify-center font-mono-tabular text-xs font-black shadow-lg"
          style={{
            clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
            background: palette.medalBg,
            color: palette.medalText,
            boxShadow: `0 0 12px ${palette.medalBorder}`,
          }}
        >
          {rank}
        </div>
      </div>
    </div>
  );
};

export const RankingSection: React.FC<RankingSectionProps> = ({
  userProfile,
  userVipLevel,
  userCharm,
  userVipGrowth,
  userGiftsGivenCoins = 0,
  rooms,
  onClose,
  onInspectUser,
  onJoinRoom,
  onGetGifts,
}) => {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>('Popularity');
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>('Today');
  const [showRules, setShowRules] = useState(false);

  const periodFactor = useMemo(() => {
    switch (activePeriod) {
      case 'Today':
        return 1;
      case 'Yesterday':
        return 0.84;
      case 'Celebrity':
        return 1.35;
      case 'Annual':
        return 4.2;
      case 'Global':
        return 6.5;
    }
  }, [activePeriod]);

  const metricLabel = useMemo(() => {
    switch (activeCategory) {
      case 'Popularity':
        return 'Charm';
      case 'VIP':
        return 'Growth';
      case 'Room':
        return 'Room EXP';
      case 'BFF':
        return 'Bond';
      case 'Gifts':
        return 'Given';
    }
  }, [activeCategory]);

  const rows: LeaderboardRow[] = useMemo(() => {
    // 1. ROOM RANKINGS — strictly from live rooms & real spend/EXP activity
    if (activeCategory === 'Room') {
      return rooms
        .map((room) => {
          const totalSpend = Object.values(room.coinsSpentByUid ?? {}).reduce(
            (sum, v) => sum + v,
            0
          );
          const rawScore = room.xp + totalSpend;
          const hostAv =
            room.seats.find((s) => s.occupant?.uid === room.ownerUid)?.occupant ??
            AVATAR_ROSTER.find((a) => a.name === room.hostName) ??
            AVATAR_ROSTER[0];
          return {
            uid: room.ownerUid,
            name: room.title,
            vipLevel: Math.min(18, Math.max(1, room.level)),
            score: Math.round(rawScore * periodFactor),
            avatar: hostAv,
            roomId: room.id,
            roomTitle: room.title,
            roomLevel: room.level,
          };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((r, idx) => ({ ...r, rank: idx + 1 }));
    }

    // Gather unique active users from real rooms + current user (zero static placeholder arrays)
    const userMap = new Map<
      string,
      {
        uid: string;
        name: string;
        vipLevel: number;
        charm: number;
        growth: number;
        coinsGiven: number;
        avatar: AvatarConfig;
        roomId?: string;
        roomTitle?: string;
      }
    >();

    const upsertUser = (
      uid: string,
      avatar: AvatarConfig,
      vipLvl: number,
      charmVal: number,
      growthVal: number,
      coinsGivenVal: number,
      roomId?: string,
      roomTitle?: string
    ) => {
      const prev = userMap.get(uid);
      if (!prev) {
        userMap.set(uid, {
          uid,
          name: avatar.name,
          vipLevel: vipLvl,
          charm: charmVal,
          growth: growthVal,
          coinsGiven: coinsGivenVal,
          avatar,
          roomId,
          roomTitle,
        });
      } else {
        prev.vipLevel = Math.max(prev.vipLevel, vipLvl);
        prev.charm = Math.max(prev.charm, charmVal);
        prev.growth = Math.max(prev.growth, growthVal);
        prev.coinsGiven += coinsGivenVal;
        if (!prev.roomId && roomId) {
          prev.roomId = roomId;
          prev.roomTitle = roomTitle;
        }
      }
    };

    upsertUser(
      userProfile.uid,
      userProfile,
      userVipLevel,
      userCharm,
      userVipGrowth,
      userGiftsGivenCoins
    );

    const tierGrowthEstimate = (vipLvl: number) =>
      vipLvl > 0
        ? VIP_TIERS[Math.min(VIP_TIERS.length - 1, Math.max(0, vipLvl - 1))]?.minGrowth ??
          vipLvl * 500
        : 0;

    for (const room of rooms) {
      const spentMap = room.coinsSpentByUid ?? {};

      for (const seat of room.seats) {
        if (!seat.occupant) continue;
        const occ = seat.occupant;
        const isSelf = occ.uid === userProfile.uid;
        const vipLvl = isSelf ? userVipLevel : (seat.vipLevel ?? 0);
        const charmVal = isSelf ? userCharm : (seat.charmValue ?? seat.giftScore ?? 0);
        const coinsSpent = isSelf ? 0 : (spentMap[occ.uid] ?? 0);
        upsertUser(
          occ.uid,
          occ,
          vipLvl,
          charmVal,
          isSelf ? userVipGrowth : tierGrowthEstimate(vipLvl),
          coinsSpent,
          room.id,
          room.title
        );
      }

      for (const lis of room.listeners) {
        const av =
          AVATAR_ROSTER.find((a) => a.uid === lis.uid || a.id === lis.avatarId) ?? {
            id: lis.avatarId,
            uid: lis.uid,
            name: lis.name,
            handle: `@${lis.name.toLowerCase().replace(/\s+/g, '')}`,
            skinTone: '#D69E76',
            hairColor: '#1E293B',
            robeColor: '#7C3AED',
            accentColor: '#DDD6FE',
            ornament: 'lotus',
          };
        const isSelf = lis.uid === userProfile.uid;
        const coinsSpent = isSelf ? 0 : (spentMap[lis.uid] ?? 0);
        upsertUser(
          lis.uid,
          av,
          isSelf ? userVipLevel : lis.vipLevel,
          isSelf ? userCharm : lis.charm,
          isSelf ? userVipGrowth : tierGrowthEstimate(lis.vipLevel),
          coinsSpent,
          room.id,
          room.title
        );
      }

      for (const [uid, spent] of Object.entries(spentMap)) {
        if (uid === userProfile.uid || spent <= 0) continue;
        if (!userMap.has(uid)) {
          const roster = AVATAR_ROSTER.find((a) => a.uid === uid);
          if (roster) {
            upsertUser(uid, roster, 3, 0, tierGrowthEstimate(3), spent, room.id, room.title);
          }
        }
      }
    }

    // 2. BFF (CP Bond Rankings) — strictly active CP connections with charm > 0
    if (activeCategory === 'BFF') {
      const bondMap = new Map<
        string,
        {
          uid: string;
          name: string;
          vipLevel: number;
          score: number;
          avatar: AvatarConfig;
          roomId?: string;
          roomTitle?: string;
        }
      >();

      userMap.forEach((u) => {
        const cp = u.avatar.cpPartner;
        const cpScore = cp?.cpCharm ?? 0;
        if (!cp || cpScore <= 0) return;
        const pairKey = [u.uid, cp.partnerUid].sort().join(':');
        const existing = bondMap.get(pairKey);
        const scaled = Math.round(cpScore * periodFactor);
        if (!existing || scaled > existing.score) {
          bondMap.set(pairKey, {
            uid: u.uid,
            name: `${u.name} ♥ ${cp.partnerName}`,
            vipLevel: u.vipLevel,
            score: scaled,
            avatar: u.avatar,
            roomId: u.roomId,
            roomTitle: u.roomTitle,
          });
        }
      });

      return Array.from(bondMap.values())
        .filter((b) => b.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((b, idx) => ({ ...b, rank: idx + 1 }));
    }

    // 3. POPULARITY / VIP / GIFTS — strictly contributors with score > 0
    return Array.from(userMap.values())
      .map((u) => {
        const raw =
          activeCategory === 'Popularity'
            ? u.charm
            : activeCategory === 'VIP'
              ? u.growth
              : u.coinsGiven;
        return {
          uid: u.uid,
          name: u.name,
          vipLevel: u.vipLevel,
          score: Math.round(raw * periodFactor),
          avatar: u.avatar,
          roomId: u.roomId,
          roomTitle: u.roomTitle,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [
    activeCategory,
    periodFactor,
    rooms,
    userProfile,
    userVipLevel,
    userCharm,
    userVipGrowth,
    userGiftsGivenCoins,
  ]);

  const top1 = rows[0];
  const top2 = rows[1];
  const top3 = rows[2];
  const restRows = rows.slice(3);

  const userMetricScore =
    activeCategory === 'VIP'
      ? userVipGrowth
      : activeCategory === 'Room'
        ? rooms.find((r) => r.ownerUid === userProfile.uid)?.xp ?? 0
        : activeCategory === 'Gifts'
          ? userGiftsGivenCoins
          : activeCategory === 'BFF'
            ? userProfile.cpPartner?.cpCharm ?? 0
            : userCharm;

  const userRankIdx = rows.findIndex(
    (r) =>
      r.uid === userProfile.uid ||
      (activeCategory === 'BFF' &&
        userProfile.cpPartner &&
        r.name.includes(userProfile.name) &&
        r.name.includes(userProfile.cpPartner.partnerName))
  );
  const userRankText = userRankIdx >= 0 ? `#${userRankIdx + 1}` : 'Unranked';

  const handleRowClick = (row: LeaderboardRow) => {
    if (activeCategory === 'Room' && row.roomId) {
      onJoinRoom(row.roomId);
      return;
    }
    onInspectUser({
      avatar: { ...row.avatar, uid: row.uid, name: row.name },
      vipLevel: row.vipLevel,
      charm: row.score,
      cpPartner: row.avatar.cpPartner ?? null,
      ringNumber: row.avatar.cpPartner?.ringNumber ?? 1,
      roomId: row.roomId,
      roomTitle: row.roomTitle,
    });
  };

  return (
    <section
      aria-label="OG VELOCITY Ranking"
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/40 shadow-[0_0_40px_rgba(6,182,212,0.25)]"
      style={{
        background:
          'radial-gradient(circle at 50% 18%, rgba(34, 211, 238, 0.24) 0%, rgba(11, 26, 46, 0.96) 48%, #060D1A 100%)',
      }}
    >
      {/* Top Neon Header: < + Winged Golden "Ranking" + ? */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1.5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/50 bg-[#0B1A2E]/90 text-white shadow-[0_0_14px_rgba(34,211,238,0.35)] hover:bg-cyan-500/25"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>

        {/* Winged Golden Ranking Emblem */}
        <div className="relative flex flex-col items-center">
          <Crown className="-mb-1 h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-teal-300 opacity-85" />
            <h2
              className="font-display bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-2xl font-black tracking-wide text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]"
            >
              Ranking
            </h2>
            <span className="h-1.5 w-6 rounded-full bg-gradient-to-l from-transparent via-cyan-400 to-teal-300 opacity-85" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRules((v) => !v)}
          aria-label="Ranking Rules"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/50 bg-[#0B1A2E]/90 text-slate-200 shadow-[0_0_14px_rgba(34,211,238,0.35)] hover:bg-cyan-500/25"
        >
          <HelpCircle className="h-4.5 w-4.5" />
        </button>
      </div>

      {showRules && (
        <div className="mx-3.5 mb-2 flex items-start justify-between gap-2 rounded-2xl border border-cyan-400/40 bg-[#0B1A2E]/95 p-3 text-[11px] text-slate-200">
          <p>
            Send or receive gifts in Voice Rooms to climb Popularity (Charm), boost VIP Growth, level up your Room, and earn BFF &amp; Top Gifter rankings.
          </p>
          <button
            type="button"
            onClick={() => setShowRules(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Primary Neon Pill Tabs: Popularity | VIP | Room | BFF | Gifts */}
      <div className="mx-3 mt-1 flex items-center justify-between gap-1 rounded-full border border-cyan-400/35 bg-[#07111F]/90 p-1 shadow-[0_0_18px_rgba(6,182,212,0.22)]">
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.6)]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.id}</span>
            </button>
          );
        })}
      </div>

      {/* Period Filter Pill Bar: Today | Yesterday | Celebrity | Annual | Global */}
      <div className="mx-3 mt-2.5 mb-3 flex items-center justify-between rounded-full border border-cyan-400/30 bg-[#07111F]/85 p-1">
        {PERIODS.map((period) => {
          const active = activePeriod === period.id;
          return (
            <React.Fragment key={period.id}>
              {period.id === 'Global' && (
                <span className="h-3.5 w-px bg-cyan-300/20" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => setActivePeriod(period.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.55)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {period.icon}
                <span>{period.id}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 3D Glowing Pedestal Podium (#2 Left Blue, #1 Center Gold, #3 Right Pink/Bronze) */}
      {rows.length === 0 ? (
        <div className="mx-3 mb-4 rounded-2xl border border-cyan-400/25 bg-[#0B1A2E]/80 px-4 py-8 text-center">
          <Trophy className="mx-auto h-8 w-8 text-amber-300/80" />
          <div className="mt-2 text-sm font-bold text-white">No Contributors Yet</div>
          <p className="mt-1 text-xs text-slate-400">
            Enter a Voice Room, send gifts, or build your CP Bond to claim #1 in {activeCategory}!
          </p>
        </div>
      ) : (
        <div className="relative grid grid-cols-3 items-end gap-2 px-3 pt-2 pb-4">
          {/* #2 Left Pedestal */}
          {top2 ? (
            <button
              type="button"
              onClick={() => handleRowClick(top2)}
              className="flex flex-col items-center text-center transition-transform hover:-translate-y-0.5"
            >
              <NeonPodiumCrown rank={2} avatar={top2.avatar} size={52} />
              <div className="mt-1.5 flex max-w-full items-center justify-center gap-1">
                <span
                  className="truncate text-[11px] font-bold"
                  style={getVipNameStyle(top2.vipLevel)}
                >
                  {top2.name}
                </span>
                {activeCategory === 'Room' && top2.roomLevel ? (
                  <RoomLevelBadgeArt level={top2.roomLevel} size={14} />
                ) : (
                  <VipBadgeArt level={top2.vipLevel} size={15} />
                )}
              </div>
              <div
                className="mt-1.5 w-full rounded-t-2xl border border-sky-400/50 px-1.5 py-2.5 shadow-[0_0_24px_rgba(59,130,246,0.4)]"
                style={{
                  background: 'linear-gradient(180deg, rgba(37,99,235,0.65) 0%, rgba(15,23,42,0.92) 100%)',
                }}
              >
                <div className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono-tabular text-[10px] font-extrabold text-white">
                  <Heart className="h-2.5 w-2.5 fill-pink-500 text-pink-500" />
                  <span>{top2.score.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ) : (
            <div />
          )}

          {/* #1 Center Tall Golden Pedestal */}
          {top1 && (
            <button
              type="button"
              onClick={() => handleRowClick(top1)}
              className="-mt-3 flex flex-col items-center text-center transition-transform hover:-translate-y-0.5"
            >
              <NeonPodiumCrown rank={1} avatar={top1.avatar} size={64} />
              <div className="mt-1.5 flex max-w-full items-center justify-center gap-1">
                <span
                  className="truncate text-xs font-black"
                  style={getVipNameStyle(top1.vipLevel)}
                >
                  {top1.name}
                </span>
                {activeCategory === 'Room' && top1.roomLevel ? (
                  <RoomLevelBadgeArt level={top1.roomLevel} size={16} />
                ) : (
                  <VipBadgeArt level={top1.vipLevel} size={17} />
                )}
              </div>
              <div
                className="mt-1.5 w-full rounded-t-2xl border border-amber-400/65 px-1.5 py-4 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                style={{
                  background: 'linear-gradient(180deg, rgba(217,119,6,0.72) 0%, rgba(45,20,6,0.94) 100%)',
                }}
              >
                <div className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-black/60 px-2.5 py-0.5 font-mono-tabular text-[10px] font-extrabold text-white">
                  <Heart className="h-2.5 w-2.5 fill-pink-500 text-pink-500" />
                  <span>{top1.score.toLocaleString()}</span>
                </div>
              </div>
            </button>
          )}

          {/* #3 Right Pedestal */}
          {top3 ? (
            <button
              type="button"
              onClick={() => handleRowClick(top3)}
              className="flex flex-col items-center text-center transition-transform hover:-translate-y-0.5"
            >
              <NeonPodiumCrown rank={3} avatar={top3.avatar} size={50} />
              <div className="mt-1.5 flex max-w-full items-center justify-center gap-1">
                <span
                  className="truncate text-[11px] font-bold"
                  style={getVipNameStyle(top3.vipLevel)}
                >
                  {top3.name}
                </span>
                {activeCategory === 'Room' && top3.roomLevel ? (
                  <RoomLevelBadgeArt level={top3.roomLevel} size={14} />
                ) : (
                  <VipBadgeArt level={top3.vipLevel} size={15} />
                )}
              </div>
              <div
                className="mt-1.5 w-full rounded-t-2xl border border-rose-400/50 px-1.5 py-2 shadow-[0_0_24px_rgba(244,63,94,0.4)]"
                style={{
                  background: 'linear-gradient(180deg, rgba(219,39,119,0.65) 0%, rgba(30,10,28,0.92) 100%)',
                }}
              >
                <div className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono-tabular text-[10px] font-extrabold text-white">
                  <Heart className="h-2.5 w-2.5 fill-pink-500 text-pink-500" />
                  <span>{top3.score.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Neon-Bordered Ranks #4 - #10 Rows */}
      <div className="space-y-1.5 px-3 pb-3">
        {restRows.map((row, idx) => {
          const ringAccent =
            idx % 3 === 0
              ? 'border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
              : idx % 3 === 1
                ? 'border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.28)]'
                : 'border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.28)]';
          return (
            <button
              key={`${activeCategory}-${row.rank}-${row.uid}`}
              type="button"
              onClick={() => handleRowClick(row)}
              className={`flex w-full items-center justify-between gap-2.5 rounded-2xl border bg-gradient-to-r from-[#0D1A30]/95 via-[#091324]/95 to-[#10223D]/95 px-3 py-2 text-left transition-transform hover:scale-[1.01] ${ringAccent}`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {/* Hexagonal Rank Number */}
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center border border-amber-300/40 bg-[#132038] font-mono-tabular text-xs font-extrabold text-white"
                  style={{
                    clipPath: 'polygon(50% 2%, 95% 26%, 95% 74%, 50% 98%, 5% 74%, 5% 26%)',
                  }}
                >
                  {row.rank}
                </div>

                <div className="shrink-0 rounded-full border-2 border-cyan-400/70 p-0.5 shadow-[0_0_10px_rgba(34,211,238,0.45)]">
                  <AvatarArt avatar={row.avatar} size={34} />
                </div>

                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="truncate text-xs font-bold"
                    style={getVipNameStyle(row.vipLevel)}
                  >
                    {row.name}
                  </span>
                  {activeCategory === 'Room' && row.roomLevel ? (
                    <RoomLevelBadgeArt level={row.roomLevel} size={16} />
                  ) : (
                    <VipBadgeArt level={row.vipLevel} size={17} />
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 font-mono-tabular">
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <div className="text-right">
                  <div className="text-xs font-extrabold text-white">
                    {row.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-cyan-300">{metricLabel}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Sticky Neon "YOU" Bar + "Get gifts" Button */}
      <div className="flex items-center justify-between gap-2 border-t border-cyan-400/40 bg-gradient-to-r from-[#0B1A2E] via-[#132B4A] to-[#0B1A2E] px-3.5 py-2.5 shadow-[0_-4px_20px_rgba(6,182,212,0.22)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="text-center leading-tight">
            <div className="text-[10px] font-extrabold text-cyan-200">YOU</div>
            <div className="font-mono-tabular text-xs font-black text-white">{userRankText}</div>
          </div>

          <div className="rounded-full border-2 border-cyan-400 p-0.5 shadow-[0_0_12px_rgba(34,211,238,0.6)]">
            <AvatarArt avatar={userProfile} size={34} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span
                className="truncate text-xs font-bold"
                style={getVipNameStyle(userVipLevel)}
              >
                {userProfile.name}
              </span>
              {userVipLevel > 0 ? (
                <VipBadgeArt level={userVipLevel} size={16} />
              ) : (
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono-tabular text-[9px] font-bold text-slate-300">
                  VIP 0
                </span>
              )}
            </div>
            <div className="font-mono-tabular text-[11px] font-bold text-slate-200">
              {metricLabel} {userMetricScore.toLocaleString()}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onGetGifts}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.55)] hover:opacity-95"
        >
          <Gift className="h-3.5 w-3.5" />
          <span>Get gifts</span>
        </button>
      </div>
    </section>
  );
};
