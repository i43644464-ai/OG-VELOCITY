import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ZayroCoinArt } from '../graphics/SpriteArtwork';
import type { VoiceRoom } from '../types';

interface CreateRoomModalProps {
  isOpen: boolean;
  coins: number;
  hasCreatedRoom: boolean;
  onClose: () => void;
  onCreateRoom: (data: {
    title: string;
    topic: string;
    category: VoiceRoom['category'];
    ambiance: VoiceRoom['ambiance'];
    roomType: VoiceRoom['roomType'];
  }) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  coins,
  hasCreatedRoom,
  onClose,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<VoiceRoom['category']>('Popular');
  const [ambiance, setAmbiance] = useState<VoiceRoom['ambiance']>('saffron');
  const [roomType, setRoomType] = useState<VoiceRoom['roomType']>('voice');

  if (!isOpen) return null;

  const canAfford = coins >= 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasCreatedRoom || !canAfford) return;
    onCreateRoom({
      title: title.trim() || 'OG VELOCITY Lounge',
      topic: topic.trim() || '10-Seat Voice Room · Music, Chat & Gifting',
      category,
      ambiance,
      roomType,
    });
    setTitle('');
    setTopic('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-room-heading"
        className="w-full max-w-md rounded-2xl border border-cyan-500/25 bg-[#0D1526] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 id="create-room-heading" className="font-display text-2xl font-bold text-white">
            Create a Voice Room
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {hasCreatedRoom ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-300">
              You have already created your personal Voice Room! Each user gets one permanent room
              UID.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 py-2.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-300"
            >
              Got It
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-amber-400/25 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-200">
              <span>One-time Room Creation Fee:</span>
              <span className="inline-flex items-center gap-1.5 font-mono-tabular font-bold">
                <ZayroCoinArt size={15} />
                500 Coins
              </span>
            </div>

            <div>
              <label htmlFor="room-title" className="block text-xs font-medium text-slate-300">
                Room Name
              </label>
              <input
                id="room-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sabir's Royal Lounge"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="room-topic" className="block text-xs font-medium text-slate-300">
                Room Topic
              </label>
              <input
                id="room-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Music, stories & late-night chat"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="room-type" className="block text-xs font-medium text-slate-300">
                  Room Type
                </label>
                <select
                  id="room-type"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as VoiceRoom['roomType'])}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="voice">Voice (10 Seats)</option>
                </select>
              </div>

              <div>
                <label htmlFor="room-category" className="block text-xs font-medium text-slate-300">
                  Category
                </label>
                <select
                  id="room-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VoiceRoom['category'])}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Popular">Popular</option>
                  <option value="Music">Music</option>
                  <option value="Chats">Chats</option>
                  <option value="Teenagers">Teenagers</option>
                </select>
              </div>

              <div>
                <label htmlFor="room-ambiance" className="block text-xs font-medium text-slate-300">
                  Ambiance
                </label>
                <select
                  id="room-ambiance"
                  value={ambiance}
                  onChange={(e) => setAmbiance(e.target.value as VoiceRoom['ambiance'])}
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-2.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="saffron">Saffron</option>
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Emerald</option>
                  <option value="crimson">Crimson</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-[#132038] px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canAfford}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-2 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-40"
              >
                Create Room (500 Coins)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
