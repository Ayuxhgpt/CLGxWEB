import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            year?: string;
            branch?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        role: string;
        year?: string;
        branch?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role: string;
        year?: string;
        branch?: string;
    }
}
