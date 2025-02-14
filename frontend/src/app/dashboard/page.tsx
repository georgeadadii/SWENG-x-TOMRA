"use client";

import Sidebar from "@/components/Sidebar";
import ImageGrid from "@/components/ImageGrid";

const DashboardPage: React.FC = () => {
    return (
        <div className="flex h-screen w-screen bg-gray-100 font-mona">
            <Sidebar />
            <ImageGrid />
        </div>
    );
};

export default DashboardPage;
