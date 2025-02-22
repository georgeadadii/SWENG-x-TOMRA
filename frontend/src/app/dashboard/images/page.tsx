"use client";

import { ImageClassificationFilter } from "@/components/filter";
import ImageGrid from "@/components/ImageGrid";

const DashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Gallery</h1>
            <div className="container mx-auto py-10">
                <ImageClassificationFilter />
            </div>
            <ImageGrid />
        </div>
    );
};

export default DashboardPage;
