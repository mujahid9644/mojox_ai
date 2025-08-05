// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils' // আমরা এই helper ফাংশনটি একটু পরেই তৈরি করব

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'MoJo AI - আপনার স্মার্ট চ্যাট অ্যাসিস্ট্যান্ট',
  description: 'বাংলাদেশের জন্য তৈরি একটি ভয়েস কন্ট্রোলড AI অ্যাসিস্ট্যান্ট',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn" className="dark" style={{colorScheme: 'dark'}}>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        
        {children}
      </body>
    </html>
  )
}