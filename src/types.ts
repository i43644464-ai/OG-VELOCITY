export type NavSection = 'home' | 'rooms' | 'chat' | 'discover' | 'me';

export type GiftId = string;

export type AuthProvider = 'gmail' | 'phone' | 'facebook';

export type ShopCategory = 'ring' | 'bubble' | 'frame' | 'entry' | 'seat-fx' | 'room-theme';

export type BondTagId = 'brother' | 'sister' | 'bestie' | 'ace';

export interface BondTag {
  id: BondTagId;
  label: string;
  emoji: string;
  color: string;
  requiredGiftCost: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  priceCoins: number;
  previewColor: string;
  description: string;
  ringNumber?: number;
  seatFrameNumber?: number;
  chatFrameNumber?: number;
  styleVariant?: string;
}

export interface CharmLevelInfo {
  level: number;
  series: 'Star Series' | 'Diamond Series' | 'Normal Crown' | 'Advanced Crown' | 'Hard Crown';
  minCharm: number;
}

export interface VipTierInfo {
  level: number;
  minGrowth: number;
  title: string;
  perk: string;
  giftReward?: string;
  frameUnlock?: string;
  accentColor: string;
}

export interface RoomLevelInfo {
  level: number;
  title: string;
  requiredExp: number;
  memberLimit: string;
  adminSlots: number;
}

export interface RoomBackgroundTheme {
  id: string;
  name: string;
  gradient: string;
  accent: string;
  ambiance: VoiceRoom['ambiance'];
}

export interface RoomTaskItem {
  id: string;
  title: string;
  rule: string;
  progress: number;
  target: number;
  rewardExp: number;
  vipDouble: boolean;
  claimed: boolean;
}

