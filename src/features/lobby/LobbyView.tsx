import React from 'react';
import { User } from '../../types';
import { Bot, Swords, Users, History } from 'lucide-react';

interface LobbyViewProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ user, onNavigate }) => {
  const actions = [
    { id: 'bot-game', label: 'Play vs Bot', hint: 'Easy, Medium or Unbeatable.', icon: Bot },
    { id: 'multiplayer', label: 'Play Online', hint: 'Create a room or join one.', icon: Swords },
    { id: 'community', label: 'Find Players', hint: 'Search players and add friends.', icon: Users },
    { id: 'history', label: 'View Match History', hint: 'Review your past games.', icon: History },
  ];

  const stats = [
    { label: 'Games Played', value: user.totalGames },
    { label: 'Wins', value: user.wins },
    { label: 'Win Rate', value: `${user.winRate}%` },
    { label: 'Rating', value: user.rating },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#DCE8F5]">Welcome back.</h1>
      <p className="mt-2 text-base text-[#B4C2D1]">Choose how you want to play.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onNavigate(a.id)}
              className="surface-card text-left rounded-2xl p-5 flex items-start gap-4 hover:border-[#D99A4E]/50 transition-colors cursor-pointer"
            >
              <Icon className="w-6 h-6 text-[#E2A65C] shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <span className="block text-lg font-semibold text-[#DCE8F5]">{a.label}</span>
                <span className="block text-sm text-[#9AA9BA] mt-0.5">{a.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card rounded-xl px-4 py-3">
            <dt className="text-xs text-[#9AA9BA]">{s.label}</dt>
            <dd className="text-2xl font-semibold text-[#DCE8F5] tabular-nums mt-0.5">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
