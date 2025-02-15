"use client"

import { gql, useQuery } from "@apollo/client"
import client from "@/lib/apolloClient"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"

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

const SAMPLE_IMAGES: ImageData[] = [
  { imageUrl: "https://picsum.photos/seed/1/300/400", classLabel: "Sample 1", confidence: 1 },
  { imageUrl: "https://picsum.photos/seed/2/300/400", classLabel: "Sample 2", confidence: 1 },
  { imageUrl: "https://picsum.photos/seed/3/300/400", classLabel: "Sample 3", confidence: 1 },
]

export default function ImageSwiper() {
  const { data, loading, error } = useQuery<{ results?: ImageData[] }>(GET_IMAGES, { client })
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [images, setImages] = useState<ImageData[]>([])

  useEffect(() => {
    if (data?.results && data.results.length > 0) {
      setImages(data.results)
    } else if (error || (!loading && images.length === 0)) {
      setImages(SAMPLE_IMAGES)
    }
  }, [data, error, loading, images.length])

  const handleSwipe = (swipeDirection: "left" | "right") => {
    if (images.length > 0) {
      setDirection(swipeDirection)
      setTimeout(() => {
        setImages((prevImages) => {
          const [removedImage, ...remainingImages] = prevImages
          return [...remainingImages, removedImage]
        })
        setDirection(null)
      }, 300)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-black to-purple-900 overflow-hidden">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="ml-[-140px] bg-red-500 text-white px-6 py-1 rounded-lg shadow-lg flex items-center space-x-2 backdrop-blur-sm bg-opacity-90">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">Oops! We couldn't load the images. Showing sample images instead.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      <div className="flex items-center justify-center w-full max-w-4xl">
        <Button
          onClick={() => handleSwipe("left")}
          disabled={direction !== null || images.length === 0}
          size="icon"
          variant="outline"
          className="mr-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="relative w-[300px] h-[400px] flex items-center justify-center perspective-1000">
          {images.length === 0 ? (
            <p className="text-white text-lg">No images available</p>
          ) : (
            <AnimatePresence>
              {images.slice(0, 3).map((image, index) => (
                <motion.div
                  key={image.imageUrl}
                  className="absolute w-full h-full overflow-hidden rounded-lg shadow-2xl"
                  style={{
                    zIndex: images.length - index,
                    transformStyle: "preserve-3d",
                  }}
                  initial={index === 0 ? { scale: 1, x: 0, rotateY: 0 } : { scale: 1 - index * 0.05, rotateY: -5 }}
                  animate={{
                    scale: 1 - index * 0.05,
                    y: index * -20,
                    x: index === 0 && direction ? (direction === "right" ? 1000 : -1000) : 0,
                    rotateY: index === 0 ? 0 : -5,
                  }}
                  exit={
                    index === 0
                      ? {
                          x: direction === "right" ? 1000 : -1000,
                          opacity: 0,
                          rotateY: direction === "right" ? 45 : -45,
                          transition: { duration: 0.3 },
                        }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-lg shadow-lg shadow-purple-500/50" />
                  <img
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.classLabel}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-lg font-bold">{image.classLabel}</p>
                    <p className="text-purple-300 text-sm">Confidence: {(image.confidence * 100).toFixed(2)}%</p>
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
          className="ml-4"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
      <div className="mt-4 text-white text-sm">
        <p>Debug Info:</p>
        <p>Images loaded: {images.length}</p>
        <p>Loading state: {loading ? "Loading" : "Not loading"}</p>
        <p>Error state: {error ? "Error occurred" : "No error"}</p>
      </div>
    </div>
  )
}

