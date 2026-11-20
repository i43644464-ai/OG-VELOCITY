import React from 'react';
import { Compass, DoorOpen, Home, MessageCircle, User } from 'lucide-react';
import type { NavSection } from '../types';

interface BottomNavProps {
  activeSection: NavSection;
  unreadChats: number;
  onNavigate: (section: NavSection) => void;
}

const BOTTOM_ITEMS: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-4.5 w-4.5" /> },
  { id: 'rooms', label: 'Voice Room', icon: <DoorOpen className="h-4.5 w-4.5" /> },
  { id: 'chat', label: 'Chats', icon: <MessageCircle className="h-4.5 w-4.5" /> },
  { id: 'discover', label: 'Discover', icon: <Compass className="h-4.5 w-4.5" /> },
  { id: 'me', label: 'Me', icon: <User className="h-4.5 w-4.5" /> },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeSection,
  unreadChats,
  onNavigate,
}) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-cyan-500/15 bg-[#0A101D]/95 px-3 py-2 backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="flex min-h-[46px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap"
            >
              <div
                className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                {item.id === 'chat' && unreadChats > 0 && (
                  <span className="absolute -top-1 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono-tabular text-[9px] font-bold text-white">
                    {unreadChats > 9 ? '9+' : unreadChats}
                  </span>
                )}
              </div>
              <span className={isActive ? 'text-cyan-300' : 'text-slate-400'}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
