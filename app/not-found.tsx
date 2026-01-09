// app/not-found.tsx
import Link from 'next/link'
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa'

export default function NotFound() {
    return (
        <div className="py-8 min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f1425] to-[#0a0e1a] text-white flex items-center justify-center px-4">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Error Code */}
            <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 mb-6">
                <FaExclamationTriangle className="text-5xl text-red-400" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                404
            </h1>
            <p className="text-xl md:text-2xl font-semibold mt-4">Page Not Found</p>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
                The property you're looking for seems to have been moved or doesn't exist.
            </p>
            </div>

            {/* Search Suggestion */}
            <div className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-3 mb-4">
                <FaSearch className="text-blue-400" />
                <h3 className="text-lg font-semibold">Looking for something specific?</h3>
            </div>
            <p className="text-gray-400 mb-4">
                Try browsing our available properties or use the search feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                href="/blog" 
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                View All Properties
                </Link>
                <Link 
                href="/" 
                className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                Back to Home
                </Link>
            </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link 
                href="/"
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                <FaHome className="text-xl text-blue-400" />
                </div>
                <h4 className="font-semibold mb-1">Homepage</h4>
                <p className="text-sm text-gray-400">Return to main page</p>
            </Link>
            
            <Link 
                href="/blog"
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-3 group-hover:scale-110 transition-transform">
                <FaSearch className="text-xl text-green-400" />
                </div>
                <h4 className="font-semibold mb-1">Properties</h4>
                <p className="text-sm text-gray-400">Browse all listings</p>
            </Link>
            
            <Link 
                href="/chat"
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 mb-3 group-hover:scale-110 transition-transform">
                <FaExclamationTriangle className="text-xl text-amber-400" />
                </div>
                <h4 className="font-semibold mb-1">Need Help?</h4>
                <p className="text-sm text-gray-400">Contact support</p>
            </Link>
            </div>

            {/* Contact Info */}
            <div className="text-sm text-gray-500">
            <p>Still having trouble? Contact our support team</p>
            <p className="mt-1">Email: abidextradingnigltd@gmail.com | Phone: +2349136552111</p>
            </div>
        </div>
        </div>
    )
}