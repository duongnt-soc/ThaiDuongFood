import { useRouter } from "next/navigation"
import React, { ElementType } from "react"

import { COOKIE_KEY, getCookie } from "@/utils/cookies"

const withAuth = (WrappedComponent: ElementType) => {
  const AuthComponent = (props: any) => {
    const route = useRouter()
    const isLogin = getCookie(COOKIE_KEY.IS_LOGIN)

    if (isLogin) {
      return <WrappedComponent {...props} />
    } else {
      route.push("/")
    }
  }

  return AuthComponent
}

export default withAuth
