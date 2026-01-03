// app/admin/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseconfig';
import { useRouter, usePathname } from 'next/navigation';
import { FaSpinner, FaSignOutAlt, FaUser } from 'react-icons/fa';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // If not logged in and not on login page, redirect to login
      if (!currentUser && !pathname.includes('/admin/login')) {
        router.push('/admin/login');
      }
      
      // If logged in and on login page, redirect to admin
      if (currentUser && pathname.includes('/admin/login')) {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, show nothing (will redirect)
  if (!user && !pathname.includes('/admin/login')) {
    return null;
  }

  // If on login page, just show the login page without header
  if (pathname.includes('/admin/login')) {
    return children;
  }

  // If logged in, show admin layout with header
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Admin Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Abidex Admin
                        </h1>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <FaUser className="text-xs" />
                            </div>
                            <span>{user?.email}</span>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className="absolute md:static top-22 right-4 flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg text-sm transition"
                        >
                            <FaSignOutAlt />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
      
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 md:px-8 py-8">
            {children}
        </main>
    </div>
  );
}