// app/admin/login/page.tsx
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseconfig';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaEnvelope, FaSignInAlt, FaEye, FaEyeSlash, FaShieldAlt, FaHome } from 'react-icons/fa';

export default function LoginPageUi() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/admin');
        } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            setError('No admin account found.');
        } else if (error.code === 'auth/wrong-password') {
            setError('Incorrect password.');
        } else {
            setError('Login failed. Please try again.');
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                <FaShieldAlt className="text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
                Admin Access
            </h1>
            <p className="text-gray-400">
                Enter your credentials to continue
            </p>
            </div>

            {/* Login Form */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FaEnvelope className="text-blue-400" />
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@abidex.com"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white transition"
                />
                </div>

                {/* Password */}
                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FaLock className="text-purple-400" />
                    Password
                </label>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white pr-12 transition"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                </div>

                {/* Error Message */}
                {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl">
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
                )}

                {/* Submit Button */}
                <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                    <FaSignInAlt />
                    Sign In
                    </>
                )}
                </button>
            </form>

            {/* Back to Home */}
            <div className="mt-8 pt-6 border-t border-gray-700">
                <Link 
                href="/" 
                className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 transition"
                >
                <FaHome />
                Back to Homepage
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}