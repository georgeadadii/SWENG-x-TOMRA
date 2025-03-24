"use client"

import type React from "react"
import ImageSwiper from "@/components/ImageSwiper"
import { Roboto } from "next/font/google"

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

const SwipingPage: React.FC = () => {
  return (
    <div className={`flex h-screen w-full bg-black ${roboto.className} overflow-hidden`}>
      {/* Background gradient effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 30%, rgba(138, 43, 226, 0.8), rgba(0, 0, 255, 0.8))`,
          filter: 'blur(100px)',
        }}
      />
      
      <div className="flex-grow flex items-center justify-center relative z-10 p-0 sm:p-4 h-full">
        <div className="w-full max-w-4xl bg-transparent overflow-hidden">
          <ImageSwiper />
        </div>
      </div>
    </div>
  )
}

export default SwipingPage