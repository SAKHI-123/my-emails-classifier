import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// 1. Extend the default Session type
declare module "next-auth" {
    interface Session {
        /** The Access Token from the provider (e.g., Google) */
        accessToken?: string;
        /** Used to signal a token refresh failure */
        error?: "RefreshAccessTokenError";
        // You can also add your User properties here if needed
        user: {
            // id: string; // example of adding a custom user property
        } & DefaultSession["user"];
    }

    // 2. Extend the default User type (optional, but good practice)
    interface User extends DefaultUser {
        // id: string;
    }
}

// 3. Extend the default JWT type
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number; // Unix timestamp in milliseconds
        error?: "RefreshAccessTokenError";
    }
}