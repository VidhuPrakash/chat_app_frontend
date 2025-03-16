import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  setAuth: (token: string, userId: string, username: string) => void;
  clearAuth: () => void;
}

// Create the store with persistence to localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      username: null,
      setAuth: (token: string, userId: string, username: string) =>
        set({ token, userId, username }),
      clearAuth: () => set({ token: null, userId: null, username: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
