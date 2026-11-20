import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import type { AuthProvider } from '../types';
import { soundFx } from '../utils/soundFx';

interface AuthScreenProps {
  onLogin: (payload: { provider: AuthProvider; name: string; identifier: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [selectedProvider, setSelectedProvider] = useState<AuthProvider>('gmail');
  const [name, setName] = useState('Sabir');
  const [identifier, setIdentifier] = useState('sabir.shah@gmail.com');
  const [otpCode, setOtpCode] = useState('4829');
  const [otpSent, setOtpSent] = useState(false);

  const handleSelectProvider = (provider: AuthProvider) => {
    setSelectedProvider(provider);
    setOtpSent(false);
    if (provider === 'gmail') {
      setIdentifier('sabir.shah@gmail.com');
    } else if (provider === 'phone') {
      setIdentifier('+91 98204 55102');
    } else {
      setIdentifier('Sabir Shah (Facebook)');
    }
    soundFx.playMove();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProvider === 'phone' && !otpSent) {
      setOtpSent(true);
      soundFx.playBeat(true);
      return;
    }
    soundFx.playVictory();
    onLogin({
      provider: selectedProvider,
      name: name.trim() || 'Sabir',
      identifier: identifier.trim() || 'OG VELOCITY Member',
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#070B14] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/25 bg-[#0D1526]/95 p-7 shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>4K Voice Sanctuary &amp; Gaming Lounge</span>
          </div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight text-white">
            OG VELOCITY
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Sign in to enter 10-seat &amp; 15-seat Voice Rooms, YouTube Rooms, VIP Lounge &amp; Social Moments.
          </p>
        </div>

        {/* Provider Selector: Gmail / Phone / Facebook */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSelectProvider('gmail')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
              selectedProvider === 'gmail'
                ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                : 'border-white/10 bg-[#132038] text-slate-300 hover:border-white/25'
            }`}
          >
            <Mail className="h-4 w-4 text-rose-400" />
            <span>Gmail</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectProvider('phone')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
              selectedProvider === 'phone'
                ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                : 'border-white/10 bg-[#132038] text-slate-300 hover:border-white/25'
            }`}
          >
            <Phone className="h-4 w-4 text-emerald-400" />
            <span>Phone</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectProvider('facebook')}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
              selectedProvider === 'facebook'
                ? 'border-cyan-400/60 bg-cyan-500/15 text-cyan-200'
                : 'border-white/10 bg-[#132038] text-slate-300 hover:border-white/25'
            }`}
          >
            <UserCheck className="h-4 w-4 text-sky-400" />
            <span>Facebook</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300">
              Display Name
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your callsign"
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-id" className="block text-xs font-medium text-slate-300">
              {selectedProvider === 'gmail'
                ? 'Gmail Address'
                : selectedProvider === 'phone'
                  ? 'Mobile Number'
                  : 'Facebook Account'}
            </label>
            <input
              id="auth-id"
              type={selectedProvider === 'gmail' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#070B14] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {selectedProvider === 'phone' && otpSent && (
            <div>
              <label htmlFor="auth-otp" className="block text-xs font-medium text-emerald-300">
                Verification Code (Sent to {identifier})
              </label>
              <input
                id="auth-otp"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-emerald-400/40 bg-[#070B14] px-3.5 py-2.5 font-mono-tabular text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:from-cyan-400 hover:to-teal-300"
          >
            {selectedProvider === 'phone' && !otpSent
              ? 'Send Verification Code'
              : `Continue with ${
                  selectedProvider === 'gmail'
                    ? 'Gmail'
                    : selectedProvider === 'phone'
                      ? 'Phone Number'
                      : 'Facebook'
                }`}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          <span>Permanent User ID assigned on sign-in (UID cannot be altered)</span>
        </div>
      </div>
    </div>
  );
};
