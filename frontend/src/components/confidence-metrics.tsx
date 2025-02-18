import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type ChartData = {
  classLabel: string;
  confidence: number;
};

/*const mockData = [
  { range: "0-0.2", count: 10 },
  { range: "0.2-0.4", count: 20 },
  { range: "0.4-0.6", count: 30 },
  { range: "0.6-0.8", count: 25 },
  { range: "0.8-1.0", count: 15 },
]*/

export default function ConfidenceMetrics() {
  //const averageConfidence = 0.65
  //const highConfidencePercentage = 40
  const [averageConfidence, setAverageConfidence] = useState<number | null>(null);
  const [highConfidencePercentage, setHighConfidencePercentage] = useState<number | null>(null);
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

        // Calculate average confidence
        const totalConfidence = rawData.reduce((sum, item) => sum + item.confidence, 0);
        const averageConfidence = totalConfidence / rawData.length;
        setAverageConfidence(averageConfidence);

        // Calculate high confidence percentage
        const highConfidenceCount = rawData.reduce((count, item) => count + (item.confidence>0.8 ? 1:0), 0);
        const percentage = 100 * highConfidenceCount / rawData.length;
        setHighConfidencePercentage(percentage);

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
    <Card>
      <CardHeader>
        <CardTitle>Confidence Metrics</CardTitle>
        <CardDescription>Distribution and averages of confidence scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Confidence Score</p>
            <p className="text-2xl font-bold">{averageConfidence !== null ? averageConfidence.toFixed(2) : "Loading..."}</p>
          </div>
          <div>
            <p className="text-sm font-medium">High Confidence Detections ({">"}0.8)</p>
            <p className="text-2xl font-bold">{highConfidencePercentage !== null ? highConfidencePercentage.toFixed(2) : "Loading..."}%</p>
          </div>
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
  )
}

