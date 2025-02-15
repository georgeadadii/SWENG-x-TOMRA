"use client";

import ImageGrid from "@/components/ImageGrid";

const DashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Gallery</h1>
            <ImageGrid />
        </div>
    );
};

export default DashboardPage;
