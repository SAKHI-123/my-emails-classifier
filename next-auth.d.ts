import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// 1. Extend the JWT interface
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
    }
}

// 2. Extend the Session interface
declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}