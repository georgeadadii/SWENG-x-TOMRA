"use client";

import Sidebar from "@/components/Sidebar";
import ImageSwiper from "@/components/ImageSwiper";

const SwipingPage: React.FC = () => {
    return (
        <div className="flex h-screen w-screen bg-gray-100 font-mona">
            <div className="w-64">
                <Sidebar />
            </div>
            <div className="flex-1 flex items-start justify-center p-4 mt-0">
                <ImageSwiper />
            </div>
        </div>
    );
};

export default SwipingPage;
