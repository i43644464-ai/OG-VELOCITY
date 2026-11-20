import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  Copy,
  Heart,
  Lock,
  MessageCircle,
  MoreVertical,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import {
  AVATAR_ROSTER,
  SHOP_ITEMS,
  getCharmLevelInfo,
  getCountryFlag,
  getCpLevelInfo,
  getGenderSymbol,
  getVipNameStyle,
} from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import {
  CharmBadgePill,
  RingSpriteArt,
  VipBadgeArt,
} from '../graphics/SpriteArtwork';
import type { AvatarConfig, PublicUserProfile } from '../types';

interface UserProfileModalProps {
  profile: PublicUserProfile | null;
  currentUserUid?: string;
  ownedItemIds?: string[];
  onOpenRingShop?: () => void;
  onClose: () => void;
  onInspectUser?: (profile: PublicUserProfile) => void;
  onJoinRoom?: (roomId: string) => void;
  onAddFriend?: (uid: string) => void;
  onMessageUser?: (uid: string, name: string) => void;
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
}

const RING_ITEMS = SHOP_ITEMS.filter((i) => i.category === 'ring');

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  currentUserUid,
  ownedItemIds = [],
  onOpenRingShop,
  onClose,
  onInspectUser,
  onJoinRoom,
  onAddFriend,
  onMessageUser,
  onSupportUser,
  onProposeCp,
}) => {
  const [showCpPartnerId, setShowCpPartnerId] = useState(false);
  const [showRingPicker, setShowRingPicker] = useState(false);
  const ownedRingItems = RING_ITEMS.filter((r) => ownedItemIds.includes(r.id));
  const [selectedRingNumber, setSelectedRingNumber] = useState<number>(
    ownedRingItems[0]?.ringNumber ?? 1
  );
  const [proposalSentNotice, setProposalSentNotice] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  if (!profile) return null;

  const { avatar, vipLevel, charm, ringNumber = 1, roomId, roomTitle, roomLocked } = profile;
  const activeCp = profile.cpPartner ?? avatar.cpPartner ?? null;
  const isSelf = currentUserUid && avatar.uid === currentUserUid;
  const charmLevel = getCharmLevelInfo(charm).current.level;
  const blessingScore = profile.blessing ?? avatar.blessing ?? Math.max(120, Math.round(charm / 40));
  const cpCharm = activeCp?.cpCharm ?? 0;
  const cpLevelInfo = getCpLevelInfo(cpCharm);
  const cpPartnerAvatar = activeCp
    ? AVATAR_ROSTER.find(
        (a) => a.uid === activeCp.partnerUid || a.id === activeCp.partnerAvatarId
      ) ?? avatar
    : avatar;

  const formattedCharm =
    charm >= 1_000_000
      ? `${(charm / 1_000_000).toFixed(1)}M`
      : charm >= 1_000
        ? `${(charm / 1_000).toFixed(1)}K`
        : String(charm);

  const sampleTags = profile.tags ?? [
    { title: 'Bro', level: 7, partnerName: 'Kabir', color: 'from-sky-400 to-blue-600' },
    { title: 'Ace', level: 5, partnerName: 'Soren', color: 'from-indigo-400 to-sky-600' },
  ];

  const pickedRingItem =
    ownedRingItems.find((r) => r.ringNumber === selectedRingNumber) ?? ownedRingItems[0];

  const handleCopyPartnerId = (uid: string) => {
    navigator.clipboard?.writeText(uid).catch(() => {});
    setCopiedId(true);
    window.setTimeout(() => setCopiedId(false), 1800);
  };

  const openCpPartnerProfile = () => {
    if (!activeCp || !onInspectUser) {
      setShowCpPartnerId((v) => !v);
      return;
    }
    const partnerBioAvatar: AvatarConfig = {
      ...cpPartnerAvatar,
      uid: activeCp.partnerUid,
      name: activeCp.partnerName,
      cpPartner: cpPartnerAvatar.cpPartner ?? {
        partnerUid: avatar.uid,
        partnerName: avatar.name,
        partnerAvatarId: avatar.id,
        ringNumber: activeCp.ringNumber,
        ringName: activeCp.ringName,
        since: activeCp.since,
        cpCharm: activeCp.cpCharm,
        cpLevel: activeCp.cpLevel,
      },
    };
    onInspectUser({
      avatar: partnerBioAvatar,
      vipLevel: 8,
      charm: Math.max(45_000, activeCp.cpCharm ?? 0),
      cpPartner: partnerBioAvatar.cpPartner,
      ringNumber: activeCp.ringNumber,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        className="zayro-scroll relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-cyan-400/20 bg-[#0D1526] shadow-2xl"
      >
        {/* Top Banner matching IMG_20261119_144826 */}
        <div
          className="relative h-48 w-full"
          style={
            avatar.coverUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(7,11,20,0.28), rgba(13,21,38,0.9)), url(${avatar.coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {
                  background:
                    'radial-gradient(circle at 50% 35%, rgba(6,182,212,0.24), transparent 55%), linear-gradient(180deg, #060D1A 0%, #0F233C 72%, #0D1526 100%)',
                }
          }
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/70"
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="pointer-events-none flex justify-center pt-2 font-display text-5xl font-black tracking-tight text-white/10">
            {avatar.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Right-aligned Frosted Pill: opens CP Partner Profile Page (never triggers blessing) */}
          <button
            type="button"
            onClick={() => {
              if (activeCp) {
                openCpPartnerProfile();
              } else {
                setShowCpPartnerId((v) => !v);
              }
            }}
            className="absolute right-3 bottom-3 flex items-center gap-2.5 rounded-full border border-rose-300/35 bg-gradient-to-r from-[#281529]/90 via-[#381C36]/90 to-[#162138]/90 py-1.5 pr-1.5 pl-2.5 shadow-[0_6px_22px_rgba(244,63,94,0.28)] backdrop-blur-md transition-transform hover:scale-[1.02]"
            title={activeCp ? `Open ${activeCp.partnerName}'s Profile` : 'Ring & Blessing'}
          >
            <RingSpriteArt
              ringNumber={activeCp?.ringNumber ?? ringNumber}
              size={44}
              alt="Equipped Ring"
            />
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-100">
                <Heart className="h-2.5 w-2.5 fill-white text-white" />
                <span>{activeCp ? 'CP Profile' : 'Blessing'}</span>
              </div>
              <div className="flex items-center gap-1 font-mono-tabular text-sm font-extrabold text-white">
                <span>{blessingScore.toLocaleString()}</span>
                <Heart className="h-2 w-2 fill-rose-200 text-rose-200" />
              </div>
            </div>
            <div className="overflow-hidden rounded-full border border-white/40">
              <AvatarArt avatar={cpPartnerAvatar} size={38} />
            </div>
          </button>
        </div>

        {/* Avatar + Name + Metadata */}
        <div className="px-5 pt-2 pb-24">
          <div className="flex items-end justify-between gap-3">
            <div className="relative -mt-12 inline-block">
              <div className="rounded-full border-2 border-cyan-300/35 bg-[#0D1526] p-0.5">
                <AvatarArt avatar={avatar} size={82} />
              </div>
              <span className="absolute right-2 bottom-2 h-3.5 w-3.5 rounded-full border-2 border-[#0D1526] bg-emerald-400" />
            </div>

            {!isSelf && onSupportUser && (
              <button
                type="button"
                onClick={() => {
                  const rNum = activeCp?.ringNumber ?? ringNumber;
                  const rName =
                    activeCp?.ringName ||
                    RING_ITEMS.find((r) => r.ringNumber === rNum)?.name ||
                    'Emerald Crown Ring';
                  onSupportUser(avatar.uid, avatar.name, rNum, rName);
                  setProposalSentNotice(`Sent Ring Support to ${avatar.name}!`);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-gradient-to-r from-pink-500/30 to-amber-500/30 px-3.5 py-1.5 text-xs font-extrabold text-amber-200 shadow-lg hover:from-pink-500/45 hover:to-amber-500/45"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Support Ring</span>
              </button>
            )}
          </div>

          {/* Name + VIP Badge beside name */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2
              className="font-display text-2xl font-black tracking-tight"
              style={getVipNameStyle(vipLevel)}
            >
              {avatar.name}
            </h2>
            <VipBadgeArt level={vipLevel} size={30} />
          </div>

          {/* Compact Metadata Row matching reference: ♂️ 25  🇮🇳 India • Online/Offline */}
          <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-1 text-sky-300">
              <span>{getGenderSymbol(avatar.gender)}</span>
              <span className="font-mono-tabular text-slate-200">{avatar.age ?? 25}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-200">
              <span>{getCountryFlag(avatar.country)}</span>
              <span>{avatar.country || 'India'}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <span className={`h-2 w-2 rounded-full ${roomId ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span className={roomId ? 'text-emerald-400' : 'text-slate-400'}>
                {roomId ? 'Online' : 'Offline'}
              </span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <CharmBadgePill level={charmLevel} charm={charm} />
            <button
              type="button"
              onClick={() => handleCopyPartnerId(avatar.uid)}
              className="inline-flex items-center gap-1 font-mono-tabular text-xs text-slate-400 hover:text-white"
            >
              <span>ID: {avatar.uid}</span>
              <Copy className="h-3 w-3" />
            </button>
            {activeCp && (
              <button
                type="button"
                onClick={() => setShowCpPartnerId((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full border border-pink-400/50 bg-pink-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-pink-200 hover:bg-pink-500/30"
                title="Click CP to view Partner ID & CP Level"
              >
                <Heart className="h-3 w-3 fill-pink-400 text-pink-400" />
                <span>
                  CP Lv.{cpLevelInfo.level} · {activeCp.partnerName}
                </span>
              </button>
            )}
          </div>

          {/* Revealed CP Partner ID & Open Profile Panel */}
          {activeCp && showCpPartnerId && (
            <div className="mt-2.5 space-y-2 rounded-2xl border border-rose-400/40 bg-gradient-to-r from-[#241328]/85 to-[#10213A]/85 px-3.5 py-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <RingSpriteArt ringNumber={activeCp.ringNumber} size={34} alt={activeCp.ringName} />
                  <div>
                    <div className="font-bold text-rose-200">
                      CP Lv.{cpLevelInfo.level} ({cpLevelInfo.title}) · {activeCp.partnerName}
                    </div>
                    <div className="font-mono-tabular text-[11px] font-bold text-white">
                      Partner ID: {activeCp.partnerUid}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={openCpPartnerProfile}
                    className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/25 px-2.5 py-1.5 text-[11px] font-bold text-cyan-100 hover:bg-cyan-500/40"
                  >
                    <span>Open Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPartnerId(activeCp.partnerUid)}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-500/25 px-2.5 py-1.5 text-[11px] font-bold text-rose-100 hover:bg-rose-500/40"
                  >
                    {copiedId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono-tabular text-[10px] text-rose-200">
                  <span>{cpCharm.toLocaleString()} CP Charms</span>
                  <span>
                    {cpLevelInfo.nextMin !== null
                      ? `Need ${cpLevelInfo.stepRemaining.toLocaleString()} for Lv.${cpLevelInfo.level + 1}`
                      : 'Max CP Level'}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-300"
                    style={{ width: `${cpLevelInfo.percent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <p className="mt-2.5 text-xs text-slate-300">
            {avatar.bio || 'Voice Sanctuary Explorer · Badge Collector'}
          </p>

          {proposalSentNotice && (
            <div className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200">
              {proposalSentNotice}
            </div>
          )}

          {/* Ring CP Proposal Drawer (Purchased Rings Only) */}
          {!isSelf && showRingPicker && (
            <div className="mt-3 space-y-2.5 rounded-2xl border border-cyan-400/35 bg-[#132038] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-200">
                  Send Ring Proposal to {avatar.name}
                </span>
                <button
                  type="button"
                  onClick={() => setShowRingPicker(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {ownedRingItems.length === 0 ? (
                <div className="space-y-2.5 rounded-xl border border-rose-400/30 bg-[#0A101D] p-3 text-center">
                  <p className="text-xs font-medium text-slate-300">
                    To grant CP, purchase a ring in the Shop first. Only rings you have purchased can be gifted.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRingPicker(false);
                      onOpenRingShop?.();
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-extrabold text-slate-950 shadow hover:brightness-105"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Purchase Ring in Shop</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ownedRingItems.map((ring) => {
                      const rNum = ring.ringNumber ?? 1;
                      const active = (pickedRingItem?.ringNumber ?? rNum) === rNum;
                      return (
                        <button
                          key={ring.id}
                          type="button"
                          onClick={() => setSelectedRingNumber(rNum)}
                          title={`${ring.name} (Owned)`}
                          className={`flex flex-col items-center rounded-xl border p-1.5 transition-all ${
                            active
                              ? 'border-rose-400 bg-rose-500/25 ring-1 ring-rose-400'
                              : 'border-white/10 bg-[#0A101D] hover:border-cyan-400/40'
                          }`}
                        >
                          <RingSpriteArt ringNumber={rNum} size={32} alt={ring.name} />
                          <span className="mt-0.5 font-mono-tabular text-[9px] text-slate-300">
                            #{rNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={!pickedRingItem}
                    onClick={() => {
                      if (!pickedRingItem) return;
                      const rNum = pickedRingItem.ringNumber ?? 1;
                      onProposeCp?.(
                        avatar.uid,
                        avatar.name,
                        avatar.id,
                        rNum,
                        pickedRingItem.name
                      );
                      setProposalSentNotice(
                        `CP proposal with ${pickedRingItem.name} sent to ${avatar.name}! Once accepted, CP status will link your profiles.`
                      );
                      setShowRingPicker(false);
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2 text-xs font-extrabold text-white shadow-md hover:opacity-95 disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Send {pickedRingItem?.name || 'Ring'} Proposal</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* LIVE NOW Voice Room Card */}
          {roomTitle && roomId && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/25 px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                    <span>LIVE NOW</span>
                    {roomLocked && <Lock className="h-3 w-3 text-slate-300" />}
                  </div>
                  <div className="truncate text-xs font-bold text-white">{roomTitle}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onJoinRoom?.(roomId);
                  onClose();
                }}
                className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                JOIN
              </button>
            </div>
          )}

          {/* 4-Column Stat Strip */}
          <div className="mt-4 grid grid-cols-4 divide-x divide-white/10 rounded-2xl bg-[#132038] py-3.5 text-center">
            <div>
              <div className="font-mono-tabular text-base font-extrabold text-white">
                {profile.friendsCount ?? 63}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">FRIENDS</div>
            </div>
            <div>
              <div className="font-mono-tabular text-base font-extrabold text-white">
                {formattedCharm}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">CHARM</div>
            </div>
            <div>
              <div className="font-mono-tabular text-base font-extrabold text-white">
                {(profile.giftsReceived ?? 7486).toLocaleString()}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">GIFTS</div>
            </div>
            <div>
              <div className="font-mono-tabular text-base font-extrabold text-white">
                {profile.giftsGiven ? `${profile.giftsGiven}` : '18M'}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">GIVEN</div>
            </div>
          </div>

          {/* Relationship Tags Grid (including clickable CP partner profile card) */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">TAGS</span>
              <span className="text-slate-400">
                {sampleTags.length + (activeCp ? 1 : 0)} Active
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {activeCp && (
                <button
                  type="button"
                  onClick={openCpPartnerProfile}
                  className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-rose-500 to-amber-600 p-3 text-center text-white shadow-lg ring-1 ring-rose-300/40 transition-transform hover:scale-[1.02]"
                  title={`Open ${activeCp.partnerName}'s Profile (${activeCp.partnerUid})`}
                >
                  <span className="text-[10px] font-bold">CP · {activeCp.since}</span>
                  <div className="my-1.5 flex items-center justify-center">
                    <RingSpriteArt
                      ringNumber={activeCp.ringNumber}
                      size={38}
                      alt={activeCp.ringName}
                    />
                  </div>
                  <span className="truncate text-[11px] font-bold">{activeCp.partnerName}</span>
                  <span className="mt-0.5 font-mono-tabular text-[9px] text-rose-100">
                    {activeCp.partnerUid}
                  </span>
                </button>
              )}
              {sampleTags.map((tag) => (
                <div
                  key={`${tag.title}-${tag.partnerName}`}
                  className={`flex flex-col items-center rounded-2xl bg-gradient-to-b ${tag.color} p-3 text-center text-white shadow-lg`}
                >
                  <span className="text-[10px] font-bold">
                    {tag.title} · LV{tag.level}
                  </span>
                  <div className="my-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                    {tag.partnerName.slice(0, 1)}
                  </div>
                  <span className="truncate text-[11px] font-semibold">{tag.partnerName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar: Add friend, Propose CP, Message */}
        <div
          className={`sticky right-0 bottom-0 left-0 grid gap-2 border-t border-white/10 bg-[#0A101D]/95 px-4 py-3.5 backdrop-blur-md ${
            !isSelf && onProposeCp ? 'grid-cols-3' : 'grid-cols-2'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onAddFriend?.(avatar.uid);
              onClose();
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-[#132038] px-2 text-xs font-bold text-white hover:bg-[#192946]"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>Add friend</span>
          </button>
          {!isSelf && onProposeCp && (
            <button
              type="button"
              onClick={() => setShowRingPicker((v) => !v)}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-rose-400/45 bg-rose-500/20 px-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30"
            >
              <Heart className="h-4 w-4 shrink-0 fill-rose-400 text-rose-400" />
              <span>Propose CP</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onMessageUser?.(avatar.uid, avatar.name);
              onClose();
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 px-2 text-xs font-extrabold text-slate-950 hover:opacity-95"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};
