import React, { useState, useEffect } from 'react';
import { User, NotificationItem } from './types';
import { api, getStoredUser, setStoredUser } from './services/api';
import { AuthScreen } from './features/auth/AuthScreen';
import { Navigation } from './components/Navigation';
import { MoonlitAtmosphere } from './components/MoonlitAtmosphere';
import { getLandscapeForRoute } from './components/landscapeConfig';
import { LobbyView } from './features/lobby/LobbyView';
import { BotGameView } from './features/game/BotGameView';
import { MultiplayerView } from './features/multiplayer/MultiplayerView';
import { OOPLabView } from './features/oop-lab/OOPLabView';
import { CommunityView } from './features/social/CommunityView';
import { FriendsView } from './features/social/FriendsView';
import { MatchHistoryView } from './features/history/MatchHistoryView';
import { ProfileView } from './features/profile/ProfileView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('lobby');
  const [multiplayerSubState, setMultiplayerSubState] = useState<'create-join' | 'in-room'>('create-join');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      api.getMe().then((res) => {
        if (res && res.user) {
          setUser(res.user);
          setStoredUser(res.user);
        }
      }).catch(console.error);
    }
    setLoadingInitial(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    const poll = async () => {
      try {
        const res = await api.getSocialOverview();
        if (res && res.notifications) {
          setNotifications(res.notifications);
        }
      } catch (e) {
        console.error(e);
      }
    };

    poll();
    const timer = setInterval(poll, 8000);
    return () => clearInterval(timer);
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setStoredUser(null);
    setUser(null);
    setActiveTab('lobby');
  };

  const handleReadNotification = async (id: string) => {
    await api.readNotification(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleReadAllNotifications = async () => {
    await api.readAllNotifications();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const currentLandscape = getLandscapeForRoute(
    activeTab,
    activeTab === 'multiplayer' ? multiplayerSubState : undefined
  );

  if (loadingInitial) {
    return (
      <div className="w-full h-screen bg-[#080D16] flex items-center justify-center">
        <div role="status" aria-label="Loading" className="w-8 h-8 rounded-full border-2 border-[#D99A4E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={(u) => setUser(u)} />;
  }

  return (
    <MoonlitAtmosphere customConfig={currentLandscape}>
      <div className="min-h-screen text-[#DCE8F5] flex flex-col selection:bg-[#D99A4E]/30 selection:text-[#DCE8F5]">
        
        <a href="#main" className="skip-link">Skip to content</a>
        <Navigation
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={handleLogout}
          notifications={notifications}
          unreadNotificationsCount={unreadCount}
          onReadNotification={handleReadNotification}
          onReadAllNotifications={handleReadAllNotifications}
        />

        <main id="main" className="flex-1 flex flex-col pb-tabbar">
          {activeTab === 'lobby' && (
            <LobbyView user={user} onNavigate={setActiveTab} />
          )}

          {activeTab === 'bot-game' && (
            <BotGameView
              user={user}
              onGoToOopLab={() => setActiveTab('oop-lab')}
            />
          )}

          {activeTab === 'multiplayer' && (
            <MultiplayerView
              user={user}
              onSubStateChange={setMultiplayerSubState}
            />
          )}

          {activeTab === 'oop-lab' && (
            <OOPLabView />
          )}

          {activeTab === 'community' && (
            <CommunityView
              user={user}
              onInviteToMultiplayer={() => setActiveTab('multiplayer')}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsView
              user={user}
              onInviteToRoom={() => setActiveTab('multiplayer')}
            />
          )}

          {activeTab === 'history' && (
            <MatchHistoryView user={user} />
          )}

          {activeTab === 'profile' && (
            <ProfileView user={user} onUserUpdated={setUser} />
          )}
        </main>

      </div>
    </MoonlitAtmosphere>
  );
}
