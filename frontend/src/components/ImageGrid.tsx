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
import { gql, useQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useState, useMemo } from "react";
import { FC } from "react";

interface ImageData {
    imageUrl: string;
    classLabel: string;
    confidence: number;
}

const GET_IMAGES = gql`
  query GetImages {
    results {
      imageUrl
      classLabel
      confidence
    }
  }
`;

const ImageGrid: FC = () => {
    const { data, loading, error } = useQuery<{ results: ImageData[] }>(GET_IMAGES, { client });
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const uniqueImages = useMemo(() => {
        const seen = new Set();
        return data?.results.filter(image => {
            if (seen.has(image.imageUrl)) {
                return false;
            }
            seen.add(image.imageUrl);
            return true;
        }) || [];
    }, [data]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="w-full h-screen overflow-y-auto p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {uniqueImages.map((image, index) => (
                <div
                    key={index}
                    className={`relative cursor-pointer transition-transform overflow-hidden flex items-center justify-center bg-transparent rounded-lg ${
                        hoveredIndex === index ? "scale-105 shadow-lg" : "scale-100"
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedImage(image)}
                >
                    <img src={image.imageUrl} alt={image.classLabel} className="w-full h-full object-cover aspect-square" />
                </div>
            ))}

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
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.classLabel}
                            className="max-w-full max-h-96 object-contain rounded-md mb-4 w-auto h-auto"
                        />
                        <p className="text-lg font-semibold text-black">AI Tag: {selectedImage.classLabel}</p>
                        <p className="text-sm text-black">Confidence: {selectedImage.confidence.toFixed(2)}</p>
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
