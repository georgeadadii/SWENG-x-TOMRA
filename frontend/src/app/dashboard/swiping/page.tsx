"use client"

import type React from "react"
import ImageSwiper from "@/components/ImageSwiper"
import { Roboto } from "next/font/google"

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

const SwipingPage: React.FC = () => {
  return (
    <div className={`flex h-screen w-full bg-black ${roboto.className} overflow-hidden`}>
      {/* Background gradient effect - lighter and more purple */}
      <div
        className="fixed inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 50% 30%, rgba(168, 85, 247, 0.6), rgba(139, 92, 246, 0.6))`,
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />
      
      <div className="flex-grow flex items-center justify-center relative z-10 p-6 h-full w-full bg-transparent rounded-full">
        <div className="w-full max-w-4xl bg-transparent overflow-hidden rounded-3xl shadow-lg shadow-purple-400/20">
          <ImageSwiper />
        </div>
      </div>
    </div>
  )
}

export default SwipingPage