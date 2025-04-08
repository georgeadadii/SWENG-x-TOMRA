"use client";

import { gql, useQuery, useMutation } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle, CircleHelp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
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
      createdAt
    }
  }
`;

const STORE_FEEDBACK = gql`
  mutation StoreFeedback($imageUrl: String!, $classified: Boolean, $misclassified: Boolean, $reviewed: Boolean) {
    storeFeedback(imageUrl: $imageUrl, classified: $classified, misclassified: $misclassified, reviewed: $reviewed)
  }
`;

interface ImageSwiperProps {
  batchId?: string;
  onReviewComplete?: () => void;
}

export default function ImageSwiper({ batchId, onReviewComplete }: ImageSwiperProps) {
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
  const [totalImagesInBatch, setTotalImagesInBatch] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [availableBatches, setAvailableBatches] = useState<{ value: string; label: string }[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>(batchId || "all");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "a" || event.key === "ArrowLeft") {
        handleSwipe("left");
      } else if (event.key === "d" || event.key === "ArrowRight") {
        handleSwipe("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images]);

  // Process images when data changes or batch selection changes
  useEffect(() => {
    if (data?.results) {
      // Group images by batchId and sort batches by creation date
      const groupedImages = data.results.reduce((acc, image) => {
        const batchId = image.batchId || "uncategorized";
        if (!acc[batchId]) {
          acc[batchId] = [];
        }
        acc[batchId].push(image);
        return acc;
      }, {} as Record<string, ImageData[]>);

      // Sort by createdAt
      const sortedBatches = Object.entries(groupedImages).sort((a, b) => {
        const dateA = new Date(a[1][0]?.createdAt || 0).getTime();
        const dateB = new Date(b[1][0]?.createdAt || 0).getTime();
        return dateB - dateA; // newest first
      });

      const batchOptions = [
        { value: "all", label: "All batches" },
        ...sortedBatches.map(([batchId], index) => ({
          value: batchId,
          label: `Batch ${index + 1}`,
        })),
      ];

      setAvailableBatches(batchOptions);

      // Filter images - if batchId is provided, use that, otherwise use selected batch
      const activeBatchId = batchId || selectedBatch;

      let filteredImages;

      // When accessed through a batch (batchId is provided), show all images regardless of review status
      // When accessed from main interface, only show unreviewed images
      if (batchId) {
        // From batch view - show all images
        filteredImages = data.results;
      } else {
        // From main interface - only show unreviewed images
        filteredImages = data.results.filter(img => img.reviewed !== true);
      }

      if (activeBatchId !== "all") {
        filteredImages = filteredImages.filter((img) => img.batchId === activeBatchId);
      }
      
      const totalInBatch = activeBatchId === "all"
        ? data.results.length
        : data.results.filter(img => img.batchId === activeBatchId).length;
      
      const reviewedInBatch = activeBatchId === "all"
        ? data.results.filter(img => img.reviewed === true).length
        : data.results.filter(img => img.batchId === activeBatchId && img.reviewed === true).length;
      
      setTotalImagesInBatch(totalInBatch);
      setReviewedCount(reviewedInBatch);

      setImages(filteredImages);
    }
  }, [data, selectedBatch, batchId]);

  const handleSwipe = async (swipeDirection: "left" | "right") => {
    if (images.length === 0) return;

    const currentImage = images[0];
    const classified = swipeDirection === "right";
    const misclassified = swipeDirection === "left";
    const wasAlreadyReviewed = currentImage.reviewed === true;

    try {
      // Always submit the new classification regardless of previous review status
      await storeFeedback({
        variables: {
          imageUrl: currentImage.imageUrl,
          classified,
          misclassified,
          reviewed: true
        },
      });

      // Only increment reviewed count if this was not already reviewed
      if (!wasAlreadyReviewed) {
        setReviewedCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to store feedback:", err);
    }

    setDirection(swipeDirection);
    setTimeout(() => {
      setDirection(null);
      setImages((prev) => {
        const newImages = prev.length > 1 ? prev.slice(1) : [];
        // If this was the last image and we have an onReviewComplete callback, call it
        if (newImages.length === 0 && onReviewComplete) {
          setTimeout(() => onReviewComplete(), 500);
        }
        return newImages;
      });
      setActiveImageIndex((prev) => prev + 1);
    }, 400);
  };

  // Calculate progress percentage
  const progressPercentage = totalImagesInBatch > 0
    ? Math.round((reviewedCount / totalImagesInBatch) * 100)
    : 0;

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6 flex justify-between items-center w-full px-6 pt-4">
        {/* Back button - only show if a specific batch is being reviewed */}
        {batchId && onReviewComplete && (
          <Button
            variant="outline"
            onClick={onReviewComplete}
            className="mr-auto flex items-center gap-1 h-8 px-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Batch
          </Button>
        )}

        {/* Only show batch selector if no batchId is provided */}
        {!batchId && (
          <Dropdown
            trigger={
              <Box variant="outline" className="w-[200px] justify-between">
                <span className="text-sm truncate">
                  {selectedBatch !== "all"
                    ? `Filtering: ${selectedBatch}`
                    : "Filter by Batch"}
                </span>
              </Box>
            }
          >
            {availableBatches.map((filter) => (
              <DropdownItem
                key={filter.value}
                onClick={() => setSelectedBatch(filter.value)}
              >
                {filter.label}
              </DropdownItem>
            ))}
          </Dropdown>
        )}

        {/* Only show help dialog in batch mode */}

        <Dialog>
          <DialogTrigger>
            <Box variant="outline" size="icon">
              <CircleHelp className="h-4 w-4" />
            </Box>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Image Batch Review</DialogTitle>
              <DialogDescription>
                <p className="mb-2">Quickly review images by swiping:</p>
                <ul className="list-disc pl-5 mb-2 space-y-1">
                  <li>Swipe LEFT for incorrectly classified images</li>
                  <li>Swipe RIGHT for correctly classified images</li>
                </ul>
                <p>You can also use keyboard shortcuts: Left arrow (←) for incorrect and Right arrow (→) for correct.</p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

      </div>

      {/* Progress bar */}
      {totalImagesInBatch > 0 && (
        <div className="px-6 mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{reviewedCount} of {totalImagesInBatch} reviewed</span>
            <span>{progressPercentage}% complete</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-8 bg-white rounded-xl">
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
            className="mr-4 transition-all duration-300 ease-in-out hover:bg-red-50 hover:border-red-500 hover:shadow-md"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="relative w-[300px] h-[400px] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
            {images.length === 0 && !loading ? (
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">🎉 All images reviewed!</p>
                {batchId && onReviewComplete && (
                  <Button
                    variant="outline"
                    onClick={onReviewComplete}
                    className="mt-4"
                  >
                    Return to Batch
                  </Button>
                )}
              </div>
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
                    <img
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.classLabel}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-white text-lg font-bold">{image.classLabel}</p>
                        {/* Only show previously classified badge in batch mode */}
                        {batchId && image.reviewed && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${image.classified ? "bg-green-500/20 text-green-50" : "bg-red-500/20 text-red-50"
                            }`}>
                            Previously {image.classified ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">Confidence: {(image.confidence * 100).toFixed(2)}%</p>
                      {batchId && (
                        <p className="text-gray-300 text-xs mt-1">
                          Batch: {batchId}
                        </p>
                      )}
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
            className="ml-4 transition-all duration-300 ease-in-out hover:bg-green-50 hover:border-green-500 hover:shadow-md"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-6">
          {/* Only show swipe guide in batch mode */}

          <div className="flex space-x-6 justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 text-red-800 p-2 rounded-full mb-2">
                <ChevronLeft className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-500">Incorrect</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 text-green-800 p-2 rounded-full mb-2">
                <ChevronRight className="h-5 w-5" />
              </div>
              <span className="text-sm text-gray-500">Correct</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}