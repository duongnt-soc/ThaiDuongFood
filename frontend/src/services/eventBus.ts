type EventCallback<T> = (event: T) => void

class EventBus {
  private listeners: Map<string, EventCallback<any>[]> = new Map()
  private currentValues: Map<string, any> = new Map()
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development"
  }

  // Helper method to log messages only in development mode
  private logGroup(eventName: string, message: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(`EventBus: ${eventName} ${!!message}`)
      // eslint-disable-next-line no-console
      console.log(message)
      // eslint-disable-next-line no-console
      console.groupEnd()
    }
  }

  // Register an event listener
  on<T>(eventName: string, listener: EventCallback<T>): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName)?.push(listener as EventCallback<any>)

    this.logGroup(
      `Registering listener for event: ${eventName}`,
      `Listener registered: ${listener}`
    )
  }

  // Emit an event to all registered listeners
  emit<T>(eventName: string, event: T, isSaveValue = true): void {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        listener(event)
      })
    }

    if (isSaveValue) {
      this.currentValues.set(eventName, event)
    }

    this.logGroup(`Emitting event: ${eventName}`, `Event data: ${JSON.stringify(event)}`)
  }

  // Get the current value of a specific event
  getCurrentValue<T>(eventName: string): T | undefined {
    return this.currentValues.get(eventName)
  }

  setCurrentValue(eventName: string, value: any): void {
    this.currentValues.set(eventName, value)
  }

  removeCurrentValue(eventName: string): void {
    this.currentValues.delete(eventName)
  }

  // Remove a specific listener for an event
  off<T>(eventName: string, listener: EventCallback<T>): void {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      this.listeners.set(
        eventName,
        eventListeners.filter((l) => l !== listener)
      )
    }

    this.logGroup(`Removing listener for event: ${eventName}`, `Listener removed: ${listener}`)
  }

  // Remove all listeners for an event
  offAll(eventName: string): void {
    this.listeners.delete(eventName)
    this.currentValues.delete(eventName)

    this.logGroup(
      `Removing all listeners for event: ${eventName}`,
      `All listeners removed for event: ${eventName}`
    )
  }
}

export const EVENT_BUS_KEY = {
  NEW_TRANSACTIONS: "NEW_TRANSACTIONS",
  TRANSACTIONS_IN_CHART: "TRANSACTIONS_IN_CHART",
  IS_CHART_READY: "IS_CHART_READY",
  IS_SHOW_MY_TRADE: "IS_SHOW_MY_TRADE",
  CONNECT_WALLET: "CONNECT_WALLET",
  DISCONNECT_WALLET: "DISCONNECT_WALLET",
  IS_CONNECTING_WALLET: "IS_CONNECTING_WALLET",
  PORTFOLIO: "PORTFOLIO",
  IS_SHOW_PRICE_LINE: "IS_SHOW_PRICE_LINE",
  IS_FILTER_TRANSACTION_LIST: "IS_FILTER_TRANSACTION_LIST",
  MARKS_UPDATE: "MARKS_UPDATE",
  ACCOUNT_INFO: "ACCOUNT_INFO",
  UPDATING_CHART: "UPDATING_CHART",
  OPEN_ORDERS: "OPEN_ORDERS",
  OPEN_ORDERS_IS_STALE: "OPEN_ORDER_IS_STALE",
  REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED",
  IS_SHOW_DEV_TRADES: "IS_SHOW_DEV_TRADES",
  IS_SHOW_INSIDERS_TRADES: "IS_SHOW_INSIDERS_TRADES",
  IS_SHOW_SNIPERS_TRADES: "IS_SHOW_SNIPERS_TRADES",
  REFRESH_MY_TRADES: "REFRESH_MY_TRADES",
  CHART_DATA: "CHART_DATA",
  IS_CALLING_CHART_DATA: "IS_CALLING_CHART_DATA",
  MOCK_ORDER: "MOCK_ORDER",
  SYNC_MOCK_ORDER: "SYNC_MOCK_ORDER",
  SELL_ALL: "SELL_ALL",
  IS_DISABLE_SELL_ALL: "IS_DISABLE_SELL_ALL",
  SIGNER_SEARCH: "SIGNER_SEARCH",
  IS_PAUSE_TXNS: "IS_PAUSE_TXNS",
  MAKER_QUANTITY: "MAKER_QUANTITY",
  BUYS_LIMIT: "BUYS_LIMIT",
  MOCK_BUY_LIMIT: "MOCK_BUY_LIMIT",
  SYNC_MOCK_BUY_LIMIT: "SYNC_MOCK_BUY_LIMIT",
  SELL_LIMIT: "SELL_LIMIT",
  MOCK_SELL_LIMIT: "MOCK_SELL_LIMIT",
  SYNC_MOCK_SELL_LIMIT: "SYNC_MOCK_SELL_LIMIT",
  IS_FIRST_REQUEST_CHART: "IS_FIRST_REQUEST_CHART",
  IS_CHANGE_TAB_IN_TOP_WALLET: "IS_CHANGE_TAB_IN_TOP_WALLET",
  IS_REFETCH_WALLET: "IS_REFETCH_WALLET",
  SYNC_ACCOUNT_INFO: "SYNC_ACCOUNT_INFO",
  TOKEN_VIRTUAL_ITEMS: "TOKEN_VIRTUAL_ITEMS",
  LINK_WALLET: "LINK_WALLET",
  MULTI_WALLETS: "MULTI_WALLETS",
  IS_PAUSE_NEW_TOKENS: "IS_PAUSE_NEW_TOKENS",
  SELECTED_WALLET_IN_CHART: "SELECTED_WALLET_IN_CHART",
  OPEN_REMINDER_CONNECT_WALLET_POPUP: "OPEN_REMINDER_CONNECT_WALLET_POPUP",
  CONFIMED_SELL_ALL: "CONFIMED_SELL_ALL",
  LISTEN_FOLLOW_WALLET: "LISTEN_FOLLOW_WALLET",
  GET_NEW_TOKEN_PUMP_TO_MOON: "GET_NEW_TOKEN_PUMP_TO_MOON",
  TOGGLE_QUICK_VIEW_TXNS: "TOGGLE_QUICK_VIEW_TXNS",
  TOGGLE_QUICK_VIEW_TXNS_ON_CHANGE_TAB: "TOGGLE_QUICK_VIEW_TXNS_ON_CHANGE_TAB",
  SYNC_NEW_TRANSACTIONS: "SYNC_NEW_TRANSACTIONS",
  TRIGGER_REDIRECT_TOKEN: "TRIGGER_REDIRECT_TOKEN",
  TRIGGER_BUY: "TRIGGER_BUY",
  TRANSACTIONS_IN_CHART_SIGNAL: "TRANSACTIONS_IN_CHART_SIGNAL",
  MARKERS_IN_CHART_SIGNAL: "MARKERS_IN_CHART_SIGNAL",
  CHART_DATA_CHART_TYPE: "CHART_DATA_CHART_TYPE",
  CHART_DATA_PRICE_TYPE: "CHART_DATA_PRICE_TYPE",
  IS_HIDE_SMALL_ASSETS: "IS_HIDE_SMALL_ASSETS",
  PRICE_TYPE_IN_SWAP_EXCHANGE: "PRICE_TYPE_IN_SWAP_EXCHANGE",
} as const

const eventBus = new EventBus()
export default eventBus

//FOR DEBUG
// if (typeof window !== 'undefined') {
//   (window as any).eventBus = eventBus;
// }
