"use client";

import { useState } from "react";

interface ImageData {
    id: number;
    src: string;
    alt: string;
    aiTag: string;
    classified: boolean;
    dateClassified: string;
}

interface ImageGridProps {
    images: ImageData[];
    setImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images = [], setImages }) => {
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleClassify = (id: number, isCorrect: boolean) => {
        setImages((prevImages) =>
            prevImages.map((image) =>
                image.id === id
                    ? { ...image, classified: isCorrect, dateClassified: new Date().toISOString().split("T")[0] }
                    : image
            )
        );
        setSelectedImage(null);
    };

    return (
        <div className="w-full h-screen overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images.length === 0 ? (
                <p className="text-center text-gray-500 col-span-full">No images found.</p>
            ) : (
                images.map((image, index) => (
                    <div
                        key={image.id}
                        className={`relative group transition-transform duration-200 ${hoveredIndex === index ? "scale-110" : "scale-100"
                            }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedImage(image)}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center text-white text-sm font-semibold rounded-lg">
                            {image.aiTag}
                        </div>
                    </div>
                ))
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage.src} alt={selectedImage.alt} className="w-64 h-64 object-cover rounded-md mb-4" />
                        <p className="text-lg font-semibold">AI Tag: {selectedImage.aiTag}</p>
                        <p className="text-sm">Status: {selectedImage.classified ? "Classified" : "Unclassified"}</p>
                        <p className="text-sm">Date: {selectedImage.dateClassified || "Not Classified"}</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                onClick={() => handleClassify(selectedImage.id, true)}
                            >
                                Correct
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                onClick={() => handleClassify(selectedImage.id, false)}
                            >
                                Incorrect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGrid;
