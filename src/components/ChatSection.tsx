import React, { useState } from 'react';
import {
  ChevronLeft,
  Gift,
  ImagePlus,
  MessageCircle,
  Mic,
  Search,
  Send,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AVATAR_ROSTER, ROOM_EMOTES, USER_PROFILE, getVipNameStyle } from '../data/zayroData';
import { AvatarArt } from '../graphics/AvatarArt';
import { GiftArtwork } from '../graphics/GiftArtwork';
import {
  ChatFrameMessage,
  EmoteSpriteArt,
  VipBadgeArt,
  resolveChatFrameNumber,
} from '../graphics/SpriteArtwork';
import type { AvatarConfig, ChatThread, VirtualGift } from '../types';

interface ChatSectionProps {
  threads: ChatThread[];
  coins: number;
  gifts: VirtualGift[];
  userProfile?: AvatarConfig;
  equippedBubbleId?: string;
  equippedBubbleColor?: string;
  onSelectThread: (friendUid: string) => void;
  onSendChatMessage: (friendUid: string, text: string, imageUrl?: string) => void;
  onSendGift: (
    gift: VirtualGift,
    recipientName: string,
    quantity?: number,
    recipientUid?: string,
    customMessage?: string
  ) => void;
  onJoinFriendVoiceRoom: (roomUid: string) => void;
  onAddFriendByUid: (uid: string) => string;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  threads,
  coins,
  gifts,
  userProfile = USER_PROFILE,
  equippedBubbleId,
  equippedBubbleColor,
  onSelectThread,
  onSendChatMessage,
  onSendGift,
  onJoinFriendVoiceRoom,
  onAddFriendByUid,
}) => {
  const [showIdSearch, setShowIdSearch] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [idQuery, setIdQuery] = useState('');
  const [addUidInput, setAddUidInput] = useState('');
  const [addNotice, setAddNotice] = useState('');
  const [onlyInRoom, setOnlyInRoom] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string>(threads[0]?.friendUid || '');
  const [mobileConvoOpen, setMobileConvoOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [bigGiftMsg, setBigGiftMsg] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [liveReaction, setLiveReaction] = useState<{
    emoteNumber: number;
    label: string;
    motion: 'bounce' | 'sway' | 'shake' | 'pulse';
    key: number;
  } | null>(null);

  const selfChatFrameNum = resolveChatFrameNumber(equippedBubbleId);

  const visibleThreads = threads.filter((t) => {
    const matchesQuery =
      !idQuery.trim() ||
      t.friendUid.toLowerCase().includes(idQuery.trim().toLowerCase()) ||
      t.friendName.toLowerCase().includes(idQuery.trim().toLowerCase());
    const matchesInRoom = !onlyInRoom || (t.status === 'In Voice Room' && !!t.voiceRoomUid);
    return matchesQuery && matchesInRoom;
  });

  const activeThread =
    visibleThreads.find((t) => t.friendUid === selectedUid) ?? visibleThreads[0] ?? threads[0];
  const quickGifts = gifts.slice(0, 4);

  const handleSelect = (uid: string) => {
    setSelectedUid(uid);
    setMobileConvoOpen(true);
    onSelectThread(uid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeThread) return;
    onSendChatMessage(activeThread.friendUid, draft.trim());
    setDraft('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeThread) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSendChatMessage(activeThread.friendUid, draft.trim() || 'Sent a photo', reader.result);
        setDraft('');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUidInput.trim()) return;
    setAddNotice(onAddFriendByUid(addUidInput.trim()));
    setAddUidInput('');
  };

  return (
    <div className="space-y-4">
      {/* Chats Header Bar matching Screenshot 2 */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Chats</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddFriend((v) => !v)}
            title="Add Friend by UID"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              showAddFriend
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                : 'border-white/10 bg-[#132038] text-slate-200 hover:bg-[#192946]'
            }`}
          >
            <UserPlus className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowIdSearch((v) => !v)}
            title="Search by User ID"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              showIdSearch
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                : 'border-white/10 bg-[#132038] text-slate-200 hover:bg-[#192946]'
            }`}
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => setOnlyInRoom((v) => !v)}
            title="Filter Friends in Voice Rooms"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              onlyInRoom
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                : 'border-white/10 bg-[#132038] text-slate-200 hover:bg-[#192946]'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Top User ID Search Bar */}
      {showIdSearch && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={idQuery}
            onChange={(e) => setIdQuery(e.target.value)}
            placeholder="Search friend by User ID (e.g. ZAY-102941) or name..."
            className="w-full rounded-2xl border border-white/10 bg-[#0D1526] py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      )}

      {/* Optional Add Friend Inline Bar */}
      {showAddFriend && (
        <form
          onSubmit={handleAddFriend}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-400/25 bg-[#0D1526] p-3"
        >
          <input
            type="text"
            value={addUidInput}
            onChange={(e) => setAddUidInput(e.target.value)}
            placeholder="Enter OG VELOCITY UID (e.g. ZAY-551923)..."
            className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-300"
          >
            Add Friend
          </button>
          {addNotice && <span className="w-full text-xs text-emerald-300">{addNotice}</span>}
        </form>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Chat List */}
        <aside
          className={`space-y-2.5 lg:col-span-5 ${mobileConvoOpen ? 'hidden lg:block' : 'block'}`}
        >
          {/* System / Admin Notice Row */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#0D1526] p-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#192946] text-xs font-bold text-cyan-200">
                AD
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white">Admin</div>
                <p className="truncate text-xs text-slate-400">
                  OG VELOCITY Voice Rooms Lv.1–20 EXP &amp; Charm Badges live now.
                </p>
              </div>
            </div>
            <span className="shrink-0 font-mono-tabular text-[10px] text-slate-500">09:55 AM</span>
          </div>

          {/* Friend Chat Rows */}
          {visibleThreads.map((thread, idx) => {
            const avatar =
              AVATAR_ROSTER.find((a) => a.id === thread.avatarId) ?? AVATAR_ROSTER[0];
            const isSelected = activeThread?.friendUid === thread.friendUid;
            const lastMsg = thread.messages[thread.messages.length - 1];
            const inRoom = thread.status === 'In Voice Room' && thread.voiceRoomUid;
            const friendVip = 5 + (idx % 4);

            return (
              <div
                key={thread.friendUid}
                onClick={() => handleSelect(thread.friendUid)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(thread.friendUid);
                  }
                }}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-400/50 bg-[#132038]'
                    : 'border-white/5 bg-[#0D1526] hover:border-white/20'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <AvatarArt avatar={avatar} size={44} />
                    {inRoom && (
                      <span className="absolute right-2 bottom-2 h-3 w-3 rounded-full border-2 border-[#0D1526] bg-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="truncate text-sm font-bold"
                        style={getVipNameStyle(friendVip)}
                      >
                        {thread.friendName}
                      </span>
                      <VipBadgeArt level={friendVip} size={22} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {inRoom
                        ? 'Room invite'
                        : lastMsg?.imageUrl
                          ? `📷 ${lastMsg.text || 'Photo'}`
                          : lastMsg
                            ? lastMsg.text
                            : 'Tap to message'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="font-mono-tabular text-[10px] text-slate-500">
                    {lastMsg?.timestamp || 'Yesterday'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {thread.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 font-mono-tabular text-[10px] font-bold text-white">
                        {thread.unread}
                      </span>
                    )}
                    {inRoom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJoinFriendVoiceRoom(thread.voiceRoomUid!);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/30"
                      >
                        <Mic className="h-2.5 w-2.5" />
                        In Voice Room
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Active Conversation Panel */}
        <section
          className={`flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0D1526] p-5 lg:col-span-7 ${
            mobileConvoOpen ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {activeThread ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMobileConvoOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-200 lg:hidden"
                    aria-label="Back to chat list"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-white">
                        {activeThread.friendName}
                      </h2>
                      {activeThread.status === 'In Voice Room' && activeThread.voiceRoomTitle && (
                        <span className="text-[11px] font-semibold text-emerald-400">
                          · In {activeThread.voiceRoomTitle}
                        </span>
                      )}
                    </div>
                    <p className="font-mono-tabular text-xs text-slate-400">
                      UID: {activeThread.friendUid}
                    </p>
                  </div>
                </div>

                {activeThread.voiceRoomUid && (
                  <button
                    type="button"
                    onClick={() => onJoinFriendVoiceRoom(activeThread.voiceRoomUid!)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Join Voice Room ({activeThread.voiceRoomUid})
                  </button>
                )}
              </div>

              <div className="zayro-scroll relative my-4 max-h-[340px] min-h-[240px] flex-1 space-y-3 overflow-y-auto pr-1">
                {liveReaction && (
                  <div
                    key={liveReaction.key}
                    className="pointer-events-none sticky top-2 z-20 mx-auto flex w-fit items-center gap-2 rounded-full border border-cyan-400/40 bg-[#070B14]/90 px-3 py-1.5 shadow-[0_0_24px_rgba(34,211,238,0.4)] backdrop-blur-md"
                  >
                    <EmoteSpriteArt
                      emoteNumber={liveReaction.emoteNumber}
                      size={32}
                      alt={liveReaction.label}
                      animated
                      motion={liveReaction.motion}
                    />
                    <span className="text-xs font-extrabold text-cyan-200">
                      Live Reaction: {liveReaction.label}
                    </span>
                  </div>
                )}
                {activeThread.messages.map((msg) => {
                  const emoteMatch = /^\[EMOTE:(\d+):([^\]]+)\]$/.exec(msg.text || '');
                  const matchedEmote = emoteMatch
                    ? ROOM_EMOTES.find((e) => e.emoteNumber === Number(emoteMatch[1]))
                    : undefined;
                  const friendAv =
                    AVATAR_ROSTER.find((a) => a.uid === activeThread.friendUid) ?? AVATAR_ROSTER[0];
                  const msgAvatar = msg.isSelf ? userProfile : friendAv;
                  const useChatFrame = msg.isSelf && !!selfChatFrameNum && !msg.imageUrl && !matchedEmote;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      {matchedEmote ? (
                        <div className="flex flex-col items-center gap-1 rounded-2xl border border-cyan-400/30 bg-[#132038]/85 px-4 py-2.5 shadow-lg">
                          <EmoteSpriteArt
                            emoteNumber={matchedEmote.emoteNumber}
                            size={52}
                            alt={matchedEmote.label}
                            animated
                            motion={matchedEmote.motion}
                          />
                          <span className="font-mono-tabular text-[10px] text-cyan-200">
                            {matchedEmote.label} · {msg.timestamp}
                          </span>
                        </div>
                      ) : useChatFrame && selfChatFrameNum ? (
                        <ChatFrameMessage
                          frameNumber={selfChatFrameNum}
                          avatarNode={<AvatarArt avatar={msgAvatar} size={34} />}
                        >
                          {msg.text && <p className="text-xs font-bold leading-snug">{msg.text}</p>}
                          <div className="mt-0.5 text-right font-mono-tabular text-[9px] opacity-75">
                            {msg.timestamp}
                          </div>
                        </ChatFrameMessage>
                      ) : (
                        <div
                          style={
                            msg.isSelf && (msg.bubbleColor || equippedBubbleColor)
                              ? {
                                  borderColor: msg.bubbleColor || equippedBubbleColor,
                                  backgroundColor: `${msg.bubbleColor || equippedBubbleColor}22`,
                                }
                              : undefined
                          }
                          className={`max-w-[78%] rounded-2xl border px-4 py-2.5 text-sm ${
                            msg.isSelf
                              ? 'border-cyan-400/35 bg-cyan-500/20 text-white'
                              : 'border-white/10 bg-[#070B14] text-slate-200'
                          }`}
                        >
                          {msg.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setLightboxImage(msg.imageUrl!)}
                              className="mb-1.5 block overflow-hidden rounded-xl border border-white/15"
                            >
                              <img
                                src={msg.imageUrl}
                                alt="Shared DM"
                                className="max-h-48 w-full object-cover transition-transform hover:scale-[1.02]"
                              />
                            </button>
                          )}
                          {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                          <div className="mt-1 text-right font-mono-tabular text-[10px] text-slate-400">
                            {msg.timestamp}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="zayro-scroll flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
                    {ROOM_EMOTES.map((em) => (
                      <button
                        key={em.id}
                        type="button"
                        onClick={() => {
                          onSendChatMessage(
                            activeThread.friendUid,
                            `[EMOTE:${em.emoteNumber}:${em.label}]`
                          );
                          setLiveReaction({
                            emoteNumber: em.emoteNumber,
                            label: em.label,
                            motion: em.motion,
                            key: Date.now(),
                          });
                        }}
                        title={`Send live ${em.label} reaction`}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-[#070B14] px-2 py-1 text-xs text-slate-200 transition-transform hover:scale-110 hover:border-cyan-400/50"
                      >
                        <EmoteSpriteArt
                          emoteNumber={em.emoteNumber}
                          size={22}
                          alt={em.label}
                          animated
                          motion={em.motion}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-300">
                      <Gift className="h-3.5 w-3.5" />
                      Gift:
                    </span>
                    <input
                      type="text"
                      maxLength={30}
                      value={bigGiftMsg}
                      onChange={(e) => setBigGiftMsg(e.target.value)}
                      placeholder="Big gift note (max 30)..."
                      className="w-36 rounded-lg border border-white/10 bg-[#070B14] px-2 py-1 text-[11px] text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none"
                    />
                    {quickGifts.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        disabled={coins < g.cost}
                        onClick={() => {
                          const msg = bigGiftMsg.trim().slice(0, 30);
                          onSendGift(g, activeThread.friendName, 1, activeThread.friendUid, msg || undefined);
                          onSendChatMessage(
                            activeThread.friendUid,
                            `Sent ${g.name} (${g.cost} Coins)${msg ? ` — "${msg}"` : ''} — +${g.charmValue} Charm!`
                          );
                          setBigGiftMsg('');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#070B14] px-2 py-1 text-[11px] text-slate-200 hover:border-cyan-400/50 disabled:opacity-40"
                      >
                        <GiftArtwork giftId={g.id} gift={g} size={18} />
                        <span>{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <label
                    title="Send Photo in DM"
                    aria-label="Send Photo in DM"
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-[#070B14] text-cyan-300 hover:border-cyan-400/60 hover:text-white"
                  >
                    <ImagePlus className="h-4.5 w-4.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${activeThread.friendName}...`}
                    className="flex-1 rounded-xl border border-white/10 bg-[#070B14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-300"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <MessageCircle className="h-8 w-8 text-cyan-300" />
              <p className="mt-2 text-sm">Select a friend from Chats to start messaging.</p>
              <Sparkles className="mt-1 h-4 w-4 text-slate-500" />
            </div>
          )}
        </section>
      </div>

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
