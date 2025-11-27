export const apiBaseUrl: string = String(process.env.NEXT_PUBLIC_API_HOST)
export const nextPublicHost: string = String(process.env.NEXT_PUBLIC_HOST)

export const imageBaseUrl = String(process.env.NEXT_PUBLIC_API_IMAGE || apiBaseUrl)

export const defaultMetadataImage = `${nextPublicHost}/images/main-site-thumbnail.png`
