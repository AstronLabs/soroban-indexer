import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, Zap, FileCode, Layers } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soroban Indexer",
  description: "Historical data indexer for Soroban smart contracts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800">
            <div className="h-16 flex items-center px-6 border-b border-gray-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></div>
              <h1 className="font-bold text-lg tracking-tight">Soroban Indexer</h1>
            </div>
            
            <nav className="p-4 space-y-1">
              <Link href="/" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
                Overview
              </Link>
              <Link href="/events" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                <Zap className="mr-3 h-5 w-5 text-gray-400" />
                Events
              </Link>
              <Link href="/contracts" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                <FileCode className="mr-3 h-5 w-5 text-gray-400" />
                Contracts
              </Link>
              <Link href="/ledgers" className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                <Layers className="mr-3 h-5 w-5 text-gray-400" />
                Ledgers
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
