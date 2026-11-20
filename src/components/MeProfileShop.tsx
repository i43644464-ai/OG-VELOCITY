import React, { useState } from 'react';
import {
  Award,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Edit3,
  Eye,
  FileText,
  Gamepad2,
  Gem,
  Gift,
  Heart,
  Image,
  Lock,
  Mic,
  MoreVertical,
  Plus,
  QrCode,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Upload,
  User,
  Video,
  Wand2,
  XCircle,
} from 'lucide-react';
import {
  AVATAR_ROSTER,
  CHARM_LEVELS,
  COIN_PACKAGES,
  CP_LEVELS,
  ROOM_LEVEL_INFO,
  SHOP_ITEMS,
  VIP_PLANS,
  VIP_TIERS,
  getCharmLevelInfo,
  getCountryFlag,
  getCpLevelInfo,
  getGenderSymbol,
  getVipNameStyle,
  getVipTierByGrowth,
} from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import { GiftArtwork } from '../graphics/GiftArtwork';
import {
  CharmBadgeArt,
  CharmBadgePill,
  ChatFrameSpriteArt,
  RingSpriteArt,
  RoomLevelBadgeArt,
  SeatFrameSpriteArt,
  VipBadgeArt,
  ZayroCoinArt,
} from '../graphics/SpriteArtwork';
import type {
  AvatarConfig,
  CpRequest,
  CustomGiftSubmission,
  FriendRecord,
  MomentPost,
  PublicUserProfile,
  ShopCategory,
  ShopItem,
  VirtualGift,
  VoiceRoom,
} from '../types';
import { soundFx } from '../utils/soundFx';

export type MeViewMode =
  | 'profile'
  | 'shop'
  | 'vip'
  | 'charm'
  | 'badges'
  | 'edit'
  | 'moments'
  | 'gifts'
  | 'visitors'
  | 'cp'
  | 'create-gift'
  | 'privacy';

interface MeProfileShopProps {
  userProfile: AvatarConfig;
  coins: number;
  charm: number;
  vipGrowth: number;
  vipLevel: number;
  vipLabel: string | null;
  ownedItemIds: string[];
  equippedItems: Partial<Record<ShopCategory, string>>;
  moments: MomentPost[];
  rooms: VoiceRoom[];
  friends?: FriendRecord[];
  cpRequests?: CpRequest[];
  customGifts?: CustomGiftSubmission[];
  receivedGiftIds: string[];
  customQrUrl: string | null;
  defaultTab?: MeViewMode;
  giftAnimationsEnabled?: boolean;
  onToggleGiftAnimations?: () => void;
  onUpdateProfile: (updates: Partial<AvatarConfig>) => void;
  onBuyCoins: (amount: number, priceInr: number) => void;
  onBuyVip: (
    planName: string,
    priceInr: number,
    grantedVipLevel: number,
    bonusGrowth: number
  ) => void;
  onBuyShopItem: (item: ShopItem) => void;
  onEquipShopItem: (item: ShopItem) => void;
  onUploadQrCode: (dataUrl: string) => void;
  onJoinRoom: (roomId: string) => void;
  onInspectUser?: (profile: PublicUserProfile) => void;
  onProposeCp?: (
    toUid: string,
    toName: string,
    toAvatarId: string,
    ringNumber: number,
    ringName: string
  ) => void;
  onRespondCpRequest?: (requestId: string, accept: boolean) => void;
  onBreakCp?: () => void;
  onSubmitCustomGift?: (
    submission: Omit<CustomGiftSubmission, 'id' | 'creatorUid' | 'creatorName' | 'status' | 'submittedAt'>
  ) => void;
  onReviewCustomGift?: (giftId: string, status: 'approved' | 'rejected', reviewNote?: string) => void;
}

const ORNAMENTS: AvatarConfig['ornament'][] = [
  'crown',
  'lotus',
  'halo',
  'visor',
  'crescent',
  'flame',
];

