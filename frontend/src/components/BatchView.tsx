"use client";

import { FC, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageSwiper from "@/components/ImageSwiper";

interface ImageData {
    imageUrl: string;
    classLabel: string;
    confidence: number;
    batchId?: string;
    classified: boolean;
    misclassified: boolean;
    createdAt: string;
}

interface BatchViewProps {
    images: ImageData[];
    onClassify: (imageUrl: string, isCorrect: boolean) => Promise<void>;
    annotationStatus: Record<string, "correct" | "incorrect" | null>;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
    setSelectedImage: (image: ImageData | null) => void;
}

const BatchView: FC<BatchViewProps> = ({
    images,
    onClassify,
    annotationStatus,
    hoveredIndex,
    setHoveredIndex,
    setSelectedImage
}) => {
    const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
    const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

    // Group images by batchId
    const batchGroups = useMemo(() => {
        const groups: Record<string, ImageData[]> = {};
        
        images.forEach(image => {
            const batchId = image.batchId || 'no-batch';
            if (!groups[batchId]) {
                groups[batchId] = [];
            }
            groups[batchId].push(image);
        });
        
        // Sort batches by date (using the first image in each batch)
        return Object.entries(groups)
            .sort(([, imagesA], [, imagesB]) => {
                const dateA = new Date(imagesA[0]?.createdAt || 0);
                const dateB = new Date(imagesB[0]?.createdAt || 0);
                return dateB.getTime() - dateA.getTime(); // newest first
            });
    }, [images]);

    // Get batch statistics
    const getBatchStats = (batchImages: ImageData[]) => {
        let correct = 0;
        let incorrect = 0;
        let notReviewed = 0;
        
        batchImages.forEach(image => {
            if (annotationStatus[image.imageUrl] === "correct") {
                correct++;
            } else if (annotationStatus[image.imageUrl] === "incorrect") {
                incorrect++;
            } else {
                notReviewed++;
            }
        });
        
        return { correct, incorrect, notReviewed, total: batchImages.length };
    };

    if (images.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-gray-500 text-lg">No images match your filter criteria</p>
            </div>
        );
    }

    // If review mode is active, show the ImageSwiper
    if (isReviewMode && selectedBatch) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-220px)]">
                <ImageSwiper 
                    batchId={selectedBatch} 
                    onReviewComplete={() => setIsReviewMode(false)} 
                />
            </div>
        );
    }

    // If a batch is selected, show its images in a grid
    if (selectedBatch) {
        const selectedImages = batchGroups.find(([batchId]) => batchId === selectedBatch)?.[1] || [];
        const stats = getBatchStats(selectedImages);
        
        return (
            <div className="w-full h-full min-h-[calc(100vh-220px)] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => setSelectedBatch(null)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to all batches
                    </button>
                    
                    {/* Review Batch Button */}
                    <Button 
                        onClick={() => setIsReviewMode(true)}
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Review Batch ({stats.total} images)
                    </Button>
                </div>
                
                {/* Batch Statistics */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-2">Batch Review Progress</h3>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                            {stats.total - stats.notReviewed} of {stats.total} reviewed
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                            {stats.notReviewed === 0 ? 'Complete!' : `${stats.notReviewed} remaining`}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((stats.total - stats.notReviewed) / stats.total) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-1">
                            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-sm text-gray-600">{stats.correct} correct</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-sm text-gray-600">{stats.incorrect} incorrect</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="inline-block w-3 h-3 rounded-full bg-gray-300"></span>
                            <span className="text-sm text-gray-600">{stats.notReviewed} not reviewed</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selectedImages.map((image, index) => (
                        <motion.div
                            key={image.imageUrl}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className={`relative cursor-pointer overflow-hidden rounded-lg aspect-square ${
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
                            <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="text-white font-medium truncate text-sm">{image.classLabel}</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-white/80">
                                        {(image.confidence * 100).toFixed(0)}%
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
                    ))}
                </div>
            </div>
        );
    }

    // Otherwise, show the grid of batch cards
    return (
        <div className="w-full h-full min-h-[calc(100vh-220px)] overflow-y-auto p-6 pb-12">
            {/* CSS for fan animation */}
            <style dangerouslySetInnerHTML={{ __html: `
                .card-fan-0, .card-fan-1, .card-fan-2, .card-fan-3,
                .card-fan-4, .card-fan-5, .card-fan-6, .card-fan-7 {
                    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                /* Gentler fan spread with more subtle angles */
                .batch-card:hover .card-fan-0 { transform: translate(-50%, -50%) translateX(-16px) translateY(-8px) rotate(-14deg) !important; box-shadow: -5px 5px 10px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-1 { transform: translate(-50%, -50%) translateX(-12px) translateY(-6px) rotate(-10deg) !important; box-shadow: -4px 4px 8px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-2 { transform: translate(-50%, -50%) translateX(-8px) translateY(-4px) rotate(-6deg) !important; box-shadow: -3px 3px 6px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-3 { transform: translate(-50%, -50%) translateX(-3px) translateY(-2px) rotate(-3deg) !important; box-shadow: -2px 2px 4px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-4 { transform: translate(-50%, -50%) translateX(3px) translateY(-2px) rotate(3deg) !important; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-5 { transform: translate(-50%, -50%) translateX(8px) translateY(-4px) rotate(6deg) !important; box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-6 { transform: translate(-50%, -50%) translateX(12px) translateY(-6px) rotate(10deg) !important; box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2) !important; }
                .batch-card:hover .card-fan-7 { transform: translate(-50%, -50%) translateX(16px) translateY(-8px) rotate(14deg) !important; box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2) !important; }
            `}} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {batchGroups.map(([batchId, batchImages]) => {
                    const stats = getBatchStats(batchImages);
                    
                    // Format date for display
                    const batchDate = new Date(batchImages[0]?.createdAt || '');
                    const formattedDate = batchDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Generate a batch name
                    const batchName = batchId === 'no-batch' 
                        ? 'Ungrouped Images' 
                        : `Batch ${batchId.slice(0, 8)}`;
                    
                    // Check if there are images to review in this batch
                    const hasUnreviewedImages = stats.notReviewed > 0;
                    
                    return (
                        <motion.div 
                            key={batchId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ 
                                scale: 1.02, 
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
                            }}
                            transition={{ duration: 0.3 }}
                            className="batch-card bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col transform transition-all duration-300 ease-out hover:border-blue-200"
                        >
                            {/* Card Stack */}
                            <div className="relative flex-1 flex items-center justify-center p-4 cursor-pointer"
                                 onClick={() => setSelectedBatch(batchId)}>
                                <div className="w-full h-full relative aspect-square">
                                    {batchImages.slice(0, Math.min(8, batchImages.length)).map((image, index) => {
                                        // Base stacked position
                                        const baseOffset = index * 2; // Reduced horizontal offset
                                        const baseRotation = (Math.random() * 6 - 3) * 0.5; // Smaller random rotation
                                        const zIndex = 10 - index; // Higher index = lower in stack
                                        const scale = 1 - (index * 0.02); // Smaller scale difference for deeper cards
                                        
                                        return (
                                            <div
                                                key={image.imageUrl}
                                                className={`absolute shadow-md rounded-lg overflow-hidden card-fan-${index}`}
                                                style={{
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: `translate(-50%, -50%) translateX(${baseOffset}px) translateY(${baseOffset/2}px) rotate(${baseRotation}deg) scale(${scale})`,
                                                    width: '70%',  // Increased width to 70%
                                                    height: '80%',
                                                    backgroundImage: `url(${image.imageUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    zIndex: zIndex,
                                                    border: '2px solid white',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        );
                                    })}
                                 
                                    
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 ease-out">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full shadow-lg">
                                            <Eye className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Batch Info */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-900 truncate">{batchName}</h3>
                                        <p className="text-sm text-gray-500">{formattedDate} · {batchImages.length} images</p>
                                    </div>
                                    
                                    {/* Quick Review Button */}
                                    <Button 
                                        variant="outline"
                                        className="text-xs px-2 py-1 h-6 min-h-0 border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBatch(batchId);
                                            setIsReviewMode(true);
                                        }}
                                    >
                                        Review
                                    </Button>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                    <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{width: `${((stats.correct + stats.incorrect) / stats.total) * 100}%`}}
                                    ></div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs text-gray-600">{stats.correct}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                        <span className="text-xs text-gray-600">{stats.incorrect}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
                                        <span className="text-xs text-gray-600">{stats.notReviewed}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default BatchView;