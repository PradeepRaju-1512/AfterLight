import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, MatchRecord } from '../../types';
import { MESSAGES, difficultyLabel, friendlyError } from '../../copy';

interface MatchHistoryViewProps {
  user: User;
}

// Older saved games used the previous bot names.
const LEGACY_NAMES: Record<string, string> = {
  Wanderer: 'Easy Bot',
  Sentinel: 'Medium Bot',
  'The Unbroken': 'Unbeatable Bot',
};
const displayName = (n: string) => LEGACY_NAMES[n] ?? n;

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({ user }) => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMatchHistory(user.username);
      if (res && res.games) setMatches(res.games);
    } catch (e: any) {
      console.error(e);
      setError(friendlyError(e?.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-bold text-[#DCE8F5]">Match History</h1>
      <p className="mt-1.5 text-base text-[#B4C2D1]">Review your previous games, results, and moves.</p>

      {error && (
        <p role="alert" className="mt-4 text-sm text-[#FF9AA2]">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p role="status" className="py-10 text-center text-[#9AA9BA]">{MESSAGES.loading}</p>
        ) : matches.length === 0 ? (
          <div className="surface-card rounded-2xl p-12 text-center text-[#B4C2D1]">{MESSAGES.noHistory}</div>
        ) : (
          matches.map((m) => {
            const isDraw = m.outcome === 'DRAW';
            const isWinner = m.winnerName === user.username;
            const result = isDraw ? 'Draw' : isWinner ? 'Win' : 'Loss';
            const boardState = m.boardState || '.........';

            return (
              <article key={m.id} className="surface-card rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`w-16 text-center py-1.5 rounded-lg text-sm font-semibold shrink-0 ${
                      isDraw
                        ? 'bg-[#172231] text-[#B9D3E3]'
                        : isWinner
                        ? 'bg-[#32C997]/15 text-[#5FE0B6]'
                        : 'bg-[#F16D78]/15 text-[#FF9AA2]'
                    }`}
                  >
                    {result}
                  </span>

                  <div className="min-w-0">
                    <p className="font-semibold text-[#DCE8F5] truncate">
                      {displayName(m.playerXName)} vs {displayName(m.playerOName)}
                    </p>
                    <p className="text-sm text-[#9AA9BA] mt-0.5">
                      {m.mode === 'BOT' ? `vs Bot · ${difficultyLabel(m.botDifficulty)}` : m.roomCode ? `Online · Room ${m.roomCode}` : 'Online'}
                      {' · '}
                      {new Date(m.createdAt * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0.5 w-[4.5rem] shrink-0" role="img" aria-label={`Final board: ${boardState.replace(/\./g, '-')}`}>
                  {boardState.split('').map((c, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      className={`aspect-square rounded-sm flex items-center justify-center text-[11px] font-bold ${
                        m.winningLine?.includes(i) ? 'bg-[#D99A4E]/25' : 'bg-[#111B2A]'
                      } ${c === 'O' ? 'text-[#E2A65C]' : 'text-[#DCE8F5]'}`}
                    >
                      {c !== '.' ? c : ''}
                    </div>
                  ))}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
