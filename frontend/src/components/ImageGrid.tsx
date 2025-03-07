"use client";

import { gql, useQuery, useMutation } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useState, useEffect, useMemo } from "react";
import { FC } from "react";
import type { Option } from "@/components/ui/multi-select";
import { ImageClassificationFilter } from "./filter";


interface ImageData {
    imageUrl: string;
    classLabel: string;
    confidence: number;
    classified: boolean;
    misclassified: boolean;
}

const GET_IMAGES = gql`
  query GetImages {
    results {
      imageUrl
      classLabel
      confidence
      classified
      misclassified
    }
  }
`;

const STORE_FEEDBACK = gql`
  mutation StoreFeedback($imageUrl: String!, $reviewed: Boolean, $classified: Boolean, $misclassified: Boolean) {
    storeFeedback(imageUrl: $imageUrl, reviewed: $reviewed, classified: $classified, misclassified: $misclassified)
  }
`;

const ImageGrid: FC<{ selectedLabels: Option[], setSelectedLabels: (labels: Option[]) => void }> = ({ selectedLabels, setSelectedLabels }) => {
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

            // If no labels are selected, show all images
            if (!selectedLabels?.length) {
                return true;
            }
            const normalizedImageLabel = image.classLabel.toLowerCase().trim();
            return selectedLabels.some(label => 
                label.value.toLowerCase().trim() === normalizedImageLabel
            );
        }) || [];
    }, [data, selectedLabels]); // Add selectedLabels to dependencies

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

                        {/* Display classification status */}
                        <p className="mt-3 text-sm font-semibold text-gray-700">
                            {annotationStatus[selectedImage.imageUrl]
                                ? `✅ Previously annotated as ${annotationStatus[selectedImage.imageUrl]}`
                                : "❗ Not yet classified"}
                        </p>

                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                className={`px-4 py-2 rounded-lg ${
                                    annotationStatus[selectedImage.imageUrl] === "correct"
                                        ? "bg-green-600 text-white"
                                        : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                                onClick={() => handleFeedback(selectedImage.imageUrl, true)}
                            >
                                Correct
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg ${
                                    annotationStatus[selectedImage.imageUrl] === "incorrect"
                                        ? "bg-red-600 text-white"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                                onClick={() => handleFeedback(selectedImage.imageUrl, false)}
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
