import { FC } from "react";

interface ImageBatchProps {
    images: {
        imageUrl: string;
        classLabel: string;
        confidence: number;
        batchId?: string;
        classified: boolean;
        misclassified: boolean;
        createdAt?: string;  
    }[];
    onClassify: (imageUrl: string, isCorrect: boolean) => void;
    annotationStatus: Record<string, "correct" | "incorrect" | null>;
    hoveredIndex: number | null;
    setHoveredIndex: (index: number | null) => void;
    setSelectedImage: (image: any) => void;
}

const ImageBatch: FC<ImageBatchProps> = ({
    images = [], 
    onClassify,
    annotationStatus,
    hoveredIndex,
    setHoveredIndex,
    setSelectedImage,
}) => {

    //Grouping images by batchId and sorting by createdAt
    const groupedImages = images.reduce((acc, image) => {
        const batchId = image.batchId || "Uncategorized"; 
        if (!acc[batchId]) {
            acc[batchId] = [];
        }
        acc[batchId].push(image);
        return acc;
    }, {} as Record<string, typeof images>);

    //Converting groupedImages to an array and sorting by createdAt
    const sortedBatches = Object.entries(groupedImages).sort((a, b) => {
        const dateA = new Date(a[1][0].createdAt || 0).getTime(); 
        const dateB = new Date(b[1][0].createdAt || 0).getTime();
        return dateA - dateB; 
    });

    return (
        <div className="w-full h-screen overflow-y-auto p-5">
            {sortedBatches.map(([batchId, batchImages], batchIndex) => (
                <div key={batchId} className="mb-8">
                    {/* Batch Header */}
                    <h2 className="text-xl font-semibold mb-4">
                        Batch {batchIndex + 1} (
                        {batchImages[0].createdAt 
                            ? new Date(batchImages[0].createdAt).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }) 
                            : "No date available"}
                        )
                    </h2>

                    {/* Batch Images Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                        {batchImages.map((image, index) => (
                            <div
                                key={index}
                                className={`relative cursor-pointer transition-transform overflow-hidden flex items-center justify-center bg-transparent rounded-lg ${
                                    hoveredIndex === index ? "scale-105 shadow-lg" : "scale-100"
                                }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => setSelectedImage(image)}
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={image.classLabel}
                                    className="w-full h-full object-cover aspect-square"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImageBatch;