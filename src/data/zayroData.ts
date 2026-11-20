import type { CSSProperties } from 'react';
import type {
  AvatarConfig,
  BondTag,
  CharmLevelInfo,
  ChatThread,
  CoinPackage,
  DailyTaskItem,
  FriendRecord,
  GuardLeader,
  IntimateSpaceData,
  MomentPost,
  RoomBackgroundTheme,
  RoomLevelInfo,
  RoomTaskItem,
  ShopItem,
  VipPlan,
  VipTierInfo,
  VirtualGift,
  VoiceRoom,
  VoiceSeat,
} from '../types';

export const USER_PROFILE: AvatarConfig = {
  id: 'user-self',
  uid: 'ZAY-849201',
  name: 'Sabir',
  handle: '@sabir.ogvelocity',
  bio: 'Voice Sanctuary Host · Collector of Rings & Badges',
  gender: 'Male',
  age: 21,
  country: 'India',
  blessing: 1_200,
  tags: [],
  email: '',
  cpPartner: null,
  skinTone: '#E0AC89',
  hairColor: '#1E293B',
  robeColor: '#F59E0B',
  accentColor: '#FBBF24',
  ornament: 'crown',
};

export function getGenderSymbol(gender?: AvatarConfig['gender']): string {
  if (gender === 'Female') return '♀️';
  if (gender === 'Other') return '⚧️';
  return '♂️';
}

export function getCountryFlag(country?: string): string {
  const clean = (country || 'India').trim().toLowerCase();
  if (clean.includes('india')) return '🇮🇳';
  if (clean.includes('usa') || clean.includes('united states')) return '🇺🇸';
  if (clean.includes('uk') || clean.includes('britain')) return '🇬🇧';
  if (clean.includes('uae') || clean.includes('dubai')) return '🇦🇪';
  if (clean.includes('canada')) return '🇨🇦';
  if (clean.includes('pakistan')) return '🇵🇰';
  if (clean.includes('bangladesh')) return '🇧🇩';
  return '🌍';
}

export interface CpLevelTier {
  level: number;
  title: string;
  minCharm: number;
}

// Level 1 -> Level 2 requires 12,000 charms; Level 2 -> Level 3 requires +30,000 charms (42,000 cumulative)
export const CP_LEVELS: CpLevelTier[] = [
  { level: 1, title: 'Spark Bond', minCharm: 0 },
  { level: 2, title: 'Sweetheart Bond', minCharm: 12_000 },
  { level: 3, title: 'Crimson Promise', minCharm: 42_000 },
  { level: 4, title: 'Twin Star', minCharm: 102_000 },
  { level: 5, title: 'Golden Oath', minCharm: 182_000 },
  { level: 6, title: 'Amethyst Soul', minCharm: 292_000 },
  { level: 7, title: 'Royal Sanctuary', minCharm: 442_000 },
  { level: 8, title: 'Celestial Pair', minCharm: 642_000 },
  { level: 9, title: 'Eternal Flame', minCharm: 900_000 },
  { level: 10, title: 'Mythic Destiny', minCharm: 1_250_000 },
];

export function getCpLevelInfo(cpCharm: number = 0): {
  level: number;
  title: string;
  currentMin: number;
  nextMin: number | null;
  stepRequired: number;
  progressInLevel: number;
  stepRemaining: number;
  percent: number;
} {
  let current = CP_LEVELS[0];
  for (const tier of CP_LEVELS) {
    if (cpCharm >= tier.minCharm) {
      current = tier;
    }
  }
  const next = CP_LEVELS.find((t) => t.level === current.level + 1) ?? null;
  const stepRequired = next ? next.minCharm - current.minCharm : 1;
  const progressInLevel = Math.max(0, cpCharm - current.minCharm);
  const stepRemaining = next ? Math.max(0, next.minCharm - cpCharm) : 0;
  const percent = next
    ? Math.min(100, Math.round((progressInLevel / Math.max(1, stepRequired)) * 100))
    : 100;

  return {
    level: current.level,
    title: current.title,
    currentMin: current.minCharm,
    nextMin: next ? next.minCharm : null,
    stepRequired,
    progressInLevel,
    stepRemaining,
    percent,
  };
}

export const AVATAR_ROSTER: AvatarConfig[] = [
  {
    id: 'av-ananya',
    uid: 'ZAY-102941',
    name: 'Ananya',
    handle: '@ananya.s',
    gender: 'Female',
    age: 22,
    country: 'India',
    blessing: 24_800,
    cpPartner: {
      partnerUid: 'ZAY-339104',
      partnerName: 'Soren',
      partnerAvatarId: 'av-soren',
      ringNumber: 6,
      ringName: 'Amethyst Royal Signet',
      since: '156 days',
      cpCharm: 18_400,
      cpLevel: 2,
    },
    skinTone: '#D69E76',
    hairColor: '#18181B',
    robeColor: '#D97706',
    accentColor: '#FDE68A',
    ornament: 'crown',
  },
  {
    id: 'av-kabir',
    uid: 'ZAY-204118',
    name: 'Kabir',
    handle: '@kabir_v',
    gender: 'Male',
    age: 24,
    country: 'India',
    blessing: 48_600,
    cpPartner: {
      partnerUid: 'ZAY-448290',
      partnerName: 'Meera',
      partnerAvatarId: 'av-meera',
      ringNumber: 7,
      ringName: 'Solar Sunburst Ring',
      since: '84 days',
      cpCharm: 45_200,
      cpLevel: 3,
    },
    skinTone: '#B87D56',
    hairColor: '#0F172A',
    robeColor: '#059669',
    accentColor: '#6EE7B7',
    ornament: 'halo',
  },
  {
    id: 'av-soren',
    uid: 'ZAY-339104',
    name: 'Soren',
    handle: '@soren.k',
    gender: 'Male',
    age: 25,
    country: 'India',
    blessing: 78_300,
    cpPartner: {
      partnerUid: 'ZAY-102941',
      partnerName: 'Ananya',
      partnerAvatarId: 'av-ananya',
      ringNumber: 6,
      ringName: 'Amethyst Royal Signet',
      since: '156 days',
      cpCharm: 18_400,
      cpLevel: 2,
    },
    skinTone: '#F1C7A8',
    hairColor: '#475569',
    robeColor: '#4F46E5',
    accentColor: '#A5B4FC',
    ornament: 'visor',
  },
  {
    id: 'av-meera',
    uid: 'ZAY-448290',
    name: 'Meera',
    handle: '@meera.art',
    gender: 'Female',
    age: 23,
    country: 'India',
    blessing: 39_400,
    cpPartner: {
      partnerUid: 'ZAY-204118',
      partnerName: 'Kabir',
      partnerAvatarId: 'av-kabir',
      ringNumber: 7,
      ringName: 'Solar Sunburst Ring',
      since: '84 days',
      cpCharm: 45_200,
      cpLevel: 3,
    },
    skinTone: '#C88A65',
    hairColor: '#27272A',
    robeColor: '#E11D48',
    accentColor: '#FDA4AF',
    ornament: 'crescent',
  },
  {
    id: 'av-devon',
    uid: 'ZAY-551923',
    name: 'Devon',
    handle: '@devon.mx',
    gender: 'Male',
    age: 26,
    country: 'UAE',
    blessing: 14_200,
    skinTone: '#8D5534',
    hairColor: '#09090B',
    robeColor: '#0284C7',
    accentColor: '#7DD3FC',
    ornament: 'flame',
  },
  {
    id: 'av-tara',
    uid: 'ZAY-662019',
    name: 'Tara',
    handle: '@tara.zen',
    gender: 'Female',
    age: 22,
    country: 'India',
    blessing: 11_500,
    skinTone: '#E5B89B',
    hairColor: '#3F2E26',
    robeColor: '#7C3AED',
    accentColor: '#DDD6FE',
    ornament: 'lotus',
  },
];

