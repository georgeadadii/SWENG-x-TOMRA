"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Define the type for our data
type ChartData = {
    name: string;
    value: number;
};

// Sample data for the chart
const data: ChartData[] = [
    { name: "Page A", value: 400 },
    { name: "Page B", value: 300 },
    { name: "Page C", value: 200 },
    { name: "Page D", value: 278 },
    { name: "Page E", value: 189 },
];

const BarChartComponent: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md w-full h-[400px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Page Views Distribution</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartComponent;
