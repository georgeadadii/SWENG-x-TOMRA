import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

// Define the correct type for fetched data
type ChartData = {
  classLabel: string;
  confidence: number;
};

const BarChartComponent: React.FC = () => {
  const [results, setResults] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                results {
                  classLabel
                  confidence
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0]?.message || "GraphQL query error");
        }
    
        const rawData: ChartData[] = result.data?.results || [];
    
        // Group by `classLabel` and compute the average confidence
        const aggregatedData = rawData.reduce((acc, item) => {
          if (!acc[item.classLabel]) {
            acc[item.classLabel] = { classLabel: item.classLabel, totalConfidence: 0, count: 0 };
          }
          acc[item.classLabel].totalConfidence += item.confidence;
          acc[item.classLabel].count ++;
          return acc;
        }, {} as Record<string, { classLabel: string; totalConfidence: number; count: number }>);
    
        // Convert grouped object to array with averages
        const averagedData = Object.values(aggregatedData).map((group) => ({
          classLabel: group.classLabel,
          confidence: group.totalConfidence / group.count, // Calculate average
        }));
    
        setResults(averagedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full h-[400px]">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Average Confidence of Images Classified with Different Labels
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="classLabel" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="confidence" fill="#8884d8" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;

