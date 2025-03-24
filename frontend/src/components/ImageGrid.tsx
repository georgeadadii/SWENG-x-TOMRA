"use client";

import { gql, useQuery, useMutation } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useState, useEffect, useMemo } from "react";
import { FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageBatch from "@/components/ImageBatch";
import type { Option } from "@/components/ui/multi-select";
import { ImageClassificationFilter } from "./filter";
import { motion } from "framer-motion";

interface ImageData {
    imageUrl: string;
    classLabel: string;
    confidence: number;
    batchId?: string;
    classified: boolean;
    misclassified: boolean;
    createdAt: string;
}

const GET_IMAGES = gql`
  query GetImages {
    results {
      imageUrl
      classLabel
      confidence
      batchId
      classified
      misclassified
      createdAt
    }
  }
`;

const STORE_FEEDBACK = gql`
  mutation StoreFeedback($imageUrl: String!, $reviewed: Boolean, $classified: Boolean, $misclassified: Boolean) {
    storeFeedback(imageUrl: $imageUrl, reviewed: $reviewed, classified: $classified, misclassified: $misclassified)
  }
`;

type StatusFilter = 'all' | 'correct' | 'misclassified' | 'not reviewed';
type DateFilter = 'today' | 'yesterday' | 'last7days' | 'last30days'|'all';

function daysFromToday(targetDate: string): number {
    const today = new Date(); // Current date
    const target = new Date(targetDate); // Convert input string to Date

    const diffInMs = today.getTime() - target.getTime(); // Difference in milliseconds
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert to days

    return diffInDays;
}

const ImageGrid: FC<{ 
    selectedLabels: Option[], 
    setSelectedLabels: (labels: Option[]) => void,
    statusFilter: StatusFilter,
    dateFilter: DateFilter  
}> = ({ 
    selectedLabels, 
    setSelectedLabels, 
    statusFilter, 
    dateFilter
}) => {
    const { data, loading, error } = useQuery<{ results: ImageData[] }>(GET_IMAGES, { client });
    const [storeFeedback] = useMutation(STORE_FEEDBACK, { client });
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [annotationStatus, setAnnotationStatus] = useState<Record<string, "correct" | "incorrect" | null>>({});

    // When data changes, update classification status
    useEffect(() => {
        if (data?.results) {
            const newStatus: Record<string, "correct" | "incorrect" | null> = {};
            data.results.forEach((image) => {
                if (image.classified) {
                    newStatus[image.imageUrl] = "correct";
                } else if (image.misclassified) {
                    newStatus[image.imageUrl] = "incorrect";
                } else {
                    newStatus[image.imageUrl] = null;
                }
            });
            setAnnotationStatus(newStatus);
        }
    }, [data]); // Runs whenever `data` changes

    const uniqueImages = useMemo(() => {
        const seen = new Set();
        return data?.results?.filter(image => {
            // Check for duplicate images
            if (seen.has(image.imageUrl)) {
                return false;
            }
            seen.add(image.imageUrl);
            // Date filtering
            switch (dateFilter) {
                case 'today':
                    if (daysFromToday(image.createdAt)>1) return false;
                    break;
                case 'yesterday':
                    if (daysFromToday(image.createdAt)>2) return false;
                    break;
                case 'last7days':
                    if (daysFromToday(image.createdAt)>7) return false;
                    break;
                case 'last30days':
                    if (daysFromToday(image.createdAt)>30) return false;
                    break;   
            }
            // Status filtering
            switch (statusFilter) {
                case 'correct':
                    if (!image.classified || image.misclassified) return false;
                    break;
                case 'misclassified':
                    if (!image.misclassified) return false;
                    break;
                case 'not reviewed':
                    if (image.classified || image.misclassified) return false;
                    break;
            }

            // Label filtering
            if (!selectedLabels?.length) {
                return true;
            }

            const normalizedImageLabel = image.classLabel.toLowerCase().trim();
            return selectedLabels.some(label => 
                label.value.toLowerCase().trim() === normalizedImageLabel
            );
        }) || [];
    }, [data, selectedLabels, statusFilter, dateFilter]);

    const handleFeedback = async (imageUrl: string, isCorrect: boolean) => {
        const status = isCorrect ? "correct" : "incorrect";

        try {
            await storeFeedback({
                variables: {
                    imageUrl,
                    reviewed: true,
                    classified: isCorrect,
                    misclassified: !isCorrect,
                },
            });

            setAnnotationStatus((prev) => ({
                ...prev,
                [imageUrl]: status,
            }));
        } catch (err) {
            console.error("Error storing feedback:", err);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Tabs defaultValue="grid" className="w-full">
                <div className="border-b border-gray-200">
                    <TabsList className="flex p-0 bg-transparent">
                        <TabsTrigger 
                            value="grid" 
                            className="px-6 py-3 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger 
                            value="batch"
                            className="px-6 py-3 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none"
                        >
                            Batch View
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Image Grid View */}
                <TabsContent value="grid" className="p-0 m-0">
                    {loading && (
                        <div className="w-full h-64 flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                <p className="text-gray-500 font-medium">Loading images...</p>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="w-full h-64 flex items-center justify-center">
                            <div className="bg-red-50 text-red-500 p-4 rounded-lg max-w-md border border-red-100">
                                <h3 className="font-semibold text-lg mb-2">Error Loading Images</h3>
                                <p>{error.message}</p>
                            </div>
                        </div>
                    )}
                    
                    {!loading && !error && (
                        <motion.div 
                            className="w-full h-[calc(100vh-320px)] overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 auto-rows-[200px]"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {uniqueImages.length === 0 ? (
                                <div className="col-span-full h-64 flex items-center justify-center">
                                    <p className="text-gray-500 text-lg">No images match your filter criteria</p>
                                </div>
                            ) : (
                                uniqueImages.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        variants={item}
                                        className={`relative cursor-pointer overflow-hidden rounded-lg ${
                                            hoveredIndex === index ? "ring-4 ring-blue-400 ring-opacity-50" : "ring-1 ring-gray-200"
                                        }`}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={() => setSelectedImage(image)}
                                        style={{
                                            backgroundImage: `url(${image.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        <div className={`absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
                                            hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                                        }`}>
                                            <p className="text-white font-medium truncate">{image.classLabel}</p>
                                            <div className="flex items-center mt-1">
                                                <span className="text-xs text-white/80">
                                                    {(image.confidence * 100).toFixed(0)}% confidence
                                                </span>
                                                {annotationStatus[image.imageUrl] && (
                                                    <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                                                        annotationStatus[image.imageUrl] === "correct" 
                                                            ? "bg-green-500/20 text-green-50"
                                                            : "bg-red-500/20 text-red-50"
                                                    }`}>
                                                        {annotationStatus[image.imageUrl] === "correct" ? "Correct" : "Incorrect"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </TabsContent>

                {/* Batch View */}
                <TabsContent value="batch" className="p-0 m-0">
                    <ImageBatch 
                        images={uniqueImages} 
                        onClassify={handleFeedback} 
                        annotationStatus={annotationStatus} 
                        hoveredIndex={hoveredIndex}
                        setHoveredIndex={setHoveredIndex}
                        setSelectedImage={setSelectedImage}
                    />
                </TabsContent>
            </Tabs>

            {/* Image Modal - with backdrop blur and smoother animation */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <img
                                src={selectedImage.imageUrl}
                                alt={selectedImage.classLabel}
                                className="w-full h-64 object-cover"
                            />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {selectedImage.classLabel}
                            </h3>
                            
                            <div className="flex items-center mb-4">
                                <span className="text-sm text-gray-500">
                                    Confidence: {(selectedImage.confidence * 100).toFixed(2)}%
                                </span>
                                {annotationStatus[selectedImage.imageUrl] && (
                                    <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                                        annotationStatus[selectedImage.imageUrl] === "correct" 
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}>
                                        {annotationStatus[selectedImage.imageUrl] === "correct" ? "Correct" : "Incorrect"}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                        annotationStatus[selectedImage.imageUrl] === "correct"
                                            ? "bg-green-600 text-white"
                                            : "bg-green-100 text-green-800 hover:bg-green-600 hover:text-white"
                                    }`}
                                    onClick={() => handleFeedback(selectedImage.imageUrl, true)}
                                >
                                    Correct
                                </button>
                                <button
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                        annotationStatus[selectedImage.imageUrl] === "incorrect"
                                            ? "bg-red-600 text-white"
                                            : "bg-red-100 text-red-800 hover:bg-red-600 hover:text-white"
                                    }`}
                                    onClick={() => handleFeedback(selectedImage.imageUrl, false)}
                                >
                                    Incorrect
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ImageGrid;