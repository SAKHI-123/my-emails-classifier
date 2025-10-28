import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// 1. Declare Module Augmentation to fix TypeScript errors
// This is done inline for copy-paste simplicity, but usually belongs in a .d.ts file.
declare module "next-auth" {
    interface Session {
        accessToken?: string;
        error?: "RefreshAccessTokenError";
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number; 
        error?: "RefreshAccessTokenError";
    }
}
// --- End of Type Augmentation ---


// CRITICAL: The scope needed to read the user's emails
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

// Helper function to refresh the expired token
async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const url =
            "https://oauth2.googleapis.com/token?" +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID as string,
                client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string,
            });

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        // Return the new token with updated access token and expiry time
        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, 
        };
    } catch (error) {
        console.error("Token Refresh Error:", error);
        // Indicate an error so the user is forced to sign in again
        return { ...token, error: "RefreshAccessTokenError" };
    }
}


// 💡 EXPORT THE CONFIGURATION OBJECT
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: `openid email profile ${GMAIL_READONLY_SCOPE}`,
                    // 🔑 CRITICAL: These parameters ensure a refresh token is requested
                    prompt: "consent",
                    access_type: "offline", 
                },
            },
        }),
    ],
    // 🔑 MUST set strategy to "jwt" for the token refresh logic to work
    session: { strategy: "jwt" }, 
    
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign-in: Save tokens and expiry
            if (account && user) {
                // 💡 Fix for 'account.expires_in' is of type 'unknown'
                const expires_in = account.expires_in ?? 0; 
                
                return {
                    accessToken: account.access_token,
                    // Convert expiry to milliseconds from now
                    accessTokenExpires: Date.now() + (expires_in as number) * 1000, 
                    refreshToken: account.refresh_token, 
                    user,
                };
            }

            // Return previous token if the access token has not expired yet
            // Subtracting 5 seconds (5 * 1000) as a buffer
            // Use optional chaining and type assertion for safety
            if (Date.now() < (token.accessTokenExpires ?? 0) - 5000) {
                return token;
            }

            // Access token has expired, try to refresh it
            return refreshAccessToken(token);
        },
        
        // This session callback passes the access token to the session object
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Pass the exported object to NextAuth
const handler = NextAuth(authOptions);

// Export the GET and POST handlers
export { handler as GET, handler as POST };