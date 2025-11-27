import { create } from "zustand"
import { persist } from "zustand/middleware"

import { AccountInfoSlice, createAccountInfoSlice } from "./accountInfo"
import { ThemeInfoSlice, createThemeInfoSlice } from "./themeInfo"
import { CartSlice, createCartSlice } from "./cartStore"
import { UISlice, createUISlice } from "./uiStore"

type StoreSlice = AccountInfoSlice & ThemeInfoSlice & CartSlice & UISlice

export const ZUSTAND_STORAGE_NAME = "storage.states"

export const useBoundStore = create<StoreSlice>()(
  persist(
    (set, get, api) => ({
      ...createAccountInfoSlice(set, get, api),
      ...createThemeInfoSlice(set, get, api),
      ...createCartSlice(set, get, api),
      ...createUISlice(set, get, api),
    }),
    {
      name: ZUSTAND_STORAGE_NAME,
      skipHydration: false,
    }
  )
)
