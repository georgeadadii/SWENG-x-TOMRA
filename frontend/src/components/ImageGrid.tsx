"use client";

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
