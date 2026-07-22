import { create } from 'zustand';

type Intent = 'image' | 'strategy' | null;

interface AuthModalState {
  isOpen: boolean;
  intent: Intent;
  openAuthModal: (intent?: Intent) => void;
  closeAuthModal: () => void;
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  intent: null,
  openAuthModal: (intent: Intent = null) => set({ isOpen: true, intent }),
  closeAuthModal: () => set({ isOpen: false, intent: null }),
}));