// Charm Levels Lv. 1 - 21 (1 Star up to 20 Crowns / Lv.21)
// Based on user's exact milestones: 5k, 13k, 40k, 100k, 150k, 300k, 500k, 1.2M, 3M, 5M, scaling to Lv.21
export const CHARM_LEVELS: CharmLevelInfo[] = [
  { level: 1, series: 'Star Series', minCharm: 0 },
  { level: 2, series: 'Star Series', minCharm: 5_000 },
  { level: 3, series: 'Diamond Series', minCharm: 13_000 },
  { level: 4, series: 'Diamond Series', minCharm: 40_000 },
  { level: 5, series: 'Diamond Series', minCharm: 100_000 },
  { level: 6, series: 'Diamond Series', minCharm: 150_000 },
  { level: 7, series: 'Diamond Series', minCharm: 300_000 },
  { level: 8, series: 'Normal Crown', minCharm: 500_000 },
  { level: 9, series: 'Normal Crown', minCharm: 1_200_000 },
  { level: 10, series: 'Normal Crown', minCharm: 3_000_000 },
  { level: 11, series: 'Advanced Crown', minCharm: 5_000_000 },
  { level: 12, series: 'Advanced Crown', minCharm: 8_000_000 },
  { level: 13, series: 'Advanced Crown', minCharm: 12_000_000 },
  { level: 14, series: 'Advanced Crown', minCharm: 18_000_000 },
  { level: 15, series: 'Advanced Crown', minCharm: 25_000_000 },
  { level: 16, series: 'Hard Crown', minCharm: 35_000_000 },
  { level: 17, series: 'Hard Crown', minCharm: 50_000_000 },
  { level: 18, series: 'Hard Crown', minCharm: 70_000_000 },
  { level: 19, series: 'Hard Crown', minCharm: 95_000_000 },
  { level: 20, series: 'Hard Crown', minCharm: 125_000_000 },
  { level: 21, series: 'Hard Crown', minCharm: 160_000_000 },
];

export function getCharmLevelInfo(charmPoints: number): {
  current: CharmLevelInfo;
  next: CharmLevelInfo | null;
} {
  let current = CHARM_LEVELS[0];
  for (const tier of CHARM_LEVELS) {
    if (charmPoints >= tier.minCharm) {
      current = tier;
    }
  }
  const next = CHARM_LEVELS.find((t) => t.level === current.level + 1) ?? null;
  return { current, next };
}

// VIP Levels (Lv. 1 - 18) driven by Growth Points (1 Growth per 100 Coins spent)
export const VIP_TIERS: VipTierInfo[] = [
  { level: 1, minGrowth: 500, title: 'VIP 1 Initiate', perk: 'Silver Shield Emblem & Standard Room Entry', accentColor: '#38BDF8' },
  { level: 2, minGrowth: 3_000, title: 'VIP 2 Azure', perk: 'Azure Winged Shield + Azure Entrance Banner', accentColor: '#38BDF8' },
  { level: 3, minGrowth: 8_000, title: 'VIP 3 Crystal', perk: 'VIP3 Glasses Gift Unlock + Priority Seat Queue', giftReward: 'V3 Glasses', frameUnlock: 'Crystal Halo Frame', accentColor: '#34D399' },
  { level: 4, minGrowth: 20_000, title: 'VIP 4 Amethyst', perk: 'Emerald-Amethyst Banner + Double Room Task EXP', accentColor: '#34D399' },
  { level: 5, minGrowth: 45_000, title: 'VIP 5 Solar', perk: 'VIP5 Sun Gift Unlock + Rose Sceptre Frame', giftReward: 'V5 Sun', frameUnlock: 'Rose Sceptre', accentColor: '#A855F7' },
  { level: 6, minGrowth: 90_000, title: 'VIP 6 Sovereign', perk: 'Gilded Violet Wings + Custom Chat Bubble Glow', accentColor: '#A855F7' },
  { level: 7, minGrowth: 160_000, title: 'VIP 7 Crimson', perk: 'VIP7 Star Gift + Advanced Frame Unlock', giftReward: 'V7 Star', frameUnlock: 'Brave of Love', accentColor: '#FB7185' },
  { level: 8, minGrowth: 260_000, title: 'VIP 8 Monarch', perk: 'Royal Gold & Rose Crown + Anti-Mute Shield', accentColor: '#FB7185' },
  { level: 9, minGrowth: 400_000, title: 'VIP 9 Imperial', perk: 'VIP9 Diamond Gift + Rainbow Unicorn Frame', giftReward: 'V9 Diamond', frameUnlock: 'Rainbow Unicorn', accentColor: '#FBBF24' },
  { level: 10, minGrowth: 600_000, title: 'VIP 10 Celestial', perk: 'Golden Flame Entrance Effect + Seat Aura', accentColor: '#FBBF24' },
  { level: 11, minGrowth: 900_000, title: 'VIP 11 Legend', perk: 'VIP11 Customized Motorcycle Gift + Foxie Frame', giftReward: 'V11 Motorcycle', frameUnlock: 'Foxie', accentColor: '#F97316' },
  { level: 12, minGrowth: 1_300_000, title: 'VIP 12 Frost', perk: 'Blazing Sovereign Wings + VIP Lounge Pass', accentColor: '#F97316' },
  { level: 13, minGrowth: 1_850_000, title: 'VIP 13 Ember', perk: 'Magenta Phoenix Crest + Global Broadcast', accentColor: '#EC4899' },
  { level: 14, minGrowth: 2_600_000, title: 'VIP 14 Astral', perk: 'Astral Crown Wings + Custom Tag Color', accentColor: '#EC4899' },
  { level: 15, minGrowth: 3_500_000, title: 'VIP 15 Crown', perk: 'Glacier Throne Room Aura + 15% Coin Bonus', accentColor: '#22D3EE' },
  { level: 16, minGrowth: 4_600_000, title: 'VIP 16 Glacier', perk: 'Diamond Ice Wings + Priority Host Access', accentColor: '#22D3EE' },
  { level: 17, minGrowth: 6_000_000, title: 'VIP 17 Dragon', perk: 'Mythic Golden Dragon Emblem + Royal Aura', accentColor: '#FDE047' },
  { level: 18, minGrowth: 7_800_000, title: 'VIP 18 Supreme', perk: 'Supreme OG VELOCITY Crown + Exclusive Max Entry', accentColor: '#FDE047' },
];

export const NO_VIP_TIER: VipTierInfo = {
  level: 0,
  minGrowth: 0,
  title: 'VIP 0 Starter',
  perk: 'Spend Coins or subscribe to unlock VIP 1',
  accentColor: '#94A3B8',
};

export function getVipTierByGrowth(growthPoints: number): {
  current: VipTierInfo;
  next: VipTierInfo | null;
} {
  if (growthPoints < VIP_TIERS[0].minGrowth) {
    return { current: NO_VIP_TIER, next: VIP_TIERS[0] };
  }
  let current = VIP_TIERS[0];
  for (const tier of VIP_TIERS) {
    if (growthPoints >= tier.minGrowth) {
      current = tier;
    }
  }
  const next = VIP_TIERS.find((t) => t.level === current.level + 1) ?? null;
  return { current, next };
}

