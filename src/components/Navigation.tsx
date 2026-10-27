import React, { useEffect, useRef, useState } from 'react';
import { User, NotificationItem } from '../types';
import { NAV, MESSAGES } from '../copy';
import {
  Home,
  Bot,
  Users,
  UserCheck,
  History,
  GraduationCap,
  Bell,
  LogOut,
  Swords,
  User as UserIcon,
  Check,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface NavigationProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  onReadNotification: (id: string) => void;
  onReadAllNotifications: () => void;
}

const navItems = [
  { id: 'lobby', label: NAV.lobby, short: 'Home', icon: Home },
  { id: 'bot-game', label: NAV['bot-game'], short: 'Bot', icon: Bot },
  { id: 'multiplayer', label: NAV.multiplayer, short: 'Online', icon: Swords },
  { id: 'community', label: NAV.community, short: 'Players', icon: Users },
  { id: 'friends', label: NAV.friends, short: 'Friends', icon: UserCheck },
  { id: 'history', label: NAV.history, short: 'History', icon: History },
  { id: 'oop-lab', label: NAV['oop-lab'], short: 'Lab', icon: GraduationCap },
];

const primaryMobile = ['lobby', 'bot-game', 'multiplayer', 'community'];

export const Navigation: React.FC<NavigationProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  notifications,
  unreadNotificationsCount,
  onReadNotification,
  onReadAllNotifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications) return;
    const onDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showNotifications]);

  useEffect(() => {
    if (!showMore) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMore(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showMore]);

  const go = (id: string) => {
    setShowMore(false);
    setShowNotifications(false);
    onSelectTab(id);
  };

  const moreActive = !primaryMobile.includes(activeTab);
  const moreItems = navItems.filter((i) => !primaryMobile.includes(i.id));

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#080D16]/85 border-b border-[#293748]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go('lobby')}
            className="font-serif tracking-[0.18em] text-lg font-bold text-[#DCE8F5] hover:text-white cursor-pointer shrink-0"
            aria-label="AFTERLIGHT home"
          >
            AFTERLIGHT
          </button>

          <nav aria-label="Main" className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive ? 'bg-[#172231] text-[#DCE8F5]' : 'text-[#9AA9BA] hover:text-[#DCE8F5] hover:bg-[#111B2A]/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg text-[#9AA9BA] hover:text-[#DCE8F5] hover:bg-[#172231] transition-colors cursor-pointer"
                aria-label={
                  unreadNotificationsCount > 0
                    ? `Notifications, ${unreadNotificationsCount} unread`
                    : 'Notifications'
                }
                aria-expanded={showNotifications}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-[#D99A4E] text-[#080D16] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-auto sm:right-0 sm:mt-2 sm:w-96 rounded-xl bg-[#0B101B] border border-[#293748] shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#293748]">
                    <h2 className="text-sm font-semibold text-[#DCE8F5]">Notifications</h2>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={onReadAllNotifications}
                        className="text-xs text-[#91B7CE] hover:text-[#DCE8F5] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#293748]/50 mt-1">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[#9AA9BA]">{MESSAGES.noNotifications}</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          type="button"
                          key={n.id}
                          onClick={() => onReadNotification(n.id)}
                          className={`w-full text-left py-3 px-2 flex items-start justify-between gap-3 transition-colors rounded cursor-pointer ${
                            !n.isRead ? 'bg-[#172231]/40 hover:bg-[#172231]/70' : 'hover:bg-[#111B2A]/50'
                          }`}
                        >
                          <span className="space-y-1">
                            <span className="block text-sm text-[#DCE8F5] leading-snug">{n.message}</span>
                            <span className="block text-xs text-[#8FA0B3]">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#D99A4E] shrink-0 mt-1.5" aria-label="Unread" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => go('profile')}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              aria-label="Your profile"
              className={`flex items-center gap-2 h-10 px-2.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#172231] text-[#DCE8F5]' : 'text-[#9AA9BA] hover:text-[#DCE8F5] hover:bg-[#172231]'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-[#172231] border border-[#293748] flex items-center justify-center overflow-hidden">
                <UserIcon className="w-3.5 h-3.5 text-[#D99A4E]" />
              </span>
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                {user.displayName || user.username}
              </span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg text-[#9AA9BA] hover:text-[#F16D78] hover:bg-[#172231] transition-colors cursor-pointer"
              aria-label="Sign Out"
              title="Sign Out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile and tablet tab bar */}
      <nav
        aria-label="Main"
        className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0B101B]/95 backdrop-blur-md border-t border-[#293748]/70"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-xl mx-auto grid grid-cols-5">
          {primaryMobile.map((id) => {
            const item = navItems.find((n) => n.id === id)!;
            const Icon = item.icon;
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[11px] font-medium cursor-pointer ${
                  isActive ? 'text-[#E2A65C]' : 'text-[#9AA9BA]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.short}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            aria-haspopup="dialog"
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[11px] font-medium cursor-pointer ${
              moreActive || showMore ? 'text-[#E2A65C]' : 'text-[#9AA9BA]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="xl:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="More">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 cursor-default"
            onClick={() => setShowMore(false)}
            aria-label="Close menu"
          />
          <div
            className="absolute bottom-0 inset-x-0 rounded-t-2xl bg-[#0B101B] border-t border-[#293748] p-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[#DCE8F5]">More</h2>
              <button
                type="button"
                onClick={() => setShowMore(false)}
                className="w-10 h-10 flex items-center justify-center text-[#9AA9BA] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="divide-y divide-[#293748]/50">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 py-3.5 text-sm cursor-pointer ${
                        activeTab === item.id ? 'text-[#E2A65C]' : 'text-[#DCE8F5]'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-[#9AA9BA]" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => go('profile')}
                  className="w-full flex items-center gap-3 py-3.5 text-sm text-[#DCE8F5] cursor-pointer"
                >
                  <UserIcon className="w-5 h-5 text-[#9AA9BA]" />
                  Your Profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setShowMore(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 py-3.5 text-sm text-[#F16D78] cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
