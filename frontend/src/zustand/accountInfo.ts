import { StateCreator } from "zustand"

import { Account } from "@/types/account"
export interface AccountInfoSlice {
  accountInfo: Account
  saveAccountInfo: (payload: Account) => void
  removeAccountInfo: () => void
}

export const createAccountInfoSlice: StateCreator<AccountInfoSlice> = (set) => ({
  accountInfo: {
    id: null,
    username: null,
    email: null,
    isAdmin: false,
  },
  saveAccountInfo: (payload: Account) =>
    set(() => ({
      accountInfo: payload,
    })),
  removeAccountInfo: () => {
    set(() => ({
      accountInfo: {
        id: null,
        username: null,
        email: null,
        isAdmin: false,
      },
    }))
  },
})
