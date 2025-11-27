import { StateCreator } from "zustand"

export interface UISlice {
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isAuthModalOpen: false,
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
})
