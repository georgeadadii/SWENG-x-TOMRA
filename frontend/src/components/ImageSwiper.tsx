"use client"

import { gql, useQuery } from "@apollo/client"
import client from "@/lib/apolloClient"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageData {
  imageUrl: string
  classLabel: string
  confidence: number
}

const GET_IMAGES = gql`
  query GetImages {
    results {
      imageUrl
      classLabel
      confidence
    }
  }
`

export default function ImageSwiper() {
  const { data, loading, error } = useQuery<{ results?: ImageData[] }>(GET_IMAGES, { client })
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [images, setImages] = useState<ImageData[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (data?.results) {
      setImages(data.results)
    }
  }, [data])

  const handleSwipe = (swipeDirection: "left" | "right") => {
    if (images.length === 0) return

    setDirection(swipeDirection)

    setTimeout(() => {
      setDirection(null)

      setImages((prevImages) => {
        if (prevImages.length > 1) {
          return prevImages.slice(1)
        } else {
          return []
        }
      })

      setActiveImageIndex((prevIndex) => prevIndex + 1)
    }, 400)
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="fixed left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">Oops! We couldn't load the images.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      <div className="flex items-center justify-center w-full">
        <Button
          onClick={() => handleSwipe("left")}
          disabled={direction !== null || images.length === 0}
          size="icon"
          variant="outline"
          className="mr-4 transition-all duration-300 ease-in-out hover:bg-red-50 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="relative w-[300px] h-[400px] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
          {images.length === 0 && !loading ? (
            <p className="text-gray-500 text-lg">No images available</p>
          ) : (
            <AnimatePresence>
              {images.slice(0, 1).map((image, index) => (
                <motion.div
                  key={`${image.imageUrl}-${activeImageIndex}`}
                  className="absolute w-full h-full overflow-hidden rounded-xl"
                  initial={{ scale: 1, y: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    x: direction ? (direction === "right" ? 1000 : -1000) : 0,
                  }}
                  exit={{
                    x: direction === "right" ? 1000 : -1000,
                    opacity: 0,
                    rotateY: direction === "right" ? 45 : -45,
                    transition: { duration: 0.4, ease: "easeInOut" },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <img
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.classLabel}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-lg font-bold">{image.classLabel}</p>
                    <p className="text-gray-300 text-sm">Confidence: {(image.confidence * 100).toFixed(2)}%</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <Button
          onClick={() => handleSwipe("right")}
          disabled={direction !== null || images.length === 0}
          size="icon"
          variant="outline"
          className="ml-4 transition-all duration-300 ease-in-out hover:bg-green-50 hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

