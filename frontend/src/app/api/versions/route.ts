export async function GET(request: Request) {
  let data: any = {}

  const encodeEnvObject = (obj: { [key: string]: string | any }) => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "string") {
        const length = 15
        const shortenedEnvValue = obj[key].substring(length)

        obj[key] = "*".repeat(length) + shortenedEnvValue
      }
    })

    return obj
  }

  if (process.env.COMMIT_HASH && request?.url?.includes("?RN7fNgvQUjaaJbX49gjFv4SP")) {
    data = {
      ...data,
      COMMIT_HASH: process.env.COMMIT_HASH,
      NEXT_PUBLIC_API_HOST: process.env.NEXT_PUBLIC_API_HOST,
      NEXT_PUBLIC_API_IMAGE: process.env.NEXT_PUBLIC_API_IMAGE,
      NEXT_PUBLIC_WEBSOCKET_HOST: process.env.NEXT_PUBLIC_WEBSOCKET_HOST,
      NEXT_API_HOST: process.env.NEXT_API_HOST,
      ...encodeEnvObject({
        NEXT_PUBLIC_FINGERPRINT_KEY: process.env.NEXT_PUBLIC_FINGERPRINT_KEY,
        NEXT_PUBLIC_RPC_NETWORK: process.env.NEXT_PUBLIC_RPC_NETWORK,
        NEXT_PUBLIC_RPC_NETWORK_WS: process.env.NEXT_PUBLIC_RPC_NETWORK_WS,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      }),
    }
  }

  return Response.json(data)
}
