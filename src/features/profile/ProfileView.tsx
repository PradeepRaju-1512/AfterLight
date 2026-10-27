import React, { useState } from 'react';
import { api, setStoredUser } from '../../services/api';
import { User } from '../../types';
import { friendlyError } from '../../copy';
import { Edit3, Save, Moon, Trees, Mountain, Eye } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

const avatars = [
  { id: 'hiker', label: 'Mountain', icon: Mountain },
  { id: 'tower', label: 'Lookout', icon: Eye },
  { id: 'moon', label: 'Moon', icon: Moon },
  { id: 'tree', label: 'Pine', icon: Trees },
];

const fieldClass =
  'w-full px-3.5 py-2.5 rounded-lg bg-[#080D16] border border-[#3A4A5E] text-[#DCE8F5] text-base sm:text-sm placeholder-[#7F90A3]';

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdated }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || 'hiker');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setNotice({ text: 'Display name can’t be empty.', isError: true });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const res = await api.updateProfile({ displayName: displayName.trim(), bio, avatar });
      if (res && (res as any).error) {
        setNotice({ text: (res as any).error, isError: true });
        return;
      }
      const updatedUser: User = { ...user, displayName: displayName.trim(), bio, avatar };
      setStoredUser(updatedUser);
      onUserUpdated(updatedUser);
      setEditing(false);
      setNotice({ text: 'Profile updated.', isError: false });
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      setNotice({ text: friendlyError(e?.message), isError: true });
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Games Played', value: user.totalGames, tone: 'text-[#DCE8F5]' },
    { label: 'Wins', value: user.wins, tone: 'text-[#5FE0B6]' },
    { label: 'Losses', value: user.losses, tone: 'text-[#FF9AA2]' },
    { label: 'Draws', value: user.draws ?? 0, tone: 'text-[#B9D3E3]' },
    { label: 'Win Rate', value: `${user.winRate}%`, tone: 'text-[#E2A65C]' },
    { label: 'Rating', value: user.rating, tone: 'text-[#DCE8F5]' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-bold text-[#DCE8F5]">Your Profile</h1>

      <section className="surface-card rounded-2xl p-6 mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <span className="w-14 h-14 rounded-2xl bg-[#080D16] border border-[#293748] flex items-center justify-center text-2xl font-semibold text-[#E2A65C] shrink-0" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[#DCE8F5] truncate">{user.displayName}</h2>
              <p className="text-sm text-[#9AA9BA] truncate">
                @{user.username} · Member since{' '}
                {new Date(user.createdAt * 1000).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (editing ? handleSave() : setEditing(true))}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-[#172231] hover:bg-[#203445] border border-[#3A4A5E] text-sm font-medium text-[#DCE8F5] flex items-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {editing ? <Save className="w-4 h-4" aria-hidden="true" /> : <Edit3 className="w-4 h-4" aria-hidden="true" />}
            {editing ? (saving ? 'Saving…' : 'Save Profile') : 'Edit Profile'}
          </button>
        </div>

        <div role="status" aria-live="polite" className="min-h-6 mt-3">
          {notice && <p className={`text-sm ${notice.isError ? 'text-[#FF9AA2]' : 'text-[#E2A65C]'}`}>{notice.text}</p>}
        </div>

        {editing ? (
          <div className="mt-2 space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm text-[#B4C2D1] mb-1.5">Display name</label>
              <input id="profile-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`${fieldClass} sm:w-80`} />
            </div>
            <div>
              <label htmlFor="profile-bio" className="block text-sm text-[#B4C2D1] mb-1.5">Bio</label>
              <textarea id="profile-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other players a little about you" className={fieldClass} />
            </div>
            <fieldset>
              <legend className="text-sm text-[#B4C2D1] mb-1.5">Avatar</legend>
              <div className="flex flex-wrap gap-2">
                {avatars.map((av) => {
                  const Icon = av.icon;
                  const selected = avatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      aria-pressed={selected}
                      className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 text-sm cursor-pointer ${
                        selected ? 'bg-[#172231] border-[#D99A4E] text-[#E2A65C]' : 'bg-[#080D16] border-[#293748] text-[#B4C2D1] hover:text-[#DCE8F5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      {av.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ) : (
          <p className="text-sm text-[#B4C2D1] leading-relaxed">{bio || 'No bio yet.'}</p>
        )}
      </section>

      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card rounded-2xl p-4">
            <dt className="text-sm text-[#9AA9BA]">{s.label}</dt>
            <dd className={`text-2xl font-semibold tabular-nums mt-1 ${s.tone}`}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
