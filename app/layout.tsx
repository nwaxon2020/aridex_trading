import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '../components/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prime Properties | Luxury Real Estate',
  description: 'Find your dream home with our premium property services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* AdSense script here */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7919953215202471"
          crossOrigin="anonymous"
        />
      </head>

      <body className={`${inter.className} bg-black text-white`}>
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none" />
        <div className="relative z-10">
          <Nav/>
          {children}
        </div>
      </body>
    </html>
  )
}