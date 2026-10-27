import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, FriendRequestItem } from '../../types';
import { MESSAGES, friendlyError } from '../../copy';
import { Check, X, Swords, Trash2 } from 'lucide-react';

interface FriendsViewProps {
  user: User;
  onInviteToRoom?: (friendName: string) => void;
}

type SubTab = 'friends' | 'incoming' | 'outgoing' | 'blocked';

export const FriendsView: React.FC<FriendsViewProps> = ({ user, onInviteToRoom }) => {
  const [subTab, setSubTab] = useState<SubTab>('friends');
  const [friends, setFriends] = useState<string[]>([]);
  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);

  const show = (text: string, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice(null), 3500);
  };

  const fetchSocial = async () => {
    setLoading(true);
    try {
      const res = await api.getSocialOverview();
      if (res) {
        setFriends(res.friends || []);
        setIncoming(res.incomingRequests || []);
        setOutgoing(res.outgoingRequests || []);
        setBlocked(res.blocked || []);
      }
    } catch (e: any) {
      console.error(e);
      show(friendlyError(e?.message), true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, []);

  const run = async (action: () => Promise<any>, success: string) => {
    try {
      const res = await action();
      if (res && res.error) {
        show(res.error, true);
        return;
      }
      show(success);
      fetchSocial();
    } catch (e: any) {
      show(friendlyError(e?.message), true);
    }
  };

  const handleRespond = (id: string, status: 'ACCEPTED' | 'REJECTED') =>
    run(() => api.respondFriendRequest(id, status), status === 'ACCEPTED' ? "You're now friends." : 'Request declined.');

  const handleCancel = (id: string) => run(() => api.respondFriendRequest(id, 'CANCELLED'), 'Request canceled.');

  const handleRemove = (name: string) => {
    if (!confirm(`Remove ${name} from your friends?`)) return;
    run(() => api.removeFriend(name), `${name} was removed from your friends.`);
  };

  const handleUnblock = (name: string) => run(() => api.unblockUser(name), `${name} is unblocked.`);

  const tabs: { id: SubTab; label: string; count: number }[] = [
    { id: 'friends', label: 'All Friends', count: friends.length },
    { id: 'incoming', label: 'Incoming Requests', count: incoming.length },
    { id: 'outgoing', label: 'Sent Requests', count: outgoing.length },
    { id: 'blocked', label: 'Blocked Users', count: blocked.length },
  ];

  const rowClass = 'flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080D16]/80';
  const iconBtn =
    'w-10 h-10 flex items-center justify-center rounded-lg bg-[#111B2A] hover:bg-[#F16D78]/15 text-[#9AA9BA] hover:text-[#FF9AA2] border border-[#293748] cursor-pointer';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-bold text-[#DCE8F5]">Friends</h1>
      <p className="mt-1.5 text-base text-[#B4C2D1]">Manage friend requests and invite friends to play.</p>

      <div role="tablist" aria-label="Friends" className="mt-6 flex gap-1 overflow-x-auto border-b border-[#293748]/70">
        {tabs.map((t) => {
          const selected = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSubTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors cursor-pointer ${
                selected ? 'border-[#D99A4E] text-[#DCE8F5]' : 'border-transparent text-[#9AA9BA] hover:text-[#DCE8F5]'
              }`}
            >
              {t.label}
              {t.count > 0 && <span className="ml-1.5 text-[#9AA9BA]">({t.count})</span>}
            </button>
          );
        })}
      </div>

      <div role="status" aria-live="polite" className="min-h-6 mt-4">
        {notice && <p className={`text-sm ${notice.isError ? 'text-[#FF9AA2]' : 'text-[#E2A65C]'}`}>{notice.text}</p>}
      </div>

      <div className="surface-card rounded-2xl p-4 sm:p-5 min-h-[260px]" role="tabpanel">
        {loading && friends.length + incoming.length + outgoing.length + blocked.length === 0 && (
          <p className="py-12 text-center text-[#9AA9BA]">{MESSAGES.loading}</p>
        )}

        {subTab === 'friends' && (
          <ul className="space-y-2">
            {friends.length === 0 && !loading ? (
              <li className="py-14 text-center text-[#B4C2D1]">{MESSAGES.noFriends}</li>
            ) : (
              friends.map((f) => (
                <li key={f} className={rowClass}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-full bg-[#111B2A] border border-[#293748] flex items-center justify-center font-semibold text-[#E2A65C] shrink-0" aria-hidden="true">
                      {f.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-[#DCE8F5] truncate">{f}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onInviteToRoom && (
                      <button
                        type="button"
                        onClick={() => onInviteToRoom(f)}
                        className="px-3 py-2 rounded-lg bg-[#D99A4E]/15 hover:bg-[#D99A4E]/25 text-[#E2A65C] border border-[#D99A4E]/40 text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Swords className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Invite to Game</span>
                        <span className="sm:hidden">Invite</span>
                      </button>
                    )}
                    <button type="button" onClick={() => handleRemove(f)} className={iconBtn} aria-label={`Remove ${f} from friends`} title="Remove Friend">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        {subTab === 'incoming' && (
          <ul className="space-y-2">
            {incoming.length === 0 && !loading ? (
              <li className="py-14 text-center text-[#B4C2D1]">No incoming requests.</li>
            ) : (
              incoming.map((req) => (
                <li key={req.id} className={rowClass}>
                  <div>
                    <p className="font-semibold text-[#DCE8F5]">{req.senderName}</p>
                    <p className="text-sm text-[#9AA9BA]">{new Date(req.createdAt * 1000).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespond(req.id, 'ACCEPTED')}
                      className="px-3 py-2 rounded-lg bg-[#32C997]/15 hover:bg-[#32C997]/25 text-[#5FE0B6] border border-[#32C997]/40 text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(req.id, 'REJECTED')}
                      className="px-3 py-2 rounded-lg bg-[#111B2A] hover:bg-[#F16D78]/15 text-[#B4C2D1] border border-[#293748] text-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                      Decline
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        {subTab === 'outgoing' && (
          <ul className="space-y-2">
            {outgoing.length === 0 && !loading ? (
              <li className="py-14 text-center text-[#B4C2D1]">No sent requests.</li>
            ) : (
              outgoing.map((req) => (
                <li key={req.id} className={rowClass}>
                  <div>
                    <p className="font-semibold text-[#DCE8F5]">{req.recipientName}</p>
                    <p className="text-sm text-[#9AA9BA]">Sent {new Date(req.createdAt * 1000).toLocaleDateString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCancel(req.id)}
                    className="px-3 py-2 rounded-lg bg-[#111B2A] hover:bg-[#172231] text-[#DCE8F5] border border-[#293748] text-sm cursor-pointer"
                  >
                    Cancel Request
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        {subTab === 'blocked' && (
          <ul className="space-y-2">
            {blocked.length === 0 && !loading ? (
              <li className="py-14 text-center text-[#B4C2D1]">You haven't blocked anyone.</li>
            ) : (
              blocked.map((name) => (
                <li key={name} className={rowClass}>
                  <span className="font-semibold text-[#DCE8F5]">{name}</span>
                  <button
                    type="button"
                    onClick={() => handleUnblock(name)}
                    className="px-3 py-2 rounded-lg bg-[#111B2A] hover:bg-[#172231] text-[#DCE8F5] border border-[#293748] text-sm cursor-pointer"
                  >
                    Unblock
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
