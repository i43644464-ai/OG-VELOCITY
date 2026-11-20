import { useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Lock, Sparkles, X } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';
import { ChatSection } from './components/ChatSection';
import { CreateRoomModal } from './components/CreateRoomModal';
import { DiscoverSection } from './components/DiscoverSection';
import { HomeHub } from './components/HomeHub';
import { MeProfileShop, type MeViewMode } from './components/MeProfileShop';
import { UserProfileModal } from './components/UserProfileModal';
import { VoiceRoomStage, type VipEntryShowcase } from './components/VoiceRoomStage';
import {
  AVATAR_ROSTER,
  INITIAL_CHAT_THREADS,
  INITIAL_DAILY_TASKS,
  INITIAL_FRIENDS,
  INITIAL_INTIMATE_SPACE,
  INITIAL_MOMENTS,
  INITIAL_ROOMS,
  INITIAL_ROOM_TASKS,
  ROOM_BACKGROUND_THEMES,
  SHOP_ITEMS,
  USER_PROFILE,
  VIRTUAL_GIFTS,
  getAdminSlotCount,
  getCpLevelInfo,
  getRoomNextExp,
  getVipNameColor,
  getVipTierByGrowth,
} from './data/zayroData';
import { AmbientCanvas } from './graphics/AmbientCanvas';
import { GiftArtwork } from './graphics/GiftArtwork';
import { GiftStageCanvas } from './graphics/GiftStageCanvas';
import type {
  ActiveGiftEvent,
  AuthProvider,
  AvatarConfig,
  ChatThread,
  CpRequest,
  CustomGiftSubmission,
  DailyTaskItem,
  EmoteMotion,
  FriendRecord,
  IntimateSpaceData,
  MomentPost,
  NavSection,
  PublicUserProfile,
  RoomListener,
  RoomTaskItem,
  ShopCategory,
  ShopItem,
  SupportRingEvent,
  VirtualGift,
  VoiceRoom,
} from './types';
import { soundFx } from './utils/soundFx';

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [userProfile, setUserProfile] = useState<AvatarConfig>(() => {
    const loaded = loadStoredJson<AvatarConfig>('zayro_user_profile', USER_PROFILE);
    return {
      ...loaded,
      email: loaded.email === 'weplayuser2024@gmail.com' ? '' : loaded.email,
    };
  });

  // VIP Growth: starts at 0 for new users (VIP 0) — 1 Growth point earned per 100 Coins spent
  const [vipGrowth, setVipGrowth] = useState<number>(() =>
    loadStoredJson<number>('zayro_vip_growth', 0)
  );
  const [subscribedVipLevel, setSubscribedVipLevel] = useState<number>(() =>
    loadStoredJson<number>('zayro_subscribed_vip', 0)
  );
  const [vipLabel, setVipLabel] = useState<string | null>(null);

  const [rooms, setRooms] = useState<VoiceRoom[]>(() => {
    const saved = loadStoredJson<VoiceRoom[] | null>('zayro_rooms_v1', null);
    if (!saved || !Array.isArray(saved) || saved.length === 0) return INITIAL_ROOMS;
    return saved.map((r) => {
      const targetCount = r.isOfficial ? 15 : 10;
      const cleaned = r.seats
        .slice(0, targetCount)
        .map((s) =>
          s.isUser
            ? {
                ...s,
                occupant: null,
                role: 'empty' as const,
                isUser: false,
                isSpeaking: false,
                audioLevel: 0,
              }
            : s
        );
      while (cleaned.length < targetCount) {
        cleaned.push({
          seatIndex: cleaned.length,
          occupant: null,
          role: 'empty',
          isMuted: false,
          isLocked: false,
          isSpeaking: false,
          audioLevel: 0,
          giftScore: 0,
        });
      }
      const initialRoom = INITIAL_ROOMS.find((ir) => ir.id === r.id);
      return {
        ...r,
        seats: cleaned,
        coinsSpentByUid: r.coinsSpentByUid ?? initialRoom?.coinsSpentByUid ?? {},
      };
    });
  });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [pendingLockedRoomId, setPendingLockedRoomId] = useState<string | null>(null);
  const [pinEntry, setPinEntry] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [unlockedRoomIds, setUnlockedRoomIds] = useState<string[]>([]);
  const [hasCreatedRoom, setHasCreatedRoom] = useState<boolean>(() =>
    loadStoredJson<boolean>('zayro_has_created_room', false)
  );
  const [inspectedUser, setInspectedUser] = useState<PublicUserProfile | null>(null);

  const [coins, setCoins] = useState<number>(() =>
    loadStoredJson<number>('zayro_coins', 0)
  );
  const [dailyLoginClaimed, setDailyLoginClaimed] = useState<boolean>(false);
  const [charm, setCharm] = useState<number>(() =>
    loadStoredJson<number>('zayro_charm', 0)
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [speakerEnabled, setSpeakerEnabled] = useState<boolean>(true);
  const [giftAnimationsEnabled, setGiftAnimationsEnabled] = useState<boolean>(() =>
    loadStoredJson<boolean>('zayro_gift_animations', true)
  );
  const [activeGiftEvent, setActiveGiftEvent] = useState<ActiveGiftEvent | null>(null);
  const [bigGiftBanner, setBigGiftBanner] = useState<ActiveGiftEvent | null>(null);
  const [supportRingEvent, setSupportRingEvent] = useState<SupportRingEvent | null>(null);

  // Social, Tasks, Moments, CP Requests, Custom Gifts & Intimate Space
  const [dailyTasks, setDailyTasks] = useState<DailyTaskItem[]>(INITIAL_DAILY_TASKS);
  const [roomTasks, setRoomTasks] = useState<RoomTaskItem[]>(INITIAL_ROOM_TASKS);
  const [friends, setFriends] = useState<FriendRecord[]>(() =>
    loadStoredJson<FriendRecord[]>('zayro_friends', INITIAL_FRIENDS)
  );
  const [cpRequests, setCpRequests] = useState<CpRequest[]>(() =>
    loadStoredJson<CpRequest[]>('zayro_cp_requests', [])
  );
  const [customGifts, setCustomGifts] = useState<CustomGiftSubmission[]>(() =>
    loadStoredJson<CustomGiftSubmission[]>('zayro_custom_gifts', [])
  );
  const [userGiftsGivenCoins, setUserGiftsGivenCoins] = useState<number>(() =>
    loadStoredJson<number>('zayro_gifts_given_coins', 0)
  );
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [moments, setMoments] = useState<MomentPost[]>(INITIAL_MOMENTS);
  const [intimateSpace, setIntimateSpace] = useState<IntimateSpaceData>(INITIAL_INTIMATE_SPACE);
  const [receivedGiftIds, setReceivedGiftIds] = useState<string[]>(() =>
    loadStoredJson<string[]>('zayro_received_gifts', [])
  );
  const [customQrUrl, setCustomQrUrl] = useState<string | null>(() =>
    loadStoredJson<string | null>('zayro_custom_qr', null)
  );

  // Me Profile & Shop state (zero items for fresh account)
  const [meDefaultTab, setMeDefaultTab] = useState<MeViewMode>('profile');
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>(() =>
    loadStoredJson<string[]>('zayro_owned_items', [])
  );
  const [equippedItems, setEquippedItems] = useState<Partial<Record<ShopCategory, string>>>(() =>
    loadStoredJson<Partial<Record<ShopCategory, string>>>('zayro_equipped_items', {})
  );

  // Live microphone state for Voice Rooms
  const [userSeatIndex, setUserSeatIndex] = useState<number | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isLiveMicActive, setIsLiveMicActive] = useState<boolean>(false);
  const [vipEntryBanner, setVipEntryBanner] = useState<VipEntryShowcase | null>(null);

  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const giftTimeoutRef = useRef<number | null>(null);
  const bigGiftTimeoutRef = useRef<number | null>(null);
  const supportTimeoutRef = useRef<number | null>(null);
  const vipEntryTimeoutRef = useRef<number | null>(null);
  const emoteSeatTimeoutRef = useRef<number | null>(null);

  const growthTier = getVipTierByGrowth(vipGrowth).current.level;
  const effectiveVipLevel = Math.min(18, Math.max(subscribedVipLevel, growthTier));

  const activeRoom = activeRoomId ? (rooms.find((r) => r.id === activeRoomId) ?? null) : null;

  const approvedCustomGifts: VirtualGift[] = customGifts
    .filter((g) => g.status === 'approved')
    .map((g, idx) => ({
      id: g.id,
      name: g.name,
      cost: g.cost,
      charmValue: g.charmValue,
      randomCoinsMin: Math.max(5, Math.round(g.cost * 0.08)),
      randomCoinsMax: Math.max(15, Math.round(g.cost * 0.2)),
      rarity: g.cost >= 1500 ? 'Mythic' : g.cost >= 300 ? 'Signature' : 'Standard',
      primaryColor: g.primaryColor,
      secondaryColor: g.secondaryColor,
      description: g.description,
      particleStyle: g.particleStyle,
      giftNumber: 900 + idx,
      customArtworkUrl: g.artworkUrl,
      customVideoUrl: g.animationVideoUrl,
      isCustomApproved: true,
    }));

  const allGifts: VirtualGift[] = [...VIRTUAL_GIFTS, ...approvedCustomGifts];

  const equippedRingColor = SHOP_ITEMS.find((i) => i.id === equippedItems.ring)?.previewColor;
  const equippedBubbleColor = SHOP_ITEMS.find((i) => i.id === equippedItems.bubble)?.previewColor;
  const equippedFrameId = equippedItems.frame;
  const equippedSeatEffect = SHOP_ITEMS.find((i) => i.id === equippedItems['seat-fx'])?.name;

  const unreadChats = chatThreads.reduce((sum, t) => sum + t.unread, 0);

  const advanceDailyTask = useCallback((taskId: string) => {
    setDailyTasks((prev) =>
      prev.map((task) =>
        task.id === taskId && task.progress < task.target
          ? { ...task, progress: task.target }
          : task
      )
    );
  }, []);

  // Earn 1 VIP Growth point per 100 Coins spent
  const applyCoinSpend = useCallback((coinsSpent: number) => {
    const earnedGrowth = Math.floor(coinsSpent / 100);
    if (earnedGrowth > 0) {
      setVipGrowth((prev) => prev + earnedGrowth);
    }
    return earnedGrowth;
  }, []);

  const handleToggleSpeaker = () => {
    setSpeakerEnabled((prev) => {
      const next = !prev;
      soundFx.enabled = next;
      if (next) {
        soundFx.playMove();
      }
      return next;
    });
  };

  // Cleanup microphone stream on unmount
  const stopMicrophone = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (micAudioCtxRef.current) {
      micAudioCtxRef.current.close().catch(() => {});
      micAudioCtxRef.current = null;
    }
    micAnalyserRef.current = null;
    setIsLiveMicActive(false);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('zayro_rooms_v1', JSON.stringify(rooms));
      window.localStorage.setItem('zayro_has_created_room', JSON.stringify(hasCreatedRoom));
      window.localStorage.setItem('zayro_user_profile', JSON.stringify(userProfile));
      window.localStorage.setItem('zayro_coins', JSON.stringify(coins));
      window.localStorage.setItem('zayro_charm', JSON.stringify(charm));
      window.localStorage.setItem('zayro_vip_growth', JSON.stringify(vipGrowth));
      window.localStorage.setItem('zayro_subscribed_vip', JSON.stringify(subscribedVipLevel));
      window.localStorage.setItem('zayro_friends', JSON.stringify(friends));
      window.localStorage.setItem('zayro_cp_requests', JSON.stringify(cpRequests));
      window.localStorage.setItem('zayro_custom_gifts', JSON.stringify(customGifts));
      window.localStorage.setItem('zayro_gifts_given_coins', JSON.stringify(userGiftsGivenCoins));
      window.localStorage.setItem('zayro_received_gifts', JSON.stringify(receivedGiftIds));
      window.localStorage.setItem('zayro_owned_items', JSON.stringify(ownedItemIds));
      window.localStorage.setItem('zayro_equipped_items', JSON.stringify(equippedItems));
      window.localStorage.setItem('zayro_custom_qr', JSON.stringify(customQrUrl));
      window.localStorage.setItem('zayro_gift_animations', JSON.stringify(giftAnimationsEnabled));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [
    rooms,
    hasCreatedRoom,
    userProfile,
    coins,
    charm,
    vipGrowth,
    subscribedVipLevel,
    friends,
    cpRequests,
    customGifts,
    userGiftsGivenCoins,
    receivedGiftIds,
    ownedItemIds,
    equippedItems,
    customQrUrl,
    giftAnimationsEnabled,
  ]);

  useEffect(() => {
    return () => {
      stopMicrophone();
      if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
      if (bigGiftTimeoutRef.current) clearTimeout(bigGiftTimeoutRef.current);
      if (supportTimeoutRef.current) clearTimeout(supportTimeoutRef.current);
      if (vipEntryTimeoutRef.current) clearTimeout(vipEntryTimeoutRef.current);
      if (emoteSeatTimeoutRef.current) clearTimeout(emoteSeatTimeoutRef.current);
    };
  }, [stopMicrophone]);

  // Animate seat voice audio levels
  useEffect(() => {
    if (activeSection !== 'rooms' || !activeRoomId) return;
    const freqData = new Uint8Array(32);

    const intervalId = window.setInterval(() => {
      let userMicLevel = 0;
      if (userSeatIndex !== null && !isMicMuted) {
        if (micAnalyserRef.current) {
          micAnalyserRef.current.getByteFrequencyData(freqData);
          const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;
          userMicLevel = Math.min(1, avg / 95);
        } else {
          userMicLevel = 0.28 + Math.random() * 0.45;
        }
      }

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id !== activeRoomId) return room;
          return {
            ...room,
            seats: room.seats.map((seat) => {
              if (!seat.occupant) return seat;
              if (seat.isUser) {
                return {
                  ...seat,
                  occupant: userProfile,
                  isMuted: isMicMuted,
                  isSpeaking: !isMicMuted && userMicLevel > 0.14,
                  audioLevel: isMicMuted ? 0 : userMicLevel,
                  vipLevel: effectiveVipLevel,
                  charmValue: charm,
                };
              }
              if (seat.isMuted) {
                return { ...seat, isSpeaking: false, audioLevel: 0 };
              }
              const speakingToggle = Math.random() > 0.72 ? !seat.isSpeaking : seat.isSpeaking;
              return {
                ...seat,
                isSpeaking: speakingToggle,
                audioLevel: speakingToggle ? 0.35 + Math.random() * 0.55 : 0.08,
              };
            }),
          };
        })
      );
    }, 180);

    return () => clearInterval(intervalId);
  }, [activeSection, activeRoomId, userSeatIndex, isMicMuted, userProfile, effectiveVipLevel, charm]);

  // PK Countdown Timer
  useEffect(() => {
    const pkTimer = window.setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          const pk = room.pkState;
          if (!pk || !pk.active || !pk.running) return room;
          if (pk.secondsLeft <= 1) {
            const winner =
              pk.pinkScore > pk.blueScore
                ? 'Pink Team Wins!'
                : pk.blueScore > pk.pinkScore
                  ? 'Blue Team Wins!'
                  : 'PK Ended in a Tie!';
            return {
              ...room,
              pkState: { ...pk, running: false, secondsLeft: 0 },
              messages: [
                ...room.messages,
                {
                  id: `pk-end-${Date.now()}`,
                  senderName: 'PK Referee',
                  senderColor: '#EC4899',
                  text: `${winner} Final Score: Pink ${pk.pinkScore.toLocaleString()} vs Blue ${pk.blueScore.toLocaleString()}`,
                  timestamp: 'Now',
                  kind: 'system' as const,
                },
              ],
            };
          }
          return {
            ...room,
            pkState: { ...pk, secondsLeft: pk.secondsLeft - 1 },
          };
        })
      );
    }, 1000);
    return () => clearInterval(pkTimer);
  }, []);

  const handleLogin = ({
    provider,
    name,
    identifier,
  }: {
    provider: AuthProvider;
    name: string;
    identifier: string;
  }) => {
    const cleanEmail = identifier.includes('@') ? identifier.trim() : '';
    setUserProfile((prev) => ({
      ...prev,
      name: name.trim() || prev.name,
      handle: `@${(name.trim() || 'sabir').toLowerCase().replace(/\s+/g, '')}.${provider}`,
      email: cleanEmail || prev.email,
    }));

    const today = getTodayDateKey();
    let lastLoginDate: string | null = null;
    try {
      lastLoginDate = window.localStorage.getItem('zayro_daily_login_date');
    } catch {
      lastLoginDate = null;
    }
    if (lastLoginDate !== today) {
      setCoins((prev) => prev + 100_000);
      setDailyLoginClaimed(true);
      try {
        window.localStorage.setItem('zayro_daily_login_date', today);
      } catch {
        // Ignore storage error
      }
    }

    setIsAuthenticated(true);
    setActiveSection('home');
    soundFx.playVictory();
  };

  const handleJoinSeat = async (seatIndex: number) => {
    if (!activeRoomId) return;
    const targetRoom = rooms.find((r) => r.id === activeRoomId);
    if (!targetRoom) return;
    if (seatIndex === 0 && targetRoom.ownerUid !== userProfile.uid) return;
    const targetSeat = targetRoom.seats.find((s) => s.seatIndex === seatIndex);
    if (!targetSeat || targetSeat.isLocked || targetSeat.occupant) return;

    soundFx.playMove();
    setUserSeatIndex(seatIndex);
    setIsMicMuted(false);
    advanceDailyTask('dt-1');

    if (navigator.mediaDevices?.getUserMedia && !micStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        micAudioCtxRef.current = ctx;
        micAnalyserRef.current = analyser;
        setIsLiveMicActive(true);
      } catch {
        setIsLiveMicActive(false);
      }
    }

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== activeRoomId) return room;
        return {
          ...room,
          seats: room.seats.map((seat) => {
            if (seat.isUser) {
              return {
                ...seat,
                occupant: null,
                role: 'empty',
                isUser: false,
                isSpeaking: false,
                audioLevel: 0,
              };
            }
            if (seat.seatIndex === seatIndex && !seat.occupant && !seat.isLocked) {
              return {
                ...seat,
                occupant: userProfile,
                role: seat.seatIndex === 0 ? 'owner' : 'speaker',
                isUser: true,
                isMuted: false,
                isSpeaking: true,
                audioLevel: 0.45,
                vipLevel: effectiveVipLevel,
                charmValue: charm,
              };
            }
            return seat;
          }),
        };
      })
    );
  };

  const handleLeaveSeat = useCallback(() => {
    stopMicrophone();
    setUserSeatIndex(null);
    if (!activeRoomId) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== activeRoomId) return room;
        return {
          ...room,
          seats: room.seats.map((seat) =>
            seat.isUser
              ? {
                  ...seat,
                  occupant: null,
                  role: 'empty',
                  isUser: false,
                  isSpeaking: false,
                  audioLevel: 0,
                }
              : seat
          ),
        };
      })
    );
  }, [activeRoomId, stopMicrophone]);

  const enterRoomDirect = (roomId: string) => {
    if (activeRoomId && activeRoomId !== roomId) {
      handleLeaveSeat();
    }
    setActiveRoomId(roomId);
    const targetRoom = rooms.find((r) => r.id === roomId);
    const isOwnerEntering = targetRoom?.ownerUid === userProfile.uid;

    if (isOwnerEntering && targetRoom) {
      // Owner's Seat (Seat 0) is permanent — automatically seat the Room Owner upon entering
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          return {
            ...room,
            seats: room.seats.map((seat) => {
              if (seat.seatIndex === 0) {
                return {
                  ...seat,
                  occupant: userProfile,
                  role: 'owner',
                  isUser: true,
                  isLocked: false,
                  isMuted: isMicMuted,
                  isSpeaking: !isMicMuted,
                  audioLevel: isMicMuted ? 0 : 0.45,
                  vipLevel: effectiveVipLevel,
                  charmValue: charm,
                };
              }
              if (seat.isUser || seat.occupant?.uid === userProfile.uid) {
                return {
                  ...seat,
                  occupant: null,
                  role: 'empty',
                  isUser: false,
                  isSpeaking: false,
                  audioLevel: 0,
                };
              }
              return seat;
            }),
          };
        })
      );
      setUserSeatIndex(0);
    } else {
      const existingSeat = targetRoom?.seats.find(
        (s) => s.isUser || s.occupant?.uid === userProfile.uid
      );
      setUserSeatIndex(existingSeat ? existingSeat.seatIndex : null);
    }

    advanceDailyTask('dt-1');
    if (speakerEnabled) {
      soundFx.playMove();
    }

    if (vipEntryTimeoutRef.current) clearTimeout(vipEntryTimeoutRef.current);
    setVipEntryBanner({
      name: userProfile.name,
      vipLevel: effectiveVipLevel,
      effectId: equippedItems.entry || 'entry-golden-flame',
    });
    vipEntryTimeoutRef.current = window.setTimeout(() => {
      setVipEntryBanner(null);
    }, 3200);
  };

  const handleSelectRoom = (roomId: string): boolean => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    const isOwnerOrAdmin =
      targetRoom?.ownerUid === userProfile.uid ||
      Boolean(targetRoom?.adminUids.includes(userProfile.uid));
    if (
      targetRoom?.isRoomLocked &&
      targetRoom.roomPasscode &&
      !isOwnerOrAdmin &&
      !unlockedRoomIds.includes(roomId)
    ) {
      setPendingLockedRoomId(roomId);
      setPinEntry('');
      setPinError('');
      return false;
    }
    enterRoomDirect(roomId);
    return true;
  };

  const handleUnlockRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLockedRoomId) return;
    const targetRoom = rooms.find((r) => r.id === pendingLockedRoomId);
    if (!targetRoom) {
      setPendingLockedRoomId(null);
      return;
    }
    if (pinEntry === targetRoom.roomPasscode) {
      const id = pendingLockedRoomId;
      setUnlockedRoomIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setPendingLockedRoomId(null);
      setPinEntry('');
      setPinError('');
      enterRoomDirect(id);
      setActiveSection('rooms');
    } else {
      setPinError('Incorrect 4-digit passcode. Please try again.');
    }
  };

  const handleExitRoom = () => {
    const exitingId = activeRoomId;
    handleLeaveSeat();
    if (exitingId) {
      setRooms((prev) =>
        prev.map((room) => (room.id === exitingId ? { ...room, messages: [] } : room))
      );
    }
    setActiveRoomId(null);
    setVipEntryBanner(null);
    soundFx.playMove();
  };

  const handleToggleRoomMember = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const alreadyMember = room.memberUids.includes(userProfile.uid);
        return {
          ...room,
          memberUids: alreadyMember
            ? room.memberUids.filter((id) => id !== userProfile.uid)
            : [...room.memberUids, userProfile.uid],
        };
      })
    );
    soundFx.playVictory();
  };

  const handleUpdateRoomSettings = (
    roomId: string,
    updates: {
      title?: string;
      dpUrl?: string;
      bgThemeId?: string;
      bgUrl?: string;
      isRoomLocked?: boolean;
      roomPasscode?: string;
    }
  ) => {
    const foundTheme = updates.bgThemeId
      ? ROOM_BACKGROUND_THEMES.find((t) => t.id === updates.bgThemeId)
      : undefined;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const canEdit =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canEdit) return room;
        return {
          ...room,
          title: updates.title ?? room.title,
          dpUrl: updates.dpUrl !== undefined ? updates.dpUrl : room.dpUrl,
          bgThemeId: updates.bgThemeId ?? room.bgThemeId,
          bgUrl: updates.bgUrl !== undefined ? updates.bgUrl || undefined : room.bgUrl,
          ambiance: foundTheme?.ambiance ?? room.ambiance,
          isRoomLocked:
            updates.isRoomLocked !== undefined ? updates.isRoomLocked : room.isRoomLocked,
          roomPasscode:
            updates.roomPasscode !== undefined ? updates.roomPasscode : room.roomPasscode,
        };
      })
    );
    soundFx.playMove();
  };

  const handleToggleAdmin = (roomId: string, targetUid: string, targetName: string) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        if (room.ownerUid !== userProfile.uid || targetUid === room.ownerUid) return room;

        const isCurrentlyAdmin = room.adminUids.includes(targetUid);
        const maxAdmins = getAdminSlotCount(room.level);
        if (!isCurrentlyAdmin && room.adminUids.length >= maxAdmins) {
          return room;
        }

        const nextAdminUids = isCurrentlyAdmin
          ? room.adminUids.filter((id) => id !== targetUid)
          : [...room.adminUids, targetUid];

        return {
          ...room,
          adminUids: nextAdminUids,
          seats: room.seats.map((seat) =>
            seat.occupant?.uid === targetUid
              ? { ...seat, role: isCurrentlyAdmin ? 'speaker' : 'admin' }
              : seat
          ),
          messages: [
            ...room.messages,
            {
              id: `sys-adm-${Date.now()}`,
              senderName: 'System',
              senderColor: '#38BDF8',
              text: isCurrentlyAdmin
                ? `${targetName} was removed from Room Admin.`
                : `${targetName} was appointed as Room Admin.`,
              timestamp,
              kind: 'system',
            },
          ],
        };
      })
    );
    soundFx.playVictory();
  };

  const handleKickUser = (roomId: string, targetUid: string, targetName: string) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (targetUid === userProfile.uid) {
      stopMicrophone();
      setUserSeatIndex(null);
    }
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const canMod =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canMod || targetUid === room.ownerUid) return room;

        return {
          ...room,
          listenerCount: Math.max(1, room.listenerCount - 1),
          listeners: room.listeners.filter((l) => l.uid !== targetUid),
          seats: room.seats.map((seat) =>
            seat.occupant?.uid === targetUid
              ? {
                  ...seat,
                  occupant: null,
                  role: 'empty',
                  isUser: false,
                  isMuted: false,
                  isSpeaking: false,
                  audioLevel: 0,
                }
              : seat
          ),
          messages: [
            ...room.messages,
            {
              id: `sys-kick-${Date.now()}`,
              senderName: 'System',
              senderColor: '#FB7185',
              text: `${targetName} (${targetUid}) was removed from the stage.`,
              timestamp,
              kind: 'system',
            },
          ],
        };
      })
    );
    soundFx.playMove();
  };

  const handleLiftUserToSeat = (roomId: string, listener: RoomListener) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    let selfSeatedIndex: number | null = null;

    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const canMod =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canMod) return room;

        const bottomStart = room.isOfficial ? 3 : 2;
        const openSeat =
          room.seats.find((s) => s.seatIndex >= bottomStart && !s.occupant && !s.isLocked) ??
          room.seats.find((s) => !s.occupant && !s.isLocked);
        if (!openSeat) return room;

        const isSelf = listener.uid === userProfile.uid;
        if (isSelf) {
          selfSeatedIndex = openSeat.seatIndex;
        }

        const matchedAvatar: AvatarConfig = isSelf
          ? userProfile
          : AVATAR_ROSTER.find((a) => a.uid === listener.uid || a.id === listener.avatarId) ?? {
              id: listener.avatarId,
              uid: listener.uid,
              name: listener.name,
              handle: `@${listener.name.toLowerCase().replace(/\s+/g, '')}`,
              skinTone: '#D69E76',
              hairColor: '#1E293B',
              robeColor: '#10B981',
              accentColor: '#6EE7B7',
              ornament: 'lotus',
            };

        return {
          ...room,
          listeners: room.listeners.filter((l) => l.uid !== listener.uid),
          seats: room.seats.map((seat) =>
            seat.seatIndex === openSeat.seatIndex
              ? {
                  ...seat,
                  occupant: matchedAvatar,
                  role: room.adminUids.includes(listener.uid) ? 'admin' : 'speaker',
                  isUser: isSelf,
                  isMuted: false,
                  isSpeaking: true,
                  audioLevel: 0.4,
                  vipLevel: isSelf ? effectiveVipLevel : listener.vipLevel,
                  charmValue: isSelf ? charm : listener.charm,
                }
              : seat
          ),
          messages: [
            ...room.messages,
            {
              id: `sys-lift-${Date.now()}`,
              senderName: 'System',
              senderColor: '#34D399',
              text: `${listener.name} was lifted to Seat ${openSeat.seatIndex + 1}.`,
              timestamp,
              kind: 'system',
            },
          ],
        };
      })
    );

    if (selfSeatedIndex !== null) {
      setUserSeatIndex(selfSeatedIndex);
      setIsMicMuted(false);
    }
    soundFx.playVictory();
  };

  const handleToggleMuteByUid = (roomId: string, targetUid: string) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          seats: room.seats.map((seat) => {
            if (seat.occupant?.uid !== targetUid) return seat;
            if (seat.isUser) {
              setIsMicMuted(!seat.isMuted);
            }
            return { ...seat, isMuted: !seat.isMuted };
          }),
          listeners: room.listeners.map((lis) =>
            lis.uid === targetUid ? { ...lis, isMuted: !lis.isMuted } : lis
          ),
        };
      })
    );
    soundFx.playMove();
  };

  const handleToggleLockSeat = (seatIndex: number) => {
    if (!activeRoomId || seatIndex === 0) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== activeRoomId) return room;
        return {
          ...room,
          seats: room.seats.map((seat) => {
            if (seat.seatIndex !== seatIndex) return seat;
            if (seat.occupant) {
              if (seat.isUser) {
                setUserSeatIndex(null);
              }
              return {
                ...seat,
                occupant: null,
                role: 'empty',
                isUser: false,
                isMuted: false,
                isSpeaking: false,
                audioLevel: 0,
                isLocked: true,
              };
            }
            return { ...seat, isLocked: !seat.isLocked };
          }),
        };
      })
    );
    soundFx.playMove();
  };

  const handleToggleMuteSeat = (seatIndex: number) => {
    if (!activeRoomId) return;
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== activeRoomId) return room;
        return {
          ...room,
          seats: room.seats.map((seat) => {
            if (seat.seatIndex !== seatIndex) return seat;
            if (seat.isUser) {
              setIsMicMuted(!seat.isMuted);
            }
            return { ...seat, isMuted: !seat.isMuted };
          }),
        };
      })
    );
    soundFx.playMove();
  };

  const handleSendMessage = (text: string, imageUrl?: string) => {
    if (!activeRoomId) return;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoomId
          ? {
              ...room,
              messages: [
                ...room.messages,
                {
                  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                  senderUid: userProfile.uid,
                  senderName: userProfile.name,
                  senderColor: equippedRingColor || getVipNameColor(effectiveVipLevel),
                  bubbleColor: equippedBubbleColor,
                  text,
                  imageUrl,
                  timestamp,
                  kind: 'chat',
                },
              ],
            }
          : room
      )
    );
    soundFx.playMove();
  };

  // Voice Room Emotes appear ONLY on the seated avatar in the Voice Room (never on profiles or chat text)
  const handleSendEmote = (
    emoteNumber: number,
    label: string,
    _symbol: string,
    motion: EmoteMotion
  ) => {
    const triggeredAt = Date.now();
    const nextEmote = { emoteNumber, label, motion, triggeredAt };

    if (activeRoomId) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === activeRoomId
            ? {
                ...room,
                seats: room.seats.map((seat) =>
                  seat.isUser || seat.occupant?.uid === userProfile.uid
                    ? { ...seat, activeEmote: nextEmote }
                    : seat
                ),
              }
            : room
        )
      );

      if (emoteSeatTimeoutRef.current) clearTimeout(emoteSeatTimeoutRef.current);
      emoteSeatTimeoutRef.current = window.setTimeout(() => {
        setRooms((prev) =>
          prev.map((room) => ({
            ...room,
            seats: room.seats.map((seat) =>
              seat.activeEmote?.triggeredAt === triggeredAt
                ? { ...seat, activeEmote: undefined }
                : seat
            ),
          }))
        );
      }, 4500);
    }

    soundFx.playBeat(true);
  };

  const grantRoomExp = useCallback(
    (roomId: string, expGained: number, extraSystemText?: string) => {
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;

          let nextXp = room.xp + expGained;
          let nextLevel = room.level;
          let leveledUp = false;

          while (nextLevel < 20 && nextXp >= getRoomNextExp(nextLevel)) {
            nextXp -= getRoomNextExp(nextLevel);
            nextLevel += 1;
            leveledUp = true;
          }
          if (nextLevel >= 20) {
            nextXp = Math.min(getRoomNextExp(20), nextXp);
          }

          const updatedMessages = [...room.messages];
          if (extraSystemText) {
            updatedMessages.push({
              id: `exp-${Date.now()}`,
              senderName: 'System',
              senderColor: '#34D399',
              text: extraSystemText,
              timestamp,
              kind: 'system',
            });
          }
          if (leveledUp) {
            updatedMessages.push({
              id: `lvl-${Date.now()}-${nextLevel}`,
              senderName: 'System',
              senderColor: '#F59E0B',
              text: `Room reached Level ${nextLevel}/20! ${getAdminSlotCount(nextLevel)} Admin Slots unlocked.`,
              timestamp,
              kind: 'system',
            });
          }

          return {
            ...room,
            level: nextLevel,
            xp: nextXp,
            messages: updatedMessages,
          };
        })
      );
    },
    []
  );

  // Sending a gift grants Charm, Random Coins, VIP Growth, Room EXP & triggers Big Gift broadcast
  const handleSendGift = (
    gift: VirtualGift,
    recipientName: string,
    quantity = 1,
    recipientUid?: string,
    customMessage?: string
  ) => {
    const qty = Math.max(1, quantity);
    const totalCost = gift.cost * qty;
    if (coins < totalCost) return;

    const cleanMessage = customMessage?.trim().slice(0, 30) || undefined;
    const isBigGift = totalCost >= 500 || gift.rarity !== 'Standard' || Boolean(cleanMessage);

    const charmEarned = gift.charmValue * qty;
    const singleRandom =
      gift.randomCoinsMin +
      Math.floor(Math.random() * (gift.randomCoinsMax - gift.randomCoinsMin + 1));
    const randomCoinsEarned = singleRandom * qty;
    const roomExpEarned = Math.max(1, Math.round(totalCost / 10));

    setCoins((prev) => prev - totalCost + randomCoinsEarned);
    setCharm((prev) => prev + charmEarned);
    setUserGiftsGivenCoins((prev) => prev + totalCost);
    applyCoinSpend(totalCost);
    soundFx.playGiftFanfare(gift.rarity);

    advanceDailyTask('dt-2');
    setRoomTasks((prev) =>
      prev.map((rt) =>
        rt.id === 'rt-gift'
          ? { ...rt, progress: Math.min(rt.target, rt.progress + roomExpEarned) }
          : rt
      )
    );

    setReceivedGiftIds((prev) => (prev.includes(gift.id) ? prev : [...prev, gift.id]));

    // Advance CP Level & Charms when gifting to connected CP Partner
    if (
      userProfile.cpPartner &&
      ((recipientUid && recipientUid === userProfile.cpPartner.partnerUid) ||
        recipientName.toLowerCase() === userProfile.cpPartner.partnerName.toLowerCase())
    ) {
      setUserProfile((prev) => {
        if (!prev.cpPartner) return prev;
        const nextCpCharm = (prev.cpPartner.cpCharm ?? 0) + charmEarned;
        const cpLevelInfo = getCpLevelInfo(nextCpCharm);
        return {
          ...prev,
          cpPartner: {
            ...prev.cpPartner,
            cpCharm: nextCpCharm,
            cpLevel: cpLevelInfo.level,
          },
        };
      });
    }

    // Ring / Diamond Ring gift automatically sends a CP Ring proposal request to the recipient
    if (
      (gift.id === 'ring' || gift.id === 'diamond-ring') &&
      recipientUid &&
      recipientUid !== userProfile.uid
    ) {
      const matched = AVATAR_ROSTER.find((a) => a.uid === recipientUid);
      const ringNum = gift.id === 'diamond-ring' ? 8 : 1;
      handleProposeCp(
        recipientUid,
        recipientName,
        matched?.id ?? AVATAR_ROSTER[0].id,
        ringNum,
        gift.name
      );
    }

    if (recipientName.toLowerCase() === intimateSpace.partnerName.toLowerCase()) {
      setIntimateSpace((prev) => ({
        ...prev,
        progress: Math.min(prev.target, prev.progress + charmEarned),
      }));
    }

    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const targetRoomId = activeRoomId ?? rooms[0]?.id;
    if (targetRoomId) {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== targetRoomId) return room;

          let nextXp = room.xp + roomExpEarned;
          let nextLevel = room.level;
          let leveledUp = false;

          while (nextLevel < 20 && nextXp >= getRoomNextExp(nextLevel)) {
            nextXp -= getRoomNextExp(nextLevel);
            nextLevel += 1;
            leveledUp = true;
          }

          const newMessages = [
            ...room.messages,
            {
              id: `gift-${Date.now()}`,
              senderUid: userProfile.uid,
              senderName: userProfile.name,
              senderColor: '#FBBF24',
              text: `sent ${qty > 1 ? `${qty}x ` : ''}${gift.name} to ${recipientName}${recipientUid ? ` (${recipientUid})` : ''}${cleanMessage ? ` · "${cleanMessage}"` : ''} (+${charmEarned.toLocaleString()} Charm, +${randomCoinsEarned.toLocaleString()} Random Coins, +${roomExpEarned.toLocaleString()} Room EXP)`,
              timestamp,
              kind: 'gift' as const,
            },
          ];

          if (leveledUp) {
            newMessages.push({
              id: `lvl-${Date.now()}`,
              senderName: 'System',
              senderColor: '#34D399',
              text: `Room reached Level ${nextLevel}/20! ${getAdminSlotCount(nextLevel)} Admin Slots now unlocked.`,
              timestamp,
              kind: 'system',
            });
          }

          let nextPkState = room.pkState;
          if (nextPkState?.active && nextPkState.running && nextPkState.mode === 'gifting') {
            const matchedSeat = room.seats.find(
              (s) =>
                (recipientUid && s.occupant?.uid === recipientUid) ||
                s.occupant?.name === recipientName
            );
            const targetUidResolved = recipientUid || matchedSeat?.occupant?.uid || '';
            let targetSide: 'pink' | 'blue' = 'pink';
            if (targetUidResolved && nextPkState.blueTeamUids.includes(targetUidResolved)) {
              targetSide = 'blue';
            } else if (targetUidResolved && nextPkState.pinkTeamUids.includes(targetUidResolved)) {
              targetSide = 'pink';
            } else if (matchedSeat) {
              const topCount = room.isOfficial ? 3 : 2;
              const bottomSeats = room.seats.slice(topCount);
              const bIdx = bottomSeats.findIndex((s) => s.seatIndex === matchedSeat.seatIndex);
              if (nextPkState.format === '1v1') {
                targetSide = bIdx === 7 ? 'blue' : 'pink';
              } else {
                const halfBottom = Math.ceil(bottomSeats.length / 2);
                targetSide = bIdx >= halfBottom ? 'blue' : 'pink';
              }
            }
            nextPkState = {
              ...nextPkState,
              pinkScore:
                targetSide === 'pink' ? nextPkState.pinkScore + totalCost : nextPkState.pinkScore,
              blueScore:
                targetSide === 'blue' ? nextPkState.blueScore + totalCost : nextPkState.blueScore,
            };
          }

          return {
            ...room,
            level: nextLevel,
            xp: nextXp,
            coinsSpentByUid: {
              ...(room.coinsSpentByUid ?? {}),
              [userProfile.uid]: (room.coinsSpentByUid?.[userProfile.uid] ?? 0) + totalCost,
            },
            pkState: nextPkState,
            seats: room.seats.map((seat) => {
              const matchesUid = recipientUid && seat.occupant?.uid === recipientUid;
              const matchesName = seat.occupant?.name === recipientName;
              return matchesUid || matchesName
                ? {
                    ...seat,
                    giftScore: seat.giftScore + totalCost,
                    charmValue: (seat.charmValue ?? 0) + charmEarned,
                  }
                : seat;
            }),
            messages: newMessages,
          };
        })
      );
    }

    const giftPayload: ActiveGiftEvent = {
      eventId: `ev-${Date.now()}`,
      gift,
      senderName: userProfile.name,
      recipientName,
      charmEarned,
      randomCoinsEarned,
      customMessage: cleanMessage,
      isBigGift,
    };

    if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
    setActiveGiftEvent(giftPayload);
    giftTimeoutRef.current = window.setTimeout(() => {
      setActiveGiftEvent(null);
    }, 3200);

    if (isBigGift) {
      if (bigGiftTimeoutRef.current) clearTimeout(bigGiftTimeoutRef.current);
      setBigGiftBanner(giftPayload);
      bigGiftTimeoutRef.current = window.setTimeout(() => {
        setBigGiftBanner(null);
      }, 5500);
    }
  };

  // PK Battle Handlers (Owner/Admin-only setup & start/end, 1 vote per user in Voting PK)
  const handleTogglePkActive = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        const canMod =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canMod) return room;
        const currentlyActive = Boolean(room.pkState?.active);
        const durMins = room.pkState?.durationMinutes ?? 5;
        return {
          ...room,
          pkState: currentlyActive
            ? { ...(room.pkState!), active: false, running: false }
            : {
                active: true,
                mode: room.pkState?.mode ?? 'gifting',
                format: room.pkState?.format ?? '1v1',
                durationMinutes: durMins,
                running: false,
                secondsLeft: durMins * 60,
                pinkScore: 0,
                blueScore: 0,
                pinkTeamUids: [],
                blueTeamUids: [],
                votedUids: [],
              },
        };
      })
    );
    soundFx.playMove();
  };

  const handleSetPkConfig = (
    roomId: string,
    config: {
      mode?: 'gifting' | 'voting';
      format?: '1v1' | 'multiplayer';
      durationMinutes?: 5 | 15 | 30 | 45 | 60;
    }
  ) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId || !room.pkState) return room;
        const canMod =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canMod) return room;
        const nextDur = config.durationMinutes ?? room.pkState.durationMinutes ?? 5;
        return {
          ...room,
          pkState: {
            ...room.pkState,
            mode: config.mode ?? room.pkState.mode,
            format: config.format ?? room.pkState.format,
            durationMinutes: nextDur,
            secondsLeft:
              !room.pkState.running && config.durationMinutes
                ? nextDur * 60
                : room.pkState.secondsLeft,
          },
        };
      })
    );
    soundFx.playMove();
  };

  const handleStartPk = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId || !room.pkState) return room;
        const canMod =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canMod) return room;
        const durMins = room.pkState.durationMinutes ?? 5;
        return {
          ...room,
          pkState: {
            ...room.pkState,
            running: true,
            durationMinutes: durMins,
            secondsLeft: durMins * 60,
            pinkScore: 0,
            blueScore: 0,
            votedUids: [],
          },
          messages: [
            ...room.messages,
            {
              id: `pk-start-${Date.now()}`,
              senderName: 'PK Referee',
              senderColor: '#38BDF8',
              text: `${room.pkState.mode === 'gifting' ? 'Gifting PK' : 'Voting PK'} (${
                room.pkState.format === '1v1' ? '1v1' : 'Multiplayer'
              }) started for ${String(durMins).padStart(2, '0')}:00!`,
              timestamp: 'Now',
              kind: 'system' as const,
            },
          ],
        };
      })
    );
    soundFx.playVictory();
  };

  const handleEndPk = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId || !room.pkState) return room;
        const canMod =
          room.ownerUid === userProfile.uid || room.adminUids.includes(userProfile.uid);
        if (!canMod) return room;
        return {
          ...room,
          pkState: {
            ...room.pkState,
            active: false,
            running: false,
          },
        };
      })
    );
    soundFx.playMove();
  };

  const handleJoinPkTeam = (roomId: string, side: 'pink' | 'blue') => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId || !room.pkState) return room;
        const cleanPink = room.pkState.pinkTeamUids.filter((id) => id !== userProfile.uid);
        const cleanBlue = room.pkState.blueTeamUids.filter((id) => id !== userProfile.uid);
        return {
          ...room,
          pkState: {
            ...room.pkState,
            pinkTeamUids: side === 'pink' ? [...cleanPink, userProfile.uid] : cleanPink,
            blueTeamUids: side === 'blue' ? [...cleanBlue, userProfile.uid] : cleanBlue,
          },
        };
      })
    );
    soundFx.playMove();
  };

  const handleVotePkTeam = (roomId: string, side: 'pink' | 'blue') => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId || !room.pkState) return room;
        const pk = room.pkState;
        if (pk.votedUids.includes(userProfile.uid)) return room;
        return {
          ...room,
          pkState: {
            ...pk,
            pinkScore: side === 'pink' ? pk.pinkScore + 1 : pk.pinkScore,
            blueScore: side === 'blue' ? pk.blueScore + 1 : pk.blueScore,
            votedUids: [...pk.votedUids, userProfile.uid],
          },
        };
      })
    );
    soundFx.playMove();
  };

  const handleClaimRoomTask = (taskId: string) => {
    const task = roomTasks.find((t) => t.id === taskId);
    if (!task || task.claimed || task.progress < task.target) return;
    const reward = task.vipDouble && effectiveVipLevel >= 2 ? task.rewardExp * 2 : task.rewardExp;
    setRoomTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)));
    const targetId = activeRoomId ?? rooms[0]?.id;
    if (targetId) {
      grantRoomExp(targetId, reward, `Claimed Room Task "${task.title}" (+${reward} Room EXP).`);
    }
    soundFx.playVictory();
  };

  // Creating a room costs 500 Coins & grants 1 Permanent Room per user
  const handleCreateRoom = (data: {
    title: string;
    topic: string;
    category: VoiceRoom['category'];
    ambiance: VoiceRoom['ambiance'];
    roomType: VoiceRoom['roomType'];
  }) => {
    if (hasCreatedRoom || coins < 500) return;

    setCoins((prev) => prev - 500);
    applyCoinSpend(500);
    setHasCreatedRoom(true);

    const generatedUid = String(Math.floor(10000 + Math.random() * 89999));
    const newRoom: VoiceRoom = {
      id: `room-${Date.now()}`,
      uid: generatedUid,
      title: data.title,
      topic: data.topic,
      category: data.category,
      tags: [data.category, 'Voice'],
      hostName: userProfile.name,
      ownerUid: userProfile.uid,
      adminUids: [],
      memberUids: [userProfile.uid],
      isOfficial: false,
      isUserCreated: true,
      roomType: 'voice',
      level: 1,
      xp: 0,
      listenerCount: 1,
      ambiance: data.ambiance,
      bgThemeId:
        ROOM_BACKGROUND_THEMES.find((t) => t.ambiance === data.ambiance)?.id ?? 'bg-saffron',
      seats: [
        {
          seatIndex: 0,
          occupant: userProfile,
          role: 'owner',
          isMuted: false,
          isLocked: false,
          isSpeaking: true,
          audioLevel: 0.5,
          isUser: true,
          giftScore: 0,
          charmValue: charm,
          vipLevel: effectiveVipLevel,
        },
        ...Array.from({ length: 9 }, (_, i) => ({
          seatIndex: i + 1,
          occupant: null,
          role: 'empty' as const,
          isMuted: false,
          isLocked: false,
          isSpeaking: false,
          audioLevel: 0,
          giftScore: 0,
        })),
      ],
      coinsSpentByUid: {},
      listeners: [],
      micRequests: [],
      messages: [
        {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          senderColor: '#F59E0B',
          text: `${data.title} (UID ${generatedUid}) created for 500 Coins! Level 1 with 3 Admin Slots.`,
          timestamp: 'Now',
          kind: 'system',
        },
      ],
    };

    setRooms((prev) => [newRoom, ...prev]);
    setActiveRoomId(newRoom.id);
    setUserSeatIndex(0);
    setActiveSection('rooms');
    soundFx.playVictory();
  };

  // Home Hub handlers
  const handleClaimTask = (taskId: string) => {
    const task = dailyTasks.find((t) => t.id === taskId);
    if (!task || task.claimed || task.progress < task.target) return;
    setDailyTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)));
    setCoins((prev) => prev + task.rewardCoins);
    soundFx.playVictory();
  };

  const handleAddFriendByUid = (rawUid: string): string => {
    const cleanUid = rawUid.trim().toUpperCase();
    if (!cleanUid) return 'Enter a valid User ID.';
    if (cleanUid === userProfile.uid) return 'That is your own permanent OG VELOCITY UID.';
    if (friends.some((f) => f.uid.toUpperCase() === cleanUid)) {
      return `${cleanUid} is already in your Friends list.`;
    }
    const matched = AVATAR_ROSTER.find((a) => a.uid.toUpperCase() === cleanUid);
    const newFriend: FriendRecord = matched
      ? {
          uid: matched.uid,
          name: matched.name,
          avatarId: matched.id,
          status: 'Online',
        }
      : {
          uid: cleanUid,
          name: `Player ${cleanUid.slice(-4)}`,
          avatarId: AVATAR_ROSTER[4].id,
          status: 'Online',
        };
    setFriends((prev) => [newFriend, ...prev]);
    soundFx.playVictory();
    return `Added ${newFriend.name} (${newFriend.uid}) to your Friends!`;
  };

  // Chat handlers
  const handleSelectChatThread = (friendUid: string) => {
    setChatThreads((prev) =>
      prev.map((t) => (t.friendUid === friendUid ? { ...t, unread: 0 } : t))
    );
  };

  const handleSendChatMessage = (friendUid: string, text: string, imageUrl?: string) => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setChatThreads((prev) =>
      prev.map((thread) =>
        thread.friendUid === friendUid
          ? {
              ...thread,
              unread: 0,
              messages: [
                ...thread.messages,
                {
                  id: `cm-${Date.now()}`,
                  senderId: userProfile.id,
                  senderName: userProfile.name,
                  text,
                  imageUrl,
                  timestamp,
                  isSelf: true,
                  bubbleColor: equippedBubbleColor,
                },
              ],
            }
          : thread
      )
    );
    advanceDailyTask('dt-3');
    soundFx.playMove();
  };

  const handleJoinFriendVoiceRoom = (roomUid: string) => {
    const target = rooms.find((r) => r.uid === roomUid);
    if (target) {
      if (handleSelectRoom(target.id)) {
        setActiveSection('rooms');
      }
      return;
    }
    setActiveSection('rooms');
  };

  const handleMessageUser = (uid: string, name: string) => {
    const existing = chatThreads.find((t) => t.friendUid === uid);
    if (!existing) {
      const matched = AVATAR_ROSTER.find((a) => a.uid === uid);
      setChatThreads((prev) => [
        {
          friendUid: uid,
          friendName: name,
          avatarId: matched?.id ?? AVATAR_ROSTER[0].id,
          status: 'Online',
          unread: 0,
          messages: [
            {
              id: `cm-init-${Date.now()}`,
              senderId: uid,
              senderName: name,
              text: `Hey ${userProfile.name}! Say hi in OG VELOCITY Chats.`,
              timestamp: 'Now',
              isSelf: false,
            },
          ],
        },
        ...prev,
      ]);
    } else {
      handleSelectChatThread(uid);
    }
    setActiveSection('chat');
  };

  const handleSendBackMessage = (uid: string, name: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const matched = AVATAR_ROSTER.find((a) => a.uid === uid);

    setChatThreads((prev) => {
      const existing = prev.find((t) => t.friendUid === uid);
      const newMsg = {
        id: `cm-back-${Date.now()}`,
        senderId: userProfile.id,
        senderName: userProfile.name,
        text: clean,
        timestamp,
        isSelf: true,
        bubbleColor: equippedBubbleColor,
      };
      if (existing) {
        return prev.map((t) =>
          t.friendUid === uid
            ? { ...t, unread: 0, messages: [...t.messages, newMsg] }
            : t
        );
      }
      return [
        {
          friendUid: uid,
          friendName: name,
          avatarId: matched?.id ?? AVATAR_ROSTER[0].id,
          status: 'Online',
          unread: 0,
          messages: [newMsg],
        },
        ...prev,
      ];
    });
    advanceDailyTask('dt-3');
    soundFx.playMove();
  };

  // Discover Moments handlers
  const handleToggleLikeMoment = (momentId: string) => {
    setMoments((prev) =>
      prev.map((m) =>
        m.id === momentId
          ? {
              ...m,
              liked: !m.liked,
              likes: m.liked ? Math.max(0, m.likes - 1) : m.likes + 1,
            }
          : m
      )
    );
    soundFx.playMove();
  };

  const handleAddMoment = (caption: string, mediaType: 'photo' | 'video', mediaUrl?: string) => {
    const post: MomentPost = {
      id: `mom-${Date.now()}`,
      authorUid: userProfile.uid,
      authorName: userProfile.name,
      avatarId: userProfile.id,
      mediaType,
      mediaUrl,
      mediaTitle: mediaType === 'video' ? `${userProfile.name}'s Live Clip` : `${userProfile.name}'s Snapshot`,
      caption,
      mediaGradient:
        mediaType === 'video'
          ? 'linear-gradient(135deg, #4c0519 0%, #7c2d12 45%, #0f172a 100%)'
          : 'linear-gradient(135deg, #064e3b 0%, #1e3a8a 50%, #090b12 100%)',
      timestamp: 'Just now',
      likes: 1,
      liked: true,
    };
    setMoments((prev) => [post, ...prev]);
    soundFx.playVictory();
  };

  const handleInviteFriendToRoom = (roomId: string, friend: FriendRecord) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    handleSendBackMessage(
      friend.uid,
      friend.name,
      `Join me in "${room.title}" Voice Room (ID: ${room.uid})!`
    );
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              messages: [
                ...r.messages,
                {
                  id: `inv-${Date.now()}`,
                  senderName: 'System',
                  senderColor: '#22D3EE',
                  text: `${userProfile.name} invited ${friend.name} (${friend.uid}) to the room.`,
                  timestamp: 'Now',
                  kind: 'system',
                },
              ],
            }
          : r
      )
    );
    soundFx.playVictory();
  };

  const handleInviteFriendToGame = (friend: FriendRecord, gameTitle: string) => {
    handleSendBackMessage(
      friend.uid,
      friend.name,
      `Hey ${friend.name}, join my ${gameTitle} match on OG VELOCITY!`
    );
    soundFx.playVictory();
  };

  // CP (Couple / Partner) Ring Proposal Workflow (Purchased Rings Only)
  const handleProposeCp = (
    toUid: string,
    toName: string,
    toAvatarId: string,
    ringNumber: number,
    ringName: string
  ) => {
    if (!toUid || toUid === userProfile.uid) return;
    const ownsRing = ownedItemIds.some(
      (id) =>
        id === `ring-${ringNumber}` ||
        SHOP_ITEMS.find((item) => item.id === id && item.category === 'ring')?.ringNumber ===
          ringNumber
    );
    if (!ownsRing) return;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newReq: CpRequest = {
      id: `cp-req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromUid: userProfile.uid,
      fromName: userProfile.name,
      fromAvatarId: userProfile.id,
      toUid,
      toName,
      toAvatarId,
      ringNumber,
      ringName,
      status: 'pending',
      timestamp,
    };
    setCpRequests((prev) => [newReq, ...prev]);

    handleSendBackMessage(
      toUid,
      toName,
      `💍 Sent a CP Proposal with ${ringName} (Ring #${ringNumber})! Open Me → Intimate & CP to accept.`
    );

    if (activeRoomId) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoomId
            ? {
                ...r,
                messages: [
                  ...r.messages,
                  {
                    id: `sys-cp-${Date.now()}`,
                    senderName: 'CP Cupido',
                    senderColor: '#F472B6',
                    text: `${userProfile.name} sent a CP Ring proposal (${ringName}) to ${toName} (${toUid})!`,
                    timestamp,
                    kind: 'system',
                  },
                ],
              }
            : r
        )
      );
    }
    soundFx.playGiftFanfare('Signature');
  };

  const handleRespondCpRequest = (requestId: string, accept: boolean) => {
    const req = cpRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return;

    setCpRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: accept ? 'accepted' : 'declined' } : r
      )
    );

    if (accept) {
      const isIncoming = req.toUid === userProfile.uid;
      const partnerUid = isIncoming ? req.fromUid : req.toUid;
      const partnerName = isIncoming ? req.fromName : req.toName;
      const partnerAvatarId = isIncoming ? req.fromAvatarId : req.toAvatarId;
      const since = getTodayDateKey();

      setUserProfile((prev) => ({
        ...prev,
        cpPartner: {
          partnerUid,
          partnerName,
          partnerAvatarId,
          ringNumber: req.ringNumber,
          ringName: req.ringName,
          since,
          cpCharm: 0,
          cpLevel: 1,
        },
      }));
      setIntimateSpace((prev) => ({
        ...prev,
        partnerName,
        partnerAvatarId,
      }));
      soundFx.playVictory();
    } else {
      soundFx.playMove();
    }
  };

  const handleBreakCp = () => {
    setUserProfile((prev) => ({
      ...prev,
      cpPartner: null,
    }));
    soundFx.playMove();
  };

  // Ring Support Animation & Blessing Boost Handler
  const handleSupportUser = (
    targetUid: string,
    targetName: string,
    ringNumber: number,
    ringName: string
  ) => {
    const blessingBoost = 100;

    if (targetUid === userProfile.uid) {
      setUserProfile((prev) => ({
        ...prev,
        blessing: (prev.blessing ?? 0) + blessingBoost,
      }));
    } else if (userProfile.cpPartner?.partnerUid === targetUid) {
      setUserProfile((prev) => {
        if (!prev.cpPartner) return prev;
        const nextCpCharm = (prev.cpPartner.cpCharm ?? 0) + blessingBoost;
        return {
          ...prev,
          cpPartner: {
            ...prev.cpPartner,
            cpCharm: nextCpCharm,
            cpLevel: getCpLevelInfo(nextCpCharm).level,
          },
        };
      });
    }

    setInspectedUser((prev) =>
      prev && prev.avatar.uid === targetUid
        ? {
            ...prev,
            avatar: {
              ...prev.avatar,
              blessing: (prev.avatar.blessing ?? 0) + blessingBoost,
            },
          }
        : prev
    );

    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        seats: room.seats.map((seat) =>
          seat.occupant?.uid === targetUid
            ? {
                ...seat,
                occupant: {
                  ...seat.occupant,
                  blessing: (seat.occupant.blessing ?? 0) + blessingBoost,
                },
              }
            : seat
        ),
      }))
    );

    if (supportTimeoutRef.current) clearTimeout(supportTimeoutRef.current);
    setSupportRingEvent({
      eventId: `sup-${Date.now()}`,
      senderName: userProfile.name,
      recipientUid: targetUid,
      recipientName: targetName,
      ringNumber,
      ringName,
      blessingAdded: blessingBoost,
    });
    supportTimeoutRef.current = window.setTimeout(() => {
      setSupportRingEvent(null);
    }, 3200);

    soundFx.playGiftFanfare('Signature');
  };

  // Create Gift Submission & Approval/Rejection Workflow
  const handleSubmitCustomGift = (
    submission: Omit<CustomGiftSubmission, 'id' | 'creatorUid' | 'creatorName' | 'status' | 'submittedAt'>
  ) => {
    const now = new Date();
    const submittedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: CustomGiftSubmission = {
      ...submission,
      id: `custom-gift-${Date.now()}`,
      creatorUid: userProfile.uid,
      creatorName: userProfile.name,
      status: 'pending',
      submittedAt,
    };
    setCustomGifts((prev) => [newEntry, ...prev]);
    soundFx.playVictory();
  };

  const handleReviewCustomGift = (
    giftId: string,
    status: 'approved' | 'rejected',
    reviewNote?: string
  ) => {
    setCustomGifts((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, status, reviewNote } : g))
    );
    if (status === 'approved') {
      soundFx.playGiftFanfare('Signature');
    } else {
      soundFx.playMove();
    }
  };

  // Profile & Shop handlers (UID stays immutable)
  const handleUpdateProfile = (updates: Partial<AvatarConfig>) => {
    setUserProfile((prev) => ({
      ...prev,
      name: updates.name ?? prev.name,
      handle: updates.handle ?? prev.handle,
      bio: updates.bio ?? prev.bio,
      gender: updates.gender ?? prev.gender,
      age: updates.age ?? prev.age,
      country: updates.country ?? prev.country,
      tags: updates.tags ?? prev.tags,
      email: updates.email ?? prev.email,
      ornament: updates.ornament ?? prev.ornament,
      photoUrl: updates.photoUrl !== undefined ? updates.photoUrl : prev.photoUrl,
      coverUrl: updates.coverUrl !== undefined ? updates.coverUrl : prev.coverUrl,
      uid: prev.uid,
    }));
  };

  const handleBuyCoins = (amount: number, _priceInr: number) => {
    setCoins((prev) => prev + amount);
    soundFx.playVictory();
  };

  const handleBuyVip = (
    planName: string,
    _priceInr: number,
    grantedVipLevel: number,
    bonusGrowth: number
  ) => {
    setVipLabel(planName.includes('3-Month') ? 'VIP 3M' : 'VIP 1M');
    setSubscribedVipLevel((prev) => Math.max(prev, grantedVipLevel));
    setVipGrowth((prev) => prev + bonusGrowth);
    soundFx.playVictory();
  };

  const handleBuyShopItem = (item: ShopItem) => {
    if (coins < item.priceCoins || ownedItemIds.includes(item.id)) return;
    setCoins((prev) => prev - item.priceCoins);
    applyCoinSpend(item.priceCoins);
    setOwnedItemIds((prev) => [...prev, item.id]);
    setEquippedItems((prev) => ({ ...prev, [item.category]: item.id }));
    soundFx.playVictory();
  };

  const handleEquipShopItem = (item: ShopItem) => {
    if (!ownedItemIds.includes(item.id)) return;
    setEquippedItems((prev) => ({ ...prev, [item.category]: item.id }));
    soundFx.playMove();
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#070B14] text-slate-100">
        <AmbientCanvas ambiance="saffron" energy={0.35} />
        <div className="relative z-10">
          <AuthScreen onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070B14] text-slate-100">
      <AmbientCanvas ambiance={activeRoom?.ambiance ?? 'saffron'} energy={0.42} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Global Top Notification Bar for Big Gifts (visible across all tabs) */}
        {bigGiftBanner && (
          <div className="pointer-events-none fixed inset-x-3 top-2 z-50 mx-auto max-w-xl">
            <div className="pointer-events-auto flex items-center justify-between gap-2.5 rounded-2xl border border-amber-300/60 bg-gradient-to-r from-[#0A1628]/95 via-[#0F233C]/95 to-[#0D1526]/95 px-3.5 py-2 shadow-[0_8px_32px_rgba(6,182,212,0.38)] backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/40 bg-black/40">
                  <GiftArtwork giftId={bigGiftBanner.gift.id} gift={bigGiftBanner.gift} size={34} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1 text-xs font-extrabold text-white">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span className="text-amber-300">{bigGiftBanner.senderName}</span>
                    <span className="text-slate-300">sent</span>
                    <span className="text-rose-300">{bigGiftBanner.gift.name}</span>
                    <span className="text-slate-300">to</span>
                    <span className="text-cyan-300">{bigGiftBanner.recipientName}</span>
                  </div>
                  {bigGiftBanner.customMessage && (
                    <div className="mt-0.5 truncate text-[11px] font-bold text-amber-200">
                      “{bigGiftBanner.customMessage}”
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBigGiftBanner(null)}
                aria-label="Dismiss gift alert"
                className="shrink-0 rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <main
          className={
            activeSection === 'rooms' && activeRoom
              ? 'flex-1'
              : 'mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-24 sm:px-6'
          }
        >
          {activeSection === 'home' && (
            <HomeHub
              userProfile={userProfile}
              coins={coins}
              charm={charm}
              vipLevel={effectiveVipLevel}
              vipGrowth={vipGrowth}
              vipLabel={vipLabel}
              userGiftsGivenCoins={userGiftsGivenCoins}
              dailyLoginClaimed={dailyLoginClaimed}
              ownedItemIds={ownedItemIds}
              equippedItems={equippedItems}
              dailyTasks={dailyTasks}
              friends={friends}
              rooms={rooms}
              onOpenMe={() => {
                setMeDefaultTab('profile');
                setActiveSection('me');
              }}
              onOpenTopUp={() => {
                setMeDefaultTab('vip');
                setActiveSection('me');
              }}
              onOpenShop={() => {
                setMeDefaultTab('shop');
                setActiveSection('me');
              }}
              onBuyShopItem={handleBuyShopItem}
              onEquipShopItem={handleEquipShopItem}
              onJoinRoom={(roomId) => {
                if (handleSelectRoom(roomId)) {
                  setActiveSection('rooms');
                }
              }}
              onSeeAllRooms={() => {
                setActiveRoomId(null);
                setActiveSection('rooms');
              }}
              onClaimTask={handleClaimTask}
              onAddFriendByUid={handleAddFriendByUid}
              onInviteFriendToGame={handleInviteFriendToGame}
              onEarnCoins={(amount) => setCoins((prev) => prev + amount)}
              onInspectUser={(profile) => setInspectedUser(profile)}
            />
          )}

          {activeSection === 'rooms' && (
            <VoiceRoomStage
              rooms={rooms}
              activeRoom={activeRoom}
              userUid={userProfile.uid}
              userName={userProfile.name}
              coins={coins}
              charm={charm}
              vipLevel={effectiveVipLevel}
              hasCreatedRoom={hasCreatedRoom}
              roomTasks={roomTasks}
              gifts={allGifts}
              userSeatIndex={userSeatIndex}
              isMicMuted={isMicMuted}
              isLiveMicActive={isLiveMicActive}
              speakerEnabled={speakerEnabled}
              equippedBubbleColor={equippedBubbleColor}
              equippedBubbleId={equippedItems.bubble}
              equippedFrameId={equippedFrameId}
              equippedSeatEffect={equippedSeatEffect}
              ownedItemIds={ownedItemIds}
              vipEntryBanner={vipEntryBanner}
              onDismissVipEntry={() => setVipEntryBanner(null)}
              onOpenRingShop={() => {
                setMeDefaultTab('shop');
                setActiveSection('me');
              }}
              onSelectRoom={handleSelectRoom}
              onMinimizeRoom={() => setActiveSection('home')}
              onExitRoom={handleExitRoom}
              onOpenCreateRoom={() => setIsCreateModalOpen(true)}
              onJumpToMyRoom={() => {
                const myRoom = rooms.find(
                  (r) => r.isUserCreated || r.ownerUid === userProfile.uid
                );
                if (myRoom && handleSelectRoom(myRoom.id)) {
                  setActiveSection('rooms');
                }
              }}
              onToggleRoomMember={handleToggleRoomMember}
              onUpdateRoomSettings={handleUpdateRoomSettings}
              onToggleAdmin={handleToggleAdmin}
              onKickUser={handleKickUser}
              onLiftUserToSeat={handleLiftUserToSeat}
              onToggleMuteByUid={handleToggleMuteByUid}
              onAddFriendByUid={handleAddFriendByUid}
              onJoinSeat={handleJoinSeat}
              onLeaveSeat={handleLeaveSeat}
              onToggleMicMute={() => setIsMicMuted((m) => !m)}
              onToggleSpeaker={handleToggleSpeaker}
              onToggleLockSeat={handleToggleLockSeat}
              onToggleMuteSeat={handleToggleMuteSeat}
              onSendMessage={handleSendMessage}
              onSendEmote={handleSendEmote}
              friends={friends}
              giftAnimationsEnabled={giftAnimationsEnabled}
              onToggleGiftAnimations={() => setGiftAnimationsEnabled((v) => !v)}
              onInviteFriendToRoom={handleInviteFriendToRoom}
              onSendGift={handleSendGift}
              onClaimRoomTask={handleClaimRoomTask}
              onInspectUser={(profile) => setInspectedUser(profile)}
              onMessageUser={handleMessageUser}
              onSendBackMessage={handleSendBackMessage}
              onSupportUser={handleSupportUser}
              onProposeCp={handleProposeCp}
              onTogglePkActive={handleTogglePkActive}
              onSetPkConfig={handleSetPkConfig}
              onStartPk={handleStartPk}
              onEndPk={handleEndPk}
              onJoinPkTeam={handleJoinPkTeam}
              onVotePkTeam={handleVotePkTeam}
            />
          )}

          {activeSection === 'chat' && (
            <ChatSection
              threads={chatThreads}
              coins={coins}
              gifts={allGifts}
              userProfile={userProfile}
              equippedBubbleColor={equippedBubbleColor}
              equippedBubbleId={equippedItems.bubble}
              onSelectThread={handleSelectChatThread}
              onSendChatMessage={handleSendChatMessage}
              onSendGift={handleSendGift}
              onJoinFriendVoiceRoom={handleJoinFriendVoiceRoom}
              onAddFriendByUid={handleAddFriendByUid}
            />
          )}

          {activeSection === 'discover' && (
            <DiscoverSection
              moments={moments}
              rooms={rooms}
              ownedItemIds={ownedItemIds}
              onToggleLikeMoment={handleToggleLikeMoment}
              onAddMoment={handleAddMoment}
              onInspectUser={(profile) => setInspectedUser(profile)}
              onProposeCp={handleProposeCp}
              onOpenRingShop={() => {
                setMeDefaultTab('shop');
                setActiveSection('me');
              }}
              onJoinRoom={(roomId) => {
                if (handleSelectRoom(roomId)) {
                  setActiveSection('rooms');
                }
              }}
              onClaimGiftPack={() => {
                setCoins((prev) => prev + 1_500);
                soundFx.playVictory();
              }}
            />
          )}

          {activeSection === 'me' && (
            <MeProfileShop
              key={`me-${meDefaultTab}`}
              userProfile={userProfile}
              coins={coins}
              charm={charm}
              vipGrowth={vipGrowth}
              vipLevel={effectiveVipLevel}
              vipLabel={vipLabel}
              ownedItemIds={ownedItemIds}
              equippedItems={equippedItems}
              moments={moments}
              rooms={rooms}
              friends={friends}
              cpRequests={cpRequests}
              customGifts={customGifts}
              receivedGiftIds={receivedGiftIds}
              customQrUrl={customQrUrl}
              defaultTab={meDefaultTab}
              giftAnimationsEnabled={giftAnimationsEnabled}
              onToggleGiftAnimations={() => setGiftAnimationsEnabled((v) => !v)}
              onUpdateProfile={handleUpdateProfile}
              onBuyCoins={handleBuyCoins}
              onBuyVip={handleBuyVip}
              onBuyShopItem={handleBuyShopItem}
              onEquipShopItem={handleEquipShopItem}
              onUploadQrCode={(dataUrl) => {
                setCustomQrUrl(dataUrl);
                soundFx.playVictory();
              }}
              onJoinRoom={(roomId) => {
                if (handleSelectRoom(roomId)) {
                  setActiveSection('rooms');
                }
              }}
              onProposeCp={handleProposeCp}
              onRespondCpRequest={handleRespondCpRequest}
              onBreakCp={handleBreakCp}
              onSubmitCustomGift={handleSubmitCustomGift}
              onReviewCustomGift={handleReviewCustomGift}
              onInspectUser={(profile) => setInspectedUser(profile)}
            />
          )}
        </main>
      </div>

      {/* Floating Minimized Voice Room Pill (matches IMG_20261119_000851) */}
      {activeRoom && activeSection !== 'rooms' && (
        <div className="fixed bottom-[76px] left-1/2 z-40 -translate-x-1/2">
          <div
            onClick={() => setActiveSection('rooms')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveSection('rooms');
              }
            }}
            className="flex cursor-pointer items-center gap-2.5 rounded-full border border-cyan-400/30 bg-[#0D1526]/95 py-1.5 pr-1.5 pl-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.75)] backdrop-blur-md transition hover:border-cyan-400/60"
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
            <Headphones className="h-4 w-4 shrink-0 text-cyan-300" />
            <span className="max-w-[170px] truncate text-xs font-extrabold tracking-wide text-white uppercase">
              {activeRoom.title}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleExitRoom();
              }}
              aria-label="Exit Voice Room"
              title="Exit Voice Room"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:border-rose-400/50 hover:bg-rose-500/25 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {!(activeSection === 'rooms' && activeRoom) && (
        <BottomNav
          activeSection={activeSection}
          unreadChats={unreadChats}
          onNavigate={(section) => {
            if (section === 'me') setMeDefaultTab('profile');
            if (section === 'rooms' && activeSection === 'rooms') {
              handleExitRoom();
            }
            setActiveSection(section);
          }}
        />
      )}

      <GiftStageCanvas
        activeEvent={giftAnimationsEnabled ? activeGiftEvent : null}
        supportRingEvent={giftAnimationsEnabled ? supportRingEvent : null}
      />

      <UserProfileModal
        key={inspectedUser?.avatar.uid ?? 'none'}
        profile={inspectedUser}
        currentUserUid={userProfile.uid}
        ownedItemIds={ownedItemIds}
        onOpenRingShop={() => {
          setMeDefaultTab('shop');
          setActiveSection('me');
        }}
        onClose={() => setInspectedUser(null)}
        onInspectUser={(profile) => setInspectedUser(profile)}
        onJoinRoom={(roomId) => {
          if (handleSelectRoom(roomId)) {
            setActiveSection('rooms');
          }
        }}
        onAddFriend={(uid) => handleAddFriendByUid(uid)}
        onMessageUser={handleMessageUser}
        onSupportUser={handleSupportUser}
        onProposeCp={handleProposeCp}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        coins={coins}
        hasCreatedRoom={hasCreatedRoom}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      {/* 4-Digit Room Passcode Unlock Modal */}
      {pendingLockedRoomId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setPendingLockedRoomId(null)}
        >
          <form
            onSubmit={handleUnlockRoomSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-3xl border border-amber-400/35 bg-[#0D1526] p-5 text-slate-100 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-white">Room Locked</h4>
                  <p className="text-[11px] text-slate-400">
                    Enter 4-digit passcode to enter
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingLockedRoomId(null)}
                aria-label="Close unlock prompt"
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={pinEntry}
              onChange={(e) => {
                setPinEntry(e.target.value.replace(/\D/g, '').slice(0, 4));
                setPinError('');
              }}
              placeholder="••••"
              className="mt-4 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-center font-mono-tabular text-lg font-bold tracking-[0.5em] text-amber-300 outline-none focus:border-amber-400"
            />

            {pinError && <p className="mt-2 text-center text-[11px] text-rose-400">{pinError}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPendingLockedRoomId(null)}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pinEntry.length !== 4}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-xs font-extrabold text-slate-950 disabled:opacity-40"
              >
                Unlock Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
