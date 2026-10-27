export type LandscapeKey =
  | 'login'
  | 'bot-game'
  | 'lobby'
  | 'multiplayer-lobby'
  | 'multiplayer-create-join'
  | 'multiplayer-room'
  | 'community'
  | 'friends'
  | 'history'
  | 'oop-lab'
  | 'profile';

export interface LandscapeConfig {
  key: LandscapeKey;
  sceneName: string;
  imageWebp: string;
  imageFallback: string;
  nearblackWebp?: string;
  enablePointerReveal?: boolean;
  revealIntensity?: number; // max reveal opacity
  darknessOverlay: string; // Tailwind/CSS overlay class or gradient
  ambientMistColor?: string;
  contentScrim?: string;
  mobileFocusY?: string; // Center crop target for mobile
}

export const LANDSCAPE_CONFIGS: Record<LandscapeKey, LandscapeConfig> = {
  login: {
    key: 'login',
    sceneName: 'Mountain Ridge',
    imageWebp: '/images/landscapes/mountain-ridge.webp',
    imageFallback: '/images/landscapes/mountain-ridge.jpeg',
    nearblackWebp: '/images/landscapes/mountain-ridge-nearblack.webp',
    enablePointerReveal: true,
    revealIntensity: 0.6,
    darknessOverlay: 'bg-[#080D16]/30',
    ambientMistColor: '#91B7CE',
    mobileFocusY: '30%',
  },

  'bot-game': {
    key: 'bot-game',
    sceneName: 'Mountain Ridge',
    imageWebp: '/images/landscapes/mountain-ridge.webp',
    imageFallback: '/images/landscapes/mountain-ridge.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/70 via-[#080D16]/38 to-[#080D16]/80',
    ambientMistColor: '#91B7CE',
    contentScrim: 'bg-[#0B101B]/80 backdrop-blur-md',
    mobileFocusY: '30%',
  },

  lobby: {
    key: 'lobby',
    sceneName: 'Vast Plain',
    imageWebp: '/images/landscapes/vast-plain.webp',
    imageFallback: '/images/landscapes/vast-plain.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/65 via-[#080D16]/32 to-[#080D16]/78',
    ambientMistColor: '#DCE8F5',
    mobileFocusY: '40%',
  },

  'multiplayer-lobby': {
    key: 'multiplayer-lobby',
    sceneName: 'Vast Plain',
    imageWebp: '/images/landscapes/vast-plain.webp',
    imageFallback: '/images/landscapes/vast-plain.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/65 via-[#080D16]/32 to-[#080D16]/78',
    ambientMistColor: '#DCE8F5',
    mobileFocusY: '40%',
  },

  'multiplayer-create-join': {
    key: 'multiplayer-create-join',
    sceneName: 'Crocodile River',
    imageWebp: '/images/landscapes/crocodile-river.webp',
    imageFallback: '/images/landscapes/crocodile-river.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/65 via-[#080D16]/35 to-[#080D16]/82',
    ambientMistColor: '#D99A4E',
    mobileFocusY: '45%',
  },

  'multiplayer-room': {
    key: 'multiplayer-room',
    sceneName: 'Crocodile River',
    imageWebp: '/images/landscapes/crocodile-river.webp',
    imageFallback: '/images/landscapes/crocodile-river.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/68 via-[#080D16]/38 to-[#080D16]/85',
    ambientMistColor: '#91A3B5',
    contentScrim: 'bg-[#0B101B]/85 backdrop-blur-md',
    mobileFocusY: '45%',
  },

  community: {
    key: 'community',
    sceneName: 'Ancient Tree',
    imageWebp: '/images/landscapes/ancient-tree.webp',
    imageFallback: '/images/landscapes/ancient-tree.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/68 via-[#080D16]/38 to-[#080D16]/78',
    ambientMistColor: '#91B7CE',
    mobileFocusY: '35%',
  },

  friends: {
    key: 'friends',
    sceneName: 'Ancient Tree',
    imageWebp: '/images/landscapes/ancient-tree.webp',
    imageFallback: '/images/landscapes/ancient-tree.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/68 via-[#080D16]/38 to-[#080D16]/78',
    ambientMistColor: '#91A3B5',
    mobileFocusY: '35%',
  },

  history: {
    key: 'history',
    sceneName: 'Moonlit River',
    imageWebp: '/images/landscapes/moonlit-river.webp',
    imageFallback: '/images/landscapes/moonlit-river.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/68 via-[#080D16]/38 to-[#080D16]/82',
    ambientMistColor: '#DCE8F5',
    mobileFocusY: '35%',
  },

  'oop-lab': {
    key: 'oop-lab',
    sceneName: 'Ancient Tree',
    imageWebp: '/images/landscapes/ancient-tree.webp',
    imageFallback: '/images/landscapes/ancient-tree.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-[#080D16]/82 backdrop-blur-sm',
    ambientMistColor: '#91B7CE',
    contentScrim: 'bg-[#0B101B]/92 backdrop-blur-md',
    mobileFocusY: '30%',
  },

  profile: {
    key: 'profile',
    sceneName: 'Ancient Tree',
    imageWebp: '/images/landscapes/ancient-tree.webp',
    imageFallback: '/images/landscapes/ancient-tree.jpeg',
    enablePointerReveal: false,
    darknessOverlay: 'bg-gradient-to-b from-[#080D16]/68 via-[#080D16]/38 to-[#080D16]/78',
    ambientMistColor: '#DCE8F5',
    mobileFocusY: '35%',
  },
};

export function getLandscapeForRoute(route: string, subState?: string): LandscapeConfig {
  if (route === 'multiplayer') {
    if (subState === 'in-room') {
      return LANDSCAPE_CONFIGS['multiplayer-room'];
    }
    return LANDSCAPE_CONFIGS['multiplayer-create-join'];
  }

  const match = LANDSCAPE_CONFIGS[route as LandscapeKey];
  return match || LANDSCAPE_CONFIGS['bot-game'];
}
