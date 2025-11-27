export enum QUERY_KEY {
  RecentToken = "RecentToken",
}

export enum MUTATION_KEY {
  OnReadNotify = "OnReadNotify",
}

export const QUERY_INFINITE_KEY = "infinite"

export enum QUERY_STALE_TIME {
  Transactions = 1000 * 60 * 1, // 1 minutes in milliseconds
  TrendingTokens = 1000 * 60 * 5, // 5 minutes in milliseconds
  MyHoldings = 1000 * 3, // 3 seconds in milliseconds
  GetHolder = 1000 * 10, // 10 seconds in milliseconds
}

export const QUERY_FALLBACK_DATA: any[] = []
