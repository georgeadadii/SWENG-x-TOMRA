"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import ImageGrid from "../components/ImageGrid";

interface ImageData {
    id: number;
    src: string;
    alt: string;
    aiTag: string;
    classified: boolean;
    dateClassified: string;
}

const generateImages = (): ImageData[] => {
    return Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        src: `https://picsum.photos/seed/${i + 1}/300/400`, // ✅ Generates random images
        alt: `Random Image ${i + 1}`,
        aiTag: `Tag ${i + 1}`,
        classified: false,
        dateClassified: "",
    }));
};

export default function ImageSwiper() {
    const [images, setImages] = useState<ImageData[]>(generateImages());
    const [direction, setDirection] = useState<"left" | "right" | null>(null);

    const handleSwipe = (swipeDirection: "left" | "right") => {
        if (images.length > 0) {
            setDirection(swipeDirection);
            setTimeout(() => {
                setImages((prevImages) => {
                    const [removedImage, ...remainingImages] = prevImages;
                    removedImage.classified = swipeDirection === "right";
                    removedImage.dateClassified = new Date().toISOString().split("T")[0];
                    return [...remainingImages, removedImage];
                });
                setDirection(null);
            }, 300);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {/* Swiper Stack */}
            <div className="relative w-[300px] h-[400px] mt-6">
                <AnimatePresence>
                    {images.slice(0, 3).map((image, index) => (
                        <motion.div
                            key={image.id}
                            className="absolute w-full h-full"
                            style={{ zIndex: images.length - index }}
                            initial={index === 0 ? { scale: 1, x: 0 } : { scale: 1 - index * 0.05 }}
                            animate={{
                                scale: 1 - index * 0.05,
                                y: index * -10,
                                x: index === 0 && direction ? (direction === "right" ? 1000 : -1000) : 0,
                            }}
                            exit={index === 0 ? { x: direction === "right" ? 1000 : -1000, opacity: 0, transition: { duration: 0.3 } } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            <img src={image.src} alt={image.alt} className="w-full h-full object-cover rounded-lg shadow-md" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Swipe Buttons */}
            <div className="mt-4 flex justify-center space-x-4">
                <Button onClick={() => handleSwipe("left")} disabled={images.length === 0 || direction !== null} size="icon" variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleSwipe("right")} disabled={images.length === 0 || direction !== null} size="icon" variant="outline">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

          
        </div>
    );
}