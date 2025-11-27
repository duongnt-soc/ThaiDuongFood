import { nextPublicHost } from "@/config"

//FIXME: update version if change localStorage structure impact application.
export const VERSION = 1.1
export const STORAGE_VERSION = 1.1

export const TRADE = {
  TYPE: {
    TRADING: "trading",
    TAKE_PROFIT: "take_profit",
    STOP_LOSS: "stop_loss",
    BUY_LIMIT_GAIN: "buy_limit_gain",
    BUY_LIMIT_LOSS: "buy_limit_loss",
    SELL_LIMIT_GAIN: "sell_limit_gain",
    SELL_LIMIT_LOSS: "sell_limit_loss",
    COPY_TRADING: "copy_trading",
    DONE: "done",
  },
  UNIT: {
    AMOUNT: "amount",
  },
  SIDE: {
    BUY: "buy",
    SELL: "sell",
  },
  ERR_MSG: {
    INSUFFICIENT_FUNDS_SOL: "Insufficient SOL balance",
    MINIMUM_AMOUNT: "The amount must be greater than 0.0001",
    INSUFFICIENT_FUNDS_BALANCE: "Insufficient token balance to sell!",
    MINIMUM_AMOUNT_PERCENT: "The amount must be greater than 0%",
  },
  MIN_VALUE: {
    MIN_PRICE_TOKEN_SOL: 0.00001,
  },
}
export enum ETradeStatus {
  SUCCESS = "success",
  FAILED = "failed",
}

export const MIN_VALUE = {
  IS_HIDE: 1,
  IS_HIDE_CHART: 0.000001,
}

export const TOAST_MESSAGE = {
  TRADE: {
    COMING_SOON: "Buy/Sell is coming soon",
    IN_PROGRESS_TRANSACTION: "Your transaction is processing...",
    SUCCESS_SELL: "You've successfully sold ",
    SUCCESS_BOUGTH: "You've successfully bought ",
    IN_PROGRESS: "Your transaction is being processed...",
    FAILURE: "Your transaction is failed.",
  },
  COPY_TRADE: {
    LOADING: "Loading",
    SUCCESS: "Your copy of [address] is now active",
  },
}

export const LOCAL_STORAGE_KEY = {
  TRADING_VIEW_CHART: {
    INTERVAL: "TRADING_VIEW_CHART_INTERVAL",
    CHART: "CHART",
    CHART_TYPE: "CHART_TYPE",
    PRICE_TYPE: "PRICE_TYPE",
  },
  SELECTED_WALLET_IN_CHART: "selected_wallet_in_chart",
  CHAKRA_UI_COLOR_MODE: "chakra-ui-color-mode",
  IS_HIDE_SMALL_ASSETS: "IS_HIDE_SMALL_ASSETS",
  IS_HIDE_SMALL_IN_ASSETS: "is_hide_small_in_assets",
  ACTIVE_TAB_DETAIL_PAGE_MOBILE: "ACTIVE_TAB_DETAIL_PAGE_MOBILE",
  IS_HIDE_ADS_POPUP: "IS_HIDE_ADS_POPUP",
  RESIZE_HEIGHT: "RESIZE_HEIGHT",
  IS_HIDE_CHART: "IS_HIDE_CHART",
  SELECTED_TAB_IN_DETAIL_WALLET: "SELECTED_TAB_IN_DETAIL_WALLET",
  TOGGLE_QUICK_VIEW_TXNS: "TOGGLE_QUICK_VIEW_TXNS",
}

export const SESSION_STORAGE_KEY = {
  IS_KILL_TAB: "IS_KILL_TAB",
}

export const SLTP = {
  DONT_SELL: "You don't have token to sell",
}

export const SL = {
  DONT_SELL: "You don't have token to sell",
}

export const MIN_TIP_VALUE = 0.000001
export const DEFAULT_FEE_VALUE = 0.0001
export const DEFAULT_TIP_VALUE = 0.01
export const MIN_PRICE_TOKEN_SOL = 0.00001
export const SUGGESTION_PRIORITY_FEE = 0.005

//TODO: update to production domain
export const INITIAL_REFERRAL_LINK = `${nextPublicHost}/@`
