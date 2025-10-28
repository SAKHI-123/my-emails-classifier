// my-emails-classifier/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// Import any other providers/adapters you are using

export const authOptions: NextAuthOptions = {
    // 1. ADD YOUR PROVIDERS HERE
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            // 2. IMPORTANT: You must define your scopes here
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
                },
            },
        }),
        // ...other providers
    ],
    // 3. ADD YOUR CALLBACKS, SESSION STRATEGY, ETC.
    callbacks: {
        async jwt({ token, account }) {
            // Persist the access_token to the token right after sign-in
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            // Send the access_token to the client-side session object
            session.accessToken = token.accessToken;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
