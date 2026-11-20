import React, { useMemo, useState } from 'react';
import {
  Armchair,
  ArrowDownCircle,
  ArrowUpCircle,
  Award,
  Check,
  ChevronLeft,
  ChevronUp,
  Copy,
  Crown,
  Flame,
  Gift,
  Heart,
  HelpCircle,
  ImagePlus,
  Lock,
  LogOut,
  MessageCircle,
  Mic,
  MicOff,
  Palette,
  Plus,
  Power,
  Search,
  Send,
  Settings,
  Shield,
  Smile,
  Sparkles,
  Swords,
  Unlock,
  Upload,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  AVATAR_ROSTER,
  ROOM_BACKGROUND_THEMES,
  ROOM_EMOTES,
  ROOM_LEVEL_INFO,
  SHOP_ITEMS,
  getAdminSlotCount,
  getCharmLevelInfo,
  getCpLevelInfo,
  getGenderSymbol,
  getRoomNextExp,
  getVipNameStyle,
} from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import { GiftArtwork } from '../graphics/GiftArtwork';
import {
  CharmBadgeArt,
  CharmBadgePill,
  ChatFrameMessage,
  CpHeartConnectorArt,
  EmoteSpriteArt,
  RingSpriteArt,
  RoomLevelBadgeArt,
  VipBadgeArt,
  ZayroCoinArt,
  resolveChatFrameNumber,
} from '../graphics/SpriteArtwork';
import type {
  AvatarConfig,
  EmoteMotion,
  FriendRecord,
  PublicUserProfile,
  RoomListener,
  RoomTaskItem,
  VirtualGift,
  VoiceRoom,
  VoiceSeat,
} from '../types';

export interface VipEntryShowcase {
  name: string;
  vipLevel: number;
  effectId?: string;
}

interface VoiceRoomStageProps {
  rooms: VoiceRoom[];
  activeRoom: VoiceRoom | null;
  userUid: string;
  userName: string;
  coins: number;
  charm: number;
  vipLevel: number;
  hasCreatedRoom: boolean;
  roomTasks: RoomTaskItem[];
  gifts: VirtualGift[];
  userSeatIndex: number | null;
  isMicMuted: boolean;
  isLiveMicActive: boolean;
  speakerEnabled: boolean;
  equippedBubbleColor?: string;
  equippedBubbleId?: string;
  equippedFrameId?: string;
  equippedSeatEffect?: string;
  ownedItemIds?: string[];
  vipEntryBanner: VipEntryShowcase | null;
  onDismissVipEntry: () => void;
  onOpenRingShop?: () => void;
  onSelectRoom: (roomId: string) => void;
  onMinimizeRoom?: () => void;
  onExitRoom: () => void;
  onOpenCreateRoom: () => void;
  onJumpToMyRoom: () => void;
  onToggleRoomMember: (roomId: string) => void;
  onUpdateRoomSettings: (
    roomId: string,
    updates: {
      title?: string;
      dpUrl?: string;
      bgThemeId?: string;
      bgUrl?: string;
      isRoomLocked?: boolean;
      roomPasscode?: string;
    }
  ) => void;
  onToggleAdmin: (roomId: string, targetUid: string, targetName: string) => void;
  onKickUser: (roomId: string, targetUid: string, targetName: string) => void;
  onLiftUserToSeat: (roomId: string, listener: RoomListener) => void;
  onToggleMuteByUid: (roomId: string, targetUid: string) => void;
  onAddFriendByUid: (uid: string) => string;
  onJoinSeat: (seatIndex: number) => void;
  onLeaveSeat: () => void;
  onToggleMicMute: () => void;
  onToggleSpeaker: () => void;
  onToggleLockSeat: (seatIndex: number) => void;
  onToggleMuteSeat: (seatIndex: number) => void;
  onSendMessage: (text: string, imageUrl?: string) => void;
  onSendEmote: (
    emoteNumber: number,
    label: string,
    symbol: string,
    motion: EmoteMotion
  ) => void;
  friends: FriendRecord[];
  giftAnimationsEnabled: boolean;
  onToggleGiftAnimations: () => void;
  onInviteFriendToRoom: (roomId: string, friend: FriendRecord) => void;
  onSendGift: (
    gift: VirtualGift,
    recipientName: string,
    quantity?: number,
    recipientUid?: string,
    customMessage?: string
  ) => void;
  onClaimRoomTask: (taskId: string) => void;
  onInspectUser: (profile: PublicUserProfile) => void;
  onMessageUser: (uid: string, name: string) => void;
  onSendBackMessage: (uid: string, name: string, text: string) => void;
  onSupportUser?: (
    targetUid: string,
    targetName: string,
    ringNumber: number,
    ringName: string
  ) => void;
  onProposeCp?: (
    toUid: string,
    toName: string,
    toAvatarId: string,
    ringNumber: number,
    ringName: string
  ) => void;
  onTogglePkActive: (roomId: string) => void;
  onSetPkConfig: (
    roomId: string,
    config: {
      mode?: 'gifting' | 'voting';
      format?: '1v1' | 'multiplayer';
      durationMinutes?: 5 | 15 | 30 | 45 | 60;
    }
  ) => void;
  onStartPk: (roomId: string) => void;
  onEndPk: (roomId: string) => void;
  onJoinPkTeam: (roomId: string, side: 'pink' | 'blue') => void;
  onVotePkTeam: (roomId: string, side: 'pink' | 'blue') => void;
}

interface SelectedRoomTarget {
  uid: string;
  name: string;
  avatar: AvatarConfig;
  vipLevel: number;
  charm: number;
  seatIndex?: number;
  isMuted?: boolean;
  isListener?: boolean;
}

const ROOM_DIRECTORY_TABS = ['Recents', 'Online', 'Joined', 'Popular', 'Music', 'Teenagers'] as const;