export const MeProfileShop: React.FC<MeProfileShopProps> = ({
  userProfile,
  coins,
  charm,
  vipGrowth,
  vipLevel,
  vipLabel,
  ownedItemIds,
  equippedItems,
  moments,
  rooms,
  friends = [],
  cpRequests = [],
  customGifts = [],
  receivedGiftIds,
  customQrUrl,
  defaultTab = 'profile',
  giftAnimationsEnabled = true,
  onToggleGiftAnimations,
  onUpdateProfile,
  onBuyCoins,
  onBuyVip,
  onBuyShopItem,
  onEquipShopItem,
  onUploadQrCode,
  onJoinRoom,
  onInspectUser,
  onProposeCp,
  onRespondCpRequest,
  onBreakCp,
  onSubmitCustomGift,
  onReviewCustomGift,
}) => {
  const [activeView, setActiveView] = useState<MeViewMode>(defaultTab);
  const [shopCategory, setShopCategory] = useState<
    'ring' | 'decorations' | 'voice' | 'items' | 'all'
  >('ring');
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [handleInput, setHandleInput] = useState(userProfile.handle.replace(/^@/, ''));
  const [bioInput, setBioInput] = useState((userProfile.bio || '').slice(0, 100));
  const [genderInput, setGenderInput] = useState<'Male' | 'Female' | 'Other'>(
    userProfile.gender || 'Male'
  );
  const [ageInput, setAgeInput] = useState<number>(userProfile.age ?? 21);
  const [countryInput, setCountryInput] = useState<string>(userProfile.country || 'India');
  const [tagsInput, setTagsInput] = useState<string[]>(userProfile.tags ?? []);
  const [newTagDraft, setNewTagDraft] = useState('');
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [emailInput, setEmailInput] = useState(userProfile.email || '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [showCpPartnerId, setShowCpPartnerId] = useState(false);
  const [cpTargetUid, setCpTargetUid] = useState(friends[0]?.uid || AVATAR_ROSTER[0].uid);
  const [cpRingNumber, setCpRingNumber] = useState(1);
  const [copiedPartnerId, setCopiedPartnerId] = useState(false);
  const [ornamentInput, setOrnamentInput] = useState<AvatarConfig['ornament']>(
    userProfile.ornament
  );
  const [language, setLanguage] = useState('English');
  const [parentalMode, setParentalMode] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [selectedVipPreview] = useState<number>(Math.max(2, vipLevel));
  const [coverIndex, setCoverIndex] = useState(0);

  // Create Gift Studio state
  const [cgName, setCgName] = useState('');
  const [cgCost, setCgCost] = useState(500);
  const [cgCharm, setCgCharm] = useState(500);
  const [cgDesc, setCgDesc] = useState('Custom sanctuary gift forged with starlight');
  const [cgPrimary, setCgPrimary] = useState('#22D3EE');
  const [cgSecondary, setCgSecondary] = useState('#FBBF24');
  const [cgParticle, setCgParticle] = useState<VirtualGift['particleStyle']>('heart');
  const [cgArtworkUrl, setCgArtworkUrl] = useState<string | undefined>(undefined);
  const [cgVideoUrl, setCgVideoUrl] = useState<string | undefined>(undefined);
  const [cgVideoName, setCgVideoName] = useState('');
  const [cgRejectNotes, setCgRejectNotes] = useState<Record<string, string>>({});

  const COVER_GRADIENTS = [
    'radial-gradient(circle at 50% 35%, rgba(34,211,238,0.22), transparent 55%), linear-gradient(180deg, #070B14 0%, #0D1526 72%, #0A101D 100%)',
    'radial-gradient(circle at 25% 30%, rgba(20,184,166,0.34), transparent 55%), linear-gradient(155deg, #081A2E 0%, #0D1526 70%, #070B14 100%)',
    'radial-gradient(circle at 75% 25%, rgba(244,63,94,0.26), transparent 55%), linear-gradient(155deg, #16182E 0%, #0D1526 70%, #070B14 100%)',
  ];

  const openCpPartnerProfile = () => {
    if (!userProfile.cpPartner || !onInspectUser) return;
    const cp = userProfile.cpPartner;
    const baseAv =
      AVATAR_ROSTER.find((a) => a.uid === cp.partnerUid || a.id === cp.partnerAvatarId) ??
      AVATAR_ROSTER[0];
    onInspectUser({
      avatar: {
        ...baseAv,
        id: cp.partnerAvatarId || baseAv.id,
        uid: cp.partnerUid,
        name: cp.partnerName,
        cpPartner: {
          partnerUid: userProfile.uid,
          partnerName: userProfile.name,
          partnerAvatarId: userProfile.id,
          ringNumber: cp.ringNumber,
          ringName: cp.ringName,
          since: cp.since,
          cpCharm: cp.cpCharm,
        },
      },
      vipLevel: 7,
      charm: Math.max(120_000, cp.cpCharm ?? 0),
      cpPartner: {
        partnerUid: userProfile.uid,
        partnerName: userProfile.name,
        partnerAvatarId: userProfile.id,
        ringNumber: cp.ringNumber,
        ringName: cp.ringName,
        since: cp.since,
        cpCharm: cp.cpCharm,
      },
      ringNumber: cp.ringNumber,
    });
  };

  const { current: charmInfo, next: nextCharmInfo } = getCharmLevelInfo(charm);
  const { current: growthVipTier, next: nextVipTier } = getVipTierByGrowth(vipGrowth);
  const effectiveVipLevel = Math.min(18, Math.max(vipLevel, growthVipTier.level));
  const equippedRing = SHOP_ITEMS.find((i) => i.id === equippedItems.ring);
  const equippedFrame = SHOP_ITEMS.find((i) => i.id === equippedItems.frame);
  const ringCatalog = SHOP_ITEMS.filter((i) => i.category === 'ring');
  const ownedRings = ringCatalog.filter((r) => ownedItemIds.includes(r.id));
  const selectedOwnedRing =
    ownedRings.find((r) => r.ringNumber === cpRingNumber) ?? ownedRings[0];

  const formattedCharm =
    charm >= 1_000_000
      ? `${(charm / 1_000_000).toFixed(1)}M`
      : charm.toLocaleString();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@+/, '');
    onUpdateProfile({
      name: nameInput.trim() || userProfile.name,
      handle: cleanHandle ? `@${cleanHandle}` : userProfile.handle,
      bio: bioInput.trim().slice(0, 100),
      gender: genderInput,
      age: Number.isFinite(ageInput) ? Math.max(13, Math.min(99, ageInput)) : 21,
      country: countryInput,
      tags: tagsInput.slice(0, 5),
      email: emailInput.trim(),
      ornament: ornamentInput,
    });
    setEditingEmail(false);
    setSavedBanner(true);
    soundFx.playVictory();
    window.setTimeout(() => setSavedBanner(false), 2200);
  };

  const handleAvatarPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({ photoUrl: reader.result });
        setPurchaseNotice('Profile photo updated!');
        soundFx.playVictory();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({ coverUrl: reader.result });
        setPurchaseNotice('Profile cover photo updated!');
        soundFx.playVictory();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadQrCode(reader.result);
        setPurchaseNotice('Custom Payment QR Code updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const visibleShopItems = (
    shopCategory === 'all'
      ? SHOP_ITEMS
      : shopCategory === 'ring'
        ? SHOP_ITEMS.filter((i) => i.category === 'ring')
        : shopCategory === 'decorations'
          ? SHOP_ITEMS.filter((i) => i.category === 'frame' || i.category === 'bubble')
          : shopCategory === 'voice'
            ? SHOP_ITEMS.filter(
                (i) =>
                  i.category === 'entry' ||
                  i.category === 'seat-fx' ||
                  i.category === 'room-theme'
              )
            : SHOP_ITEMS.filter((i) => i.category === 'bubble' || i.category === 'seat-fx')
  )
    .slice()
    .sort((a, b) => (a.ringNumber ?? 999) - (b.ringNumber ?? 999));

  const ownTags = ['Bro 🤝', 'Sister 🍀', 'Bestie 🎀'];
  const previewVipInfo = VIP_TIERS.find((v) => v.level === selectedVipPreview) ?? VIP_TIERS[1];

  return (
    <div className="space-y-5">
      {/* Sub-view Back Header (hidden on Shop & Edit Profile which have dedicated headers) */}
      {activeView !== 'profile' && activeView !== 'shop' && activeView !== 'edit' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-[#0D1526] px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveView('profile')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </button>

          <div className="flex items-center gap-2 font-mono-tabular text-xs font-bold text-amber-300">
            <ZayroCoinArt size={18} />
            <span>{coins.toLocaleString()} Coins</span>
          </div>
        </div>
      )}

      {purchaseNotice && (
        <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-3 text-xs font-semibold text-emerald-200">
          {purchaseNotice}
        </div>
      )}

      {/* Default Profile Hub */}
      {activeView === 'profile' && (() => {
        const myCpCharm = userProfile.cpPartner?.cpCharm ?? 0;
        const myCpLvl = getCpLevelInfo(myCpCharm);
        const myBlessing = userProfile.blessing ?? Math.max(120, Math.round(charm / 40));
        const cpPartnerAv = userProfile.cpPartner
          ? AVATAR_ROSTER.find(
              (a) =>
                a.uid === userProfile.cpPartner?.partnerUid ||
                a.id === userProfile.cpPartner?.partnerAvatarId
            ) ?? userProfile
          : userProfile;
        return (
        <div className="space-y-5">
          {/* Top Cover Banner */}
          <section className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#0D1526]">
            <div
              className="relative h-48 w-full bg-cover bg-center"
              style={
                userProfile.coverUrl
                  ? { backgroundImage: `linear-gradient(to bottom, rgba(7,11,20,0.22), rgba(7,11,20,0.78)), url(${userProfile.coverUrl})` }
                  : { background: COVER_GRADIENTS[coverIndex % COVER_GRADIENTS.length] }
              }
            >
              <div className="flex items-center justify-between px-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveView('edit')}
                  aria-label="Edit Profile"
                  className="flex h-10 items-center gap-1.5 rounded-full bg-black/45 px-3.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/65"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <div className="flex items-center gap-2">
                  <label
                    title="Upload Cover Photo"
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-black/50 px-3 text-[11px] font-semibold text-white backdrop-blur-sm hover:bg-black/75"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCoverIndex((c) => c + 1)}
                    title="Cycle Cover Theme"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('privacy')}
                    aria-label="Settings & Privacy"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    <MoreVertical className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Compact Frosted Rose-Gold Blessing + Ring + CP Partner Pill */}
              <button
                type="button"
                onClick={() => {
                  if (userProfile.cpPartner) {
                    if (onInspectUser) {
                      openCpPartnerProfile();
                    } else {
                      setShowCpPartnerId((v) => !v);
                    }
                  } else {
                    setShopCategory('ring');
                    setActiveView('shop');
                  }
                }}
                className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 rounded-full border border-rose-300/35 bg-gradient-to-r from-[#4B1A2F]/90 via-[#5D223D]/90 to-[#3D1628]/90 py-1 pr-1 pl-2 shadow-[0_4px_16px_rgba(244,63,94,0.28)] backdrop-blur-md transition-transform hover:scale-[1.02]"
                title={userProfile.cpPartner ? `Open ${userProfile.cpPartner.partnerName}'s Profile` : 'Open Ring Shop'}
              >
                <RingSpriteArt
                  ringNumber={userProfile.cpPartner?.ringNumber ?? equippedRing?.ringNumber ?? 1}
                  size={28}
                  alt="Equipped Ring"
                />
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-rose-100">
                    <Heart className="h-2 w-2 fill-white text-white" />
                    <span>{userProfile.cpPartner ? 'CP Partner' : 'Blessing'}</span>
                  </div>
                  <div className="flex items-center gap-0.5 font-mono-tabular text-xs font-extrabold text-white">
                    <span>{myBlessing.toLocaleString()}</span>
                    <Heart className="h-2 w-2 fill-rose-200 text-rose-200" />
                  </div>
                </div>
                <div className="overflow-hidden rounded-full border border-white/40">
                  <AvatarArt avatar={cpPartnerAv} size={26} />
                </div>
              </button>
            </div>

            <div className="px-5 pb-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="relative -mt-12 inline-block">
                  <div
                    className="rounded-full border-2 border-white/25 bg-[#0D1526] p-0.5"
                    style={
                      equippedFrame && !equippedItems.frame?.startsWith('frame-fire') && !equippedItems.frame?.startsWith('frame-ice') && !equippedItems.frame?.startsWith('frame-flower') && !equippedItems.frame?.startsWith('frame-chair') && !equippedItems.frame?.startsWith('frame-room')
                        ? { boxShadow: `0 0 18px ${equippedFrame.previewColor}` }
                        : undefined
                    }
                  >
                    <AvatarArt
                      avatar={userProfile}
                      size={82}
                      frameId={equippedItems.frame}
                    />
                  </div>
                  <label
                    title="Upload Real Profile Photo"
                    aria-label="Upload Real Profile Photo"
                    className="absolute right-0.5 bottom-0.5 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#0D1526] bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView('vip')}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-[#132038] px-4 py-2 font-mono-tabular text-xs font-bold text-amber-300 hover:border-amber-400/60"
                >
                  <ZayroCoinArt size={18} />
                  <span>{coins.toLocaleString()}</span>
                </button>
              </div>

              {/* Bold VIP-Colored Name + VIP Badge beside name (matching IMG_20261119_144826) */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <h1
                  className="font-display text-2xl font-black tracking-tight"
                  style={getVipNameStyle(effectiveVipLevel)}
                >
                  {userProfile.name}
                </h1>
                <VipBadgeArt level={effectiveVipLevel} size={30} />
              </div>

              {/* Metadata Row matching reference: ♂️ 21  🇮🇳 India • Online */}
              <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1 text-sky-300">
                  <span>{getGenderSymbol(userProfile.gender)}</span>
                  <span className="font-mono-tabular text-slate-200">{userProfile.age ?? 21}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-200">
                  <span>{getCountryFlag(userProfile.country)}</span>
                  <span>{userProfile.country || 'India'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{hideOnlineStatus ? 'Hidden' : 'Online'}</span>
                </span>
                <span className="inline-flex items-center gap-1 font-mono-tabular text-slate-400">
                  <Lock className="h-3 w-3 text-amber-300" />
                  {userProfile.uid}
                </span>
              </div>

              {/* Charm Badge Pill + VIP Center + CP Level + All Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('charm')}
                  className="inline-flex items-center transition-transform hover:scale-105"
                  title={`Charm Lv.${charmInfo.level} · ${charm.toLocaleString()}`}
                >
                  <CharmBadgePill level={charmInfo.level} charm={charm} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('vip')}
                  className="inline-flex items-center gap-2 rounded-full bg-[#132038] px-3 py-1 text-xs font-bold text-amber-300"
                >
                  <VipBadgeArt level={effectiveVipLevel} size={22} />
                  <span style={effectiveVipLevel >= 12 ? getVipNameStyle(effectiveVipLevel) : undefined}>
                    {vipLabel || `VIP ${effectiveVipLevel}`}
                  </span>
                </button>

                {userProfile.cpPartner ? (
                  <button
                    type="button"
                    onClick={() => setShowCpPartnerId((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/50 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500/30"
                    title="Click CP to view Partner ID & Level"
                  >
                    <Heart className="h-2.5 w-2.5 fill-rose-400 text-rose-400" />
                    <span>
                      CP Lv.{myCpLvl.level} · {userProfile.cpPartner.partnerName}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveView('cp')}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/35 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500/20"
                  >
                    <Heart className="h-2.5 w-2.5 text-rose-300" />
                    <span>CP ({cpRequests.filter((r) => r.status === 'pending').length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveView('badges')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-[#132038] px-3 py-1 text-xs font-bold text-cyan-200 hover:border-cyan-400/65"
                >
                  <Award className="h-3.5 w-3.5 text-amber-300" />
                  <span>All Badges</span>
                </button>
              </div>

              {/* Clicking CP reveals Partner ID, Profile shortcut & CP Level Progress */}
              {userProfile.cpPartner && showCpPartnerId && (
                <div className="mt-3 space-y-2 rounded-2xl border border-rose-400/40 bg-gradient-to-r from-[#2D1426]/90 to-[#0B1A2E]/90 px-3.5 py-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={openCpPartnerProfile}
                      className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-85"
                    >
                      <RingSpriteArt
                        ringNumber={userProfile.cpPartner.ringNumber}
                        size={34}
                        alt={userProfile.cpPartner.ringName}
                      />
                      <div>
                        <div className="font-bold text-rose-200">
                          CP Lv.{myCpLvl.level} ({myCpLvl.title}) · {userProfile.cpPartner.partnerName}
                        </div>
                        <div className="font-mono-tabular text-[11px] font-bold text-white">
                          Partner ID: {userProfile.cpPartner.partnerUid}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {onInspectUser && (
                        <button
                          type="button"
                          onClick={openCpPartnerProfile}
                          className="rounded-xl bg-cyan-500 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-cyan-400"
                        >
                          View Profile
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(userProfile.cpPartner!.partnerUid).catch(() => {});
                          setCopiedPartnerId(true);
                          window.setTimeout(() => setCopiedPartnerId(false), 1800);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/25 px-2.5 py-1.5 text-[11px] font-bold text-rose-100 hover:bg-rose-500/40"
                      >
                        {copiedPartnerId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedPartnerId ? 'Copied' : 'Copy ID'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveView('cp')}
                        className="rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-white/20"
                      >
                        Manage CP
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono-tabular text-[10px] text-rose-200">
                      <span>{myCpCharm.toLocaleString()} CP Charms</span>
                      <span>
                        {myCpLvl.nextMin !== null
                          ? `Need ${myCpLvl.stepRemaining.toLocaleString()} for Lv.${myCpLvl.level + 1}`
                          : 'Max CP Level'}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-300"
                        style={{ width: `${myCpLvl.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 4-Icon Quick Card Row: CP Life, Avatar, Shop, VIP Center */}
          <section className="grid grid-cols-4 gap-3 rounded-3xl border border-white/10 bg-[#0D1526] p-4 text-center">
            <button
              type="button"
              onClick={() => setActiveView('cp')}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                <Heart className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">CP Life</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('edit')}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Avatar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('shop')}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Shop</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('vip')}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">VIP Center</span>
            </button>
          </section>

          {/* ACTIVITY List Section */}
          <section className="space-y-2">
            <h2 className="px-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              ACTIVITY
            </h2>
            <div className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1526]">
              <button
                type="button"
                onClick={() => setActiveView('moments')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                    <Image className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Moments</div>
                    <div className="text-xs text-slate-400">Share your sanctuary journey</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('gifts')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Gift Wall &amp; Rings</div>
                    <div className="text-xs text-slate-400">
                      Showcased gifts ({receivedGiftIds.length}) &amp; joined rooms
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('badges')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">All Badges Gallery</div>
                    <div className="text-xs text-slate-400">
                      View all VIP (Lv.1–18), Charm (Lv.1–21) &amp; Room Badges
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('charm')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Stats &amp; Charm</div>
                    <div className="text-xs text-slate-400">
                      Charm Lv.{charmInfo.level} ·{' '}
                      {nextCharmInfo
                        ? `Need ${(nextCharmInfo.minCharm - charm).toLocaleString()} for Lv.${nextCharmInfo.level}`
                        : 'Max Charm Tier'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('create-gift')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Create Gift</div>
                    <div className="text-xs text-slate-400">
                      Upload custom gift animation videos &amp; track Approval queue
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {customGifts.some((g) => g.status === 'pending') && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 font-mono-tabular text-[10px] font-extrabold text-slate-950">
                      {customGifts.filter((g) => g.status === 'pending').length} Pending
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('visitors')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Visitors</div>
                    <div className="text-xs text-slate-400">See who visited your profile</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-500 px-2.5 py-0.5 font-mono-tabular text-[10px] font-bold text-white">
                    +7 new
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </button>
            </div>
          </section>

          {/* MORE Section + Payment QR Upload */}
          <section className="space-y-2">
            <h2 className="px-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              MORE
            </h2>
            <div className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-[#0D1526]">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                    {customQrUrl ? (
                      <img
                        src={customQrUrl}
                        alt="My Payment QR"
                        className="h-9 w-9 rounded-lg bg-white object-contain p-0.5"
                      />
                    ) : (
                      <QrCode className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Payment QR Code (Top-Up)</div>
                    <div className="text-xs text-slate-400">
                      {customQrUrl
                        ? 'Custom QR uploaded & visible in Top-Up'
                        : 'Upload your QR code image for in-game payments'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{customQrUrl ? 'Change QR' : 'Upload QR'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveView('vip')}
                    className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Top-Up
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('privacy')}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Privacy, Language &amp; Security
                    </div>
                    <div className="text-xs text-slate-400">
                      {language} · Parental control &amp; visibility settings
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </section>
        </div>
        );
      })()}

      {/* SUB-VIEW: Obsidian-Teal & Golden ZAYRO Shop */}
      {activeView === 'shop' && (
        <div
          className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/45 shadow-[0_0_40px_rgba(6,182,212,0.28)]"
          style={{
            background:
              'radial-gradient(circle at 50% 14%, rgba(34,211,238,0.24) 0%, rgba(11,26,46,0.96) 48%, #060D1A 100%)',
          }}
        >
          {/* Top Header: Back < + Winged Golden "Shop" + Golden Bag */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <button
              type="button"
              onClick={() => setActiveView('profile')}
              aria-label="Back to Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/50 bg-[#0B1A2E]/90 text-white shadow-[0_0_14px_rgba(34,211,238,0.35)] hover:bg-cyan-500/25"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>

            <div className="relative flex flex-col items-center">
              <Crown className="-mb-1 h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-teal-300" />
                <h2 className="font-display bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-2xl font-black tracking-wide text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                  Shop
                </h2>
                <span className="h-1.5 w-6 rounded-full bg-gradient-to-l from-transparent via-cyan-400 to-teal-300" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('vip')}
              aria-label="Top Up"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/45 bg-[#2A1712]/80 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)] hover:bg-amber-500/20"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Balance Strip */}
          <div className="mx-3 mt-1 flex items-center justify-between rounded-2xl border border-cyan-400/40 bg-[#07111F]/90 px-3.5 py-2 shadow-[0_0_16px_rgba(6,182,212,0.22)]">
            <span className="text-xs font-bold text-slate-200">Balance:</span>
            <div className="flex items-center gap-3 font-mono-tabular text-xs font-extrabold">
              <span className="inline-flex items-center gap-1 text-sky-300">
                <Gem className="h-3.5 w-3.5 text-sky-400" />
                <span>{vipGrowth.toLocaleString()}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300">
                <ZayroCoinArt size={15} />
                <span>
                  {coins >= 1_000_000
                    ? `${(coins / 1_000_000).toFixed(2)}M`
                    : coins >= 1_000
                      ? `${Math.round(coins / 1_000)}K`
                      : coins}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setActiveView('vip')}
                aria-label="Top Up Coins"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.7)] hover:scale-105"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mx-3 mt-2.5 flex items-center gap-1 overflow-x-auto pb-1">
            {(
              [
                {
                  id: 'ring',
                  label: 'Relationship',
                  icon: <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />,
                },
                {
                  id: 'decorations',
                  label: 'Decorations',
                  icon: <Gift className="h-3 w-3 text-cyan-300" />,
                },
                {
                  id: 'voice',
                  label: 'Voice Room',
                  icon: <Mic className="h-3 w-3 text-sky-300" />,
                },
                {
                  id: 'items',
                  label: 'Items',
                  icon: <Star className="h-3 w-3 fill-amber-300 text-amber-300" />,
                },
                {
                  id: 'all',
                  label: 'All',
                  icon: <Gamepad2 className="h-3 w-3 text-teal-300" />,
                },
              ] as const
            ).map((cat) => {
              const active = shopCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setShopCategory(cat.id)}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                    active
                      ? 'border border-cyan-300/80 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.55)]'
                      : 'border border-cyan-400/30 bg-[#0B1A2E]/90 text-slate-300 hover:text-white'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Golden Section Title Banner */}
          <div className="mx-5 mt-2 mb-3 flex items-center justify-center gap-2 rounded-full border border-amber-400/70 bg-gradient-to-r from-[#0B1A2E] via-[#152B47] to-[#0B1A2E] py-1.5 shadow-[0_0_18px_rgba(245,158,11,0.3)]">
            <Crown className="h-3.5 w-3.5 text-amber-300" />
            <span className="font-display text-sm font-black tracking-wide text-amber-200">
              {shopCategory === 'ring'
                ? 'Rings Collection'
                : shopCategory === 'decorations'
                  ? 'Decorations & Frames'
                  : shopCategory === 'voice'
                    ? 'Voice Room Effects'
                    : shopCategory === 'items'
                      ? 'Chat & Seat Items'
                      : 'All OG VELOCITY Gear'}
            </span>
            <Crown className="h-3.5 w-3.5 text-amber-300" />
          </div>

          {/* 3-Column Obsidian-Teal & Gold-Framed Item Cards */}
          <div className="grid grid-cols-3 gap-2.5 px-3 pb-3">
            {visibleShopItems.map((item) => {
              const owned = ownedItemIds.includes(item.id);
              const equipped = equippedItems[item.category] === item.id;
              const canAfford = coins >= item.priceCoins;
              const coinLabel =
                item.priceCoins >= 1_000_000
                  ? `${item.priceCoins / 1_000_000}M Coin`
                  : `${Math.round(item.priceCoins / 1000)}K Coin`;

              const isRingOnly = !!item.ringNumber;
              return (
                <div
                  key={item.id}
                  className={
                    isRingOnly
                      ? 'relative flex flex-col items-center justify-between bg-transparent p-1.5 text-center'
                      : 'relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border-2 border-amber-400/75 p-2 text-center shadow-[0_0_16px_rgba(6,182,212,0.28)]'
                  }
                  style={
                    isRingOnly
                      ? undefined
                      : {
                          background:
                            'radial-gradient(circle at 50% 42%, rgba(34,211,238,0.34) 0%, rgba(15,39,68,0.9) 58%, #07111F 100%)',
                        }
                  }
                >
                  <div className="line-clamp-1 w-full text-[9px] font-bold text-cyan-100/90">
                    {item.name}
                  </div>

                  {/* Transparent Cutouts for Rings, Chat Frames & Seat Frames */}
                  <div className="my-1.5 flex h-18 items-center justify-center bg-transparent">
                    {item.ringNumber ? (
                      <RingSpriteArt ringNumber={item.ringNumber} size={70} alt={item.name} />
                    ) : item.chatFrameNumber ? (
                      <ChatFrameSpriteArt
                        frameNumber={item.chatFrameNumber}
                        alt={item.name}
                        className="h-10 w-24"
                      />
                    ) : item.seatFrameNumber ? (
                      <SeatFrameSpriteArt
                        frameNumber={item.seatFrameNumber}
                        size={64}
                        alt={item.name}
                      />
                    ) : item.category === 'bubble' ? (
                      <div
                        className="rounded-xl border-2 px-2 py-1 text-[9px] font-bold text-white"
                        style={{
                          borderColor: item.previewColor,
                          backgroundColor: `${item.previewColor}33`,
                        }}
                      >
                        OG VELOCITY!
                      </div>
                    ) : item.category === 'frame' ? (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full border-3 text-base"
                        style={{
                          borderColor: item.previewColor,
                          boxShadow: `0 0 14px ${item.previewColor}88`,
                        }}
                      >
                        {item.styleVariant === 'fire'
                          ? '🔥'
                          : item.styleVariant === 'ice'
                            ? '❄️'
                            : item.styleVariant === 'flower'
                              ? '🌸'
                              : item.styleVariant === 'chair'
                                ? '🪑'
                                : item.styleVariant === 'room'
                                  ? '🏛️'
                                  : '✨'}
                      </div>
                    ) : item.category === 'entry' ? (
                      <span className="text-3xl">
                        {item.styleVariant === 'car'
                          ? '🏎️'
                          : item.styleVariant === 'river'
                            ? '🌊'
                            : item.styleVariant === 'golden-palace'
                              ? '🏛️'
                              : item.styleVariant === 'throne'
                                ? '👑'
                                : item.styleVariant === 'crab'
                                  ? '🦀'
                                  : '🔥'}
                      </span>
                    ) : (
                      <Sparkles className="h-8 w-8" style={{ color: item.previewColor }} />
                    )}
                  </div>

                  {owned ? (
                    <button
                      type="button"
                      onClick={() => {
                        onEquipShopItem(item);
                        setPurchaseNotice(`Equipped ${item.name}!`);
                      }}
                      className={`w-full rounded-full border py-1 text-[10px] font-extrabold ${
                        equipped
                          ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
                          : 'border-cyan-300/50 bg-[#0B1A2E]/90 text-white hover:bg-cyan-500/30'
                      }`}
                    >
                      {equipped ? 'Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        onBuyShopItem(item);
                        setPurchaseNotice(
                          `Unlocked ${item.name} (+${Math.floor(item.priceCoins / 100).toLocaleString()} VIP Growth)!`
                        );
                      }}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-amber-400/70 bg-[#07111F]/90 py-1 font-mono-tabular text-[10px] font-extrabold text-white hover:bg-amber-500/25 disabled:opacity-45"
                    >
                      <ZayroCoinArt size={12} />
                      <span>{coinLabel}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Sticky YOU Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-cyan-400/40 bg-gradient-to-r from-[#0B1A2E] via-[#132B4A] to-[#0B1A2E] px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="text-center leading-tight">
                <div className="text-[10px] font-extrabold text-cyan-200">YOU</div>
                <div className="font-mono-tabular text-xs font-black text-white">#500+</div>
              </div>
              <div className="rounded-full border-2 border-cyan-400 p-0.5">
                <AvatarArt avatar={userProfile} size={32} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <VipBadgeArt level={effectiveVipLevel} size={16} />
                  <span
                    className="truncate text-xs font-bold"
                    style={getVipNameStyle(effectiveVipLevel)}
                  >
                    {userProfile.name}
                  </span>
                </div>
                <div className="font-mono-tabular text-[10px] text-slate-200">
                  Charm {charm.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('vip')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.55)] hover:opacity-95"
            >
              <Gift className="h-3.5 w-3.5" />
              <span>Get gifts</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: VIP Center & INR Top-Up + Custom QR */}
      {activeView === 'vip' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-400/25 bg-[#0D1526] p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  My Membership · VIP Growth (Lv. 1 – 18)
                </h2>
                <p className="text-xs text-slate-400">
                  100 Coins spent = +1 VIP Growth. Thresholds: VIP 1→2 (3,000), VIP 2→3 (8,000), VIP 3→4 (20,000)...
                </p>
              </div>
              <VipBadgeArt level={effectiveVipLevel} size={50} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between font-mono-tabular text-xs text-amber-300">
                <span>Current VIP {effectiveVipLevel} Growth: {vipGrowth.toLocaleString()}</span>
                {nextVipTier && (
                  <span className="text-slate-400">
                    Next VIP {nextVipTier.level}: {nextVipTier.minGrowth.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300"
                  style={{
                    width: `${
                      nextVipTier
                        ? Math.min(100, Math.max(6, Math.round((vipGrowth / nextVipTier.minGrowth) * 100)))
                        : 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Entrance Effect Preview Banner */}
            <div
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: `${previewVipInfo.accentColor}66`,
                background: `linear-gradient(90deg, ${previewVipInfo.accentColor}22, rgba(7,11,20,0.95))`,
              }}
            >
              <div className="flex items-center gap-3">
                <VipBadgeArt level={previewVipInfo.level} size={40} />
                <div>
                  <div className="text-xs font-semibold">
                    <span className="text-amber-300">Entrance Preview · </span>
                    <span style={getVipNameStyle(previewVipInfo.level)}>{previewVipInfo.title}</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {userProfile.name} entered
                  </div>
                  <div className="text-[11px] text-slate-300">{previewVipInfo.perk}</div>
                </div>
              </div>
              <div className="font-mono-tabular text-xs text-amber-200">
                {previewVipInfo.minGrowth.toLocaleString()} Growth
              </div>
            </div>
          </div>

          {/* VIP Subscriptions */}
          <div className="rounded-3xl border border-white/10 bg-[#0D1526] p-6 shadow-xl">
            <h2 className="font-display text-2xl font-bold text-white">VIP Subscriptions (INR)</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {VIP_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col justify-between rounded-2xl border border-amber-400/30 bg-[#132038] p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
                      <span className="font-mono-tabular text-lg font-bold text-amber-300">
                        ₹{plan.priceInr} INR
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const bonusGrowth = plan.grantedVipLevel >= 10 ? 3_500 : 1_000;
                      onBuyVip(plan.name, plan.priceInr, plan.grantedVipLevel, bonusGrowth);
                      setPurchaseNotice(
                        `Activated ${plan.name} (₹${plan.priceInr} INR) — +${bonusGrowth.toLocaleString()} VIP Growth!`
                      );
                    }}
                    className="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    Subscribe · ₹{plan.priceInr} INR
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* INR Coin Packs + Custom Payment QR Code */}
          <div className="rounded-3xl border border-white/10 bg-[#0D1526] p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Coin Top-Up (INR) &amp; Payment QR
                </h2>
                <p className="text-xs text-slate-400">
                  Upload your own UPI / Payment QR code for INR coin purchases.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload My QR Code</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-5">
                {COIN_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/15 bg-[#132038] p-4"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-amber-300">
                        {pkg.highlight || 'Standard Bundle'}
                      </div>
                      <div className="font-display mt-2 text-lg font-extrabold text-white">
                        {pkg.label}
                      </div>
                      <div className="mt-1 font-mono-tabular text-xs text-slate-400">
                        {pkg.coins.toLocaleString()} Coins
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onBuyCoins(pkg.coins, pkg.priceInr);
                        setPurchaseNotice(`Added ${pkg.label} (₹${pkg.priceInr} INR)!`);
                      }}
                      className="mt-4 w-full rounded-xl bg-amber-500 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                    >
                      ₹{pkg.priceInr} INR
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-[#132038] p-4 text-center lg:col-span-3">
                {customQrUrl ? (
                  <img
                    src={customQrUrl}
                    alt="Custom Payment QR Code"
                    className="h-36 w-36 rounded-lg bg-white object-contain p-1"
                  />
                ) : (
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5 text-slate-400">
                    <QrCode className="h-12 w-12 text-amber-300" />
                    <span className="mt-2 text-[11px]">No QR uploaded yet</span>
                  </div>
                )}
                <div className="mt-2 text-xs font-semibold text-white">Merchant INR QR</div>
                <div className="text-[10px] text-slate-400">Scan to pay INR packages</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Charm Levels (Lv. 1 - 21) & Joined Rooms */}
      {activeView === 'charm' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-rose-400/25 bg-[#0D1526] p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Charm Levels (Lv. 1 – 21 · Star to 20 Crowns)
                </h2>
                <p className="text-xs text-slate-400">
                  Current: {charm.toLocaleString()} Charm ·{' '}
                  {nextCharmInfo
                    ? `Need ${(nextCharmInfo.minCharm - charm).toLocaleString()} for Lv.${nextCharmInfo.level}`
                    : 'Max Charm Level Achieved'}
                </p>
              </div>
              <CharmBadgeArt level={charmInfo.level} size={52} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7">
              {CHARM_LEVELS.map((tier) => {
                const unlocked = charm >= tier.minCharm;
                const isCurrent = charmInfo.level === tier.level;
                return (
                  <div
                    key={tier.level}
                    className={`flex flex-col items-center rounded-2xl border p-3 text-center ${
                      isCurrent
                        ? 'border-rose-400 bg-rose-500/15'
                        : unlocked
                          ? 'border-white/15 bg-[#132038]'
                          : 'border-white/5 bg-[#070B14] opacity-60'
                    }`}
                  >
                    <CharmBadgeArt level={tier.level} size={48} />
                    <div className="mt-1.5 text-xs font-bold text-white">Lv.{tier.level}</div>
                    <div className="text-[10px] text-slate-400">{tier.series}</div>
                    <div className="mt-0.5 font-mono-tabular text-[11px] font-semibold text-rose-300">
                      {tier.minCharm.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0D1526] p-6">
            <h3 className="font-display text-xl font-bold text-white">Joined Voice Rooms</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {rooms.slice(0, 3).map((rm) => (
                <div
                  key={rm.id}
                  className="flex items-center justify-between rounded-2xl bg-[#132038] px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{rm.title}</div>
                    <div className="font-mono-tabular text-[11px] text-slate-400">
                      ID {rm.uid} · Lv.{rm.level}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onJoinRoom(rm.id)}
                    className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                  >
                    Enter
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: All Badges Gallery (VIP Lv.1-18 with Name Colors, Charm Lv.1-21, Room Lv.1-20) */}
      {activeView === 'badges' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-400/25 bg-[#0D1526] p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  VIP Badges &amp; Name Colors (Lv. 1 – 18)
                </h2>
                <p className="text-xs text-slate-400">
                  Name colors change every 2 VIP levels (V1–V11) &amp; shine in two colors beyond VIP 11 (V12–V18).
                </p>
              </div>
              <VipBadgeArt level={effectiveVipLevel} size={46} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {VIP_TIERS.map((tier) => {
                const unlocked = effectiveVipLevel >= tier.level;
                const isCurrent = effectiveVipLevel === tier.level;
                const nameStyle = getVipNameStyle(tier.level);
                return (
                  <div
                    key={tier.level}
                    className={`flex flex-col items-center rounded-2xl border p-3 text-center ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/15'
                        : unlocked
                          ? 'border-white/15 bg-[#132038]'
                          : 'border-white/5 bg-[#070B14] opacity-65'
                    }`}
                  >
                    <VipBadgeArt level={tier.level} size={42} />
                    <div className="mt-1.5 text-xs font-extrabold" style={nameStyle}>
                      V{tier.level} Name
                    </div>
                    <div
                      className={`mt-0.5 text-[10px] font-bold ${tier.level > 11 ? '' : 'text-slate-300'}`}
                      style={tier.level > 11 ? nameStyle : undefined}
                    >
                      {tier.title}
                    </div>
                    <div className="mt-1 font-mono-tabular text-[9px] text-slate-400">
                      {unlocked ? (isCurrent ? 'Current' : 'Unlocked') : 'Locked'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-rose-400/25 bg-[#0D1526] p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Charm Badges (Lv. 1 – 21)
                </h2>
                <p className="text-xs text-slate-400">
                  Star Series, Diamond Series &amp; Crown Series earned via gifts.
                </p>
              </div>
              <CharmBadgeArt level={charmInfo.level} size={46} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-7">
              {CHARM_LEVELS.map((tier) => {
                const unlocked = charm >= tier.minCharm;
                const isCurrent = charmInfo.level === tier.level;
                return (
                  <div
                    key={tier.level}
                    className={`flex flex-col items-center rounded-2xl border p-2.5 text-center ${
                      isCurrent
                        ? 'border-rose-400 bg-rose-500/15'
                        : unlocked
                          ? 'border-white/15 bg-[#132038]'
                          : 'border-white/5 bg-[#070B14] opacity-65'
                    }`}
                  >
                    <CharmBadgeArt level={tier.level} size={42} />
                    <div className="mt-1 text-xs font-bold text-white">Lv.{tier.level}</div>
                    <div className="text-[9px] text-slate-400">{tier.series}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-sky-400/25 bg-[#0D1526] p-6 shadow-xl">
            <div className="border-b border-white/10 pb-4">
              <h2 className="font-display text-2xl font-bold text-white">
                Room Level Badges (Lv. 1 – 20)
              </h2>
              <p className="text-xs text-slate-400">
                Level up rooms with daily activity and gifts to unlock up to 15 Admin Slots.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {ROOM_LEVEL_INFO.map((rl) => (
                <div
                  key={rl.level}
                  className="flex flex-col items-center rounded-2xl border border-white/10 bg-[#132038] p-2.5 text-center"
                >
                  <RoomLevelBadgeArt level={rl.level} size={40} />
                  <div className="mt-1 text-xs font-bold text-white">Lv.{rl.level}</div>
                  <div className="line-clamp-1 text-[9px] text-sky-300">{rl.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Edit Profile & Photo Management */}
      {activeView === 'edit' && (
        <form
          onSubmit={handleSaveProfile}
          className="space-y-5 rounded-3xl border border-cyan-500/20 bg-[#0D1526] p-5 shadow-2xl sm:p-6"
        >
          {/* Top Header: < | Edit Profile | Save */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveView('profile')}
              aria-label="Back to Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200 hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-display text-lg font-bold text-white">Edit Profile</h2>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-1.5 text-xs font-extrabold text-slate-950 shadow hover:from-cyan-400 hover:to-teal-300"
            >
              Save
            </button>
          </div>

          {savedBanner && (
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/35 bg-emerald-500/15 py-2 text-xs font-bold text-emerald-300">
              <Check className="h-4 w-4" />
              Profile &amp; Photo Settings Saved
            </div>
          )}

          {/* Centered Circular Avatar + Camera Button + Photo Management Controls */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <AvatarArt avatar={userProfile} size={88} frameId={equippedItems.frame} />
              <label
                title="Change Profile Photo"
                className="absolute right-0 bottom-0 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-[#0D1526] bg-cyan-400 text-slate-950 shadow hover:bg-cyan-300"
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cyan-400/35 bg-[#132038] px-3 py-1.5 text-[11px] font-semibold text-cyan-200 hover:bg-[#192946]">
                <Upload className="h-3.5 w-3.5" />
                <span>Cover Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
              </label>
              {userProfile.photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ photoUrl: '' });
                    setPurchaseNotice('Profile photo removed.');
                  }}
                  className="rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-1.5 text-[11px] font-semibold text-rose-200 hover:bg-rose-500/25"
                >
                  Remove Photo
                </button>
              )}
              {userProfile.coverUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ coverUrl: '' });
                    setPurchaseNotice('Cover photo removed.');
                  }}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-white/10"
                >
                  Reset Cover
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="prof-name" className="block text-xs font-semibold text-slate-300">
              Name
            </label>
            <input
              id="prof-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#132038] px-3.5 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="prof-handle" className="block text-xs font-semibold text-slate-300">
              Username
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-white/10 bg-[#132038] px-3.5 focus-within:border-cyan-400">
              <span className="mr-2 font-mono-tabular text-sm text-slate-400">@</span>
              <input
                id="prof-handle"
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value.replace(/^@+/, ''))}
                className="w-full bg-transparent py-3 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Bio with 100-char counter */}
          <div>
            <label htmlFor="prof-bio" className="block text-xs font-semibold text-slate-300">
              Bio
            </label>
            <textarea
              id="prof-bio"
              rows={3}
              maxLength={100}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value.slice(0, 100))}
              className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-[#132038] px-3.5 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
            <div className="mt-1 text-right font-mono-tabular text-[11px] text-slate-400">
              {bioInput.length}/100
            </div>
          </div>

          {/* Gender */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-300">Gender</span>
              <span className="text-[11px] text-slate-400">locked for 48 hours after a change</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['Male', 'Female', 'Other'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenderInput(g)}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${
                    genderInput === g
                      ? 'border border-cyan-400 bg-cyan-500/20 text-white'
                      : 'border border-white/5 bg-[#132038] text-slate-300 hover:bg-[#192946]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age & Country */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5">
              <div className="text-xs font-semibold text-slate-300">Age</div>
              <div className="text-[10px] leading-tight text-slate-400">
                only you · locked 48h after change
              </div>
              <input
                type="number"
                min={13}
                max={99}
                value={ageInput}
                onChange={(e) => setAgeInput(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#132038] px-3.5 py-2.5 font-mono-tabular text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="col-span-7 flex flex-col justify-end">
              <label htmlFor="prof-country" className="block text-xs font-semibold text-slate-300">
                Country
              </label>
              <select
                id="prof-country"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#132038] px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="India">🇮🇳 India</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="UAE">🇦🇪 UAE</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Singapore">🇸🇬 Singapore</option>
              </select>
            </div>
          </div>

          {/* Tags 0/5 */}
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-300">Tags</span>
              <span className="font-mono-tabular text-slate-400">{tagsInput.length}/5</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tagsInput.map((tg) => (
                <button
                  key={tg}
                  type="button"
                  onClick={() => setTagsInput((prev) => prev.filter((item) => item !== tg))}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-400/35 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200"
                >
                  <span>{tg}</span>
                  <span className="text-slate-400">×</span>
                </button>
              ))}
              {tagsInput.length < 5 && !showAddTagInput && (
                <button
                  type="button"
                  onClick={() => setShowAddTagInput(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/25 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
              {showAddTagInput && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    maxLength={18}
                    value={newTagDraft}
                    onChange={(e) => setNewTagDraft(e.target.value)}
                    placeholder="e.g. Gamer"
                    className="w-28 rounded-full border border-cyan-400/40 bg-[#132038] px-3 py-1 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const clean = newTagDraft.trim();
                      if (clean && tagsInput.length < 5 && !tagsInput.includes(clean)) {
                        setTagsInput((prev) => [...prev, clean]);
                      }
                      setNewTagDraft('');
                      setShowAddTagInput(false);
                    }}
                    className="rounded-full bg-cyan-500 px-2.5 py-1 text-[11px] font-bold text-slate-950"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="text-xs font-semibold text-slate-300">Email</div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#132038] px-3.5 py-2.5 text-xs">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {emailInput.trim() && !editingEmail && (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                )}
                {editingEmail ? (
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address..."
                    className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                ) : (
                  <span className={`truncate ${emailInput.trim() ? 'text-slate-200' : 'text-slate-400'}`}>
                    {emailInput.trim() || 'Not linked'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {emailInput.trim() && (
                  <span className="font-mono-tabular text-[11px] font-extrabold text-emerald-400">
                    VERIFIED
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setEditingEmail((v) => !v)}
                  className="font-bold text-cyan-300 hover:text-white"
                >
                  {editingEmail ? 'Done' : emailInput.trim() ? 'Change' : 'Link Email'}
                </button>
              </div>
            </div>
          </div>

          {/* Locked UID & Ornament */}
          <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-400">User ID (Locked)</div>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 font-mono-tabular text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5 text-amber-300" />
                <span>{userProfile.uid}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">Avatar Ornament</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {ORNAMENTS.map((orn) => (
                  <button
                    key={orn}
                    type="button"
                    onClick={() => setOrnamentInput(orn)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      ornamentInput === orn
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'border border-white/10 bg-[#070B14] text-slate-300'
                    }`}
                  >
                    {orn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SUB-VIEW: Gift Wall & Equipped Rings */}
      {activeView === 'gifts' && (
        <div className="space-y-5 rounded-3xl border border-white/10 bg-[#0D1526] p-6">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-300" />
            <h2 className="font-display text-2xl font-bold text-white">
              Gift Wall &amp; Ring Showcase
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {receivedGiftIds.map((gid, i) => (
              <div
                key={`${gid}-${i}`}
                className="flex items-center justify-center rounded-2xl bg-[#132038] p-3"
              >
                <GiftArtwork giftId={gid} size={48} />
              </div>
            ))}
          </div>
          {equippedRing?.ringNumber && (
            <div className="flex items-center gap-4 bg-transparent py-2">
              <RingSpriteArt
                ringNumber={equippedRing.ringNumber}
                size={68}
                alt={equippedRing.name}
              />
              <div>
                <div className="text-xs text-amber-300">Equipped Ring</div>
                <div className="font-display text-lg font-bold text-white">
                  {equippedRing.name}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: Moments */}
      {activeView === 'moments' && (
        <div className="rounded-3xl border border-white/10 bg-[#0D1526] p-6">
          <h2 className="font-display text-2xl font-bold text-white">My Moments</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {moments.map((m) => (
              <div key={m.id} className="rounded-2xl bg-[#132038] p-4 text-xs">
                <div className="font-bold text-amber-300">{m.mediaTitle}</div>
                <p className="mt-1 text-slate-300">{m.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: CP Life, Ring Proposals & Clickable Partner ID */}
      {activeView === 'cp' && (
        <div className="space-y-5 rounded-3xl border border-rose-400/25 bg-[#0D1526] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">CP Life &amp; Ring Proposals</h2>
              <p className="mt-1 text-xs text-slate-400">
                Send a ring proposal to form a CP bond. Clicking your CP partner opens their Profile Page.
              </p>
            </div>
          </div>

          {/* Current CP Status & CP Level System */}
          {userProfile.cpPartner ? (() => {
            const cpCharm = userProfile.cpPartner.cpCharm ?? 0;
            const cpLvl = getCpLevelInfo(cpCharm);
            return (
              <div className="space-y-3 rounded-2xl border border-rose-400/40 bg-gradient-to-r from-[#2D1426]/90 via-[#192038] to-[#0B1A2E]/90 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <RingSpriteArt
                      ringNumber={userProfile.cpPartner.ringNumber}
                      size={56}
                      alt={userProfile.cpPartner.ringName}
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onInspectUser) {
                            openCpPartnerProfile();
                          } else {
                            setShowCpPartnerId((v) => !v);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/25 px-3 py-1 text-xs font-extrabold text-rose-200 hover:bg-rose-500/35"
                      >
                        <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                        <span>
                          CP Lv.{cpLvl.level} ({cpLvl.title}) · {userProfile.cpPartner.partnerName}
                        </span>
                      </button>
                      <div className="mt-1 font-mono-tabular text-xs font-bold text-white">
                        Partner ID: {userProfile.cpPartner.partnerUid}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {userProfile.cpPartner.ringName} · Since {userProfile.cpPartner.since}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onInspectUser && (
                      <button
                        type="button"
                        onClick={openCpPartnerProfile}
                        className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-cyan-400"
                      >
                        Open Profile
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        onBreakCp?.();
                        setPurchaseNotice('CP status ended.');
                      }}
                      className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
                    >
                      Unbind CP
                    </button>
                  </div>
                </div>

                {/* CP Level Charm Progress */}
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px]">
                    <span className="font-bold text-rose-200">
                      CP Charms: {cpCharm.toLocaleString()}
                    </span>
                    <span className="text-amber-300">
                      {cpLvl.nextMin !== null
                        ? `${cpLvl.progressInLevel.toLocaleString()} / ${cpLvl.stepRequired.toLocaleString()} for CP Lv.${cpLvl.level + 1}`
                        : 'Max CP Level Reached'}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 transition-all"
                      style={{ width: `${cpLvl.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="rounded-2xl border border-white/10 bg-[#132038] p-4 text-xs text-slate-300">
              No active CP yet. Send a Ring proposal below or from any user profile!
            </div>
          )}

          {/* CP Level Milestones Ladder */}
          <div className="rounded-2xl border border-white/10 bg-[#132038] p-3.5">
            <div className="mb-2 text-xs font-bold text-rose-200">
              CP Bond Level Milestones (Gift Charms Exchanged)
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
              {CP_LEVELS.slice(0, 5).map((tier, idx) => {
                const prevMin = idx === 0 ? 0 : CP_LEVELS[idx - 1].minCharm;
                const step = tier.minCharm - prevMin;
                return (
                  <div
                    key={tier.level}
                    className="rounded-xl border border-rose-400/20 bg-[#0A101D] p-2 text-center"
                  >
                    <div className="text-[10px] font-black text-rose-300">CP Lv.{tier.level}</div>
                    <div className="truncate text-[9.5px] font-semibold text-white">{tier.title}</div>
                    <div className="mt-0.5 font-mono-tabular text-[9px] text-amber-300">
                      {idx === 0
                        ? '0 Charms'
                        : `+${step.toLocaleString()} (${tier.minCharm.toLocaleString()})`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Send New Ring Proposal (Purchased Rings Only) */}
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#132038] p-4">
            <div className="text-sm font-bold text-white">Propose CP With a Purchased Ring</div>
            {ownedRings.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-[#070B14] p-3">
                <p className="text-xs text-slate-300">
                  Purchase a ring in the Shop first. Only rings you own can be gifted to request CP.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShopCategory('ring');
                    setActiveView('shop');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow hover:brightness-105"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Buy a Ring in Shop</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cp-target-select" className="block text-[11px] font-semibold text-slate-400">
                      Select Partner
                    </label>
                    <select
                      id="cp-target-select"
                      value={cpTargetUid}
                      onChange={(e) => setCpTargetUid(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {AVATAR_ROSTER.map((av) => (
                        <option key={av.uid} value={av.uid}>
                          {getGenderSymbol(av.gender)} {av.name} ({av.uid})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cp-ring-select" className="block text-[11px] font-semibold text-slate-400">
                      Choose Purchased Ring
                    </label>
                    <select
                      id="cp-ring-select"
                      value={selectedOwnedRing?.ringNumber ?? ownedRings[0].ringNumber ?? 1}
                      onChange={(e) => setCpRingNumber(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {ownedRings.map((r) => (
                        <option key={r.id} value={r.ringNumber ?? 1}>
                          Ring #{r.ringNumber}: {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <RingSpriteArt
                      ringNumber={selectedOwnedRing?.ringNumber ?? 1}
                      size={42}
                      alt={selectedOwnedRing?.name || 'Purchased Ring'}
                    />
                    <span className="text-xs font-semibold text-rose-200">
                      {selectedOwnedRing?.name || `Ring #${cpRingNumber}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!selectedOwnedRing}
                    onClick={() => {
                      if (!selectedOwnedRing) return;
                      const target =
                        AVATAR_ROSTER.find((a) => a.uid === cpTargetUid) ?? AVATAR_ROSTER[0];
                      const ringNum = selectedOwnedRing.ringNumber ?? 1;
                      onProposeCp?.(
                        target.uid,
                        target.name,
                        target.id,
                        ringNum,
                        selectedOwnedRing.name
                      );
                      setPurchaseNotice(
                        `Sent CP Ring proposal (${selectedOwnedRing.name}) to ${target.name} (${target.uid})!`
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-xs font-extrabold text-white shadow hover:opacity-95 disabled:opacity-40"
                  >
                    <Heart className="h-3.5 w-3.5 fill-white" />
                    <span>Send Ring Proposal</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Pending & Sent CP Requests */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              CP Proposal Requests ({cpRequests.length})
            </h3>
            {cpRequests.length === 0 ? (
              <p className="text-xs text-slate-400">No CP requests yet.</p>
            ) : (
              cpRequests.map((req) => {
                const isIncoming = req.toUid === userProfile.uid;
                return (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#132038] p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <RingSpriteArt ringNumber={req.ringNumber} size={38} alt={req.ringName} />
                      <div>
                        <div className="font-bold text-white">
                          {isIncoming
                            ? `${req.fromName} (${req.fromUid}) proposed to you`
                            : `You proposed to ${req.toName} (${req.toUid})`}
                        </div>
                        <div className="text-[11px] text-rose-200">
                          {req.ringName} · Status:{' '}
                          <span className="font-bold uppercase">{req.status}</span> · {req.timestamp}
                        </div>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onRespondCpRequest?.(req.id, true)}
                          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400"
                        >
                          {isIncoming ? 'Accept CP' : 'Accept Proposal'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRespondCpRequest?.(req.id, false)}
                          className="rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-rose-500/25 hover:text-rose-200"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {ownTags.map((tag) => (
              <span
                key={tag}
                className="rounded-2xl border border-rose-400/35 bg-rose-500/15 px-3.5 py-1.5 text-xs font-bold text-rose-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: Visitors (Clicking opens user's Profile Page) */}
      {activeView === 'visitors' && (
        <div className="rounded-3xl border border-white/10 bg-[#0D1526] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Recent Visitors</h2>
            <span className="rounded-full bg-rose-500 px-2.5 py-0.5 font-mono-tabular text-xs font-bold text-white">
              +7 new
            </span>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {AVATAR_ROSTER.map((av, idx) => (
              <button
                key={av.id}
                type="button"
                onClick={() =>
                  onInspectUser?.({
                    avatar: av,
                    vipLevel: 4 + (idx % 6),
                    charm: 160_000 - idx * 15_000,
                    ringNumber: (idx % 5) + 1,
                  })
                }
                className="flex w-full items-center justify-between rounded-xl px-2 py-3 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <AvatarArt avatar={av} size={38} />
                  <div>
                    <div className="text-sm font-bold text-white">{av.name}</div>
                    <div className="font-mono-tabular text-[11px] text-slate-400">{av.uid}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-cyan-300">View Profile</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: Create Gift Studio & Gift Animation Video Upload */}
      {activeView === 'create-gift' && (
        <div className="space-y-5 rounded-3xl border border-cyan-400/25 bg-[#0D1526] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 text-slate-950 shadow">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">Create Custom Gift</h2>
                <p className="text-xs text-slate-400">
                  Upload a gift animation video &amp; submit for approval. Approved gifts unlock across Voice Rooms &amp; DMs!
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!cgName.trim()) return;
              onSubmitCustomGift?.({
                name: cgName.trim(),
                cost: Math.max(50, cgCost),
                charmValue: Math.max(50, cgCharm),
                description: cgDesc.trim() || `Custom OG VELOCITY Gift: ${cgName.trim()}`,
                primaryColor: cgPrimary,
                secondaryColor: cgSecondary,
                particleStyle: cgParticle,
                artworkUrl: cgArtworkUrl,
                animationVideoUrl: cgVideoUrl,
                videoFileName: cgVideoName || undefined,
              });
              setPurchaseNotice(`Gift "${cgName.trim()}" submitted for review!`);
              setCgName('');
              setCgArtworkUrl(undefined);
              setCgVideoUrl(undefined);
              setCgVideoName('');
            }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-5"
          >
            {/* Left: Form Inputs */}
            <div className="space-y-3 lg:col-span-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Gift Name
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={cgName}
                    onChange={(e) => setCgName(e.target.value)}
                    placeholder="e.g. Celestial Heart"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-300">
                  Particle Effect
                  <select
                    value={cgParticle}
                    onChange={(e) => setCgParticle(e.target.value as VirtualGift['particleStyle'])}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="heart">Floating Hearts</option>
                    <option value="crown">Royal Crown</option>
                    <option value="rose">Rose Petals</option>
                    <option value="lotus">Lotus Spark</option>
                    <option value="phoenix">Phoenix Flame</option>
                    <option value="lantern">Sky Lantern</option>
                    <option value="meteor">Meteor Shower</option>
                    <option value="vehicle">Neon Speed</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Coin Price
                  <input
                    type="number"
                    min={50}
                    max={500000}
                    step={50}
                    value={cgCost}
                    onChange={(e) => setCgCost(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 font-mono-tabular text-xs text-amber-300 focus:border-cyan-400 focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-300">
                  Charm Reward
                  <input
                    type="number"
                    min={50}
                    max={500000}
                    step={50}
                    value={cgCharm}
                    onChange={(e) => setCgCharm(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 font-mono-tabular text-xs text-rose-300 focus:border-cyan-400 focus:outline-none"
                  />
                </label>
              </div>

              {/* Gift Animation Video Upload (replaces removed Gift Shape selector) */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Gift Animation Video</div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25">
                    <Video className="h-3.5 w-3.5" />
                    <span>{cgVideoName || 'Upload Gift Animation Video'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setCgVideoName(f.name);
                        if (f.size <= 3_500_000) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') setCgVideoUrl(reader.result);
                          };
                          reader.readAsDataURL(f);
                        } else {
                          setCgVideoUrl(URL.createObjectURL(f));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {cgVideoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCgVideoUrl(undefined);
                        setCgVideoName('');
                      }}
                      className="rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/25"
                    >
                      Clear Video
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Primary</span>
                  <input
                    type="color"
                    value={cgPrimary}
                    onChange={(e) => setCgPrimary(e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Accent</span>
                  <input
                    type="color"
                    value={cgSecondary}
                    onChange={(e) => setCgSecondary(e.target.value)}
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </label>
                <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{cgArtworkUrl ? 'Change Art' : 'Upload Gift Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setCgArtworkUrl(reader.result);
                      };
                      reader.readAsDataURL(f);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <label className="block text-xs font-semibold text-slate-300">
                Description
                <input
                  type="text"
                  maxLength={80}
                  value={cgDesc}
                  onChange={(e) => setCgDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg hover:opacity-95"
              >
                Submit Gift for Review
              </button>
            </div>

            {/* Right: Live Gift Preview Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#070B14] p-5 text-center lg:col-span-2">
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200">
                LIVE GIFT PREVIEW
              </span>
              <div
                className="my-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#132038]"
                style={{ boxShadow: `0 0 24px ${cgPrimary}33` }}
              >
                {cgVideoUrl ? (
                  <video
                    src={cgVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : cgArtworkUrl ? (
                  <img
                    src={cgArtworkUrl}
                    alt="Custom gift preview"
                    className="h-24 w-24 rounded-xl object-contain"
                  />
                ) : (
                  <Sparkles className="h-12 w-12" style={{ color: cgPrimary }} />
                )}
              </div>
              <div className="font-display text-lg font-extrabold text-white">
                {cgName.trim() || 'Untitled Gift'}
              </div>
              <div className="mt-1 flex items-center gap-3 font-mono-tabular text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                  <ZayroCoinArt size={14} />
                  {cgCost.toLocaleString()}
                </span>
                <span className="font-bold text-rose-300">+{cgCharm.toLocaleString()} Charm</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">{cgDesc}</p>
            </div>
          </form>

          {/* Review Queue: Pending / Approved / Rejected */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                Custom Gift Submissions ({customGifts.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Approve to publish live to Gift Dock
              </span>
            </div>

            {customGifts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#132038] p-5 text-center text-xs text-slate-400">
                No custom gifts submitted yet. Create one above to send it for approval!
              </div>
            ) : (
              <div className="space-y-2.5">
                {customGifts.map((cg) => (
                  <div
                    key={cg.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#132038] p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      {cg.animationVideoUrl ? (
                        <video
                          src={cg.animationVideoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : cg.artworkUrl ? (
                        <img
                          src={cg.artworkUrl}
                          alt={cg.name}
                          className="h-12 w-12 rounded-xl object-contain"
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-[#070B14]"
                          style={{ boxShadow: `0 0 12px ${cg.primaryColor}44` }}
                        >
                          <Gift className="h-5 w-5" style={{ color: cg.primaryColor }} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{cg.name}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                              cg.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : cg.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {cg.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                            {cg.status === 'rejected' && <XCircle className="h-3 w-3" />}
                            {cg.status === 'pending' && <Clock className="h-3 w-3" />}
                            {cg.status}
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono-tabular text-[11px] text-slate-300">
                          {cg.cost.toLocaleString()} Coins · +{cg.charmValue.toLocaleString()} Charm · {cg.submittedAt}
                          {cg.videoFileName ? ` · 🎬 ${cg.videoFileName}` : ''}
                        </div>
                        {cg.reviewNote && (
                          <div className="mt-0.5 text-[11px] text-rose-300">
                            Note: {cg.reviewNote}
                          </div>
                        )}
                      </div>
                    </div>

                    {cg.status === 'pending' && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={cgRejectNotes[cg.id] ?? ''}
                          onChange={(e) =>
                            setCgRejectNotes((prev) => ({ ...prev, [cg.id]: e.target.value }))
                          }
                          placeholder="Optional note..."
                          className="w-32 rounded-lg border border-white/15 bg-[#070B14] px-2 py-1 text-[11px] text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onReviewCustomGift?.(cg.id, 'approved', cgRejectNotes[cg.id]?.trim());
                            setPurchaseNotice(`Approved "${cg.name}"! Now available in Gift Docks.`);
                          }}
                          className="rounded-xl bg-emerald-500 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onReviewCustomGift?.(
                              cg.id,
                              'rejected',
                              cgRejectNotes[cg.id]?.trim() || 'Needs artwork adjustment'
                            );
                            setPurchaseNotice(`Rejected "${cg.name}".`);
                          }}
                          className="rounded-xl bg-rose-500/20 px-3 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/35"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW: Privacy, Photo Management, Gift Animations & Security */}
      {activeView === 'privacy' && (
        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0D1526] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-cyan-300" />
              <h2 className="font-display text-2xl font-bold text-white">
                Profile Settings &amp; Privacy
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('edit')}
              className="rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              Open Full Edit Profile
            </button>
          </div>

          {/* Photo Management Panel inside Settings */}
          <div className="rounded-2xl border border-cyan-400/20 bg-[#132038] p-4">
            <div className="text-sm font-bold text-white">Photo Management</div>
            <p className="text-xs text-slate-400">
              Update or clear your profile photo and cover banner
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <AvatarArt avatar={userProfile} size={44} frameId={equippedItems.frame} />
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400">
                <Camera className="h-3.5 w-3.5" />
                <span>Change Profile Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarPhotoUpload}
                  className="hidden"
                />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs font-semibold text-white hover:border-cyan-400">
                <Upload className="h-3.5 w-3.5" />
                <span>Change Cover Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
              </label>
              {userProfile.photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ photoUrl: '' });
                    setPurchaseNotice('Profile photo removed.');
                  }}
                  className="rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200"
                >
                  Remove Photo
                </button>
              )}
              {userProfile.coverUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProfile({ coverUrl: '' });
                    setPurchaseNotice('Cover photo removed.');
                  }}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300"
                >
                  Reset Cover
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Disable Gift Animations Toggle */}
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#132038] p-4">
              <div>
                <div className="text-sm font-bold text-white">Disable Gift Animations</div>
                <div className="text-xs text-slate-400">
                  Turn off full-screen gift spectacle animations (top big-gift bar stays active)
                </div>
              </div>
              <input
                type="checkbox"
                checked={!giftAnimationsEnabled}
                onChange={() => onToggleGiftAnimations?.()}
                className="h-4.5 w-4.5 accent-cyan-400"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#132038] p-4">
              <div>
                <div className="text-sm font-bold text-white">App Language</div>
                <div className="text-xs text-slate-400">Choose your preferred interface language</div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#070B14] px-3 py-2 text-xs text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#132038] p-4">
              <div>
                <div className="text-sm font-bold text-white">Hide Online Presence</div>
                <div className="text-xs text-slate-400">
                  Hide your live Voice Room status from public friend lists
                </div>
              </div>
              <input
                type="checkbox"
                checked={hideOnlineStatus}
                onChange={(e) => setHideOnlineStatus(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#132038] p-4">
              <div>
                <div className="text-sm font-bold text-white">Parental Control Mode</div>
                <div className="text-xs text-slate-400">
                  Require confirmation before high-value INR top-ups
                </div>
              </div>
              <input
                type="checkbox"
                checked={parentalMode}
                onChange={(e) => setParentalMode(e.target.checked)}
                className="h-4 w-4 accent-cyan-400"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
