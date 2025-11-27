export const FEATURE_FLAGS = {
  WITHDRAW: "WITHDRAW",
  AUTO_TRADE: "AUTO_TRADE",
} as const

export type FeatureFlagType = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]

export const ROUTES_FLAG: Record<string, string> = {
  "/wallets-management?type=withdraw": FEATURE_FLAGS.WITHDRAW,
  "/trading-bots": FEATURE_FLAGS.AUTO_TRADE,
  "/portfolio?type=trading-bots": FEATURE_FLAGS.AUTO_TRADE,
}
