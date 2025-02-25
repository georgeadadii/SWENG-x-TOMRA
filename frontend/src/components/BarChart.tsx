import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

// Define the correct type for fetched data
type ChartData = {
  classLabel: string;
  confidence: number;
};

const ClassConfidence: React.FC = () => {
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
          // Calculate average to 2 decimal places
          confidence: parseFloat((group.totalConfidence / group.count).toFixed(2)), 
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
    <Card>
      <CardHeader>
        <CardTitle>Class Confidence</CardTitle>
        <CardDescription>Averages of confidence scores for different labels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="classLabel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="confidence" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassConfidence;

