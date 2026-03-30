import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getSupabaseCredentials } from "@/lib/supabase/env"

// Force dynamic rendering to ensure env vars are read at request time
export const dynamic = "force-dynamic"
export const revalidate = 0

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "PreNatal Care - Patient Management System",
  description: "Modern prenatal patient management system for healthcare providers",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Use the env module which caches values at module import time
  const { url, anonKey } = getSupabaseCredentials()

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SUPABASE_URL = ${JSON.stringify(url || null)};
              window.__SUPABASE_ANON_KEY = ${JSON.stringify(anonKey || null)};
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
