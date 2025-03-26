"use client";

import { gql, useQuery, useMutation } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Box } from "./ui/box";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

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

  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [availableBatches, setAvailableBatches] = useState<{ value: string; label: string }[]>([]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "a" || event.key === "ArrowLeft") {
        handleSwipe("left")
      } else if (event.key === "d" || event.key === "ArrowRight") {
        handleSwipe("right")
      }
    }
  
    window.addEventListener("keydown", handleKeyDown)
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
              <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-semibold">Oops! We couldn't load the images.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-40">
            <div role="status" className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
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
          <ChevronLeft aria-label="chevron-left" className="h-6 w-6" />
        </Button>

          <div className="relative w-[300px] h-[400px] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
            {images.length === 0 && !loading ? (
              <p className="text-gray-500 text-lg">🎉 All images reviewed!</p>
            ) : (
              <AnimatePresence>
                {images.slice(0, 1).map((image) => (
                  <motion.div
                    key={`${image.imageUrl}-${activeImageIndex}`}
                    className="absolute w-full h-full overflow-hidden rounded-xl"
                    initial={{ scale: 1, y: 0, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ x: direction === "right" ? 1000 : -1000, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <img src={image.imageUrl || "/placeholder.svg"} alt={image.classLabel} className="w-full h-full object-cover" />
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
            <ChevronRight aria-label="chevron-right" className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
}
