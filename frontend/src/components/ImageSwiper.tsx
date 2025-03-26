"use client";

import { gql, useQuery, useMutation } from "@apollo/client"
import client from "@/lib/apolloClient"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, AlertCircle, CircleHelp } from "lucide-react"
import Button from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

interface ImageData {
  imageUrl: string;
  classLabel: string;
  confidence: number;
  classified: boolean;
  misclassified: boolean;
  reviewed?: boolean;
  batchId?: string;
  createdAt?: string; 
}

const GET_IMAGES = gql`
  query GetImages {
    results {
      imageUrl
      classLabel
      confidence
      classified
      misclassified
      reviewed
      batchId
    }
  }
`;

const STORE_FEEDBACK = gql`
  mutation StoreFeedback($imageUrl: String!, $classified: Boolean, $misclassified: Boolean, $reviewed: Boolean) {
    storeFeedback(imageUrl: $imageUrl, classified: $classified, misclassified: $misclassified, reviewed: $reviewed)
  }
`;


export default function ImageSwiper() {
  const { data, loading, error } = useQuery<{ results?: ImageData[] }>(GET_IMAGES, {
    client,
    onError: (err) => console.error("GraphQL Query Error:", err),
  });

  const [storeFeedback] = useMutation(STORE_FEEDBACK, {
    client,
    onError: (err) => console.error("Mutation Error:", err),
  });

  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [images, setImages] = useState<ImageData[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  // References to the buttons for adding/removing classes
  const leftButtonRef = useRef<HTMLButtonElement>(null)
  const rightButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    console.log("🚀 GraphQL Data Loaded:", data)

    if (data?.results) {
      const unreviewed = data.results.filter((img) => img.reviewed !== true)
      console.log("✅ Unreviewed Images:", unreviewed)
      setImages(unreviewed)
    }
  }, [data])
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [availableBatches, setAvailableBatches] = useState<{ value: string; label: string }[]>([]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "a" || event.key === "ArrowLeft") && images.length > 0 && direction === null) {
        // Add visual effect to the left button
        if (leftButtonRef.current) {
          leftButtonRef.current.classList.add("bg-red-400/20", "border-red-400", "shadow-[0_0_15px_rgba(248,113,113,0.4)]")
        }
        handleSwipe("left")
      } else if ((event.key === "d" || event.key === "ArrowRight") && images.length > 0 && direction === null) {
        // Add visual effect to the right button
        if (rightButtonRef.current) {
          rightButtonRef.current.classList.add("bg-green-400/20", "border-green-400", "shadow-[0_0_15px_rgba(74,222,128,0.4)]")
        }
        handleSwipe("right")
      }
    }
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "a" || event.key === "ArrowLeft") {
        // Remove visual effect from the left button
        if (leftButtonRef.current) {
          setTimeout(() => {
            leftButtonRef.current?.classList.remove("bg-red-400/20", "border-red-400", "shadow-[0_0_15px_rgba(248,113,113,0.4)]")
          }, 300)
        }
      } else if (event.key === "d" || event.key === "ArrowRight") {
        // Remove visual effect from the right button
        if (rightButtonRef.current) {
          setTimeout(() => {
            rightButtonRef.current?.classList.remove("bg-green-400/20", "border-green-400", "shadow-[0_0_15px_rgba(74,222,128,0.4)]")
          }, 300)
        }
      }
    }
  
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [images, direction])
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [images])

  
useEffect(() => {
  if (data?.results) {

    //Grouping images by batchId and sorting batches by creation date
    const groupedImages = data.results.reduce((acc, image) => {
      const batchId = image.batchId || "uncategorized";
      if (!acc[batchId]) {
        acc[batchId] = [];
      }
      acc[batchId].push(image);
      return acc;
    }, {} as Record<string, ImageData[]>);

    //Sorting by createdAt
    const sortedBatches = Object.entries(groupedImages).sort((a, b) => {
      const dateA = new Date(a[1][0]?.createdAt || 0).getTime();
      const dateB = new Date(b[1][0]?.createdAt || 0).getTime();
      return dateA - dateB;
    });

  
    const batchOptions = [
      { value: "all", label: "All batches" },
      ...sortedBatches.map(([batchId], index) => ({
        value: batchId,
        label: `Batch ${index + 1}`,
      })),
    ];

    setAvailableBatches(batchOptions);
   
    let filteredImages = data.results.filter((img) => img.reviewed !== true);
    if (batchFilter !== "all") {
      filteredImages = filteredImages.filter((img) => img.batchId === batchFilter);
    }
    setImages(filteredImages);
  }
}, [data, batchFilter]);


  const handleSwipe = async (swipeDirection: "left" | "right") => {
    if (images.length === 0) return;
    const currentImage = images[0];
    const classified = swipeDirection === "right";
    const misclassified = swipeDirection === "left";

    try {
      await storeFeedback({
        variables: { imageUrl: currentImage.imageUrl, classified, misclassified, reviewed: true },
      });
    } catch (err) {
      console.error("Failed to store feedback:", err);
    }

    setDirection(swipeDirection);
    setTimeout(() => {
      setDirection(null);
      setImages((prev) => (prev.length > 1 ? prev.slice(1) : []));
      setActiveImageIndex((prev) => prev + 1);
    }, 400);
  };

  return (
    <>    
      <div className="mb-4 flex justify-between items-center px-4 pt-4 bg-transparent">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Image Swiper</h2>
        <Dialog>
          <DialogTrigger>
            {/* Using the new purple variant */}
            <Button 
              variant="purple" 
              size="icon" 
              hoverEffect="purple"
            >
              <CircleHelp className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/90 border-purple-300/30 text-white rounded-2xl backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-purple-200">About the Image Swiper</DialogTitle>
              <DialogDescription className="text-gray-300">
                The image swiper allows you to review images efficiently by swiping left or right. You need to swipe
                left when you see a misclassified image and right if you see an image with the right label.
              </DialogDescription>
            </DialogHeader>
            <p className="my-4 text-sm text-gray-300">
                Click the left arrow, or press the key "A" or the left arrow key on your keyboard to swipe left.
            </p>
            <p className="my-4 text-sm text-gray-300">
                Click the right arrow, or press the key "D" or the right arrow key on your keyboard to swipe right.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    
      <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto p-6 bg-purple-900/30 backdrop-blur-sm rounded-3xl overflow-hidden relative border border-purple-300/30 shadow-lg shadow-purple-400/10">
    <>
      <div className="mb-6 flex justify-between items-center w-full">
        {/* Dropdown for selecting batch filter */}
        <Dropdown
          trigger={
            <Box variant="outline" className="w-[200px] justify-between">
              <span className="text-sm truncate">
                {batchFilter !== "all" ? `Filtering: ${batchFilter}` : "Filter by Batch"}
              </span>
            </Box>
          }
        >
          {availableBatches.map((filter) => (
            <DropdownItem key={filter.value} onClick={() => setBatchFilter(filter.value)}>
              {filter.label}
            </DropdownItem>
          ))}
        </Dropdown>

        <Dialog>
          <DialogTrigger>
            <Box variant="outline" size="icon">
              <CircleHelp className="h-4 w-4" />
            </Box>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About the Image Swiper</DialogTitle>
              <DialogDescription>
                The image swiper lets you review images by swiping left for misclassified and right for correctly
                classified images.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

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
              <div className="bg-purple-700/80 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 border border-purple-400/50">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-semibold">Oops! We couldn't load the images.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm z-40 rounded-3xl">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-300 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-blue-300 animate-spin animation-delay-150"></div>
            </div>
          </div>
        )}
        
        {/* Background gradient effect */}
        <div
          className="absolute inset-0 opacity-40 z-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4), rgba(139, 92, 246, 0.3))`,
            filter: 'blur(40px)',
          }}
        />

        <div className="flex items-center justify-center w-full z-10">
          {/* Using the new red variant */}
          <Button
            ref={leftButtonRef}
            onClick={() => handleSwipe("left")}
            disabled={direction !== null || images.length === 0}
            size="icon"
            variant="red"
            hoverEffect="red"
            className="mr-4"
          >
            <ChevronLeft aria-label="chevron-left" className="h-6 w-6" />
          </Button>

        <div className="flex items-center justify-center w-full">
        <Button
          onClick={() => handleSwipe("left")}
          disabled={direction !== null || images.length === 0}
          size="icon"
          variant="outline"
          className="mr-4 transition-all duration-300 ease-in-out hover:bg-red-50 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        >
          <ChevronLeft aria-label="chevron-left" className="h-6 w-6" />
        </Button>

          <div className="relative w-[280px] h-[350px] flex items-center justify-center bg-black/30 rounded-2xl overflow-hidden border border-purple-300/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            {images.length === 0 && !loading ? (
              <div className="text-center p-4">
                <p className="text-purple-200 text-lg mb-2">🎉 All images reviewed!</p>
                <p className="text-gray-300 text-sm">Check back later for more images to classify</p>
              </div>
            ) : (
              <AnimatePresence>
                {images.slice(0, 1).map((image) => (
                  <motion.div
                    key={`${image.imageUrl}-${activeImageIndex}`}
                    className="absolute w-full h-full overflow-hidden rounded-2xl"
                    initial={{ scale: 1, y: 0, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ x: direction === "right" ? 1000 : -1000, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <img src={image.imageUrl || "/placeholder.svg"} alt={image.classLabel} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <p className="text-white text-lg font-bold">{image.classLabel}</p>
                      <div className="flex items-center mt-1">
                        <div className="h-1.5 w-full bg-gray-700/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" 
                            style={{ width: `${image.confidence * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-gray-300 text-sm ml-2 min-w-[60px]">
                          {(image.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Using the new green variant */}
          <Button
            ref={rightButtonRef}
            onClick={() => handleSwipe("right")}
            disabled={direction !== null || images.length === 0}
            size="icon"
            variant="green"
            hoverEffect="green"
            className="ml-4"
          >
            <ChevronRight aria-label="chevron-right" className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 flex space-x-8 text-xs text-gray-300">
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center mr-2 bg-red-400/10 border border-red-400/30 rounded-full">
              <span className="text-red-200">A</span>
            </div>
            <span>Misclassified</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center mr-2 bg-green-400/10 border border-green-400/30 rounded-full">
              <span className="text-green-200">D</span>
            </div>
            <span>Correct</span>
          </div>
        </div>
      </div>
    </>
  )
}