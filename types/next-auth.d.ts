import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            isBlocked: boolean
            isVerified?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
        isBlocked: boolean
        isVerified?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        isBlocked: boolean
        isVerified?: boolean
    }
}
