'use client'; // 👈 MUST be a client component to use useSession

import { signIn, signOut, useSession } from 'next-auth/react';

// --- Placeholder Component for the Main Application ---

function EmailDashboard() {
  // We can access the access token here if needed, e.g., session.accessToken
  const { data: session } = useSession(); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-green-700">
          Authentication Successful! 🎉
        </h1>
        <p className="text-lg mb-6 text-gray-700">
          Welcome, {session?.user?.name || 'User'}!
          <br />
          Your Google Access Token is now available for fetching emails.
        </p>
        <button
          onClick={() => signOut()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 shadow-md"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// --- Login Component ---

function LoginComponent() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    MagicSlides Email Classifier
                </h2>
                <button
                    onClick={() => signIn('google')}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.01]"
                >
                    {/* Google Icon SVG */}
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.000 12.000c0-1.15-.103-2.25-.297-3.32h-9.703v4.24h5.45c-.244 1.258-.94 2.317-1.92 3.09v3.66h4.78c2.802-2.583 4.49-6.398 4.49-10.67z" />
                        <path d="M12.000 24.000c3.24 0 5.95-.98 7.93-2.66l-4.78-3.66c-1.33 1.01-3.03 1.6-5.15 1.6-3.95 0-7.3-2.65-8.49-6.2h-4.93v3.83c1.97 3.89 6.09 6.64 10.37 6.64z" />
                        <path d="M3.51 14.8c-.187-.604-.288-1.24-.288-1.89s.101-1.286.288-1.89v-3.83h-4.93c-.496.984-.77 2.072-.77 3.22s.274 2.236.77 3.22l4.93 3.83z" />
                        <path d="M12 7.35c2.16 0 3.73.91 4.57 1.72l3.35-3.35c-2.01-1.85-4.83-2.92-7.92-2.92-4.28 0-8.39 2.75-10.37 6.64l4.93 3.83c1.19-3.55 4.54-6.2 8.49-6.2z" />
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function Home() {
  // Use the hook to get the session data
  const { data: session, status } = useSession();

  // Show a loading screen while authentication status is being determined
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading session...</p>
      </div>
    );
  }

  // If the user is logged in, show the main dashboard
  if (session) {
    return <EmailDashboard />;
  }

  // If the user is not logged in, show the login button
  return <LoginComponent />;
}