import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, PlayerPublicProfile } from '../../types';
import { MESSAGES, friendlyError } from '../../copy';
import { Search, UserPlus, Swords, Ban, Check } from 'lucide-react';

interface CommunityViewProps {
  user: User;
  onInviteToMultiplayer?: (username: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ user, onInviteToMultiplayer }) => {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<PlayerPublicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [blockedList, setBlockedList] = useState<string[]>([]);
  const [outgoing, setOutgoing] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchPlayers = async (search = query) => {
    setLoading(true);
    try {
      const [playersRes, socialRes] = await Promise.all([api.searchPlayers(search), api.getSocialOverview()]);
      if (playersRes && playersRes.players) setPlayers(playersRes.players);
      if (socialRes) {
        setFriendsList(socialRes.friends || []);
        setBlockedList(socialRes.blocked || []);
        setOutgoing((socialRes.outgoingRequests || []).map((r: any) => r.recipientName));
      }
    } catch (err: any) {
      console.error(err);
      setNotice({ text: friendlyError(err?.message), isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers('');
  }, []);

  const show = (text: string, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddFriend = async (targetUsername: string) => {
    try {
      const res = await api.sendFriendRequest(targetUsername);
      if (res.error) {
        show(res.error, true);
      } else {
        show('Friend request sent');
        fetchPlayers();
      }
    } catch (e: any) {
      show(friendlyError(e?.message), true);
    }
  };

  const handleBlockUser = async (targetUsername: string) => {
    if (!confirm(`Block ${targetUsername}?`)) return;
    try {
      const res = await api.blockUser(targetUsername);
      if (res && res.error) {
        show(res.error, true);
        return;
      }
      show(`${targetUsername} is blocked`);
      fetchPlayers();
    } catch (e: any) {
      show(friendlyError(e?.message), true);
    }
  };

  const visible = players.filter((p) => p.username !== user.username);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#DCE8F5]">Players</h1>
          <p className="mt-1.5 text-base text-[#B4C2D1] max-w-lg">
            Find players, view profiles, and connect with people who enjoy the game.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <label htmlFor="player-search" className="sr-only">Search players</label>
          <Search className="w-4 h-4 text-[#9AA9BA] absolute left-3 top-3.5" aria-hidden="true" />
          <input
            id="player-search"
            type="search"
            placeholder="Search players"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              fetchPlayers(e.target.value);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#080D16] border border-[#3A4A5E] text-[#DCE8F5] text-base sm:text-sm placeholder-[#7F90A3]"
          />
        </div>
      </div>

      <div role="status" aria-live="polite" className="min-h-6 mt-4">
        {notice && (
          <p className={`text-sm ${notice.isError ? 'text-[#FF9AA2]' : 'text-[#E2A65C]'}`}>{notice.text}</p>
        )}
      </div>

      {loading && visible.length === 0 ? (
        <p role="status" className="py-12 text-center text-[#9AA9BA]">{MESSAGES.loading}</p>
      ) : visible.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center text-[#B4C2D1]">
          {query ? `No players found for "${query}".` : 'No players to show yet.'}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((p) => {
            const isFriend = friendsList.includes(p.username);
            const isBlocked = blockedList.includes(p.username);
            const isPending = outgoing.includes(p.username);

            return (
              <li key={p.id} className="surface-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-full bg-[#080D16] border border-[#293748] flex items-center justify-center font-semibold text-[#E2A65C] shrink-0" aria-hidden="true">
                        {p.displayName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#DCE8F5] truncate">{p.displayName}</p>
                        <p className="text-sm text-[#9AA9BA] truncate">@{p.username}</p>
                      </div>
                    </div>
                    <span className="text-sm text-[#B4C2D1] shrink-0">
                      Rating <span className="font-semibold text-[#DCE8F5]">{p.rating}</span>
                    </span>
                  </div>

                  {p.bio && <p className="text-sm text-[#B4C2D1] mt-3 line-clamp-2">{p.bio}</p>}

                  <dl className="grid grid-cols-4 gap-2 mt-4 text-center">
                    {[
                      { k: 'Games', v: p.totalGames },
                      { k: 'Wins', v: p.wins },
                      { k: 'Losses', v: p.losses },
                      { k: 'Win Rate', v: `${p.winRate}%` },
                    ].map((s) => (
                      <div key={s.k} className="py-1.5 rounded-lg bg-[#080D16]/70">
                        <dt className="text-xs text-[#9AA9BA]">{s.k}</dt>
                        <dd className="text-sm font-semibold text-[#DCE8F5] tabular-nums">{s.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  {isFriend ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#5FE0B6]">
                      <Check className="w-4 h-4" aria-hidden="true" />
                      Friends
                    </span>
                  ) : isBlocked ? (
                    <span className="text-sm text-[#FF9AA2]">Blocked</span>
                  ) : isPending ? (
                    <span className="text-sm text-[#9AA9BA]">Request sent</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddFriend(p.username)}
                      className="px-3.5 py-2 rounded-lg bg-[#D99A4E]/15 hover:bg-[#D99A4E]/25 border border-[#D99A4E]/40 text-[#E2A65C] text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" aria-hidden="true" />
                      Add Friend
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    {onInviteToMultiplayer && isFriend && (
                      <button
                        type="button"
                        onClick={() => onInviteToMultiplayer(p.username)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#080D16] hover:bg-[#172231] border border-[#293748] text-[#91B7CE] cursor-pointer"
                        aria-label={`Invite ${p.displayName} to a game`}
                        title="Invite to Game"
                      >
                        <Swords className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                    {!isBlocked && (
                      <button
                        type="button"
                        onClick={() => handleBlockUser(p.username)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#080D16] hover:bg-[#F16D78]/15 border border-[#293748] text-[#9AA9BA] hover:text-[#FF9AA2] cursor-pointer"
                        aria-label={`Block ${p.displayName}`}
                        title="Block"
                      >
                        <Ban className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
