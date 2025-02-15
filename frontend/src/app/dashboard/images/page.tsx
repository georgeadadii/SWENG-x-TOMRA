"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ImageGrid from "@/components/ImageGrid";

interface ImageData {
    id: number;
    src: string;
    alt: string;
    aiTag: string;
    classified: boolean;
    dateClassified: string;
}

// Function to generate the same images as ImageSwiper
const generateImages = (): ImageData[] => {
    return Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        src: `https://picsum.photos/seed/${i + 1}/300/400`,
        alt: `Random Image ${i + 1}`,
        aiTag: `Tag ${i + 1}`,
        classified: false,
        dateClassified: "",
    }));
};

const DashboardPage: React.FC = () => {
    const [images, setImages] = useState<ImageData[]>(generateImages());

    return (
        <div className="flex h-screen w-screen bg-gray-100 font-mona">
            <Sidebar />
            {/* ✅ Pass images & setImages as props */}
            <ImageGrid images={images} setImages={setImages} />
        <div>
            <h1 className="text-4xl font-bold mb-8">Gallery</h1>
            <ImageGrid />
        </div>
    );
};

export default DashboardPage;
