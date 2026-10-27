// Visible UI text shared across pages. Internal ids, routes and API values are unchanged.

export const BRAND = {
  name: 'AFTERLIGHT',
  tagline: 'Every move leaves a mark.',
};

export type Difficulty = 'wanderer' | 'sentinel' | 'unbroken';

export const DIFFICULTY: Record<Difficulty, { label: string; description: string }> = {
  wanderer: { label: 'Easy', description: 'Makes random moves.' },
  sentinel: { label: 'Medium', description: 'Looks for winning moves and blocks your threats.' },
  unbroken: { label: 'Unbeatable', description: 'Uses minimax search to play optimally.' },
};

export const difficultyLabel = (d?: string | null): string =>
  d && d in DIFFICULTY ? DIFFICULTY[d as Difficulty].label : 'Bot';

export const NAV = {
  lobby: 'Home',
  'bot-game': 'Play vs Bot',
  multiplayer: 'Play Online',
  community: 'Players',
  friends: 'Friends',
  history: 'Match History',
  'oop-lab': 'OOP Learning Lab',
} as const;

export const MESSAGES = {
  loading: 'Loading…',
  genericError: 'Something went wrong. Please try again.',
  networkError: 'Unable to connect. Check your connection and try again.',
  invalidLogin: 'Incorrect username or password.',
  noFriends: "You haven't added any friends yet. Find players to get started.",
  noHistory: 'Your completed games will appear here.',
  noNotifications: "You're all caught up.",
  roomNotFound: "We couldn't find a room with that code.",
  roomFull: 'The room is full.',
};

// Maps raw server messages onto the standard wording without touching the API.
export function friendlyError(raw?: string | null): string {
  if (!raw) return MESSAGES.genericError;
  const m = raw.toLowerCase();
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed')) {
    return MESSAGES.networkError;
  }
  if (m.includes('room is full')) return MESSAGES.roomFull;
  if (m.includes('unexpected token') || m.includes('json')) return MESSAGES.genericError;
  return raw;
}