export interface MomentPost {
  id: string;
  authorUid: string;
  authorName: string;
  avatarId: string;
  mediaType: 'photo' | 'video';
  mediaUrl?: string;
  caption: string;
  mediaTitle: string;
  mediaGradient: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

export interface GuardLeader {
  rank: number;
  name: string;
  uid: string;
  avatarId: string;
  guardPoints: number;
  vipLevel: number;
}

export interface IntimateSpaceData {
  partnerName: string;
  partnerAvatarId: string;
  togetherDays: number;
  relationType: 'Couple' | 'BFF';
  level: number;
  progress: number;
  target: number;
  bffTokenName: string;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  isSelf: boolean;
  bubbleColor?: string;
  bubbleFrameNumber?: number;
}

export interface ChatThread {
  friendUid: string;
  friendName: string;
  avatarId: string;
  status: FriendRecord['status'];
  voiceRoomUid?: string;
  voiceRoomTitle?: string;
  unread: number;
  messages: ChatMessageItem[];
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins?: number;
  label: string;
  priceInr: number;
  highlight?: string;
}

export interface VipPlan {
  id: string;
  name: string;
  durationDays: number;
  priceInr: number;
  grantedVipLevel: number;
  perks: string[];
}

export interface DailyTaskItem {
  id: string;
  title: string;
  rewardCoins: number;
  progress: number;
  target: number;
  claimed: boolean;
}

export interface FriendRecord {
  uid: string;
  name: string;
  avatarId: string;
  status: 'Online' | 'In Voice Room' | 'In Chats';
  voiceRoomUid?: string;
  bondTag?: string;
}

export type EmoteMotion = 'bounce' | 'sway' | 'shake' | 'pulse';

export interface ActiveEmoteState {
  emoteNumber: number;
  label: string;
  motion: EmoteMotion;
  triggeredAt: number;
}

export interface CpPartnerInfo {
  partnerUid: string;
  partnerName: string;
  partnerAvatarId: string;
  ringNumber: number;
  ringName: string;
  since: string;
  cpCharm?: number;
  cpLevel?: number;
}

export interface CpRequest {
  id: string;
  fromUid: string;
  fromName: string;
  fromAvatarId: string;
  toUid: string;
  toName: string;
  toAvatarId: string;
  ringNumber: number;
  ringName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface AvatarConfig {
  id: string;
  uid: string;
  name: string;
  handle: string;
  bio?: string;
  photoUrl?: string;
  coverUrl?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  country?: string;
  blessing?: number;
  tags?: string[];
  email?: string;
  activeEmote?: ActiveEmoteState;
  cpPartner?: CpPartnerInfo | null;
  seatFrameNumber?: number;
  chatFrameNumber?: number;
  skinTone: string;
  hairColor: string;
  robeColor: string;
  accentColor: string;
  ornament: 'crown' | 'lotus' | 'halo' | 'visor' | 'crescent' | 'flame';
}

export interface VoiceSeat {
  seatIndex: number;
  occupant: AvatarConfig | null;
  role: 'owner' | 'admin' | 'speaker' | 'empty';
  isMuted: boolean;
  isLocked: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isUser?: boolean;
  giftScore: number;
  charmValue?: number;
  vipLevel?: number;
  bondTag?: string;
  seatEffect?: string;
  activeEmote?: ActiveEmoteState;
}

export interface RoomListener {
  uid: string;
  name: string;
  avatarId: string;
  vipLevel: number;
  charm: number;
  isMuted?: boolean;
}

export interface MicRequest {
  userId: string;
  name: string;
  requestedAt: string;
}

export interface RoomChatMessage {
  id: string;
  senderUid?: string;
  senderName: string;
  senderColor: string;
  bubbleColor?: string;
  bubbleFrameNumber?: number;
  text: string;
  imageUrl?: string;
  emoteNumber?: number;
  timestamp: string;
  kind: 'chat' | 'gift' | 'system' | 'emote' | 'tag';
}

export interface RoomPkState {
  active: boolean;
  mode: 'gifting' | 'voting';
  format: '1v1' | 'multiplayer';
  durationMinutes?: 5 | 15 | 30 | 45 | 60;
  running: boolean;
  secondsLeft: number;
  pinkScore: number;
  blueScore: number;
  pinkTeamUids: string[];
  blueTeamUids: string[];
  votedUids: string[];
}

export interface VoiceRoom {
  id: string;
  uid: string;
  title: string;
  topic: string;
  category: 'Popular' | 'Music' | 'Chats' | 'Teenagers';
  tags: string[];
  hostName: string;
  ownerUid: string;
  adminUids: string[];
  memberUids: string[];
  dpUrl?: string;
  isOfficial: boolean;
  isUserCreated?: boolean;
  isRoomLocked?: boolean;
  roomPasscode?: string;
  coinsSpentByUid?: Record<string, number>;
  pkState?: RoomPkState;
  roomType: 'voice' | 'youtube';
  level: number; // 1 to 20
  xp: number;
  listenerCount: number;
  ambiance: 'saffron' | 'emerald' | 'indigo' | 'crimson';
  bgThemeId?: string;
  bgUrl?: string;
  youtubeVideoId?: string;
  youtubeTitle?: string;
  youtubeQueue?: { title: string; videoId: string }[];
  seats: VoiceSeat[];
  listeners: RoomListener[];
  micRequests: MicRequest[];
  messages: RoomChatMessage[];
}

export interface VirtualGift {
  id: GiftId;
  name: string;
  cost: number;
  charmValue: number;
  randomCoinsMin: number;
  randomCoinsMax: number;
  rarity: 'Standard' | 'Signature' | 'Mythic';
  primaryColor: string;
  secondaryColor: string;
  description: string;
  particleStyle: 'lotus' | 'crown' | 'phoenix' | 'lantern' | 'rose' | 'meteor' | 'heart' | 'vehicle';
  giftNumber: number;
  customArtworkUrl?: string;
  customVideoUrl?: string;
  isCustomApproved?: boolean;
}

export interface CustomGiftSubmission {
  id: string;
  name: string;
  cost: number;
  charmValue: number;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  particleStyle: VirtualGift['particleStyle'];
  animationVideoUrl?: string;
  videoFileName?: string;
  artworkUrl?: string;
  creatorUid: string;
  creatorName: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  submittedAt: string;
}

export interface SupportRingEvent {
  eventId: string;
  senderName: string;
  recipientUid: string;
  recipientName: string;
  ringNumber: number;
  ringName: string;
  blessingAdded: number;
}

export interface ActiveGiftEvent {
  eventId: string;
  gift: VirtualGift;
  senderName: string;
  recipientName: string;
  charmEarned?: number;
  randomCoinsEarned?: number;
  customMessage?: string;
  isBigGift?: boolean;
}

export interface PublicUserProfile {
  avatar: AvatarConfig;
  vipLevel: number;
  charm: number;
  blessing?: number;
  ringNumber?: number;
  roomId?: string;
  roomTitle?: string;
  roomLocked?: boolean;
  friendsCount?: number;
  giftsReceived?: number;
  giftsGiven?: number;
  cpPartner?: CpPartnerInfo | null;
  activeEmote?: ActiveEmoteState;
  tags?: Array<{ title: string; level: number; partnerName: string; color: string }>;
}

