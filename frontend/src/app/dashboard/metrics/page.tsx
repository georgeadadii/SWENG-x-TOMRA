"use client";

import Sidebar from "@/components/Sidebar";
import BarChartComponent from "@/components/BarChart";
import LineChartComponent from "@/components/LineChart";

const Metrics: React.FC = () => {
    return (
        <div className="flex h-screen w-screen bg-gray-100 font-mona">
            <Sidebar />
            <div className="flex flex-col flex-grow p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Metrics Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LineChartComponent />
                    <BarChartComponent />
                </div>
            </div>
        </div>
    );
};

export default Metrics;
