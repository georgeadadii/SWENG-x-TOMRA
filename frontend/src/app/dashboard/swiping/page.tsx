"use client"

import type React from "react"

import ImageSwiper from "@/components/ImageSwiper"

const SwipingPage: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-gray-50">
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
          <ImageSwiper />
        </div>
      </div>
    </div>
  )
}

export default SwipingPage