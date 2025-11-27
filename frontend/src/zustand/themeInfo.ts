import { StateCreator } from "zustand"

export const THEME = {
  LIGHT: 0,
  DARK: 1,
} as const

export type ThemeType = (typeof THEME)[keyof typeof THEME]

export interface ThemeInfoSlice {
  themeInfo: ThemeType
  saveThemeInfo: (payload: ThemeType) => void
  removeThemeInfo: () => void
}

export const createThemeInfoSlice: StateCreator<ThemeInfoSlice> = (set) => ({
  themeInfo: THEME.DARK,
  saveThemeInfo: (payload: ThemeType) =>
    set(() => ({
      themeInfo: payload,
    })),
  removeThemeInfo: () =>
    set(() => ({
      themeInfo: THEME.DARK,
    })),
})