// One distinct name color per 2 VIP levels: V1-V2, V3-V4, V5-V6, V7-V8, V9-V10, V11-V12, V13-V14, V15-V16, V17-V18
export function getVipNameColor(vipLevel: number): string {
  if (vipLevel <= 0) return '#F8FAFC';
  const level = Math.max(1, Math.min(18, Math.round(vipLevel)));
  if (level <= 2) return '#38BDF8'; // V1-V2: Sky Blue
  if (level <= 4) return '#34D399'; // V3-V4: Emerald Mint
  if (level <= 6) return '#A855F7'; // V5-V6: Amethyst Violet
  if (level <= 8) return '#FB7185'; // V7-V8: Rose Coral
  if (level <= 10) return '#FBBF24'; // V9-V10: Royal Amber
  if (level <= 12) return '#F97316'; // V11-V12: Ember Orange
  if (level <= 14) return '#EC4899'; // V13-V14: Neon Magenta
  if (level <= 16) return '#22D3EE'; // V15-V16: Glacier Cyan
  return '#FDE047'; // V17-V18: Mythic Gold
}

// For any level beyond VIP 11 (V12-V18), display VIP name & level name in two colors
export function getVipNameStyle(vipLevel: number): CSSProperties {
  if (vipLevel <= 0) {
    return { color: '#F8FAFC' };
  }
  const level = Math.max(1, Math.min(18, Math.round(vipLevel)));
  if (level <= 11) {
    return { color: getVipNameColor(level) };
  }
  const [c1, c2] =
    level === 12
      ? ['#F97316', '#38BDF8']
      : level <= 14
        ? ['#EC4899', '#A855F7']
        : level <= 16
          ? ['#22D3EE', '#3B82F6']
          : ['#FDE047', '#FB7185'];
  return {
    backgroundImage: `linear-gradient(90deg, ${c1} 0%, ${c2} 100%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    display: 'inline-block',
  };
}

// Room Level EXP requirements (Lv. 1 -> 20):
// Lv 1->2: 15,000 EXP, Lv 2->3: 40,000 EXP, Lv 3->4: 100,000 EXP, scaling up to Lv 20
// Admin slots scale from 3 (Level 1) up to 15 (Level 20)
const ROOM_EXP_DELTAS = [
  0, // Lv 1 base
  15_000, // 1->2
  40_000, // 2->3
  100_000, // 3->4
  180_000, // 4->5
  280_000, // 5->6
  420_000, // 6->7
  600_000, // 7->8
  850_000, // 8->9
  1_150_000, // 9->10
  1_500_000, // 10->11
  1_950_000, // 11->12
  2_500_000, // 12->13
  3_150_000, // 13->14
  3_900_000, // 14->15
  4_800_000, // 15->16
  5_850_000, // 16->17
  7_100_000, // 17->18
  8_500_000, // 18->19
  10_200_000, // 19->20
];

const ROOM_TITLES = [
  'Newbie Explorer',
  'Bronze Spark',
  'Amber Flame',
  'Amethyst Pulse',
  'Royal Spark',
  'Premium Jade',
  'Frost Guardian',
  'Royal Crest',
  'Crimson Valor',
  'Power Shield',
  'Royal Star',
  'Sapphire Wing',
  'Imperial Crest',
  'Legend Guard',
  'Cosmic Star',
  'Astral Halo',
  'Thunder Lord',
  'Solar Sovereign',
  'Super Legend',
  'Supreme Legend',
];

export const ROOM_LEVEL_INFO: RoomLevelInfo[] = Array.from({ length: 20 }, (_, i) => {
  const level = i + 1;
  const adminSlots = Math.min(15, 3 + Math.floor(((level - 1) * 12) / 19));
  const memberNumeric = level < 5 ? `${level * 1}k` : level < 12 ? `${level * 2}k` : `${Math.min(50, level * 2.5)}k`;
  return {
    level,
    title: ROOM_TITLES[i],
    requiredExp: ROOM_EXP_DELTAS[i],
    memberLimit: memberNumeric.replace('.5k', 'k'),
    adminSlots,
  };
});

export function getAdminSlotCount(roomLevel: number): number {
  const found = ROOM_LEVEL_INFO.find((r) => r.level === Math.max(1, Math.min(20, roomLevel)));
  return found ? found.adminSlots : 3;
}

export function getRoomNextExp(roomLevel: number): number {
  const next = ROOM_LEVEL_INFO.find((r) => r.level === roomLevel + 1);
  return next ? next.requiredExp : ROOM_EXP_DELTAS[19];
}

export const ROOM_BACKGROUND_THEMES: RoomBackgroundTheme[] = [
  {
    id: 'bg-saffron',
    name: 'Obsidian Amber',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.16) 0%, rgba(10,18,34,0.97) 52%, rgba(245,158,11,0.18) 100%)',
    accent: '#22D3EE',
    ambiance: 'saffron',
  },
  {
    id: 'bg-aurora',
    name: 'Cyan Nebula',
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(8,15,30,0.97) 52%, rgba(20,184,166,0.22) 100%)',
    accent: '#22D3EE',
    ambiance: 'indigo',
  },
  {
    id: 'bg-emerald',
    name: 'Deep Jade Sanctuary',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(7,16,28,0.97) 55%, rgba(6,95,70,0.26) 100%)',
    accent: '#10B981',
    ambiance: 'emerald',
  },
  {
    id: 'bg-crimson',
    name: 'Rose-Gold Lounge',
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.22) 0%, rgba(12,16,32,0.97) 55%, rgba(190,24,93,0.22) 100%)',
    accent: '#FB7185',
    ambiance: 'crimson',
  },
  {
    id: 'bg-golden',
    name: 'Champagne Palace',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.24) 0%, rgba(18,16,24,0.97) 50%, rgba(217,119,6,0.26) 100%)',
    accent: '#FBBF24',
    ambiance: 'saffron',
  },
  {
    id: 'bg-river',
    name: 'Crystal Lagoon',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(8,18,36,0.97) 55%, rgba(14,116,144,0.28) 100%)',
    accent: '#22D3EE',
    ambiance: 'indigo',
  },
];

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pkg-1m', coins: 1_000_000, label: '1 Million Coins', priceInr: 100 },
  {
    id: 'pkg-2m',
    coins: 2_200_000,
    bonusCoins: 200_000,
    label: '2.2 Million Coins',
    priceInr: 200,
    highlight: 'Includes +200K Bonus',
  },
  { id: 'pkg-8m', coins: 8_000_000, label: '8 Million Coins', priceInr: 500, highlight: 'Popular Value' },
  { id: 'pkg-12m', coins: 12_000_000, label: '12 Million Coins', priceInr: 1000 },
  { id: 'pkg-30m', coins: 30_000_000, label: '30 Million Coins', priceInr: 2000, highlight: 'Best Mega Pack' },
];

export const VIP_PLANS: VipPlan[] = [
  {
    id: 'vip-1m',
    name: '1-Month OG VELOCITY VIP',
    durationDays: 30,
    priceInr: 200,
    grantedVipLevel: 5,
    perks: ['Activates VIP Badge + Entry Banner', 'Double Voice Room Task EXP', '+1,000 Bonus VIP Growth'],
  },
  {
    id: 'vip-3m',
    name: '3-Month OG VELOCITY VIP',
    durationDays: 90,
    priceInr: 500,
    grantedVipLevel: 10,
    perks: ['Royal Entrance Effects (VIP2–10)', 'Double Room EXP & Priority Mic', '+3,500 Bonus VIP Growth'],
  },
];

// 20 Rings (1M-20M) + 12 Chat Frames (150K-2M) + 20 Seat Frames (200K-2M) + Voice Room Effects
export const SHOP_ITEMS: ShopItem[] = [
  // 20 Rings (transparent cutouts, 1M to 20M Coins)
  { id: 'ring-1', name: 'Imperial Ruby Crest Ring', category: 'ring', priceCoins: 1_000_000, previewColor: '#F59E0B', description: '24K gold sovereign band crowned with a fiery ruby.', ringNumber: 1 },
  { id: 'ring-2', name: 'Astral Cryo Sapphire Ring', category: 'ring', priceCoins: 2_000_000, previewColor: '#38BDF8', description: 'Frost-forged platinum spiral holding an ocean sapphire.', ringNumber: 2 },
  { id: 'ring-3', name: 'Rose Ember Filigree Ring', category: 'ring', priceCoins: 3_000_000, previewColor: '#FB7185', description: 'Sculpted rose-gold petals encircling a radiant pink diamond.', ringNumber: 3 },
  { id: 'ring-4', name: 'Seraphim Wing Halo Ring', category: 'ring', priceCoins: 4_000_000, previewColor: '#E2E8F0', description: 'Twin silver angel wings cradling a celestial star gem.', ringNumber: 4 },
  { id: 'ring-5', name: 'Flame Trident Monarch Ring', category: 'ring', priceCoins: 5_000_000, previewColor: '#F97316', description: 'Blazing amber-gold crest forged for CP champions.', ringNumber: 5 },
  { id: 'ring-6', name: 'Amethyst Violet Signet Ring', category: 'ring', priceCoins: 6_000_000, previewColor: '#A855F7', description: 'Royal filigree band set with a deep prism amethyst.', ringNumber: 6 },
  { id: 'ring-7', name: 'Solar Sunburst Halo Ring', category: 'ring', priceCoins: 7_000_000, previewColor: '#FBBF24', description: 'Sun-flare gold spokes framing a luminous opal core.', ringNumber: 7 },
  { id: 'ring-8', name: 'Glacier Teardrop Ring', category: 'ring', priceCoins: 8_000_000, previewColor: '#60A5FA', description: 'Refined silver vinework locked with an aquamarine gem.', ringNumber: 8 },
  { id: 'ring-9', name: 'Celestial Compass Ring', category: 'ring', priceCoins: 9_000_000, previewColor: '#FDE68A', description: 'Dual-tone navigator jewel engraved with star runes.', ringNumber: 9 },
  { id: 'ring-10', name: 'Emerald Dragon Claw Ring', category: 'ring', priceCoins: 10_000_000, previewColor: '#10B981', description: 'Golden wyrm talons clutching an imperial emerald.', ringNumber: 10 },
  { id: 'ring-11', name: 'Prism Aurora Diamond Ring', category: 'ring', priceCoins: 11_000_000, previewColor: '#67E8F9', description: 'Rainbow-faceted diamond heart glowing in starlight.', ringNumber: 11 },
  { id: 'ring-12', name: 'Void Singularity Ring', category: 'ring', priceCoins: 12_000_000, previewColor: '#818CF8', description: 'Obsidian-violet astral coils orbiting a cosmic pearl.', ringNumber: 12 },
  { id: 'ring-13', name: 'Sakura Blossom Crown Ring', category: 'ring', priceCoins: 13_000_000, previewColor: '#F472B6', description: 'Enamel cherry-blossom bouquet blooming in 3D gold.', ringNumber: 13 },
  { id: 'ring-14', name: 'Clockwork Magenta Ruby Ring', category: 'ring', priceCoins: 14_000_000, previewColor: '#FB923C', description: 'Precision-cut gear halo centered on a royal magenta stone.', ringNumber: 14 },
  { id: 'ring-15', name: 'Arctic Rune Titanium Ring', category: 'ring', priceCoins: 15_000_000, previewColor: '#38BDF8', description: 'Engraved glacial runes crowned by a midnight cabochon.', ringNumber: 15 },
  { id: 'ring-16', name: 'Phoenix Feather Ruby Ring', category: 'ring', priceCoins: 16_000_000, previewColor: '#EF4444', description: 'Sculpted crimson plumes rising from molten gold.', ringNumber: 16 },
  { id: 'ring-17', name: 'Starlight Lotus Halo Ring', category: 'ring', priceCoins: 17_000_000, previewColor: '#2DD4BF', description: 'Delicate jade lotus petals cradling a star-cut crystal.', ringNumber: 17 },
  { id: 'ring-18', name: 'Royal Lion Sovereign Ring', category: 'ring', priceCoins: 18_000_000, previewColor: '#F59E0B', description: 'Crowned heraldic crest inlaid with golden diamonds.', ringNumber: 18 },
  { id: 'ring-19', name: 'Eternal Twin Heart Ring', category: 'ring', priceCoins: 19_000_000, previewColor: '#EC4899', description: 'Interlocking rose-quartz hearts bound by white gold.', ringNumber: 19 },
  { id: 'ring-20', name: 'OG VELOCITY Mythic Crown Ring', category: 'ring', priceCoins: 20_000_000, previewColor: '#FDE047', description: 'The ultimate 20M Sovereign Ring for eternal CP royalty.', ringNumber: 20 },

  // 12 Chat Frames (transparent cutouts, 150K to 2M Coins)
  { id: 'bubble-1', name: 'Royal Crown Noir Chat Frame', category: 'bubble', priceCoins: 150_000, previewColor: '#FBBF24', description: 'Gilded crown & obsidian velvet banner for Voice Room & DM chats.', chatFrameNumber: 1 },
  { id: 'bubble-2', name: 'Violet Majesty Crown Chat Frame', category: 'bubble', priceCoins: 200_000, previewColor: '#8B5CF6', description: 'Neon indigo-violet beam topped with a crystalline crown.', chatFrameNumber: 2 },
  { id: 'bubble-3', name: 'Crimson Inferno Chat Frame', category: 'bubble', priceCoins: 250_000, previewColor: '#EF4444', description: 'Blazing ruby flame ribbon wrapping your chat messages.', chatFrameNumber: 3 },
  { id: 'bubble-4', name: 'Cyber Cyan Star Chat Frame', category: 'bubble', priceCoins: 300_000, previewColor: '#22D3EE', description: 'Electric ice-cyan wave banner with glowing star accent.', chatFrameNumber: 4 },
  { id: 'bubble-5', name: 'Champagne Gold Star Chat Frame', category: 'bubble', priceCoins: 350_000, previewColor: '#FDE68A', description: 'Creamy champagne-gold ribbon crowned with a golden star.', chatFrameNumber: 5 },
  { id: 'bubble-6', name: 'Amethyst Prism Gem Chat Frame', category: 'bubble', priceCoins: 400_000, previewColor: '#A855F7', description: 'Royal deep-purple silk bar studded with a violet diamond.', chatFrameNumber: 6 },
  { id: 'bubble-7', name: 'Magenta Twin Hearts Chat Frame', category: 'bubble', priceCoins: 500_000, previewColor: '#EC4899', description: 'Vibrant magenta aura banner adorned with twin love hearts.', chatFrameNumber: 7 },
  { id: 'bubble-8', name: 'Pearl Blossom Chat Frame', category: 'bubble', priceCoins: 750_000, previewColor: '#E2E8F0', description: 'Iridescent silver-pearl ribbon accented with white lilies.', chatFrameNumber: 8 },
  { id: 'bubble-9', name: 'Emerald Leaf Breeze Chat Frame', category: 'bubble', priceCoins: 1_000_000, previewColor: '#84CC16', description: 'Fresh forest-emerald nature wave with dewy spring leaves.', chatFrameNumber: 9 },
  { id: 'bubble-10', name: 'Lavender Love Glow Chat Frame', category: 'bubble', priceCoins: 1_250_000, previewColor: '#C084FC', description: 'Dreamy lavender-violet gradient banner with glowing hearts.', chatFrameNumber: 10 },
  { id: 'bubble-11', name: 'Sakura Pink Bloom Chat Frame', category: 'bubble', priceCoins: 1_500_000, previewColor: '#F472B6', description: 'Radiant rose-pink floral frame blooming with cherry blossoms.', chatFrameNumber: 11 },
  { id: 'bubble-12', name: 'Aurora Neon Heart Chat Frame', category: 'bubble', priceCoins: 2_000_000, previewColor: '#2DD4BF', description: 'Teal aurora light stream finished with a neon heart crest.', chatFrameNumber: 12 },

  // 20 Seat Frames (transparent cutouts, 200K to 2M Coins)
  { id: 'frame-1', name: 'Royal Sapphire Crown Frame', category: 'frame', priceCoins: 200_000, previewColor: '#38BDF8', description: 'Blue-winged sovereign crown framing your mic seat & DP.', seatFrameNumber: 1 },
  { id: 'frame-2', name: 'Diamond Ice Crystal Frame', category: 'frame', priceCoins: 300_000, previewColor: '#67E8F9', description: 'Glacial crystalline frost halo crowned with an ice diamond.', seatFrameNumber: 2 },
  { id: 'frame-3', name: 'Crimson Rose Wreath Frame', category: 'frame', priceCoins: 400_000, previewColor: '#EF4444', description: 'Velvet red roses twined around a golden royal wreath.', seatFrameNumber: 3 },
  { id: 'frame-4', name: 'Winged Star Crest Frame', category: 'frame', priceCoins: 500_000, previewColor: '#FBBF24', description: 'Golden laurel & azure wings topped with a champion star.', seatFrameNumber: 4 },
  { id: 'frame-5', name: 'Amethyst Dragon Coil Frame', category: 'frame', priceCoins: 600_000, previewColor: '#A855F7', description: 'Fierce neon-purple cyber dragon coiling around your seat.', seatFrameNumber: 5 },
  { id: 'frame-6', name: 'Sakura Neko Ears Frame', category: 'frame', priceCoins: 700_000, previewColor: '#F472B6', description: 'Playful glowing pink cat ears and paw gems.', seatFrameNumber: 6 },
  { id: 'frame-7', name: 'Solar Flame Dragon Frame', category: 'frame', priceCoins: 800_000, previewColor: '#F97316', description: 'Blazing golden-crimson fire dragon circling your portrait.', seatFrameNumber: 7 },
  { id: 'frame-8', name: 'Azure Morpho Garden Frame', category: 'frame', priceCoins: 900_000, previewColor: '#3B82F6', description: 'Luminous blue butterflies & sakura blossoms on your mic.', seatFrameNumber: 8 },
  { id: 'frame-9', name: 'Seraphic Halo Wings Frame', category: 'frame', priceCoins: 1_000_000, previewColor: '#FDE68A', description: 'White angel wings and golden star halo.', seatFrameNumber: 9 },
  { id: 'frame-10', name: 'Obsidian Ruby Crown Frame', category: 'frame', priceCoins: 1_100_000, previewColor: '#DC2626', description: 'Gothic silver-steel crown encrusted with dark rubies.', seatFrameNumber: 10 },
  { id: 'frame-11', name: 'Bamboo Panda Guardian Frame', category: 'frame', priceCoins: 1_200_000, previewColor: '#4ADE80', description: 'Adorable bamboo panda hugging your voice seat.', seatFrameNumber: 11 },
  { id: 'frame-12', name: 'Valkyrie Wing Crest Frame', category: 'frame', priceCoins: 1_300_000, previewColor: '#9333EA', description: 'Crystal violet valkyrie wings with silver chains.', seatFrameNumber: 12 },
  { id: 'frame-13', name: 'Sovereign Golden Stars Frame', category: 'frame', priceCoins: 1_400_000, previewColor: '#F59E0B', description: 'Radiant constellation of 24K golden stars.', seatFrameNumber: 13 },
  { id: 'frame-14', name: 'Tidal Dolphin Wave Frame', category: 'frame', priceCoins: 1_500_000, previewColor: '#0EA5E9', description: 'Ocean crest wave with a leaping luminous dolphin.', seatFrameNumber: 14 },
  { id: 'frame-15', name: 'Blossom Sakura Ring Frame', category: 'frame', priceCoins: 1_600_000, previewColor: '#EC4899', description: 'Full ring of radiant spring sakura petals.', seatFrameNumber: 15 },
  { id: 'frame-16', name: 'Neon DJ Beats Frame', category: 'frame', priceCoins: 1_700_000, previewColor: '#38BDF8', description: 'Glowing cyber headphones & music equalizer waves.', seatFrameNumber: 16 },
  { id: 'frame-17', name: 'Kitsune Blossom Mask Frame', category: 'frame', priceCoins: 1_800_000, previewColor: '#F43F5E', description: 'Mystic scarlet kitsune spirit mask & camellia flowers.', seatFrameNumber: 17 },
  { id: 'frame-18', name: 'Imperial Lion Laurel Frame', category: 'frame', priceCoins: 1_900_000, previewColor: '#D97706', description: 'Crowned golden lion crest wreathed in victory laurels.', seatFrameNumber: 18 },
  { id: 'frame-19', name: 'Pink Ribbon Heart Frame', category: 'frame', priceCoins: 1_950_000, previewColor: '#F472B6', description: 'Floating heart-shaped pink aura tied with a satin bow.', seatFrameNumber: 19 },
  { id: 'frame-20', name: 'Immortal Phoenix Crest Frame', category: 'frame', priceCoins: 2_000_000, previewColor: '#FBBF24', description: 'Supreme blazing golden phoenix wings for room legends.', seatFrameNumber: 20 },

  // Voice Room Entrance Effects (Flame, Throne, Crab, Car, River, Golden Place)
  { id: 'entry-golden-flame', name: 'Golden Flame Entry', category: 'entry', priceCoins: 80_000, previewColor: '#FBBF24', description: 'Blazing golden flame ribbon with your VIP badge & colored name.', styleVariant: 'flame' },
  { id: 'entry-throne', name: 'Royal Throne Entry', category: 'entry', priceCoins: 140_000, previewColor: '#EF4444', description: 'Grand imperial throne entrance alert across the room.', styleVariant: 'throne' },
  { id: 'entry-car', name: 'Luxury Car Entry', category: 'entry', priceCoins: 180_000, previewColor: '#38BDF8', description: 'Sleek neon supercar streaks across the stage on VIP entry.', styleVariant: 'car' },
  { id: 'entry-river', name: 'Crystal River Entry', category: 'entry', priceCoins: 160_000, previewColor: '#22D3EE', description: 'Shimmering azure river wave banner announces your arrival.', styleVariant: 'river' },
  { id: 'entry-golden-palace', name: 'Golden Place Entry', category: 'entry', priceCoins: 240_000, previewColor: '#FDE047', description: 'Radiant Golden Place archway entrance with royal sparkles.', styleVariant: 'golden-palace' },
  { id: 'entry-crab', name: 'Red Crab Entry', category: 'entry', priceCoins: 110_000, previewColor: '#F97316', description: 'Playful neon coral crab entrance spectacle.', styleVariant: 'crab' },

  // Seat Effects
  { id: 'seatfx-blazing-fire', name: 'Blazing Fire Seat FX', category: 'seat-fx', priceCoins: 95_000, previewColor: '#F97316', description: 'Blazing amber flames pulsing around your active mic seat.' },
  { id: 'seatfx-astral-halo', name: 'Astral Pulse Seat FX', category: 'seat-fx', priceCoins: 130_000, previewColor: '#38BDF8', description: 'Dual cyan harmonic rings radiating as you speak.' },

  // Room Themes
  { id: 'theme-aurora', name: 'Aurora Nebula Theme', category: 'room-theme', priceCoins: 120_000, previewColor: '#38BDF8', description: 'Unlocks luminous northern-lights room stage theme.' },
  { id: 'theme-golden', name: 'Golden Palace Theme', category: 'room-theme', priceCoins: 180_000, previewColor: '#FBBF24', description: 'Imperial gilded room backdrop for level-up celebrations.' },
  { id: 'theme-river', name: 'Crystal River Theme', category: 'room-theme', priceCoins: 150_000, previewColor: '#22D3EE', description: 'Serene flowing river light gradients for your voice room.' },
];

export const BOND_TAGS: BondTag[] = [
  { id: 'brother', label: 'Brother', emoji: '🤝', color: '#38BDF8', requiredGiftCost: 50 },
  { id: 'sister', label: 'Sister', emoji: '🍀', color: '#34D399', requiredGiftCost: 100 },
  { id: 'bestie', label: 'Bestie', emoji: '🎀', color: '#F472B6', requiredGiftCost: 200 },
  { id: 'ace', label: 'Squad Ace', emoji: '⚡', color: '#FBBF24', requiredGiftCost: 520 },
];

export const ROOM_EMOTES: Array<{
  id: string;
  emoteNumber: number;
  label: string;
  symbol: string;
  motion: 'bounce' | 'sway' | 'shake' | 'pulse';
}> = [
  { id: 'em-1', emoteNumber: 1, label: 'Thanks', symbol: '🙏', motion: 'bounce' },
  { id: 'em-2', emoteNumber: 2, label: 'Tears of Joy', symbol: '😂', motion: 'shake' },
  { id: 'em-3', emoteNumber: 3, label: 'Cheer Up', symbol: '🎉', motion: 'sway' },
  { id: 'em-4', emoteNumber: 4, label: 'Kiss', symbol: '😘', motion: 'pulse' },
  { id: 'em-5', emoteNumber: 5, label: 'Love', symbol: '😍', motion: 'pulse' },
  { id: 'em-6', emoteNumber: 6, label: 'DJ', symbol: '🎧', motion: 'bounce' },
  { id: 'em-7', emoteNumber: 7, label: 'Bow', symbol: '🙇', motion: 'sway' },
  { id: 'em-8', emoteNumber: 8, label: 'Confused', symbol: '❓', motion: 'sway' },
  { id: 'em-9', emoteNumber: 9, label: 'Tongue', symbol: '😛', motion: 'bounce' },
  { id: 'em-10', emoteNumber: 10, label: 'Shocked', symbol: '😱', motion: 'shake' },
  { id: 'em-11', emoteNumber: 11, label: 'Sob', symbol: '😭', motion: 'shake' },
  { id: 'em-12', emoteNumber: 12, label: 'Angry', symbol: '😡', motion: 'shake' },
  { id: 'em-13', emoteNumber: 13, label: 'Cool', symbol: '😎', motion: 'sway' },
  { id: 'em-14', emoteNumber: 14, label: 'Wink', symbol: '😉', motion: 'pulse' },
  { id: 'em-15', emoteNumber: 15, label: 'Heart', symbol: '💖', motion: 'pulse' },
  { id: 'em-16', emoteNumber: 16, label: 'Thumbs Up', symbol: '👍', motion: 'bounce' },
  { id: 'em-17', emoteNumber: 17, label: 'Laugh', symbol: '😆', motion: 'bounce' },
  { id: 'em-18', emoteNumber: 18, label: 'Facepalm', symbol: '🤦', motion: 'sway' },
  { id: 'em-19', emoteNumber: 19, label: 'Hug', symbol: '🤗', motion: 'pulse' },
  { id: 'em-20', emoteNumber: 20, label: 'Aww', symbol: '🥰', motion: 'pulse' },
  { id: 'em-21', emoteNumber: 21, label: 'Blow Kiss', symbol: '💋', motion: 'pulse' },
  { id: 'em-22', emoteNumber: 22, label: 'Hurray', symbol: '🙌', motion: 'bounce' },
  { id: 'em-23', emoteNumber: 23, label: 'Furious', symbol: '💢', motion: 'shake' },
  { id: 'em-24', emoteNumber: 24, label: 'Crying', symbol: '😢', motion: 'shake' },
  { id: 'em-25', emoteNumber: 25, label: 'Sleep', symbol: '😴', motion: 'sway' },
  { id: 'em-26', emoteNumber: 26, label: 'Peek', symbol: '👀', motion: 'sway' },
  { id: 'em-27', emoteNumber: 27, label: 'Boss', symbol: '🕶️', motion: 'bounce' },
  { id: 'em-28', emoteNumber: 28, label: 'King', symbol: '👑', motion: 'pulse' },
  { id: 'em-29', emoteNumber: 29, label: 'I Love You', symbol: '💌', motion: 'pulse' },
  { id: 'em-30', emoteNumber: 30, label: 'Rose', symbol: '🌹', motion: 'sway' },
];

export const INITIAL_DAILY_TASKS: DailyTaskItem[] = [
  { id: 'dt-1', title: 'Spend 5 min in a Voice Room (5 EXP / 2x VIP)', rewardCoins: 25_000, progress: 1, target: 1, claimed: false },
  { id: 'dt-2', title: 'Send Gifts in a Voice Room (10 Coins = 1 EXP)', rewardCoins: 35_000, progress: 0, target: 1, claimed: false },
  { id: 'dt-3', title: 'Message a Friend in Chats', rewardCoins: 15_000, progress: 0, target: 1, claimed: false },
];

export const INITIAL_ROOM_TASKS: RoomTaskItem[] = [
  { id: 'rt-play', title: 'Playing Voice Room', rule: '5 Minutes = 5 EXP (Double for VIP, max 5k/50k)', progress: 5, target: 5, rewardExp: 5, vipDouble: true, claimed: false },
  { id: 'rt-gift', title: 'Sending Gifts or Red Packets', rule: '10 Coins = 1 EXP toward Room Level', progress: 0, target: 100, rewardExp: 10, vipDouble: false, claimed: false },
];

export const INITIAL_FRIENDS: FriendRecord[] = [
  { uid: 'ZAY-102941', name: 'Ananya', avatarId: 'av-ananya', status: 'In Voice Room', voiceRoomUid: '10482', bondTag: 'Sister 🍀' },
  { uid: 'ZAY-204118', name: 'Kabir', avatarId: 'av-kabir', status: 'Online', bondTag: 'Brother 🤝' },
  { uid: 'ZAY-448290', name: 'Meera', avatarId: 'av-meera', status: 'In Voice Room', voiceRoomUid: '10001', bondTag: 'Bestie 🎀' },
  { uid: 'ZAY-339104', name: 'Soren', avatarId: 'av-soren', status: 'In Voice Room', voiceRoomUid: '10001' },
];

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    friendUid: 'ZAY-102941',
    friendName: 'Ananya',
    avatarId: 'av-ananya',
    status: 'In Voice Room',
    voiceRoomUid: '10482',
    voiceRoomTitle: 'Saffron Courtyard',
    unread: 2,
    messages: [
      {
        id: 'c1',
        senderId: 'ZAY-102941',
        senderName: 'Ananya',
        text: 'Hey Sabir! I am live in Saffron Courtyard (UID 10482) — tap Join Room above!',
        timestamp: '22:10',
        isSelf: false,
      },
      {
        id: 'c2',
        senderId: 'ZAY-102941',
        senderName: 'Ananya',
        text: 'Create an animated custom gift in Me → Create Gift and try it inside the Voice Room!',
        timestamp: '22:12',
        isSelf: false,
      },
    ],
  },
  {
    friendUid: 'ZAY-204118',
    friendName: 'Kabir',
    avatarId: 'av-kabir',
    status: 'Online',
    unread: 1,
    messages: [
      {
        id: 'c3',
        senderId: 'ZAY-204118',
        senderName: 'Kabir',
        text: 'Check out the Golden Lion Ruby Ring in the Shop — looks awesome!',
        timestamp: '21:54',
        isSelf: false,
      },
    ],
  },
  {
    friendUid: 'ZAY-448290',
    friendName: 'Meera',
    avatarId: 'av-meera',
    status: 'In Voice Room',
    voiceRoomUid: '10001',
    voiceRoomTitle: 'OG VELOCITY Official Arena',
    unread: 0,
    messages: [
      {
        id: 'c4',
        senderId: 'ZAY-448290',
        senderName: 'Meera',
        text: 'I posted a new video moment in Discover and jumped into Official Room 10001!',
        timestamp: '20:40',
        isSelf: false,
      },
    ],
  },
];

export const INITIAL_MOMENTS: MomentPost[] = [
  {
    id: 'mom-1',
    authorUid: 'ZAY-102941',
    authorName: 'Ananya',
    avatarId: 'av-ananya',
    mediaType: 'photo',
    mediaTitle: 'Midnight Voice Stage Glow',
    caption: 'Saffron Courtyard hit 48 listeners tonight! Unlocked our new Room Level crest.',
    mediaGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 45%, #0f172a 100%)',
    timestamp: '14m ago',
    likes: 42,
    liked: false,
  },
  {
    id: 'mom-2',
    authorUid: 'ZAY-448290',
    authorName: 'Meera',
    avatarId: 'av-meera',
    mediaType: 'video',
    mediaTitle: 'Phoenix Gift Rain Clip (0:24)',
    caption: 'Look at that Cosmic Phoenix particle animation when Kabir sent a 80k Phoenix!',
    mediaGradient: 'linear-gradient(135deg, #4c0519 0%, #9f1239 45%, #1e1b4b 100%)',
    timestamp: '1h ago',
    likes: 89,
    liked: true,
  },
  {
    id: 'mom-3',
    authorUid: 'ZAY-204118',
    authorName: 'Kabir',
    avatarId: 'av-kabir',
    mediaType: 'photo',
    mediaTitle: 'New VIP 5 Winged Shield',
    caption: 'Crossed 45,000 VIP Growth points today and equipped the Rose Sceptre frame!',
    mediaGradient: 'linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #090b12 100%)',
    timestamp: '3h ago',
    likes: 64,
    liked: false,
  },
  {
    id: 'mom-4',
    authorUid: 'ZAY-339104',
    authorName: 'Soren',
    avatarId: 'av-soren',
    mediaType: 'video',
    mediaTitle: 'YouTube Watch Room Lo-Fi Live (0:45)',
    caption: 'Chilling in the YouTube Room listening to synthwave & vibing with the squad.',
    mediaGradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #090b12 100%)',
    timestamp: '5h ago',
    likes: 53,
    liked: false,
  },
];

export const GUARD_LEADERBOARD: GuardLeader[] = [
  { rank: 1, name: 'Soren', uid: 'ZAY-339104', avatarId: 'av-soren', guardPoints: 482_500, vipLevel: 15 },
  { rank: 2, name: 'Ananya', uid: 'ZAY-102941', avatarId: 'av-ananya', guardPoints: 365_200, vipLevel: 11 },
  { rank: 3, name: 'Meera', uid: 'ZAY-448290', avatarId: 'av-meera', guardPoints: 294_800, vipLevel: 9 },
  { rank: 4, name: 'Kabir', uid: 'ZAY-204118', avatarId: 'av-kabir', guardPoints: 184_100, vipLevel: 6 },
  { rank: 5, name: 'Devon', uid: 'ZAY-551923', avatarId: 'av-devon', guardPoints: 129_400, vipLevel: 5 },
  { rank: 6, name: 'Tara', uid: 'ZAY-662019', avatarId: 'av-tara', guardPoints: 96_300, vipLevel: 4 },
];

export const INITIAL_INTIMATE_SPACE: IntimateSpaceData = {
  partnerName: 'Ananya',
  partnerAvatarId: 'av-ananya',
  togetherDays: 156,
  relationType: 'BFF',
  level: 3,
  progress: 4_620,
  target: 8_000,
  bffTokenName: 'Yellow Scooter Token',
};

// All built-in gifts removed per user request — only user-created & approved custom gifts appear
export const VIRTUAL_GIFTS: VirtualGift[] = [];

function buildSeats(
  count: number,
  presets: Array<{
    idx: number;
    occupant: AvatarConfig;
    role: VoiceSeat['role'];
    score: number;
    charm?: number;
    vip?: number;
    tag?: string;
    seatEffect?: string;
  }>
): VoiceSeat[] {
  return Array.from({ length: count }, (_, idx) => {
    const found = presets.find((p) => p.idx === idx);
    if (found) {
      return {
        seatIndex: idx,
        occupant: found.occupant,
        role: found.role,
        isMuted: false,
        isLocked: false,
        isSpeaking: idx === 0,
        audioLevel: idx === 0 ? 0.65 : 0.14,
        giftScore: found.score,
        charmValue: found.charm ?? Math.round(found.score / 5),
        vipLevel: found.vip ?? 1,
        bondTag: found.tag,
        seatEffect: found.seatEffect,
      };
    }
    return {
      seatIndex: idx,
      occupant: null,
      role: 'empty',
      isMuted: false,
      isLocked: false,
      isSpeaking: false,
      audioLevel: 0,
      giftScore: 0,
    };
  });
}

export const INITIAL_ROOMS: VoiceRoom[] = [
  {
    id: 'room-saffron',
    uid: '10482',
    title: 'Saffron Courtyard',
    topic: '10-Seat Lounge (2 Top + 8 Bottom) · Chill talk & gifting',
    category: 'Popular',
    tags: ['Chill', 'Chats'],
    hostName: USER_PROFILE.name,
    ownerUid: USER_PROFILE.uid,
    adminUids: [AVATAR_ROSTER[0].uid, AVATAR_ROSTER[1].uid],
    memberUids: [USER_PROFILE.uid, AVATAR_ROSTER[0].uid, AVATAR_ROSTER[1].uid],
    isOfficial: false,
    roomType: 'voice',
    level: 1,
    xp: 2_400,
    listenerCount: 48,
    ambiance: 'saffron',
    bgThemeId: 'bg-saffron',
    coinsSpentByUid: {
      [AVATAR_ROSTER[0].uid]: 33_000,
      [AVATAR_ROSTER[1].uid]: 29_000,
      [AVATAR_ROSTER[3].uid]: 19_300,
      [AVATAR_ROSTER[2].uid]: 15_000,
    },
    seats: buildSeats(10, [
      { idx: 1, occupant: AVATAR_ROSTER[0], role: 'admin', score: 940, charm: 48_200, vip: 5, tag: 'Sister 🍀' },
      { idx: 2, occupant: AVATAR_ROSTER[1], role: 'admin', score: 680, charm: 16_400, vip: 3, tag: 'Brother 🤝' },
      { idx: 3, occupant: AVATAR_ROSTER[3], role: 'speaker', score: 490, charm: 24_200, vip: 4, tag: 'Bestie 🎀' },
      { idx: 4, occupant: AVATAR_ROSTER[2], role: 'speaker', score: 310, charm: 7_110, vip: 2 },
    ]),
    listeners: [
      { uid: AVATAR_ROSTER[4].uid, name: AVATAR_ROSTER[4].name, avatarId: AVATAR_ROSTER[4].id, vipLevel: 5, charm: 129_400 },
      { uid: AVATAR_ROSTER[5].uid, name: AVATAR_ROSTER[5].name, avatarId: AVATAR_ROSTER[5].id, vipLevel: 4, charm: 96_300 },
    ],
    micRequests: [],
    messages: [
      {
        id: 'm1',
        senderName: 'System',
        senderColor: '#F59E0B',
        text: 'Room UID 10482 · Level 1 (3 Admin Slots). Tap any user ID to Mute or Add Friend.',
        timestamp: '22:48',
        kind: 'system',
      },
      {
        id: 'm2',
        senderUid: AVATAR_ROSTER[0].uid,
        senderName: 'Ananya',
        senderColor: '#FBBF24',
        text: 'Tap Speaker Audio at the bottom to hear live room voices!',
        timestamp: '22:49',
        kind: 'chat',
      },
    ],
  },
  {
    id: 'room-official',
    uid: '10001',
    title: 'OG VELOCITY Official Arena',
    topic: 'Official 15-Seat Sanctuary · VIP Lounge & Live Audio Hosts',
    category: 'Popular',
    tags: ['Official', 'PK'],
    hostName: 'Soren',
    ownerUid: AVATAR_ROSTER[2].uid,
    adminUids: [USER_PROFILE.uid, AVATAR_ROSTER[0].uid, AVATAR_ROSTER[4].uid],
    memberUids: [AVATAR_ROSTER[2].uid, USER_PROFILE.uid],
    isOfficial: true,
    roomType: 'voice',
    level: 12,
    xp: 640_000,
    listenerCount: 215,
    ambiance: 'indigo',
    bgThemeId: 'bg-aurora',
    coinsSpentByUid: {
      [AVATAR_ROSTER[2].uid]: 240_000,
      [AVATAR_ROSTER[0].uid]: 165_000,
      [AVATAR_ROSTER[4].uid]: 98_500,
      [AVATAR_ROSTER[3].uid]: 44_000,
      [USER_PROFILE.uid]: 12_000,
    },
    seats: buildSeats(15, [
      { idx: 0, occupant: AVATAR_ROSTER[2], role: 'owner', score: 14_400, charm: 1_380_000, vip: 16, seatEffect: 'Blazing Fire' },
      { idx: 1, occupant: AVATAR_ROSTER[0], role: 'admin', score: 9_100, charm: 340_400, vip: 11 },
      { idx: 2, occupant: AVATAR_ROSTER[4], role: 'admin', score: 7_750, charm: 194_200, vip: 9 },
      { idx: 3, occupant: AVATAR_ROSTER[1], role: 'speaker', score: 2_980, charm: 61_650, vip: 6 },
      { idx: 4, occupant: AVATAR_ROSTER[3], role: 'speaker', score: 3_120, charm: 81_900, vip: 7 },
      { idx: 5, occupant: AVATAR_ROSTER[5], role: 'speaker', score: 1_860, charm: 29_920, vip: 4 },
    ]),
    listeners: [
      { uid: AVATAR_ROSTER[5].uid, name: AVATAR_ROSTER[5].name, avatarId: AVATAR_ROSTER[5].id, vipLevel: 4, charm: 29_920 },
    ],
    micRequests: [],
    messages: [
      {
        id: 'm-off-1',
        senderName: 'System',
        senderColor: '#38BDF8',
        text: 'Official 15-Seat Room UID 10001 · Level 12 (10 Admin Slots unlocked).',
        timestamp: '22:45',
        kind: 'system',
      },
    ],
  },
  {
    id: 'room-river',
    uid: '20540',
    title: 'Crystal River Lounge',
    topic: '10-Seat Hangout · Golden conversations & VIP gifting',
    category: 'Music',
    tags: ['River', 'Chill'],
    hostName: 'Devon',
    ownerUid: AVATAR_ROSTER[4].uid,
    adminUids: [AVATAR_ROSTER[5].uid],
    memberUids: [AVATAR_ROSTER[4].uid, AVATAR_ROSTER[5].uid],
    isOfficial: false,
    roomType: 'voice',
    level: 5,
    xp: 120_000,
    listenerCount: 74,
    ambiance: 'emerald',
    bgThemeId: 'bg-river',
    coinsSpentByUid: {
      [AVATAR_ROSTER[4].uid]: 74_200,
      [AVATAR_ROSTER[5].uid]: 51_800,
      [AVATAR_ROSTER[1].uid]: 18_400,
    },
    seats: buildSeats(10, [
      { idx: 0, occupant: AVATAR_ROSTER[4], role: 'owner', score: 2_290, charm: 115_550, vip: 8 },
      { idx: 1, occupant: AVATAR_ROSTER[5], role: 'admin', score: 1_710, charm: 48_840, vip: 4 },
      { idx: 2, occupant: AVATAR_ROSTER[1], role: 'speaker', score: 620, charm: 16_310, vip: 2 },
    ]),
    listeners: [
      { uid: AVATAR_ROSTER[0].uid, name: AVATAR_ROSTER[0].name, avatarId: AVATAR_ROSTER[0].id, vipLevel: 5, charm: 48_200 },
    ],
    micRequests: [],
    messages: [
      {
        id: 'm-yt-1',
        senderName: 'System',
        senderColor: '#34D399',
        text: 'Crystal River Lounge UID 20540 · Tap Join next to the room name to become a member!',
        timestamp: '22:46',
        kind: 'system',
      },
    ],
  },
  {
    id: 'room-midnight',
    uid: '30888',
    title: 'Teenagers & Midnight Chat',
    topic: '10-Seat Hangout · Open mic stories & Late Night Lounge',
    category: 'Teenagers',
    tags: ['Teenagers', 'Chats'],
    hostName: 'Meera',
    ownerUid: AVATAR_ROSTER[3].uid,
    adminUids: [AVATAR_ROSTER[0].uid],
    memberUids: [AVATAR_ROSTER[3].uid, AVATAR_ROSTER[0].uid],
    isOfficial: false,
    roomType: 'voice',
    level: 8,
    xp: 310_000,
    listenerCount: 92,
    ambiance: 'crimson',
    bgThemeId: 'bg-crimson',
    coinsSpentByUid: {
      [AVATAR_ROSTER[3].uid]: 89_000,
      [AVATAR_ROSTER[0].uid]: 64_500,
      [AVATAR_ROSTER[1].uid]: 27_900,
      [AVATAR_ROSTER[4].uid]: 11_200,
    },
    seats: buildSeats(10, [
      { idx: 0, occupant: AVATAR_ROSTER[3], role: 'owner', score: 5_150, charm: 514_800, vip: 10, tag: 'Bestie 🎀' },
      { idx: 1, occupant: AVATAR_ROSTER[0], role: 'admin', score: 2_120, charm: 101_900, vip: 6, tag: 'Sister 🍀' },
      { idx: 2, occupant: AVATAR_ROSTER[1], role: 'speaker', score: 1_890, charm: 41_120, vip: 4, tag: 'Brother 🤝' },
      { idx: 3, occupant: AVATAR_ROSTER[4], role: 'speaker', score: 610, charm: 15_450, vip: 3 },
    ]),
    listeners: [
      { uid: AVATAR_ROSTER[2].uid, name: AVATAR_ROSTER[2].name, avatarId: AVATAR_ROSTER[2].id, vipLevel: 16, charm: 1_380_000 },
    ],
    micRequests: [],
    messages: [
      {
        id: 'm-mid-1',
        senderName: 'System',
        senderColor: '#FB7185',
        text: 'Midnight Chat UID 30888 · Tap any empty seat to join the mic!',
        timestamp: '22:47',
        kind: 'system',
      },
    ],
  },
];
