'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Function to extract name from email
const getNameFromEmail = (email: string | null | undefined): string => {
  if (!email) return 'Coach';

  // Get the part before @
  const beforeAt = email.split('@')[0];
  if (!beforeAt) return 'Coach';

  // Split on '.' and take the first part
  const firstPart = beforeAt.split('.')[0];
  if (!firstPart) return 'Coach';

  // Remove any trailing non-letter characters
  const cleanName = firstPart.replace(/[^a-zA-Z]+$/, '');
  if (!cleanName) return 'Coach';

  // Capitalize first letter
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
};

export default function WelcomePage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  // Get personalized name from email
  const userName = getNameFromEmail(session?.user?.email);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/summary');
        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
        } else {
          // Fallback to a default message if API fails
          setSummary('Welcome to summer school!');
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        // Fallback to a default message if API fails
        setSummary('Welcome to summer school!');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-2xl px-6 text-center">
        {/* Main content */}
        <div className="space-y-8">
          {/* Greeting */}
          <div className="space-y-4">
            <h2 className="text-6xl font-bold text-gray-900 dark:text-zinc-50">
              Hey {userName}!
            </h2>
            <p className="text-xl text-gray-600 dark:text-zinc-400">
              Welcome to summer school! <br />
              <span className="text-gray-400 dark:text-zinc-500 italic">
                {loading ? 'Loading...' : summary}
              </span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-6 pt-8">
            <Link
              href="/chat"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-2">chat with nisa</h3>
                <p className="text-blue-100 opacity-90">
                  start a conversation with nisa
                </p>
              </div>
            </Link>

            <Link
              href="https://rehearse.nisa.coach"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-8 text-white transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-2">
                  build rehearse session
                </h3>
                <p className="text-green-100 opacity-90">
                  create a deliberate practice session for teachers
                </p>
              </div>
            </Link>

            <Link
              href="https://aishow.nisa.coach"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 p-8 text-white transition-all duration-300 hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-2">create podcast</h3>
                <p className="text-purple-100 opacity-90">
                  create a personalized podcast for your teachers
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