export const VoiceRoomStage: React.FC<VoiceRoomStageProps> = ({
  rooms,
  activeRoom,
  userUid,
  userName,
  coins,
  charm,
  vipLevel,
  hasCreatedRoom,
  roomTasks,
  gifts,
  userSeatIndex,
  isMicMuted,
  isLiveMicActive,
  speakerEnabled,
  equippedBubbleColor,
  equippedBubbleId,
  equippedFrameId,
  equippedSeatEffect,
  ownedItemIds = [],
  vipEntryBanner,
  onDismissVipEntry,
  onOpenRingShop,
  onSelectRoom,
  onMinimizeRoom,
  onExitRoom,
  onOpenCreateRoom,
  onJumpToMyRoom,
  onToggleRoomMember,
  onUpdateRoomSettings,
  onToggleAdmin,
  onKickUser,
  onLiftUserToSeat,
  onToggleMuteByUid,
  onAddFriendByUid,
  onJoinSeat,
  onLeaveSeat,
  onToggleMicMute,
  onToggleSpeaker,
  onToggleLockSeat,
  onToggleMuteSeat,
  onSendMessage,
  onSendEmote,
  friends,
  giftAnimationsEnabled,
  onToggleGiftAnimations,
  onInviteFriendToRoom,
  onSendGift,
  onClaimRoomTask,
  onInspectUser,
  onMessageUser,
  onSendBackMessage,
  onSupportUser,
  onProposeCp,
  onTogglePkActive,
  onSetPkConfig,
  onStartPk,
  onEndPk,
  onJoinPkTeam,
  onVotePkTeam,
}) => {
  const [showRoomSearch, setShowRoomSearch] = useState(false);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [directoryTab, setDirectoryTab] = useState<(typeof ROOM_DIRECTORY_TABS)[number]>('Recents');
  const [chatInput, setChatInput] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>(
    activeRoom?.hostName || 'Ananya'
  );
  const [selectedRecipientUid, setSelectedRecipientUid] = useState<string>('');
  const [customGiftUid, setCustomGiftUid] = useState<string>('');
  const [selectedGiftId, setSelectedGiftId] = useState<string>(gifts[0]?.id || 'rose');
  const [giftQty, setGiftQty] = useState<number>(1);
  const [bigGiftMessage, setBigGiftMessage] = useState<string>('');
  const [showGiftDock, setShowGiftDock] = useState(false);
  const [showEmoteDock, setShowEmoteDock] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRoomLevelsDrawer, setShowRoomLevelsDrawer] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [invitedFriendUids, setInvitedFriendUids] = useState<string[]>([]);

  // Online / Members / Contribution Sheet state
  const [showListenersDrawer, setShowListenersDrawer] = useState(false);
  const [sheetTab, setSheetTab] = useState<'online' | 'members' | 'contribution'>('contribution');
  const [contribPeriod, setContribPeriod] = useState<'Daily' | 'Weekly' | 'Total'>('Daily');
  const [showContribTip, setShowContribTip] = useState(false);

  const [roomNameDraft, setRoomNameDraft] = useState('');
  const [roomPasscodeDraft, setRoomPasscodeDraft] = useState('');
  const [actionTarget, setActionTarget] = useState<SelectedRoomTarget | null>(null);
  const [showCardReplyInput, setShowCardReplyInput] = useState(false);
  const [showCardCpId, setShowCardCpId] = useState(false);
  const [showSeatCpPicker, setShowSeatCpPicker] = useState(false);
  const [selectedSeatCpRingNum, setSelectedSeatCpRingNum] = useState<number>(1);
  const [cardReplyDraft, setCardReplyDraft] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const ownedRingItems = useMemo(
    () => SHOP_ITEMS.filter((i) => i.category === 'ring' && ownedItemIds.includes(i.id)),
    [ownedItemIds]
  );
  const selfChatFrameNum = resolveChatFrameNumber(equippedBubbleId);

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      !roomSearchQuery.trim() ||
      r.uid.toLowerCase().includes(roomSearchQuery.trim().toLowerCase()) ||
      r.title.toLowerCase().includes(roomSearchQuery.trim().toLowerCase());
    const matchesTab =
      directoryTab === 'Recents' ||
      directoryTab === 'Online' ||
      (directoryTab === 'Joined' &&
        (r.isUserCreated || r.memberUids.includes(userUid) || r.id === activeRoom?.id)) ||
      r.category === directoryTab ||
      r.tags.includes(directoryTab);
    return matchesSearch && matchesTab;
  });

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setChatInput('');
  };

  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSendMessage(chatInput.trim() || 'Shared a photo', reader.result);
        setChatInput('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRoomDpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeRoom) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateRoomSettings(activeRoom.id, { dpUrl: reader.result });
        notify('Room profile picture updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRoomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeRoom) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateRoomSettings(activeRoom.id, { bgUrl: reader.result });
        notify('Room background image updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const notify = (msg: string) => {
    setActionNotice(msg);
    window.setTimeout(() => setActionNotice(null), 2600);
  };

  const selectedGift = gifts.find((g) => g.id === selectedGiftId) ?? gifts[0];

  const roomRecipientCandidates: Array<{ uid: string; name: string; avatar: AvatarConfig }> = [];
  if (activeRoom) {
    for (const s of activeRoom.seats) {
      if (s.occupant && !roomRecipientCandidates.some((c) => c.uid === s.occupant!.uid)) {
        roomRecipientCandidates.push({
          uid: s.occupant.uid,
          name: s.occupant.name,
          avatar: s.occupant,
        });
      }
    }
    for (const l of activeRoom.listeners) {
      if (!roomRecipientCandidates.some((c) => c.uid === l.uid)) {
        const av = AVATAR_ROSTER.find((a) => a.uid === l.uid || a.id === l.avatarId) ?? AVATAR_ROSTER[0];
        roomRecipientCandidates.push({ uid: l.uid, name: l.name, avatar: av });
      }
    }
  }
  for (const av of AVATAR_ROSTER) {
    if (!roomRecipientCandidates.some((c) => c.uid === av.uid)) {
      roomRecipientCandidates.push({ uid: av.uid, name: av.name, avatar: av });
    }
  }

  const activeRecipientCandidate =
    roomRecipientCandidates.find((c) => c.uid === selectedRecipientUid) ??
    roomRecipientCandidates.find((c) => c.name === selectedRecipient) ??
    roomRecipientCandidates[0];

  const activeBg =
    ROOM_BACKGROUND_THEMES.find((b) => b.id === activeRoom?.bgThemeId) ??
    ROOM_BACKGROUND_THEMES[0];
  const nextExpTarget = activeRoom ? getRoomNextExp(activeRoom.level) : 15_000;
  const activeLevelInfo = activeRoom
    ? ROOM_LEVEL_INFO[Math.max(0, Math.min(19, activeRoom.level - 1))]
    : null;

  const isOwner = activeRoom ? activeRoom.ownerUid === userUid : false;
  const isAdmin = activeRoom ? activeRoom.adminUids.includes(userUid) : false;
  const hasModAuthority = isOwner || isAdmin;
  const isJoinedMember = activeRoom ? activeRoom.memberUids.includes(userUid) : false;

  // Compute Contributor Leaderboard (showing exact Coins Spent per user)
  const contributorRows = useMemo(() => {
    if (!activeRoom) return [];
    const spentMap: Record<string, number> = { ...(activeRoom.coinsSpentByUid ?? {}) };
    const periodMultiplier =
      contribPeriod === 'Daily' ? 1 : contribPeriod === 'Weekly' ? 3.4 : 9.2;

    const uids = new Set<string>(Object.keys(spentMap));
    activeRoom.seats.forEach((s) => s.occupant && uids.add(s.occupant.uid));
    activeRoom.listeners.forEach((l) => uids.add(l.uid));
    uids.add(userUid);

    const rows = Array.from(uids).map((uid) => {
      const seat = activeRoom.seats.find((s) => s.occupant?.uid === uid);
      const lis = activeRoom.listeners.find((l) => l.uid === uid);
      const roster = AVATAR_ROSTER.find((a) => a.uid === uid);
      const isMe = uid === userUid;
      const avatar: AvatarConfig = isMe
        ? {
            id: 'user-self',
            uid: userUid,
            name: userName,
            handle: `@${userName.toLowerCase()}`,
            skinTone: '#E0AC89',
            hairColor: '#1E293B',
            robeColor: '#F59E0B',
            accentColor: '#FBBF24',
            ornament: 'crown',
          }
        : seat?.occupant ??
          roster ?? {
            id: lis?.avatarId ?? `u-${uid}`,
            uid,
            name: lis?.name ?? `User ${uid.slice(-4)}`,
            handle: `@user`,
            skinTone: '#D69E76',
            hairColor: '#1E293B',
            robeColor: '#06B6D4',
            accentColor: '#A5F3FC',
            ornament: 'lotus',
          };

      const rawSpend = spentMap[uid] ?? (seat ? seat.giftScore * 10 : 0);
      const coinsSpent = Math.round(rawSpend * periodMultiplier);
      const rowVip = isMe ? vipLevel : (seat?.vipLevel ?? lis?.vipLevel ?? 3);
      const rowCharm = isMe ? charm : (seat?.charmValue ?? lis?.charm ?? 12_000);

      return {
        uid,
        name: avatar.name,
        avatar,
        vipLevel: rowVip,
        charmLevel: getCharmLevelInfo(rowCharm).current.level,
        coinsSpent,
      };
    });

    return rows
      .filter((r) => r.coinsSpent > 0 || r.uid === userUid)
      .sort((a, b) => b.coinsSpent - a.coinsSpent);
  }, [activeRoom, contribPeriod, userUid, userName, vipLevel, charm]);

  const userContribIndex = contributorRows.findIndex((r) => r.uid === userUid);
  const userContribRow = userContribIndex >= 0 ? contributorRows[userContribIndex] : null;
  const top3Contributors = contributorRows.slice(0, 3);

  const entryItem = vipEntryBanner?.effectId
    ? SHOP_ITEMS.find((i) => i.id === vipEntryBanner.effectId)
    : undefined;

  const entryEffectMeta = (() => {
    const variant = entryItem?.styleVariant || 'flame';
    if (variant === 'car') {
      return {
        icon: '🏎️',
        gradient: 'linear-gradient(90deg, rgba(56,189,248,0.65), rgba(37,99,235,0.45), rgba(13,12,24,0.85))',
        border: '#38BDF8',
      };
    }
    if (variant === 'river') {
      return {
        icon: '🌊',
        gradient: 'linear-gradient(90deg, rgba(34,211,238,0.65), rgba(6,182,212,0.4), rgba(13,12,24,0.85))',
        border: '#22D3EE',
      };
    }
    if (variant === 'golden-palace') {
      return {
        icon: '🏛️',
        gradient: 'linear-gradient(90deg, rgba(253,224,71,0.7), rgba(245,158,11,0.45), rgba(13,12,24,0.85))',
        border: '#FDE047',
      };
    }
    if (variant === 'throne') {
      return {
        icon: '👑',
        gradient: 'linear-gradient(90deg, rgba(239,68,68,0.65), rgba(245,158,11,0.4), rgba(13,12,24,0.85))',
        border: '#EF4444',
      };
    }
    if (variant === 'crab') {
      return {
        icon: '🦀',
        gradient: 'linear-gradient(90deg, rgba(249,115,22,0.65), rgba(244,63,94,0.4), rgba(13,12,24,0.85))',
        border: '#F97316',
      };
    }
    return {
      icon: '🔥',
      gradient: 'linear-gradient(90deg, rgba(251,191,36,0.65), rgba(168,85,247,0.4), rgba(13,12,24,0.85))',
      border: '#FBBF24',
    };
  })();

  const openTargetByUid = (uid: string, fallbackName: string) => {
    if (!activeRoom) return;
    const seatMatch = activeRoom.seats.find((s) => s.occupant?.uid === uid);
    if (seatMatch?.occupant) {
      setActionTarget({
        uid: seatMatch.occupant.uid,
        name: seatMatch.occupant.name,
        avatar: seatMatch.occupant,
        vipLevel: seatMatch.isUser ? vipLevel : (seatMatch.vipLevel ?? 1),
        charm: seatMatch.isUser ? charm : (seatMatch.charmValue ?? 0),
        seatIndex: seatMatch.seatIndex,
        isMuted: seatMatch.isMuted,
      });
      return;
    }
    const listenerMatch = activeRoom.listeners.find((l) => l.uid === uid);
    const av =
      AVATAR_ROSTER.find((a) => a.uid === uid) ?? {
        id: `ext-${uid}`,
        uid,
        name: fallbackName,
        handle: `@${fallbackName.toLowerCase()}`,
        skinTone: '#D69E76',
        hairColor: '#1E293B',
        robeColor: '#06B6D4',
        accentColor: '#A5F3FC',
        ornament: 'crown',
      };
    setActionTarget({
      uid,
      name: listenerMatch?.name ?? fallbackName,
      avatar: av,
      vipLevel: listenerMatch?.vipLevel ?? 2,
      charm: listenerMatch?.charm ?? 1200,
      isMuted: listenerMatch?.isMuted,
      isListener: true,
    });
  };

  const openCpPartnerProfileFromCard = (target: SelectedRoomTarget) => {
    const cp = target.avatar.cpPartner;
    if (!cp || !activeRoom) return;
    const seatMatch = activeRoom.seats.find((s) => s.occupant?.uid === cp.partnerUid);
    const rosterMatch = AVATAR_ROSTER.find(
      (a) => a.uid === cp.partnerUid || a.id === cp.partnerAvatarId
    );
    const partnerAvatar: AvatarConfig = seatMatch?.occupant ??
      rosterMatch ?? {
        id: cp.partnerAvatarId || `cp-${cp.partnerUid}`,
        uid: cp.partnerUid,
        name: cp.partnerName,
        handle: `@${cp.partnerName.toLowerCase().replace(/\s+/g, '')}`,
        skinTone: '#D69E76',
        hairColor: '#1E293B',
        robeColor: '#06B6D4',
        accentColor: '#A5F3FC',
        ornament: 'lotus',
      };
    const reciprocalCp = {
      partnerUid: target.uid,
      partnerName: target.name,
      partnerAvatarId: target.avatar.id,
      ringNumber: cp.ringNumber,
      ringName: cp.ringName,
      cpCharm: cp.cpCharm,
      since: cp.since,
    };
    onInspectUser({
      avatar: { ...partnerAvatar, cpPartner: reciprocalCp },
      vipLevel: seatMatch?.isUser ? vipLevel : (seatMatch?.vipLevel ?? 8),
      charm: seatMatch?.isUser ? charm : (seatMatch?.charmValue ?? (cp.cpCharm || 18_000)),
      cpPartner: reciprocalCp,
      ringNumber: cp.ringNumber,
      roomId: activeRoom.id,
      roomTitle: activeRoom.title,
    });
    setActionTarget(null);
    setShowCardReplyInput(false);
    setShowCardCpId(false);
  };

  // Slightly enlarged seats; Seat 0 reserved exclusively for Room Owner ("Leave" when absent)
  const renderCircularSeat = (
    seat: VoiceSeat,
    isTopSeat: boolean,
    pkBadgeSide?: 'pink' | 'blue'
  ) => {
    const isStandardRoom = !activeRoom?.isOfficial;
    const avatarSize = pkBadgeSide
      ? 44
      : isStandardRoom
        ? isTopSeat
          ? 54
          : 45
        : isTopSeat
          ? 42
          : 34;
    const emptyRingClass = pkBadgeSide
      ? 'h-11 w-11'
      : isStandardRoom
        ? isTopSeat
          ? 'h-[54px] w-[54px]'
          : 'h-[45px] w-[45px]'
        : isTopSeat
          ? 'h-[42px] w-[42px]'
          : 'h-[34px] w-[34px]';

    const ringBorderClass =
      pkBadgeSide === 'pink'
        ? 'border-2 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.55)]'
        : pkBadgeSide === 'blue'
          ? 'border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.55)]'
          : '';

    const isOwnerOnlySeat = seat.seatIndex === 0;

    if (!seat.occupant) {
      return (
        <div key={seat.seatIndex} className="relative flex flex-col items-center">
          {hasModAuthority && !isOwnerOnlySeat && (
            <button
              type="button"
              onClick={() => onToggleLockSeat(seat.seatIndex)}
              title={seat.isLocked ? 'Unlock seat' : 'Lock seat'}
              className="absolute -top-1 right-0 z-20 rounded-full border border-white/15 bg-[#0D1526] p-0.5 text-slate-300 hover:text-amber-300"
            >
              {seat.isLocked ? (
                <Lock className="h-2.5 w-2.5 text-rose-400" />
              ) : (
                <Unlock className="h-2.5 w-2.5" />
              )}
            </button>
          )}

          <button
            type="button"
            disabled={seat.isLocked}
            onClick={() => {
              if (isOwnerOnlySeat && !isOwner) {
                notify('Owner Seat is reserved exclusively for the Room Owner.');
                return;
              }
              onJoinSeat(seat.seatIndex);
            }}
            className="group flex flex-col items-center disabled:cursor-not-allowed"
          >
            <div
              className={`flex items-center justify-center rounded-full border transition-colors ${emptyRingClass} ${
                pkBadgeSide === 'pink'
                  ? 'border-2 border-pink-400 bg-pink-500/15 text-pink-200'
                  : pkBadgeSide === 'blue'
                    ? 'border-2 border-sky-400 bg-sky-500/15 text-sky-200'
                    : seat.isLocked
                      ? 'border-rose-500/50 bg-rose-950/35 text-rose-400'
                      : isOwnerOnlySeat
                        ? 'border-amber-400/65 bg-amber-500/15 text-amber-200 hover:border-amber-300'
                        : 'border-amber-300/45 bg-[#0D1526]/80 text-amber-300 hover:border-cyan-300 hover:bg-cyan-500/20'
              }`}
            >
              {seat.isLocked ? (
                <Lock className="h-3 w-3" />
              ) : isOwnerOnlySeat && !isOwner ? (
                <Crown className="h-3.5 w-3.5 text-amber-300/80" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </div>
            {pkBadgeSide ? (
              <span
                className={`-mt-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-black text-white shadow ${
                  pkBadgeSide === 'pink'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600'
                }`}
              >
                PK
              </span>
            ) : (
              <span
                className={`mt-0.5 text-[8.5px] font-semibold ${
                  isOwnerOnlySeat && !seat.isLocked ? 'text-amber-300' : 'text-slate-300'
                }`}
              >
                {seat.isLocked ? 'Locked' : isOwnerOnlySeat ? 'Leave' : `Seat ${seat.seatIndex + 1}`}
              </span>
            )}
          </button>
        </div>
      );
    }

    const occupant = seat.occupant;
    const isRecipient = selectedRecipient === occupant.name;
    const seatCharm = seat.isUser ? charm : (seat.charmValue ?? Math.round(seat.giftScore / 5));
    const seatCharmLevel = getCharmLevelInfo(seatCharm).current.level;
    const seatVip = Math.min(18, seat.isUser ? vipLevel : (seat.vipLevel ?? 1));
    const hasBlazingFx =
      seat.seatEffect === 'Blazing Fire' ||
      (seat.isUser && equippedSeatEffect === 'Blazing Fire Seat FX');

    return (
      <div key={seat.seatIndex} className="relative flex flex-col items-center">
        <div
          onClick={() => {
            setSelectedRecipient(occupant.name);
            setActionTarget({
              uid: occupant.uid,
              name: occupant.name,
              avatar: occupant,
              vipLevel: seatVip,
              charm: seatCharm,
              seatIndex: seat.seatIndex,
              isMuted: seat.isMuted,
            });
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedRecipient(occupant.name);
              setActionTarget({
                uid: occupant.uid,
                name: occupant.name,
                avatar: occupant,
                vipLevel: seatVip,
                charm: seatCharm,
                seatIndex: seat.seatIndex,
                isMuted: seat.isMuted,
              });
            }
          }}
          className={`relative cursor-pointer rounded-full transition-transform hover:scale-105 ${ringBorderClass} ${
            isRecipient && !pkBadgeSide ? 'ring-2 ring-amber-400' : ''
          }`}
          style={hasBlazingFx ? { boxShadow: '0 0 16px rgba(249,115,22,0.5)' } : undefined}
        >
          {hasBlazingFx && (
            <span className="absolute -top-0.5 -left-0.5 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500/90 text-white">
              <Flame className="h-2 w-2" />
            </span>
          )}
          {seat.activeEmote && (
            <div
              style={{ width: avatarSize + 14, height: avatarSize + 14 }}
              className="pointer-events-none absolute inset-0 m-auto z-30 flex items-center justify-center rounded-full border-2 border-cyan-300/90 bg-cyan-950/35 shadow-[0_0_20px_rgba(34,211,238,0.7)] ring-4 ring-cyan-400/25"
            >
              <EmoteSpriteArt
                emoteNumber={seat.activeEmote.emoteNumber}
                size={Math.round(avatarSize * 0.72)}
                alt={seat.activeEmote.label}
                animated
                motion={seat.activeEmote.motion}
              />
            </div>
          )}
          <AvatarArt
            avatar={occupant}
            size={avatarSize}
            isSpeaking={seat.isSpeaking}
            audioLevel={seat.audioLevel}
            isMuted={seat.isMuted}
            frameId={seat.isUser ? equippedFrameId : undefined}
          />
          {seat.isMuted && (
            <span className="absolute right-0 bottom-0 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-white">
              <MicOff className="h-2 w-2" />
            </span>
          )}
        </div>

        {pkBadgeSide && (
          <span
            className={`-mt-1.5 z-10 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-black text-white shadow ${
              pkBadgeSide === 'pink'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                : 'bg-gradient-to-r from-sky-500 to-blue-600'
            }`}
          >
            <Armchair className="h-2.5 w-2.5" />
            <span>PK</span>
          </span>
        )}

        {/* Name + Charm Badge + VIP Badge to the right of user's name */}
        <button
          type="button"
          onClick={() =>
            setActionTarget({
              uid: occupant.uid,
              name: occupant.name,
              avatar: occupant,
              vipLevel: seatVip,
              charm: seatCharm,
              seatIndex: seat.seatIndex,
              isMuted: seat.isMuted,
            })
          }
          className="mt-0.5 flex max-w-[82px] items-center gap-0.5 rounded px-0.5 hover:bg-white/10"
          title="Tap for Actions / ID"
        >
          <span className="truncate text-[9.5px] font-bold" style={getVipNameStyle(seatVip)}>
            {occupant.name}
          </span>
          <CharmBadgeArt level={seatCharmLevel} size={11} />
          <VipBadgeArt level={seatVip} size={12} />
        </button>

        {/* Clickable UID tag */}
        <button
          type="button"
          onClick={() => openTargetByUid(occupant.uid, occupant.name)}
          className="font-mono-tabular text-[7.5px] text-slate-400 underline-offset-2 hover:text-cyan-300 hover:underline"
        >
          {occupant.uid}
        </button>
      </div>
    );
  };

  // ROOMS DIRECTORY VIEW
  if (!activeRoom) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">Rooms</h1>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowRoomSearch((v) => !v)}
              aria-label="Search Room ID"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                showRoomSearch
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                  : 'border-white/10 bg-[#132038] text-slate-200 hover:bg-[#192946]'
              }`}
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {hasCreatedRoom ? (
              <button
                type="button"
                onClick={onJumpToMyRoom}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25"
              >
                <Mic className="h-3.5 w-3.5" />
                My Room
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenCreateRoom}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95"
              >
                <Plus className="h-3.5 w-3.5" />
                Create
              </button>
            )}
          </div>
        </div>

        {showRoomSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={roomSearchQuery}
              onChange={(e) => setRoomSearchQuery(e.target.value)}
              placeholder="Search Room ID (e.g. 10482, 10001)..."
              className="w-full rounded-2xl border border-white/10 bg-[#0D1526] py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-5 overflow-x-auto border-b border-white/10 pb-0.5">
          {ROOM_DIRECTORY_TABS.map((tab) => {
            const active = directoryTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setDirectoryTab(tab)}
                className={`relative pb-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
                {active && (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#0D1526] p-3.5 transition-colors hover:border-cyan-400/35"
            >
              <div className="flex min-w-0 items-center gap-3.5">
                {room.dpUrl ? (
                  <img
                    src={room.dpUrl}
                    alt={room.title}
                    className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#132038]">
                    <RoomLevelBadgeArt level={room.level} size={40} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display truncate text-base font-bold text-white">
                      {room.title}
                    </h3>
                    {room.isRoomLocked && (
                      <span title="Locked Room" className="inline-flex shrink-0">
                        <Lock className="h-3.5 w-3.5 text-amber-300" />
                      </span>
                    )}
                    {(room.isUserCreated || room.ownerUid === userUid) && (
                      <span className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                        Permanent
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {room.listenerCount} online
                    </span>
                    <span>·</span>
                    <span className="font-mono-tabular">ID {room.uid}</span>
                    <span>·</span>
                    <span>
                      {room.isOfficial ? `Official ${room.seats.length} Seats` : `${room.seats.length} Seats`}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectRoom(room.id);
                  setSelectedRecipient(room.hostName);
                }}
                className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PK Helper State
  const pk = activeRoom.pkState;
  const pkActive = !!pk?.active;
  const pkTotalScore = (pk?.pinkScore ?? 0) + (pk?.blueScore ?? 0);
  const pinkPercent = pkTotalScore > 0 ? Math.max(12, Math.min(88, Math.round(((pk?.pinkScore ?? 0) / pkTotalScore) * 100))) : 50;
  const pkMins = pk ? String(Math.floor(pk.secondsLeft / 60)).padStart(2, '0') : '03';
  const pkSecs = pk ? String(pk.secondsLeft % 60).padStart(2, '0') : '00';

  const topSeatSliceEnd = activeRoom.isOfficial ? 3 : 2;
  const topSeats = activeRoom.seats.slice(0, topSeatSliceEnd);
  const bottomSeats = activeRoom.seats.slice(topSeatSliceEnd);
  const halfBottom = Math.ceil(bottomSeats.length / 2);

  // Detect active CP connections currently seated together in the Voice Room
  const checkCpPair = (a: AvatarConfig | null | undefined, b: AvatarConfig | null | undefined): number | null => {
    if (!a || !b) return null;
    const isLinked =
      a.cpPartner?.partnerUid === b.uid ||
      b.cpPartner?.partnerUid === a.uid;
    if (!isLinked) return null;
    const charmSum = Math.max(a.cpPartner?.cpCharm ?? 0, b.cpPartner?.cpCharm ?? 0);
    return getCpLevelInfo(charmSum).level;
  };

  const renderSeatRowWithCpHearts = (
    rowSeats: VoiceSeat[],
    isTop: boolean,
    colsClass: string,
    maxWidthClass: string
  ) => {
    const colCount = rowSeats.length;
    const adjacentPairs: Array<{ idx: number; cpLevel: number }> = [];
    for (let i = 0; i < rowSeats.length - 1; i++) {
      const lvl = checkCpPair(rowSeats[i]?.occupant, rowSeats[i + 1]?.occupant);
      if (lvl !== null) {
        adjacentPairs.push({ idx: i, cpLevel: lvl });
      }
    }
    return (
      <div className={`relative mx-auto grid justify-items-center gap-2 ${maxWidthClass} ${colsClass}`}>
        {rowSeats.map((seat) => renderCircularSeat(seat, isTop))}
        {adjacentPairs.map(({ idx, cpLevel }) => {
          const leftPercent = ((idx + 1) / colCount) * 100;
          return (
            <div
              key={`cp-heart-row-${rowSeats[idx]?.seatIndex}-${rowSeats[idx + 1]?.seatIndex}`}
              style={{ left: `${leftPercent}%` }}
              className="pointer-events-none absolute top-3.5 z-30 -translate-x-1/2 animate-pulse"
              title={`CP Bond Lv.${cpLevel}`}
            >
              <CpHeartConnectorArt size={isTop ? 44 : 38} cpLevel={cpLevel} />
            </div>
          );
        })}
      </div>
    );
  };

  const bottomSeatRows: VoiceSeat[][] = [];
  for (let i = 0; i < bottomSeats.length; i += 4) {
    bottomSeatRows.push(bottomSeats.slice(i, i + 4));
  }

  // Also detect any seated CP pair across different rows so the heart connector always renders when together
  const crossRowCpBonds = (() => {
    const seated = activeRoom.seats.filter((s) => s.occupant);
    const pairs: Array<{ aName: string; bName: string; cpLevel: number; key: string }> = [];
    const seen = new Set<string>();
    for (let i = 0; i < seated.length; i++) {
      for (let j = i + 1; j < seated.length; j++) {
        const sA = seated[i];
        const sB = seated[j];
        const lvl = checkCpPair(sA.occupant, sB.occupant);
        if (lvl !== null) {
          // Check if already adjacent in topSeats or within a 4-seat bottom row
          const sameTopAdjacent =
            sA.seatIndex < topSeatSliceEnd &&
            sB.seatIndex < topSeatSliceEnd &&
            Math.abs(sA.seatIndex - sB.seatIndex) === 1;
          const bA = sA.seatIndex - topSeatSliceEnd;
          const bB = sB.seatIndex - topSeatSliceEnd;
          const sameBottomAdjacent =
            bA >= 0 &&
            bB >= 0 &&
            Math.floor(bA / 4) === Math.floor(bB / 4) &&
            Math.abs(bA - bB) === 1;
          if (!sameTopAdjacent && !sameBottomAdjacent) {
            const pairKey = [sA.occupant!.uid, sB.occupant!.uid].sort().join(':');
            if (!seen.has(pairKey)) {
              seen.add(pairKey);
              pairs.push({
                aName: sA.occupant!.name,
                bName: sB.occupant!.name,
                cpLevel: lvl,
                key: pairKey,
              });
            }
          }
        }
      }
    }
    return pairs;
  })();

  // ACTIVE VOICE ROOM STAGE (True Full-Screen Edge-to-Edge Layout)
  return (
    <div
      style={
        activeRoom.bgUrl
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(7,11,20,0.45) 0%, rgba(7,11,20,0.82) 100%), url(${activeRoom.bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { background: activeBg.gradient }
      }
      className="fixed inset-0 z-50 h-dvh w-screen overflow-hidden"
    >
      <div className="relative mx-auto flex h-full w-full max-w-xl flex-col justify-between p-2.5 sm:p-4">
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Top Bar: Minimize + Room Name & Room-Level Badge + Join (left) | Top-3 Avatars + Invite + Settings + Exit (right) */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex min-w-0 items-center gap-1">
              <button
                type="button"
                onClick={onMinimizeRoom ?? onExitRoom}
                aria-label="Minimize Room"
                title="Minimize Room (keeps room pill open)"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white hover:bg-black/60"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRoomLevelsDrawer((v) => !v)}
                className="flex min-w-0 items-center gap-1 rounded-full border border-white/15 bg-black/45 py-0.5 pr-1.5 pl-1 text-left backdrop-blur-sm hover:border-cyan-400/50"
                title="View Room Level Batches (Lv.1–20)"
              >
                {activeRoom.dpUrl && (
                  <img
                    src={activeRoom.dpUrl}
                    alt={activeRoom.title}
                    className="h-5.5 w-5.5 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="max-w-[66px] truncate text-[10.5px] font-bold text-white">
                      {activeRoom.title}
                    </span>
                    <RoomLevelBadgeArt level={activeRoom.level} size={16} />
                    {activeRoom.isRoomLocked && <Lock className="h-2.5 w-2.5 text-amber-300" />}
                  </div>
                  <div className="font-mono-tabular text-[8px] text-slate-300">
                    ID {activeRoom.uid}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleRoomMember(activeRoom.id);
                  notify(
                    isJoinedMember
                      ? `Left membership of ${activeRoom.title}`
                      : `Joined ${activeRoom.title} as a Member!`
                  );
                }}
                className={`inline-flex h-6.5 shrink-0 items-center gap-0.5 rounded-full px-1.5 text-[9px] font-bold whitespace-nowrap transition-colors ${
                  isJoinedMember
                    ? 'border border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:opacity-95'
                }`}
              >
                {isJoinedMember ? (
                  <>
                    <Check className="h-2.5 w-2.5" />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-2.5 w-2.5" />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>

            {/* Top-Right: Contribution Pill Only */}
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => {
                  setSheetTab('contribution');
                  setShowListenersDrawer((v) => !v);
                }}
                className="flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2 py-0.5 hover:border-cyan-400/50"
                title="View Online, Members & Contribution"
              >
                <div className="flex -space-x-1">
                  {top3Contributors.map((c, idx) => (
                    <div key={c.uid} className="relative">
                      <AvatarArt avatar={c.avatar} size={19} />
                      <span
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1 font-mono-tabular text-[6.5px] font-black text-slate-950 ${
                          idx === 0
                            ? 'bg-amber-300'
                            : idx === 1
                              ? 'bg-slate-200'
                              : 'bg-orange-300'
                        }`}
                      >
                        {c.coinsSpent >= 1000 ? `${Math.round(c.coinsSpent / 1000)}k` : c.coinsSpent}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="ml-0.5 rounded-full bg-white/10 px-1 py-0.5 font-mono-tabular text-[9.5px] font-bold text-white">
                  {activeRoom.listenerCount}
                </span>
              </button>
            </div>
          </div>

          {/* Relocated Quick Room Controls Row directly below the Contribution Section */}
          <div className="mt-1.5 flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowInviteFriendsModal(true)}
              aria-label="Invite Friends"
              title="Invite Friends to Voice Room"
              className="flex h-7 items-center gap-1 rounded-full border border-cyan-400/35 bg-cyan-500/20 px-2.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/35 hover:text-white"
            >
              <UserPlus className="h-3 w-3" />
              <span>Invite</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoomNameDraft(activeRoom.title);
                setRoomPasscodeDraft(activeRoom.roomPasscode || '');
                setShowSettingsModal((v) => !v);
              }}
              aria-label="Room Settings"
              title="Room Settings (Name, DP, BG, Lock, Admins)"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white hover:border-cyan-400/50 hover:bg-black/65"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onExitRoom}
              aria-label="Exit Voice Room"
              title="Exit Voice Room Completely"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {actionNotice && (
            <div className="mt-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
              {actionNotice}
            </div>
          )}

          {/* V6-Style Golden Hexagonal Badge + Purple-to-Pink Metallic Ribbon Entry Effect (triggers whenever any user enters) */}
          {vipEntryBanner && (
            <div
              onClick={onDismissVipEntry}
              role="presentation"
              className="pointer-events-none absolute inset-x-3 top-14 z-40 flex justify-center"
            >
              <div className="animate-entry-ribbon relative flex w-full max-w-[330px] items-center py-1 pl-1">
                {/* Horizontal gradient ribbon fading softly on right */}
                <div
                  className="relative ml-5 flex h-9 flex-1 items-center overflow-hidden pl-7 pr-8 shadow-[0_6px_24px_rgba(168,85,247,0.45)]"
                  style={{
                    background:
                      vipEntryBanner.vipLevel >= 1
                        ? 'linear-gradient(90deg, rgba(147,51,234,0.92) 0%, rgba(236,72,153,0.95) 52%, rgba(168,85,247,0.6) 80%, rgba(168,85,247,0) 100%)'
                        : 'linear-gradient(90deg, rgba(59,130,246,0.9) 0%, rgba(168,85,247,0.92) 55%, rgba(168,85,247,0) 100%)',
                    maskImage: 'linear-gradient(90deg, black 0%, black 80%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(90deg, black 0%, black 80%, transparent 100%)',
                  }}
                >
                  {/* Top metallic white-silver highlight streak */}
                  <span
                    className="pointer-events-none absolute top-0 right-6 left-0 h-[1.5px] bg-gradient-to-r from-white/95 via-white/80 to-transparent"
                    aria-hidden="true"
                  />
                  {/* Bottom subtle glow line */}
                  <span
                    className="pointer-events-none absolute right-10 bottom-0 left-0 h-[1px] bg-gradient-to-r from-pink-200/70 via-white/30 to-transparent"
                    aria-hidden="true"
                  />
                  {/* Sparkling star dots */}
                  <span
                    className="pointer-events-none absolute top-1.5 left-24 h-1.5 w-1.5 animate-pulse rounded-full bg-white shadow-[0_0_8px_#fff]"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute right-24 bottom-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-pink-100 shadow-[0_0_8px_#fff]"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute top-2 right-16 h-1 w-1 rounded-full bg-white/90 shadow-[0_0_6px_#fff]"
                    aria-hidden="true"
                  />
                  {/* Sweeping sheen */}
                  <span
                    className="animate-ribbon-sheen pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-center gap-1.5 text-sm font-black italic tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]">
                    {entryEffectMeta.icon && (
                      <span className="text-xs not-italic" aria-hidden="true">
                        {entryEffectMeta.icon}
                      </span>
                    )}
                    <span
                      className="truncate max-w-[140px]"
                      style={
                        vipEntryBanner.vipLevel > 0
                          ? getVipNameStyle(vipEntryBanner.vipLevel)
                          : { color: '#FFFFFF' }
                      }
                    >
                      {vipEntryBanner.name}
                    </span>
                    <span className="font-semibold not-italic text-white/95 text-xs">entered</span>
                  </div>
                </div>

                {/* Left Overlapping VIP Badge matching User's VIP Level */}
                <div className="absolute left-0 z-10 flex items-center justify-center drop-shadow-[0_3px_10px_rgba(245,158,11,0.75)]">
                  {vipEntryBanner.vipLevel > 0 ? (
                    <VipBadgeArt level={vipEntryBanner.vipLevel} size={44} />
                  ) : (
                    <>
                      <svg
                        width="54"
                        height="44"
                        viewBox="0 0 54 44"
                        className="pointer-events-none absolute"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 31 C4 26, 2 16, 8 8 C8 16, 10 23, 16 28 Z"
                          fill="#FACC15"
                          stroke="#FEF08A"
                          strokeWidth="0.8"
                        />
                        <path
                          d="M42 31 C50 26, 52 16, 46 8 C46 16, 44 23, 38 28 Z"
                          fill="#FACC15"
                          stroke="#FEF08A"
                          strokeWidth="0.8"
                        />
                      </svg>
                      <div
                        className="relative flex h-10 w-9 items-center justify-center shadow-lg"
                        style={{
                          clipPath: 'polygon(50% 2%, 96% 24%, 96% 76%, 50% 98%, 4% 76%, 4% 24%)',
                          background: 'linear-gradient(180deg, #FEF08A 0%, #F59E0B 55%, #B45309 100%)',
                          padding: '2px',
                        }}
                      >
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{
                            clipPath: 'polygon(50% 2%, 96% 24%, 96% 76%, 50% 98%, 4% 76%, 4% 24%)',
                            background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 70%, #92400E 100%)',
                          }}
                        >
                          <span className="font-display text-sm font-black tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                            V0
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Top-Right Room Settings Overlay Drawer (Name, DP, BG, 4-Digit Room Lock, Admin Management) */}
          {showSettingsModal && (
            <div className="zayro-scroll absolute inset-x-2.5 top-12 z-30 max-h-[78%] space-y-3 overflow-y-auto rounded-2xl border border-cyan-400/30 bg-[#0A101D]/95 p-3.5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Room Settings</h3>
                  <p className="text-[10px] text-slate-400">
                    Role: {isOwner ? 'Room Owner' : isAdmin ? 'Room Admin' : 'Member / Guest'} ·{' '}
                    {getAdminSlotCount(activeRoom.level)} Admin Slots
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-lg border border-white/15 p-1.5 text-slate-300 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Personal Room Setting: Disable Gift Animations */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0D1526] px-3 py-2 text-xs">
                <div>
                  <div className="font-bold text-white">Disable Gift Animations</div>
                  <div className="text-[10px] text-slate-400">
                    Hide full-screen gift effects while keeping coins, charm &amp; big-gift bar active
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!giftAnimationsEnabled}
                  onChange={() => {
                    onToggleGiftAnimations();
                    notify(giftAnimationsEnabled ? 'Gift animations disabled' : 'Gift animations enabled');
                  }}
                  aria-label="Disable Gift Animations"
                  className="h-4 w-4 shrink-0 accent-cyan-400"
                />
              </div>

              {hasModAuthority ? (
                <>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!roomNameDraft.trim()) return;
                        onUpdateRoomSettings(activeRoom.id, { title: roomNameDraft.trim() });
                        notify('Room name updated!');
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={roomNameDraft}
                        onChange={(e) => setRoomNameDraft(e.target.value)}
                        placeholder="Change Room Name..."
                        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#0D1526] px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                      >
                        Save
                      </button>
                    </form>

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Room Photo (DP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleRoomDpUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* 4-Digit Room Lock Code Security */}
                  <div className="rounded-xl border border-amber-400/25 bg-[#0D1526] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Lock className="h-3.5 w-3.5 text-amber-300" />
                        <span>Room Lock (4-Digit Code)</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          activeRoom.isRoomLocked
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {activeRoom.isRoomLocked ? `Locked (${activeRoom.roomPasscode})` : 'Unlocked'}
                      </span>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const clean = roomPasscodeDraft.replace(/\D/g, '').slice(0, 4);
                        if (clean.length !== 4) {
                          notify('Please enter a 4-digit numeric passcode.');
                          return;
                        }
                        onUpdateRoomSettings(activeRoom.id, {
                          isRoomLocked: true,
                          roomPasscode: clean,
                        });
                        setRoomPasscodeDraft(clean);
                        notify(`Room locked with 4-digit code ${clean}!`);
                      }}
                      className="mt-2 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={roomPasscodeDraft}
                        onChange={(e) =>
                          setRoomPasscodeDraft(e.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="4-digit PIN (e.g. 1234)"
                        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#070B14] px-3 py-1.5 font-mono-tabular text-xs tracking-widest text-white focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-amber-400"
                      >
                        {activeRoom.isRoomLocked ? 'Update PIN' : 'Lock Room'}
                      </button>
                      {activeRoom.isRoomLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateRoomSettings(activeRoom.id, { isRoomLocked: false });
                            notify('Room unlocked!');
                          }}
                          className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white"
                        >
                          Unlock
                        </button>
                      )}
                    </form>
                  </div>

                  {/* Room Background Theme & Custom Photo */}
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-amber-300" />
                        <span>Room Background</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/15 px-2.5 py-1 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/25">
                          <Upload className="h-3 w-3" />
                          <span>Wallpaper</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRoomBgUpload}
                            className="hidden"
                          />
                        </label>
                        {activeRoom.bgUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateRoomSettings(activeRoom.id, { bgUrl: '' });
                              notify('Cleared custom wallpaper');
                            }}
                            className="rounded-lg bg-white/10 px-2 py-1 text-[10px] text-slate-200"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ROOM_BACKGROUND_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            onUpdateRoomSettings(activeRoom.id, { bgThemeId: theme.id, bgUrl: '' });
                            notify(`Background switched to ${theme.name}`);
                          }}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                            !activeRoom.bgUrl && activeRoom.bgThemeId === theme.id
                              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                              : 'border-white/10 bg-[#0D1526] text-slate-300 hover:text-white'
                          }`}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">
                  <Lock className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>
                    Only the Room Owner and appointed Admins can change the room name, DP, background, or 4-digit lock code.
                  </span>
                </div>
              )}

              {/* Manage Admins */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                    <Shield className="h-3.5 w-3.5 text-amber-300" />
                    Manage Admins ({activeRoom.adminUids.length}/{getAdminSlotCount(activeRoom.level)}) &amp; Users
                  </span>
                </div>

                <div className="zayro-scroll max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  {activeRoom.seats
                    .filter((s) => s.occupant)
                    .map((s) => {
                      const occ = s.occupant!;
                      const isRowOwner = occ.uid === activeRoom.ownerUid;
                      const isRowAdmin = activeRoom.adminUids.includes(occ.uid);
                      const rowVip = s.isUser ? vipLevel : (s.vipLevel ?? 1);
                      return (
                        <div
                          key={occ.uid}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#0D1526] px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={getVipNameStyle(rowVip)}>
                              {occ.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => openTargetByUid(occ.uid, occ.name)}
                              className="font-mono-tabular text-[11px] text-cyan-300 underline"
                            >
                              {occ.uid}
                            </button>
                            {isRowOwner && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300">
                                <Crown className="h-3 w-3" /> Owner
                              </span>
                            )}
                            {!isRowOwner && isRowAdmin && (
                              <span className="text-[10px] font-bold text-sky-300">Admin</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isOwner && !isRowOwner && (
                              <button
                                type="button"
                                onClick={() => {
                                  onToggleAdmin(activeRoom.id, occ.uid, occ.name);
                                  notify(
                                    isRowAdmin
                                      ? `Removed ${occ.name} from Admin`
                                      : `Appointed ${occ.name} as Admin`
                                  );
                                }}
                                className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                                  isRowAdmin
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-sky-500/20 text-sky-300'
                                }`}
                              >
                                {isRowAdmin ? 'Remove Admin' : 'Make Admin'}
                              </button>
                            )}
                            {hasModAuthority && !isRowOwner && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onToggleMuteSeat(s.seatIndex)}
                                  className="rounded-lg bg-white/10 px-2 py-1 text-[10px] text-white"
                                >
                                  {s.isMuted ? 'Unmute' : 'Mute'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onKickUser(activeRoom.id, occ.uid, occ.name);
                                    notify(`Removed ${occ.name} from seat`);
                                  }}
                                  className="rounded-lg bg-rose-500 px-2 py-1 text-[10px] font-bold text-white"
                                >
                                  Kick
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Online / Members / Contribution Bottom Sheet */}
          {showListenersDrawer && (
            <div className="absolute inset-x-0 bottom-0 z-40 flex max-h-[82%] flex-col overflow-hidden rounded-t-3xl border-t border-cyan-400/25 bg-[#0D1526] text-white shadow-[0_-12px_40px_rgba(0,0,0,0.75)]">
              {/* Top Handle + Small Clickable Details Strip right above tabs */}
              <div className="flex flex-col items-center pt-2">
                <div className="h-1 w-10 rounded-full bg-white/25" />
                <button
                  type="button"
                  onClick={() => setShowContribTip((v) => !v)}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-cyan-400/25 bg-[#132038] px-3 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-[#192946]"
                >
                  <span>
                    {sheetTab === 'contribution'
                      ? 'Top Coin Spenders · Tap for details'
                      : sheetTab === 'online'
                        ? `${activeRoom.listenerCount} Online Users · Tap ID for Actions`
                        : `${activeRoom.memberUids.length} Joined Members`}
                  </span>
                  <ChevronUp className={`h-3 w-3 transition-transform ${showContribTip ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showContribTip && (
                <div className="mx-4 mt-1.5 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-[11px] text-amber-100">
                  <span>
                    Shows total Coins spent on gifts &amp; packs in {activeRoom.title}. Tap any user row to view profile or manage.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowContribTip(false)}
                    className="ml-2 text-amber-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Sheet Tabs: Online | Members | Contribution */}
              <div className="mt-2 flex items-center justify-between border-b border-white/10 px-4">
                <div className="flex flex-1 items-center justify-around">
                  {(
                    [
                      { id: 'online', label: `Online ${activeRoom.listenerCount}` },
                      { id: 'members', label: `Members ${activeRoom.memberUids.length}` },
                      { id: 'contribution', label: 'Contribution' },
                    ] as const
                  ).map((t) => {
                    const active = sheetTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSheetTab(t.id)}
                        className={`relative pb-2.5 text-xs font-bold transition-colors ${
                          active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t.label}
                        {active && (
                          <span className="absolute right-2 bottom-0 left-2 h-0.5 rounded-full bg-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setShowListenersDrawer(false)}
                  aria-label="Close Sheet"
                  className="mb-1 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* TAB: CONTRIBUTION (Daily / Weekly / Total + Coins Spent per user) */}
              {sheetTab === 'contribution' && (
                <>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {(['Daily', 'Weekly', 'Total'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setContribPeriod(p)}
                          className={`rounded-full px-3.5 py-1 text-[11px] font-bold transition-colors ${
                            contribPeriod === p
                              ? 'border border-cyan-400/35 bg-cyan-500/20 text-cyan-300'
                              : 'bg-[#132038] text-slate-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowContribTip((v) => !v)}
                      aria-label="Contribution Help"
                      className="text-slate-400 hover:text-cyan-300"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="zayro-scroll flex-1 space-y-1 overflow-y-auto px-4 pb-3">
                    {contributorRows.map((row, idx) => {
                      const rank = idx + 1;
                      return (
                        <div
                          key={row.uid}
                          onClick={() => openTargetByUid(row.uid, row.name)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') openTargetByUid(row.uid, row.name);
                          }}
                          className="flex cursor-pointer items-center justify-between rounded-2xl px-2 py-2 hover:bg-[#132038]"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex w-6 shrink-0 items-center justify-center">
                              {rank === 1 ? (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 font-mono-tabular text-[11px] font-black text-amber-300">
                                  👑1
                                </span>
                              ) : rank === 2 ? (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/20 font-mono-tabular text-[11px] font-black text-slate-200">
                                  👑2
                                </span>
                              ) : rank === 3 ? (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 font-mono-tabular text-[11px] font-black text-orange-300">
                                  👑3
                                </span>
                              ) : (
                                <span className="font-mono-tabular text-xs font-bold text-slate-400">
                                  {rank}
                                </span>
                              )}
                            </div>

                            <AvatarArt avatar={row.avatar} size={36} />

                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span
                                  className="truncate text-xs font-extrabold"
                                  style={
                                    row.vipLevel >= 12
                                      ? getVipNameStyle(row.vipLevel)
                                      : { color: '#FFFFFF' }
                                  }
                                >
                                  {row.name}
                                </span>
                                <VipBadgeArt level={row.vipLevel} size={15} />
                                <CharmBadgeArt level={row.charmLevel} size={14} />
                              </div>
                              <div className="font-mono-tabular text-[9.5px] text-slate-400">
                                {row.uid}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className="inline-flex items-center gap-1 font-mono-tabular text-xs font-black text-amber-300">
                              <ZayroCoinArt size={13} />
                              <span>{row.coinsSpent.toLocaleString()}</span>
                            </div>
                            <div className="text-[9.5px] font-semibold text-slate-400">
                              Coins Spent
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sticky Current User Footer */}
                  <div className="flex items-center justify-between border-t border-white/10 bg-[#0A101D] px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center font-mono-tabular text-xs font-black text-slate-400">
                        {userContribIndex >= 0 ? `#${userContribIndex + 1}` : '-'}
                      </span>
                      {userContribRow && <AvatarArt avatar={userContribRow.avatar} size={34} />}
                      <div>
                        <div className="flex items-center gap-1">
                          <span
                            className="text-xs font-extrabold"
                            style={
                              vipLevel >= 12 ? getVipNameStyle(vipLevel) : { color: '#FFFFFF' }
                            }
                          >
                            {userName}
                          </span>
                          <VipBadgeArt level={vipLevel} size={14} />
                        </div>
                        <div className="text-[10px] text-slate-400">Your {contribPeriod} Spend</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 font-mono-tabular text-xs font-black text-amber-300">
                        <ZayroCoinArt size={13} />
                        <span>{(userContribRow?.coinsSpent ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="text-[9.5px] font-semibold text-slate-400">Coins Spent</div>
                    </div>
                  </div>

                  {/* 3 Room Quick Actions (Invite Friends, Room Settings, Exit Room) below Contribution */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/10 bg-[#0A101D] px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowListenersDrawer(false);
                        setShowInviteFriendsModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-2 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/25"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Invite Friends</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowListenersDrawer(false);
                        setRoomNameDraft(activeRoom.title);
                        setRoomPasscodeDraft(activeRoom.roomPasscode || '');
                        setShowSettingsModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-[#132038] px-2.5 py-2 text-[11px] font-bold text-white hover:border-cyan-400/40"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Room Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowListenersDrawer(false);
                        onExitRoom();
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-500/20 px-2.5 py-2 text-[11px] font-bold text-rose-200 hover:bg-rose-500 hover:text-white"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Exit Room</span>
                    </button>
                  </div>
                </>
              )}

              {/* TAB: ONLINE USERS */}
              {sheetTab === 'online' && (
                <div className="zayro-scroll flex-1 space-y-2 overflow-y-auto p-4">
                  {activeRoom.listeners.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      All active users are currently seated on mics.
                    </p>
                  ) : (
                    activeRoom.listeners.map((lis) => (
                      <div
                        key={lis.uid}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#132038] px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold"
                            style={
                              lis.vipLevel >= 12 ? getVipNameStyle(lis.vipLevel) : { color: '#FFFFFF' }
                            }
                          >
                            {lis.name}
                          </span>
                          <VipBadgeArt level={lis.vipLevel} size={16} />
                          <button
                            type="button"
                            onClick={() => openTargetByUid(lis.uid, lis.name)}
                            className="font-mono-tabular text-[10.5px] text-cyan-300 underline"
                          >
                            {lis.uid}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => notify(onAddFriendByUid(lis.uid))}
                            className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-2 py-1 text-[10px] font-bold text-cyan-200"
                          >
                            Add Friend
                          </button>
                          {hasModAuthority && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onLiftUserToSeat(activeRoom.id, lis);
                                  notify(`Lifted ${lis.name} to a mic seat!`);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-bold text-slate-950"
                              >
                                <ArrowUpCircle className="h-3 w-3" />
                                Lift
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleMuteByUid(activeRoom.id, lis.uid)}
                                className="rounded-lg bg-[#192946] px-2 py-1 text-[10px] font-bold text-slate-200"
                              >
                                {lis.isMuted ? 'Unmute' : 'Mute'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onKickUser(activeRoom.id, lis.uid, lis.name);
                                  notify(`Kicked ${lis.name}`);
                                }}
                                className="rounded-lg bg-rose-500 px-2 py-1 text-[10px] font-bold text-white"
                              >
                                Kick
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: MEMBERS */}
              {sheetTab === 'members' && (
                <div className="zayro-scroll flex-1 space-y-2 overflow-y-auto p-4">
                  {activeRoom.memberUids.map((uid) => {
                    const av =
                      uid === userUid
                        ? { name: userName, uid: userUid }
                        : AVATAR_ROSTER.find((a) => a.uid === uid) ?? { name: `Member`, uid };
                    const isRoomOwner = uid === activeRoom.ownerUid;
                    const isRoomAdmin = activeRoom.adminUids.includes(uid);
                    return (
                      <div
                        key={uid}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#132038] px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{av.name}</span>
                          <span className="font-mono-tabular text-[10.5px] text-slate-400">
                            {uid}
                          </span>
                        </div>
                        <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200">
                          {isRoomOwner ? 'Owner' : isRoomAdmin ? 'Admin' : 'Member'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Room EXP & Levels Overlay Drawer */}
          {showRoomLevelsDrawer && (
            <div className="zayro-scroll absolute inset-x-2.5 top-12 z-30 max-h-[75%] space-y-3 overflow-y-auto rounded-2xl border border-cyan-400/25 bg-[#0A101D]/95 p-3.5 shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Room Level {activeRoom.level}/20 ({activeLevelInfo?.title})
                  </h3>
                  <p className="font-mono-tabular text-xs text-slate-300">
                    EXP: {activeRoom.xp.toLocaleString()} / {nextExpTarget.toLocaleString()} ·{' '}
                    {getAdminSlotCount(activeRoom.level)} Admin Slots
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoomLevelsDrawer(false)}
                  className="rounded-lg border border-white/15 px-3 py-1 text-xs text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {roomTasks.map((rt) => (
                  <div
                    key={rt.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0D1526] p-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{rt.title}</div>
                      <div className="text-[11px] text-slate-400">{rt.rule}</div>
                    </div>
                    <button
                      type="button"
                      disabled={rt.claimed}
                      onClick={() => onClaimRoomTask(rt.id)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 disabled:bg-white/10 disabled:text-slate-400"
                    >
                      {rt.claimed
                        ? 'Claimed'
                        : `+${vipLevel > 1 && rt.vipDouble ? rt.rewardExp * 2 : rt.rewardExp} EXP`}
                    </button>
                  </div>
                ))}
              </div>

              <div className="zayro-scroll max-h-40 overflow-y-auto rounded-xl border border-white/10">
                <table className="w-full text-left font-mono-tabular text-[11px]">
                  <thead className="bg-[#0D1526] text-slate-400">
                    <tr>
                      <th className="px-2.5 py-1.5">Level</th>
                      <th className="px-2.5 py-1.5">Required EXP</th>
                      <th className="px-2.5 py-1.5">Members</th>
                      <th className="px-2.5 py-1.5">Admin Slots</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {ROOM_LEVEL_INFO.map((rl) => (
                      <tr key={rl.level}>
                        <td className="px-2.5 py-1.5 font-bold text-white">
                          Lv.{rl.level} ({rl.title})
                        </td>
                        <td className="px-2.5 py-1.5 text-amber-300">
                          {rl.requiredExp.toLocaleString()}
                        </td>
                        <td className="px-2.5 py-1.5">{rl.memberLimit}</td>
                        <td className="px-2.5 py-1.5 text-emerald-300">{rl.adminSlots}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PK MODE STAGE OR STANDARD SEAT STAGE */}
          {pkActive && pk ? (
            <div className="mt-1.5 space-y-2 rounded-2xl border border-white/15 bg-gradient-to-b from-pink-950/35 via-[#0D1526]/85 to-sky-950/35 p-2 shadow-[0_0_24px_rgba(236,72,153,0.18)] backdrop-blur-md">
              {/* Owner's Seat & Neighbor Seat Always Visible Above PK Stage (with CP Heart Connector if paired) */}
              {renderSeatRowWithCpHearts(
                topSeats,
                true,
                activeRoom.isOfficial ? 'grid-cols-3' : 'grid-cols-2',
                activeRoom.isOfficial ? 'max-w-[270px]' : 'max-w-[210px]'
              )}

              {/* Owner/Admin PK Setup Controls (Gifting/Voting, Duration 5-60m, 1v1/Multiplayer) */}
              {hasModAuthority && (
                <div className="flex flex-wrap items-center justify-between gap-1 text-[9px]">
                  <div className="flex items-center gap-1 rounded-full bg-black/45 p-0.5">
                    <button
                      type="button"
                      onClick={() => onSetPkConfig(activeRoom.id, { mode: 'gifting' })}
                      className={`rounded-full px-2 py-0.5 font-bold whitespace-nowrap ${
                        pk.mode === 'gifting' ? 'bg-pink-500 text-white' : 'text-slate-300'
                      }`}
                    >
                      Gifting PK
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetPkConfig(activeRoom.id, { mode: 'voting' })}
                      className={`rounded-full px-2 py-0.5 font-bold whitespace-nowrap ${
                        pk.mode === 'voting' ? 'bg-sky-500 text-white' : 'text-slate-300'
                      }`}
                    >
                      Voting PK
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5 rounded-full bg-black/45 p-0.5">
                    {([5, 15, 30, 45, 60] as const).map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        disabled={pk.running}
                        onClick={() => onSetPkConfig(activeRoom.id, { durationMinutes: mins })}
                        className={`rounded-full px-1.5 py-0.5 font-mono-tabular text-[8.5px] font-bold transition-colors disabled:opacity-50 ${
                          (pk.durationMinutes ?? 5) === mins
                            ? 'bg-amber-400 text-slate-950'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-black/45 p-0.5">
                    <button
                      type="button"
                      onClick={() => onSetPkConfig(activeRoom.id, { format: '1v1' })}
                      className={`rounded-full px-2 py-0.5 font-bold whitespace-nowrap ${
                        pk.format === '1v1' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
                      }`}
                    >
                      1v1
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetPkConfig(activeRoom.id, { format: 'multiplayer' })}
                      className={`rounded-full px-2 py-0.5 font-bold whitespace-nowrap ${
                        pk.format === 'multiplayer' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                      }`}
                    >
                      Multiplayer
                    </button>
                  </div>
                </div>
              )}

              {/* Top PK Row: Pink Chair+ Pill (left) | Centered Title | Blue Chair+ Pill (right) */}
              <div className="flex items-center justify-between px-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onJoinPkTeam(activeRoom.id, 'pink');
                    notify('Joined Pink PK Side!');
                  }}
                  title="Join Pink PK Side"
                  className="flex h-7 items-center gap-1 rounded-full bg-gradient-to-b from-pink-400 to-rose-500 px-3 text-white shadow-[0_0_12px_rgba(244,63,94,0.65)] transition-transform hover:scale-105"
                >
                  <Armchair className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black">+</span>
                </button>

                <div className="flex items-center gap-1.5 text-center">
                  <span className="font-display text-xs font-extrabold tracking-wide text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">
                    {activeRoom.hostName}
                  </span>
                  <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-pink-200">
                    {pk.mode === 'gifting' ? 'Gifting' : 'Voting'} · {pk.format === '1v1' ? '1v1' : 'Multi'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onJoinPkTeam(activeRoom.id, 'blue');
                    notify('Joined Blue PK Side!');
                  }}
                  title="Join Blue PK Side"
                  className="flex h-7 items-center gap-1 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 px-3 text-white shadow-[0_0_12px_rgba(56,189,248,0.65)] transition-transform hover:scale-105"
                >
                  <Armchair className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black">+</span>
                </button>
              </div>

              {/* Exact PK Split Score Bar + Hanging Frosted Tray matching Reference Screenshot */}
              <div>
                <div className="relative flex h-6 w-full overflow-hidden rounded-full font-mono-tabular text-xs font-black text-white shadow-[0_0_18px_rgba(236,72,153,0.3)]">
                  <div
                    className="flex items-center justify-start bg-gradient-to-r from-rose-500 via-pink-500 to-pink-400 pl-3 transition-all duration-300"
                    style={{ width: `${pinkPercent}%` }}
                  >
                    {pk.pinkScore.toLocaleString()}
                  </div>
                  <div className="flex flex-1 items-center justify-end bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 pr-3 transition-all duration-300">
                    {pk.blueScore.toLocaleString()}
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center justify-center">
                    <Zap className="h-5 w-5 fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                  </div>
                </div>

                {/* Frosted Glass Tray Directly Beneath Bar */}
                <div className="relative mx-0.5 -mt-0.5 flex items-center justify-between rounded-b-2xl border border-t-0 border-white/25 bg-white/10 px-2.5 pt-2 pb-2 backdrop-blur-md">
                  {/* Left 3 Pink Chair Dots */}
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border border-pink-200/60 ${
                          i < pk.pinkTeamUids.length
                            ? 'bg-pink-500 text-white shadow-[0_0_8px_rgba(236,72,153,0.85)]'
                            : 'bg-pink-400/55 text-white/95'
                        }`}
                      >
                        <Armchair className="h-3 w-3" />
                      </div>
                    ))}
                  </div>

                  {/* Center Hanging Cyan Trapezoid Start/Timer Tab + Power Off Button Below */}
                  <div className="flex flex-col items-center">
                    {pk.running ? (
                      <div
                        className="-mt-2 flex h-6 items-center justify-center bg-gradient-to-b from-slate-800/95 to-slate-900/95 px-5 font-mono-tabular text-[11px] font-black text-white shadow-md"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 86% 100%, 14% 100%)' }}
                      >
                        <span className="text-pink-400">PK</span>
                        <span className="ml-1.5">
                          {pkMins}:{pkSecs}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasModAuthority) {
                            notify('Only Room Owner or Admin can start PK!');
                            return;
                          }
                          onStartPk(activeRoom.id);
                        }}
                        className="-mt-2 flex h-6 items-center justify-center bg-gradient-to-b from-sky-300/90 to-cyan-500/90 px-6 text-[11px] font-black text-white shadow-md transition-transform hover:scale-105"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 86% 100%, 14% 100%)' }}
                      >
                        Start
                      </button>
                    )}

                    {hasModAuthority && (
                      <button
                        type="button"
                        onClick={() => onEndPk(activeRoom.id)}
                        title="End PK"
                        aria-label="End PK"
                        className="mt-1 flex h-5 w-6 items-center justify-center rounded-md border border-white/25 bg-black/25 text-white/90 hover:bg-rose-500 hover:text-white"
                      >
                        <Power className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Right 3 Blue Chair Dots */}
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex h-5.5 w-5.5 items-center justify-center rounded-full border border-sky-200/60 ${
                          i < pk.blueTeamUids.length
                            ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(56,189,248,0.85)]'
                            : 'bg-sky-400/55 text-white/95'
                        }`}
                      >
                        <Armchair className="h-3 w-3" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voting PK quick-vote buttons (STRICTLY 1 VOTE PER USER) */}
              {pk.mode === 'voting' && (() => {
                const alreadyVoted = pk.votedUids.includes(userUid);
                return (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={alreadyVoted}
                      onClick={() => {
                        if (alreadyVoted) return;
                        onVotePkTeam(activeRoom.id, 'pink');
                        notify('Voted +1 for Pink Team! (1 vote per user)');
                      }}
                      className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-1.5 text-[11px] font-extrabold text-white shadow hover:opacity-95 disabled:opacity-50"
                    >
                      {alreadyVoted ? 'Voted ✓' : 'Vote Pink (+1)'}
                    </button>
                    <button
                      type="button"
                      disabled={alreadyVoted}
                      onClick={() => {
                        if (alreadyVoted) return;
                        onVotePkTeam(activeRoom.id, 'blue');
                        notify('Voted +1 for Blue Team! (1 vote per user)');
                      }}
                      className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-1.5 text-[11px] font-extrabold text-white shadow hover:opacity-95 disabled:opacity-50"
                    >
                      {alreadyVoted ? 'Voted ✓' : 'Vote Blue (+1)'}
                    </button>
                  </div>
                );
              })()}

              {/* PK Seat Layout: 1v1 (bottom-left Pink PK, bottom-right Blue PK) OR Multiplayer (split Pink Left vs Blue Right halves) */}
              {pk.format === '1v1' ? (
                <div className="grid grid-cols-4 justify-items-center gap-2 pt-1">
                  {bottomSeats.slice(0, 8).map((seat, idx) => {
                    const side = idx === 4 ? 'pink' : idx === 7 ? 'blue' : undefined;
                    return renderCircularSeat(seat, false, side);
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15">
                  <div className="grid grid-cols-2 justify-items-center gap-2 bg-pink-500/20 p-2">
                    {bottomSeats.slice(0, halfBottom).map((seat) => renderCircularSeat(seat, false, 'pink'))}
                  </div>
                  <div className="grid grid-cols-2 justify-items-center gap-2 bg-sky-500/20 p-2">
                    {bottomSeats.slice(halfBottom).map((seat) => renderCircularSeat(seat, false, 'blue'))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STANDARD 10-SEAT (2 Top + 8 Bottom, Larger Seats) OR OFFICIAL 15-SEAT (3 Top + 12 Bottom) */
            <div className="mt-1.5 space-y-2">
              {renderSeatRowWithCpHearts(
                topSeats,
                true,
                activeRoom.isOfficial ? 'grid-cols-3' : 'grid-cols-2',
                activeRoom.isOfficial ? 'max-w-[270px]' : 'max-w-[210px]'
              )}

              {crossRowCpBonds.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {crossRowCpBonds.map((bond) => (
                    <div
                      key={bond.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/40 bg-pink-950/50 px-2.5 py-0.5 text-[10px] font-bold text-pink-100 shadow-[0_0_12px_rgba(236,72,153,0.35)]"
                    >
                      <span>{bond.aName}</span>
                      <CpHeartConnectorArt size={24} cpLevel={bond.cpLevel} />
                      <span>{bond.bName}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {bottomSeatRows.map((rowSeats, rIdx) => (
                  <React.Fragment key={`bottom-row-${rIdx}`}>
                    {renderSeatRowWithCpHearts(rowSeats, false, 'grid-cols-4', 'w-full')}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Room Chat Feed (supports Photos + VIP Two-Color Names + Clickable IDs) */}
          <div className="zayro-scroll mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {activeRoom.messages.map((msg) => {
              const senderSeat = msg.senderUid
                ? activeRoom.seats.find((s) => s.occupant?.uid === msg.senderUid)
                : undefined;
              const senderRosterAv = msg.senderUid
                ? AVATAR_ROSTER.find((a) => a.uid === msg.senderUid)
                : undefined;
              const msgAvatar = senderSeat?.occupant ?? senderRosterAv;
              const isSelfMsg = msg.senderUid === userUid || msg.senderName === userName;
              const msgVip = isSelfMsg ? vipLevel : (senderSeat?.vipLevel ?? (msg.senderUid ? 3 : 0));
              const msgCharm = isSelfMsg ? charm : (senderSeat?.charmValue ?? 12_000);
              const msgCharmLvl = getCharmLevelInfo(msgCharm).current.level;
              const activeBubble = isSelfMsg ? equippedBubbleColor : msg.bubbleColor;

              if (msg.kind === 'system') {
                return (
                  <div
                    key={msg.id}
                    className="max-w-lg rounded-xl border border-white/10 bg-black/45 px-3 py-1.5 text-[11px] text-slate-200 backdrop-blur-sm"
                  >
                    <span className="font-bold" style={{ color: msg.senderColor }}>
                      {msg.senderName}:{' '}
                    </span>
                    <span>{msg.text}</span>
                  </div>
                );
              }

              if (isSelfMsg && selfChatFrameNum && !msg.imageUrl && !msg.emoteNumber) {
                return (
                  <div key={msg.id} className="max-w-lg space-y-1">
                    <div className="flex flex-wrap items-center gap-1 pl-1">
                      <span
                        className="text-xs font-bold"
                        style={
                          msgVip >= 2 ? getVipNameStyle(msgVip) : { color: msg.senderColor }
                        }
                      >
                        {msg.senderName}
                      </span>
                      {msgVip >= 1 && <VipBadgeArt level={msgVip} size={15} />}
                      {msg.senderUid && <CharmBadgeArt level={msgCharmLvl} size={14} />}
                    </div>
                    <ChatFrameMessage
                      frameNumber={selfChatFrameNum}
                      avatarNode={
                        msgAvatar ? <AvatarArt avatar={msgAvatar} size={36} /> : undefined
                      }
                    >
                      <span className="text-xs font-semibold">{msg.text}</span>
                    </ChatFrameMessage>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex max-w-lg items-start gap-2">
                  {msgAvatar && (
                    <button
                      type="button"
                      onClick={() =>
                        msg.senderUid && openTargetByUid(msg.senderUid, msg.senderName)
                      }
                      className="mt-0.5 shrink-0"
                    >
                      <AvatarArt avatar={msgAvatar} size={28} />
                    </button>
                  )}
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1">
                      <span
                        className="text-xs font-bold"
                        style={
                          msgVip >= 2 ? getVipNameStyle(msgVip) : { color: msg.senderColor }
                        }
                      >
                        {msg.senderName}
                      </span>
                      {msgVip >= 1 && <VipBadgeArt level={msgVip} size={15} />}
                      {msg.senderUid && <CharmBadgeArt level={msgCharmLvl} size={14} />}
                      {msg.senderUid && (
                        <button
                          type="button"
                          onClick={() => openTargetByUid(msg.senderUid!, msg.senderName)}
                          className="font-mono-tabular text-[9.5px] text-cyan-300 underline-offset-2 hover:underline"
                          title="Click ID to Mute or Add Friend"
                        >
                          [{msg.senderUid}]
                        </button>
                      )}
                    </div>
                    <div
                      style={
                        activeBubble
                          ? {
                              borderColor: activeBubble,
                              background: `linear-gradient(135deg, ${activeBubble}2e 0%, rgba(10,10,20,0.86) 100%)`,
                              boxShadow: `0 0 12px ${activeBubble}44`,
                            }
                          : undefined
                      }
                      className="inline-block rounded-2xl border border-amber-400/50 bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                    >
                      {msg.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setLightboxImage(msg.imageUrl!)}
                          className="mb-1 block overflow-hidden rounded-xl border border-white/15"
                        >
                          <img
                            src={msg.imageUrl}
                            alt="Room upload"
                            className="max-h-36 w-auto rounded-xl object-cover"
                          />
                        </button>
                      )}
                      {msg.emoteNumber && (
                        <div className="mb-1 flex items-center gap-2">
                          <EmoteSpriteArt
                            emoteNumber={msg.emoteNumber}
                            size={34}
                            alt={msg.text}
                            animated
                          />
                        </div>
                      )}
                      {msg.text && <span>{msg.text}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Dock: Emotes (30 Animated Cutouts) + Menu + Gift Dock + Photo Upload + Speaker at Bottom */}
        <div className="mt-1.5 shrink-0 space-y-2 border-t border-white/10 pt-2">
          {showEmoteDock && (
            <div className="zayro-scroll max-h-56 overflow-y-auto rounded-2xl border border-cyan-400/30 bg-[#0A101D]/95 p-2.5 shadow-2xl backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-bold text-slate-300">
                <span>Emotes (Triggers on Seat)</span>
                <button
                  type="button"
                  onClick={() => setShowEmoteDock(false)}
                  className="text-slate-400 hover:text-white"
                  aria-label="Close Emotes"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {ROOM_EMOTES.map((em) => (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => {
                      onSendEmote(em.emoteNumber, em.label, em.symbol, em.motion);
                      setShowEmoteDock(false);
                      notify(`Triggered "${em.label}" emote!`);
                    }}
                    className="flex flex-col items-center rounded-xl border border-white/5 bg-[#132038] px-1 py-1.5 transition-colors hover:border-cyan-400/50 hover:bg-[#192946]"
                  >
                    <EmoteSpriteArt
                      emoteNumber={em.emoteNumber}
                      size={32}
                      alt={em.label}
                      animated
                      motion={em.motion}
                    />
                    <span className="mt-1 line-clamp-1 text-[9px] font-semibold text-slate-200">
                      {em.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showRoomMenu && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/75 p-2.5 text-xs backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowRoomLevelsDrawer((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  <Award className="h-3 w-3 text-sky-300" />
                  Room EXP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteFriendsModal(true);
                    setShowRoomMenu(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-cyan-400/35 bg-cyan-500/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-200"
                >
                  <UserPlus className="h-3 w-3" />
                  Invite Friends
                </button>
                {hasModAuthority && (
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePkActive(activeRoom.id);
                      setShowRoomMenu(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-400/40 bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-200"
                  >
                    <Swords className="h-3 w-3" />
                    {pkActive ? 'Hide PK' : 'Start PK'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowRoomMenu(false);
                    onExitRoom();
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-400/45 bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-200 hover:bg-rose-500 hover:text-white"
                >
                  <LogOut className="h-3 w-3" />
                  Exit Room
                </button>
              </div>
              <div className="inline-flex items-center gap-1 font-mono-tabular text-[11px] text-amber-300">
                <ZayroCoinArt size={14} />
                <span>{coins.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Gift Section Overlay Sheet */}
          {showGiftDock && selectedGift && (
            <div className="zayro-scroll absolute inset-x-2 bottom-14 z-30 max-h-[68%] overflow-y-auto rounded-3xl border border-cyan-400/30 bg-[#0A101D]/95 p-3 shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1">
                  {roomRecipientCandidates.slice(0, 8).map((cand) => {
                    const isPicked =
                      !customGiftUid.trim() && activeRecipientCandidate?.uid === cand.uid;
                    return (
                      <button
                        key={cand.uid}
                        type="button"
                        onClick={() => {
                          setCustomGiftUid('');
                          setSelectedRecipientUid(cand.uid);
                          setSelectedRecipient(cand.name);
                        }}
                        className={`relative flex shrink-0 items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-[11px] font-semibold transition-colors ${
                          isPicked
                            ? 'border-rose-400 bg-rose-500/20 text-white'
                            : 'border-white/10 bg-[#132038] text-slate-300 hover:border-cyan-400/40'
                        }`}
                      >
                        <AvatarArt avatar={cand.avatar} size={24} />
                        <span>{cand.name}</span>
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={customGiftUid}
                  onChange={(e) => setCustomGiftUid(e.target.value)}
                  placeholder="Any User ID (ZAY-...)"
                  className="w-40 rounded-xl border border-white/15 bg-[#070B14] px-2.5 py-1.5 font-mono-tabular text-[11px] text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="my-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                <span>
                  To{' '}
                  <strong className="text-rose-300">
                    {customGiftUid.trim()
                      ? `ID ${customGiftUid.trim().toUpperCase()}`
                      : `${activeRecipientCandidate?.name || selectedRecipient} (${activeRecipientCandidate?.uid || ''})`}
                  </strong>{' '}
                  · Charm +{(selectedGift.charmValue * giftQty).toLocaleString()} · Random Coins
                </span>
                <button
                  type="button"
                  onClick={() => setShowGiftDock(false)}
                  className="text-slate-400 hover:text-white"
                  aria-label="Close Gift Drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="zayro-scroll grid max-h-60 grid-cols-4 gap-2 overflow-y-auto pr-1">
                {gifts.map((gift) => {
                  const isSelected = gift.id === selectedGift.id;
                  const isMythic = gift.rarity === 'Mythic';
                  return (
                    <button
                      key={gift.id}
                      type="button"
                      onClick={() => setSelectedGiftId(gift.id)}
                      className={`relative flex flex-col items-center rounded-2xl border p-2 text-center transition-all ${
                        isSelected
                          ? 'border-rose-400 bg-[#192946] ring-2 ring-rose-400/60'
                          : isMythic
                            ? 'border-amber-400/50 bg-[#132038] hover:border-rose-400/60'
                            : 'border-white/10 bg-[#0D1526] hover:border-cyan-400/50'
                      }`}
                    >
                      {isMythic && (
                        <span className="mb-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-1.5 py-0.5 text-[8px] font-extrabold text-white">
                          LEGENDARY
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                      <GiftArtwork giftId={gift.id} gift={gift} size={44} />
                      <span className="mt-1 line-clamp-1 text-[10px] font-semibold text-white">
                        {gift.name}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-0.5 font-mono-tabular text-[10px] font-bold text-amber-300">
                        <ZayroCoinArt size={11} />
                        {gift.cost.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/10 bg-[#070B14] px-2.5 py-1.5">
                <input
                  type="text"
                  maxLength={30}
                  value={bigGiftMessage}
                  onChange={(e) => setBigGiftMessage(e.target.value.slice(0, 30))}
                  placeholder="Big gift broadcast message (max 30 chars)..."
                  className="min-w-0 flex-1 bg-transparent text-[11px] text-white placeholder-slate-500 focus:outline-none"
                />
                <span className="shrink-0 font-mono-tabular text-[10px] text-slate-400">
                  {bigGiftMessage.length}/30
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#132038] px-3 py-1.5 font-mono-tabular text-xs font-extrabold text-amber-300">
                  <ZayroCoinArt size={16} />
                  <span>{coins.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={giftQty}
                    onChange={(e) => setGiftQty(Number(e.target.value))}
                    aria-label="Gift Quantity"
                    className="rounded-xl border border-white/15 bg-[#132038] px-2.5 py-2 font-mono-tabular text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value={1}>1</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={99}>99</option>
                  </select>

                  <button
                    type="button"
                    disabled={coins < selectedGift.cost * giftQty}
                    onClick={() => {
                      const typedUid = customGiftUid.trim().toUpperCase();
                      const matchedCustom = typedUid
                        ? roomRecipientCandidates.find((c) => c.uid.toUpperCase() === typedUid)
                        : undefined;
                      const finalUid = typedUid || activeRecipientCandidate?.uid;
                      const finalName = typedUid
                        ? (matchedCustom?.name ?? `User ${typedUid}`)
                        : (activeRecipientCandidate?.name || selectedRecipient);
                      const cleanNote = bigGiftMessage.trim().slice(0, 30) || undefined;
                      onSendGift(selectedGift, finalName, giftQty, finalUid, cleanNote);
                      setBigGiftMessage('');
                      notify(`Sent ${giftQty}x ${selectedGift.name} to ${finalName}!`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-xs font-extrabold text-white shadow-lg shadow-rose-500/30 hover:opacity-95 disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Control Row */}
          <div className="flex items-center gap-1.5">
            {userSeatIndex !== null && (
              <button
                type="button"
                onClick={onToggleMicMute}
                title={
                  isMicMuted
                    ? 'Unmute Mic'
                    : isLiveMicActive
                      ? 'Mute Live Mic'
                      : 'Mute Mic'
                }
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isMicMuted
                    ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                    : 'border-emerald-400/50 bg-emerald-500 text-slate-950'
                }`}
              >
                {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={onToggleSpeaker}
              title={speakerEnabled ? 'Mute Room Speaker' : 'Turn Room Speaker On'}
              aria-label="Room Speaker"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                speakerEnabled
                  ? 'border-emerald-400/45 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/15 bg-black/45 text-slate-400'
              }`}
            >
              {speakerEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <form onSubmit={handleChatSubmit} className="flex min-w-0 flex-1 items-center gap-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="h-9 min-w-0 flex-1 rounded-full border border-white/15 bg-black/45 px-3 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
              />
              <label
                title="Send Photo in Voice Room"
                aria-label="Send Photo in Voice Room"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/45 text-cyan-300 hover:border-cyan-400/60 hover:text-white"
              >
                <ImagePlus className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRoomPhotoUpload}
                  className="hidden"
                />
              </label>
              {chatInput.trim() && (
                <button
                  type="submit"
                  aria-label="Send"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-slate-950"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => setShowEmoteDock((v) => !v)}
              aria-label="Emotes"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                showEmoteDock
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-white/15 bg-black/45 text-slate-200'
              }`}
            >
              <Smile className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowGiftDock((v) => !v)}
              aria-label="Toggle Gifts"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30"
            >
              <Gift className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowRoomMenu((v) => !v)}
              aria-label="Room Controls"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                showRoomMenu
                  ? 'border-cyan-400 bg-cyan-500/25 text-white'
                  : 'border-white/15 bg-black/45 text-slate-200'
              }`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Profile Card Popup */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-xs sm:items-center">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-cyan-400/25 bg-[#0D1526] shadow-2xl">
            <div
              className="relative h-24 w-full"
              style={
                actionTarget.avatar.coverUrl
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(7,11,20,0.25), rgba(13,21,38,0.92)), url(${actionTarget.avatar.coverUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : {
                      background:
                        'radial-gradient(circle at 30% 35%, rgba(34,211,238,0.4), transparent 55%), linear-gradient(145deg, #071326 0%, #0D1526 65%, #132038 100%)',
                    }
              }
            >
              <div className="pointer-events-none flex h-full items-center justify-center font-display text-4xl font-black tracking-widest text-white/25">
                {actionTarget.name.slice(0, 2).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionTarget(null);
                  setShowCardReplyInput(false);
                  setCardReplyDraft('');
                }}
                aria-label="Close Profile Card"
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-slate-200 hover:bg-black/75 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-end gap-2.5">
                <div className="relative -mt-10 inline-block">
                  <AvatarArt
                    avatar={actionTarget.avatar}
                    size={64}
                    frameId={actionTarget.uid === userUid ? equippedFrameId : undefined}
                  />
                  <span className="absolute right-1 bottom-1 h-3 w-3 rounded-full border-2 border-[#0D1526] bg-emerald-400" />
                </div>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className="text-sm leading-none"
                  title={actionTarget.avatar.gender || 'Male'}
                  aria-label={`Gender: ${actionTarget.avatar.gender || 'Male'}`}
                >
                  {getGenderSymbol(actionTarget.avatar.gender)}
                </span>
                <span
                  className="font-display text-lg font-extrabold"
                  style={getVipNameStyle(actionTarget.vipLevel)}
                >
                  {actionTarget.name}
                </span>
                <VipBadgeArt level={actionTarget.vipLevel} size={22} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CharmBadgePill
                  level={getCharmLevelInfo(actionTarget.charm).current.level}
                  charm={actionTarget.charm}
                />
                <span className="rounded-full border border-cyan-400/35 bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200">
                  {activeRoom.title}
                </span>
                {actionTarget.avatar.cpPartner && (
                  <button
                    type="button"
                    onClick={() => openCpPartnerProfileFromCard(actionTarget)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/45 bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500/30"
                    title="Open CP Partner Profile Page"
                  >
                    <Heart className="h-2.5 w-2.5 fill-rose-400 text-rose-400" />
                    <span>CP · {actionTarget.avatar.cpPartner.partnerName}</span>
                  </button>
                )}
              </div>

              {actionTarget.avatar.cpPartner && showCardCpId && (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-rose-400/35 bg-rose-950/40 px-2.5 py-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <RingSpriteArt
                      ringNumber={actionTarget.avatar.cpPartner.ringNumber}
                      size={24}
                      alt={actionTarget.avatar.cpPartner.ringName}
                    />
                    <span className="font-mono-tabular font-bold text-rose-100">
                      Partner ID: {actionTarget.avatar.cpPartner.partnerUid}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-mono-tabular text-[10px] font-bold text-rose-300">
                  Lv.{getCharmLevelInfo(actionTarget.charm).current.level}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(actionTarget.uid).catch(() => {});
                    notify(`Copied ID ${actionTarget.uid}`);
                  }}
                  className="inline-flex items-center gap-1 font-mono-tabular text-xs text-slate-300 hover:text-white"
                >
                  <span>ID: {actionTarget.uid}</span>
                  <Copy className="h-3 w-3 text-slate-400" />
                </button>
              </div>

              <div className="mt-3 rounded-xl bg-[#132038] px-3 py-2 text-xs italic text-slate-200">
                “{actionTarget.avatar.bio || 'Voice Sanctuary Explorer · Catch me on mic!'}”
              </div>

              <div className="mt-3.5 grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onInspectUser({
                      avatar: actionTarget.avatar,
                      vipLevel: actionTarget.vipLevel,
                      charm: actionTarget.charm,
                      cpPartner: actionTarget.avatar.cpPartner ?? null,
                      ringNumber: actionTarget.avatar.cpPartner?.ringNumber ?? 1,
                      roomId: activeRoom.id,
                      roomTitle: activeRoom.title,
                    });
                    setActionTarget(null);
                    setShowCardReplyInput(false);
                    setShowCardCpId(false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#192946] px-2.5 py-2.5 font-bold text-white hover:bg-[#22365c]"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCardReplyInput((v) => !v)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 px-2.5 py-2.5 font-bold text-slate-950 shadow-md hover:opacity-95"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Message</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomGiftUid('');
                    setSelectedRecipientUid(actionTarget.uid);
                    setSelectedRecipient(actionTarget.name);
                    setShowGiftDock(true);
                    setActionTarget(null);
                    setShowCardReplyInput(false);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#192946] px-2.5 py-2.5 font-bold text-rose-300 hover:bg-[#22365c]"
                >
                  <Gift className="h-3.5 w-3.5 text-rose-400" />
                  <span>Gift</span>
                </button>
              </div>

              {showCardReplyInput && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!cardReplyDraft.trim()) return;
                    onSendBackMessage(actionTarget.uid, actionTarget.name, cardReplyDraft);
                    notify(`Sent message to ${actionTarget.name}`);
                    setCardReplyDraft('');
                    setShowCardReplyInput(false);
                  }}
                  className="mt-2.5 flex items-center gap-1.5 rounded-2xl border border-cyan-400/35 bg-[#070B14] p-1.5"
                >
                  <input
                    type="text"
                    value={cardReplyDraft}
                    onChange={(e) => setCardReplyDraft(e.target.value)}
                    placeholder={`Send back message to ${actionTarget.name}...`}
                    className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onMessageUser(actionTarget.uid, actionTarget.name);
                      setActionTarget(null);
                      setShowCardReplyInput(false);
                    }}
                    className="rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-white/20"
                  >
                    Chat
                  </button>
                </form>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    notify(onAddFriendByUid(actionTarget.uid));
                    setActionTarget(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#132038] px-2.5 py-1.5 font-semibold text-cyan-200 hover:bg-cyan-500/20"
                >
                  <UserPlus className="h-3 w-3" />
                  Add Friend
                </button>

                {onSupportUser && (
                  <button
                    type="button"
                    onClick={() => {
                      onSupportUser(
                        actionTarget.uid,
                        actionTarget.name,
                        actionTarget.avatar.cpPartner?.ringNumber ?? 1,
                        actionTarget.avatar.cpPartner?.ringName ?? 'Emerald Crown Ring'
                      );
                      notify(`Sent Ring Support blessing to ${actionTarget.name}!`);
                      setActionTarget(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-400/45 bg-gradient-to-r from-rose-500/30 to-amber-500/25 px-2.5 py-1.5 font-bold text-rose-100 hover:brightness-110"
                  >
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    Support Ring
                  </button>
                )}

                {onProposeCp && actionTarget.uid !== userUid && (
                  <button
                    type="button"
                    onClick={() => setShowSeatCpPicker((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-xl border border-pink-400/40 bg-pink-500/15 px-2.5 py-1.5 font-semibold text-pink-200 hover:bg-pink-500/25"
                  >
                    <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                    Propose CP
                  </button>
                )}

                {showSeatCpPicker && onProposeCp && actionTarget.uid !== userUid && (
                  <div className="w-full space-y-2 rounded-2xl border border-rose-400/35 bg-[#0A101D] p-2.5 text-[11px]">
                    {ownedRingItems.length === 0 ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-300">
                          Purchase a ring in Shop first to send a CP request.
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSeatCpPicker(false);
                            setActionTarget(null);
                            onOpenRingShop?.();
                          }}
                          className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-[10px] font-extrabold text-slate-950"
                        >
                          Buy Ring in Shop
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-rose-200">
                          Pick Purchased Ring to Gift {actionTarget.name}:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ownedRingItems.map((ring) => {
                            const rNum = ring.ringNumber ?? 1;
                            const chosen =
                              (ownedRingItems.find((r) => r.ringNumber === selectedSeatCpRingNum)
                                ?.ringNumber ?? ownedRingItems[0]?.ringNumber) === rNum;
                            return (
                              <button
                                key={ring.id}
                                type="button"
                                onClick={() => setSelectedSeatCpRingNum(rNum)}
                                className={`flex items-center gap-1 rounded-xl border px-2 py-1 ${
                                  chosen
                                    ? 'border-rose-400 bg-rose-500/25 text-white'
                                    : 'border-white/10 bg-[#132038] text-slate-300'
                                }`}
                              >
                                <RingSpriteArt ringNumber={rNum} size={22} alt={ring.name} />
                                <span className="text-[10px] font-bold">#{rNum}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const ringObj =
                              ownedRingItems.find((r) => r.ringNumber === selectedSeatCpRingNum) ??
                              ownedRingItems[0];
                            if (!ringObj) return;
                            onProposeCp(
                              actionTarget.uid,
                              actionTarget.name,
                              actionTarget.avatar.id,
                              ringObj.ringNumber ?? 1,
                              ringObj.name
                            );
                            notify(`Sent CP Ring proposal (${ringObj.name}) to ${actionTarget.name}!`);
                            setShowSeatCpPicker(false);
                            setActionTarget(null);
                          }}
                          className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-1.5 text-[11px] font-extrabold text-white"
                        >
                          Send Ring Proposal
                        </button>
                      </>
                    )}
                  </div>
                )}

                {hasModAuthority && actionTarget.uid !== activeRoom.ownerUid && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (actionTarget.seatIndex !== undefined) {
                          onToggleMuteSeat(actionTarget.seatIndex);
                        } else {
                          onToggleMuteByUid(activeRoom.id, actionTarget.uid);
                        }
                        notify(
                          actionTarget.isMuted
                            ? `Unmuted ${actionTarget.name}`
                            : `Muted ${actionTarget.name}`
                        );
                        setActionTarget(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-semibold text-white"
                    >
                      {actionTarget.isMuted ? (
                        <Mic className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <MicOff className="h-3 w-3 text-amber-300" />
                      )}
                      {actionTarget.isMuted ? 'Unmute' : 'Mute'}
                    </button>

                    {actionTarget.isListener ? (
                      <button
                        type="button"
                        onClick={() => {
                          onLiftUserToSeat(activeRoom.id, {
                            uid: actionTarget.uid,
                            name: actionTarget.name,
                            avatarId: actionTarget.avatar.id,
                            vipLevel: actionTarget.vipLevel,
                            charm: actionTarget.charm,
                          });
                          notify(`Lifted ${actionTarget.name} to seat`);
                          setActionTarget(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-2.5 py-1.5 font-bold text-slate-950"
                      >
                        <ArrowUpCircle className="h-3 w-3" />
                        Lift
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onKickUser(activeRoom.id, actionTarget.uid, actionTarget.name);
                          notify(`Removed ${actionTarget.name} from seat`);
                          setActionTarget(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-2.5 py-1.5 font-bold text-white"
                      >
                        <UserMinus className="h-3 w-3" />
                        Kick
                      </button>
                    )}
                  </>
                )}

                {actionTarget.uid === userUid && userSeatIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      onLeaveSeat();
                      notify('Stepped down from mic seat');
                      setActionTarget(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/15 px-2.5 py-1.5 font-bold text-amber-200"
                  >
                    <ArrowDownCircle className="h-3 w-3" />
                    Leave Seat
                  </button>
                )}

                {isOwner && actionTarget.uid !== activeRoom.ownerUid && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleAdmin(activeRoom.id, actionTarget.uid, actionTarget.name);
                      const alreadyAdmin = activeRoom.adminUids.includes(actionTarget.uid);
                      notify(
                        alreadyAdmin
                          ? `Removed ${actionTarget.name} as Admin`
                          : `Appointed ${actionTarget.name} as Admin`
                      );
                      setActionTarget(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-sky-400/40 bg-sky-500/15 px-2.5 py-1.5 font-bold text-sky-200"
                  >
                    <Shield className="h-3 w-3" />
                    {activeRoom.adminUids.includes(actionTarget.uid) ? 'Remove Admin' : 'Make Admin'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends to Voice Room Modal */}
      {showInviteFriendsModal && (
        <div
          onClick={() => setShowInviteFriendsModal(false)}
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-cyan-400/30 bg-[#0D1526] p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <h3 className="font-display text-base font-bold text-white">Invite Friends</h3>
                <p className="text-[11px] text-slate-400">
                  Invite friends to {activeRoom.title} (ID {activeRoom.uid})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteFriendsModal(false)}
                aria-label="Close Invite Friends"
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="zayro-scroll mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {friends.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  No friends yet. Add friends by UID first!
                </p>
              ) : (
                friends.map((fr) => {
                  const av = AVATAR_ROSTER.find((a) => a.id === fr.avatarId) ?? AVATAR_ROSTER[0];
                  const isInvited = invitedFriendUids.includes(fr.uid);
                  return (
                    <div
                      key={fr.uid}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#132038] px-3 py-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <AvatarArt avatar={av} size={34} />
                        <div>
                          <div className="text-xs font-bold text-white">{fr.name}</div>
                          <div className="font-mono-tabular text-[10px] text-slate-400">
                            {fr.uid} · {fr.status}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isInvited}
                        onClick={() => {
                          onInviteFriendToRoom(activeRoom.id, fr);
                          setInvitedFriendUids((prev) => [...prev, fr.uid]);
                          notify(`Invited ${fr.name} to ${activeRoom.title}!`);
                        }}
                        className={`rounded-xl px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${
                          isInvited
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:opacity-95'
                        }`}
                      >
                        {isInvited ? 'Invited' : 'Invite'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close photo"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImage}
            alt="Full preview"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
