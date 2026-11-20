import React, { useState } from 'react';
import {
  Camera,
  ChevronRight,
  Gift,
  Heart,
  Image,
  MapPin,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Sparkles,
  Upload,
  Users,
  Video,
} from 'lucide-react';
import { AVATAR_ROSTER, SHOP_ITEMS, getVipNameStyle } from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import { RingSpriteArt, VipBadgeArt } from '../graphics/SpriteArtwork';
import type { MomentPost, PublicUserProfile, VoiceRoom } from '../types';

type DiscoverHubTab = 'moments' | 'church' | 'nearby';

interface DiscoverSectionProps {
  moments: MomentPost[];
  rooms?: VoiceRoom[];
  ownedItemIds?: string[];
  onToggleLikeMoment: (momentId: string) => void;
  onAddMoment: (caption: string, mediaType: 'photo' | 'video', mediaUrl?: string) => void;
  onInspectUser: (profile: PublicUserProfile) => void;
  onJoinRoom?: (roomId: string) => void;
  onClaimGiftPack?: () => void;
  onProposeCp?: (
    toUid: string,
    toName: string,
    toAvatarId: string,
    ringNumber: number,
    ringName: string
  ) => void;
  onOpenRingShop?: () => void;
}

export const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  moments,
  rooms = [],
  ownedItemIds = [],
  onToggleLikeMoment,
  onAddMoment,
  onInspectUser,
  onJoinRoom,
  onClaimGiftPack,
  onProposeCp,
  onOpenRingShop,
}) => {
  const ownedRings = SHOP_ITEMS.filter(
    (i) => i.category === 'ring' && ownedItemIds.includes(i.id)
  );
  const [activeTab, setActiveTab] = useState<DiscoverHubTab>('moments');
  const [showComposer, setShowComposer] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [playingMomentId, setPlayingMomentId] = useState<string | null>(null);
  const [followedUids, setFollowedUids] = useState<string[]>([]);
  const [pledgedCouple, setPledgedCouple] = useState<string | null>(null);
  const [giftPackClaimed, setGiftPackClaimed] = useState(false);

  const latestAuthor = AVATAR_ROSTER.find((a) => a.id === moments[0]?.avatarId) ?? AVATAR_ROSTER[0];

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'photo');
    setUploadedFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setUploadedMediaUrl(objectUrl);
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionInput.trim() && !uploadedMediaUrl) return;
    onAddMoment(
      captionInput.trim() ||
        (mediaType === 'video' ? 'Shared a video moment' : 'Shared a photo moment'),
      mediaType,
      uploadedMediaUrl
    );
    setCaptionInput('');
    setUploadedMediaUrl(undefined);
    setUploadedFileName('');
    setShowComposer(false);
    setActiveTab('moments');
  };

  const toggleFollow = (uid: string) => {
    setFollowedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="relative mx-auto max-w-2xl space-y-4 pb-10">
      {/* Header matching Discover screenshot */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-white">Discover</h1>
        <button
          type="button"
          onClick={() => {
            setActiveTab('moments');
            setShowComposer((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Post Moment
        </button>
      </div>

      {/* Moments Top Row Card */}
      <button
        type="button"
        onClick={() => setActiveTab('moments')}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
          activeTab === 'moments'
            ? 'border-cyan-400/50 bg-[#132038] shadow-lg shadow-cyan-500/10'
            : 'border-white/10 bg-[#0D1526] hover:border-cyan-400/35'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Colorful Moments Swirl Emblem */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full p-1 shadow-inner"
            style={{
              background:
                'conic-gradient(from 45deg, #38BDF8, #34D399, #FACC15, #F43F5E, #22D3EE, #38BDF8)',
            }}
          >
            <div className="h-3.5 w-3.5 rounded-full bg-[#0D1526]" />
          </div>
          <span className="font-display text-base font-bold text-white">Moments</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <AvatarArt avatar={latestAuthor} size={30} />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0D1526] bg-rose-500" />
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </button>

      {/* 2 Shortcut Cards: Church | Nearby */}
      <div className="grid grid-cols-2 gap-3">
        {/* Church */}
        <button
          type="button"
          onClick={() => setActiveTab('church')}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all ${
            activeTab === 'church'
              ? 'border-rose-400/60 bg-rose-500/15 shadow-lg shadow-rose-500/15'
              : 'border-white/10 bg-[#0D1526] hover:border-rose-400/35'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-rose-400/25 to-pink-500/35 text-rose-300 shadow-inner">
            <Heart className="h-6 w-6 fill-rose-400 text-rose-300" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Church</span>
        </button>

        {/* Nearby */}
        <button
          type="button"
          onClick={() => setActiveTab('nearby')}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 transition-all ${
            activeTab === 'nearby'
              ? 'border-emerald-400/60 bg-emerald-500/15 shadow-lg shadow-emerald-500/15'
              : 'border-white/10 bg-[#0D1526] hover:border-emerald-400/35'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400/25 to-teal-500/35 text-emerald-300 shadow-inner">
            <MapPin className="h-6 w-6 fill-emerald-400/30 text-emerald-300" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Nearby</span>
        </button>
      </div>

      {/* Floating Gift Pack Promo Pill (matching bottom-right Gift Pack 4d 3h widget in screenshot) */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={giftPackClaimed}
          onClick={() => {
            setGiftPackClaimed(true);
            onClaimGiftPack?.();
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-[#281C12] via-[#3A2714] to-[#281C12] px-3.5 py-2 text-xs shadow-lg shadow-amber-500/15 transition-transform hover:scale-105 disabled:opacity-60"
        >
          <Gift className="h-4 w-4 text-amber-300" />
          <span className="font-bold text-amber-200">
            {giftPackClaimed ? 'Gift Pack Claimed (+1,500)' : 'Gift Pack'}
          </span>
          <span className="rounded-full bg-black/50 px-2 py-0.5 font-mono-tabular text-[10px] font-bold text-white">
            4 d 3 h
          </span>
        </button>
      </div>

      {/* TAB 1: MOMENTS FEED */}
      {activeTab === 'moments' && (
        <div className="space-y-4">
          {showComposer && (
            <form
              onSubmit={handlePost}
              className="space-y-3 rounded-2xl border border-cyan-400/25 bg-[#0D1526] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-[#070B14] p-1">
                  <button
                    type="button"
                    onClick={() => setMediaType('photo')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      mediaType === 'photo' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <Image className="h-3.5 w-3.5" />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      mediaType === 'video' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </button>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadedFileName ? uploadedFileName : 'Upload Photo or Video'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedMediaUrl && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50 p-2">
                  {mediaType === 'video' ? (
                    <video
                      src={uploadedMediaUrl}
                      controls
                      className="max-h-56 w-full rounded-lg object-contain"
                    />
                  ) : (
                    <img
                      src={uploadedMediaUrl}
                      alt="Preview"
                      className="max-h-56 w-full rounded-lg object-cover"
                    />
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder={`Write a caption for your ${mediaType}...`}
                  className="min-w-[200px] flex-1 rounded-xl border border-white/15 bg-[#070B14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-300"
                >
                  Publish
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {moments.map((m, idx) => {
              const authorAv = AVATAR_ROSTER.find((a) => a.id === m.avatarId) ?? AVATAR_ROSTER[0];
              const authorVip = 4 + (idx % 5);
              const isFollowed = followedUids.includes(m.authorUid);
              const isPlaying = playingMomentId === m.id;
              return (
                <article
                  key={m.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#0D1526] p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-2 pb-3">
                    <button
                      type="button"
                      onClick={() =>
                        onInspectUser({
                          avatar: authorAv,
                          vipLevel: authorVip,
                          charm: 120_000,
                          ringNumber: 3,
                        })
                      }
                      className="flex items-center gap-2.5 text-left"
                    >
                      <AvatarArt avatar={authorAv} size={38} />
                      <div>
                        <div
                          className="text-sm font-bold"
                          style={getVipNameStyle(authorVip)}
                        >
                          {m.authorName}
                        </div>
                        <div className="font-mono-tabular text-[11px] text-slate-400">
                          {m.timestamp}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFollow(m.authorUid)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                        isFollowed
                          ? 'border border-white/15 bg-white/5 text-slate-300'
                          : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  {m.mediaUrl ? (
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                      {m.mediaType === 'video' ? (
                        <video
                          src={m.mediaUrl}
                          controls
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <img
                          src={m.mediaUrl}
                          alt={m.caption}
                          className="h-48 w-full object-cover"
                        />
                      )}
                      <div className="bg-black/70 px-3 py-2 text-xs text-slate-200">{m.caption}</div>
                    </div>
                  ) : (
                    <div
                      className="relative flex h-40 flex-col items-center justify-center rounded-2xl px-5 text-center"
                      style={{ background: m.mediaGradient }}
                    >
                      <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {m.mediaType === 'video' ? (
                          <Video className="h-3 w-3 text-cyan-300" />
                        ) : (
                          <Camera className="h-3 w-3 text-amber-300" />
                        )}
                        <span>{m.mediaType === 'video' ? 'Video' : 'Photo'}</span>
                      </div>
                      {m.mediaType === 'video' ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white">
                          <Play className="ml-0.5 h-4 w-4" />
                        </div>
                      ) : (
                        <Sparkles className="h-6 w-6 text-amber-300" />
                      )}
                      <div className="font-display mt-1.5 text-base font-bold text-white">
                        {m.mediaTitle}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-200">{m.caption}</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onToggleLikeMoment(m.id)}
                        className={`inline-flex items-center gap-1.5 font-semibold ${
                          m.liked ? 'text-pink-400' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Heart className="h-4 w-4" />
                        <span className="font-mono-tabular">{m.likes}</span>
                      </button>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-mono-tabular">{Math.max(1, m.likes % 7)}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlayingMomentId(isPlaying ? null : m.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#132038] px-2.5 py-1 text-[11px] text-cyan-300 hover:text-white"
                    >
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CHURCH (CP Ceremony & Couple Rings) */}
      {activeTab === 'church' && (
        <section className="space-y-4 rounded-3xl border border-rose-400/25 bg-[#0D1526] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Church · CP Sanctuary</h2>
              <p className="text-xs text-slate-400">
                Purchase a ring in the Shop first, then send a CP proposal in OG VELOCITY rooms
              </p>
            </div>
            <RingSpriteArt ringNumber={ownedRings[0]?.ringNumber ?? 3} size={46} alt="Church CP Ring" />
          </div>

          {ownedRings.length === 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-400/35 bg-amber-500/15 px-4 py-3 text-xs text-amber-200">
              <span>You must purchase a Ring first before sending a CP request.</span>
              {onOpenRingShop && (
                <button
                  type="button"
                  onClick={onOpenRingShop}
                  className="rounded-xl bg-amber-400 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-amber-300"
                >
                  Open Ring Shop
                </button>
              )}
            </div>
          )}

          {pledgedCouple && (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-xs font-semibold text-rose-200">
              Sent CP Ring request ({ownedRings[0]?.name || 'Purchased Ring'}) to {pledgedCouple}! Waiting for acceptance.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AVATAR_ROSTER.slice(0, 4).map((av, idx) => (
              <div
                key={av.uid}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#132038] p-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    onInspectUser({
                      avatar: av,
                      vipLevel: 6 + idx,
                      charm: 420_000 - idx * 60_000,
                      ringNumber: idx + 1,
                    })
                  }
                  className="flex items-center gap-2.5 text-left"
                >
                  <AvatarArt avatar={av} size={40} />
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={getVipNameStyle(6 + idx)}
                    >
                      {av.name}
                    </div>
                    <div className="font-mono-tabular text-[10px] text-slate-400">
                      Intimacy Lv.{4 + idx}
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={ownedRings.length === 0}
                  onClick={() => {
                    const ring = ownedRings[0];
                    if (!ring) return;
                    onProposeCp?.(av.uid, av.name, av.id, ring.ringNumber ?? 1, ring.name);
                    setPledgedCouple(av.name);
                  }}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Pledge CP
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: NEARBY (Nearby Explorers & Live Rooms) */}
      {activeTab === 'nearby' && (
        <section className="space-y-4 rounded-3xl border border-emerald-400/25 bg-[#0D1526] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Nearby Explorers</h2>
              <p className="text-xs text-slate-400">Active voices &amp; rooms near your region</p>
            </div>
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AVATAR_ROSTER.map((av, idx) => {
              const distKm = (0.4 + idx * 1.1).toFixed(1);
              const matchedRoom = rooms[idx % Math.max(1, rooms.length)];
              return (
                <div
                  key={av.uid}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#132038] p-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onInspectUser({
                        avatar: av,
                        vipLevel: 4 + idx,
                        charm: 190_000 - idx * 20_000,
                        roomId: matchedRoom?.id,
                        roomTitle: matchedRoom?.title,
                      })
                    }
                    className="flex min-w-0 items-center gap-2.5 text-left"
                  >
                    <AvatarArt avatar={av} size={40} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className="truncate text-sm font-bold"
                          style={getVipNameStyle(4 + idx)}
                        >
                          {av.name}
                        </span>
                        <VipBadgeArt level={4 + idx} size={16} />
                      </div>
                      <div className="font-mono-tabular text-[11px] text-emerald-300">
                        {distKm} km away · Online
                      </div>
                    </div>
                  </button>
                  {matchedRoom && onJoinRoom && (
                    <button
                      type="button"
                      onClick={() => onJoinRoom(matchedRoom.id)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                    >
                      <Users className="h-3 w-3" />
                      Join
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
