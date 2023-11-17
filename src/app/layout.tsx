import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"

import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/navbar'
import { cn } from '@/lib/utils'

import SessionServer from '@/components/session.server'
import { Suspense } from 'react'
import './globals.css'

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'DBMS',
  description: 'Description...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Navbar />
        <Suspense>
          <SessionServer>
            {children}
          </SessionServer>
        </Suspense>
        
        <Toaster />
      </body>
    </html>
  )
}
