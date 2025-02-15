"use client";

import Sidebar from "@/components/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen bg-gray-100 font-mona">
      <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-50">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64 overflow-y-auto h-screen p-6">
        {children}
      </div>
    </div>
  );
}
