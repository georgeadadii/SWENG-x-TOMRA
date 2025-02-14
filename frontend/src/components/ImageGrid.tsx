"use client";

import { useState, useMemo } from "react";

interface ImageData {
    src: string;
    alt: string;
    aiTag: string;
    classified: boolean;
    dateClassified: string;
}

const generateImages = (): ImageData[] => {
    return Array.from({ length: 100 }, (_, i) => ({
        src: `https://picsum.photos/seed/${i + 1}/150/150`,
        alt: `Random Image ${i + 1}`,
        aiTag: `Tag ${i + 1}`,
        classified: Math.random() > 0.5,
        dateClassified: new Date().toISOString().split("T")[0],
    }));
};

const ImageGrid: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const images = useMemo(() => generateImages(), []);

    return (
        <div className="w-full h-screen overflow-y-auto p-5 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`cursor-pointer transition-transform ${
                        hoveredIndex === index ? "scale-110 -translate-y-1" : "scale-100"
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedImage(image)}
                >
                    <img src={image.src} alt={image.alt} className="w-full h-auto rounded-md" />
                </div>
            ))}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.src}
                            alt={selectedImage.alt}
                            className="w-64 h-64 object-cover rounded-md mb-4"
                        />
                        <p className="text-lg font-semibold">AI Tag: {selectedImage.aiTag}</p>
                        <p className="text-sm">
                            Status: {selectedImage.classified ? "Classified" : "Unclassified"}
                        </p>
                        <p className="text-sm">Date: {selectedImage.dateClassified}</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                                Correct
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
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
