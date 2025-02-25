import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type ConfidenceData = {
  fullRange: string;
  shortRange: string;
  count: number;
};

export default function ConfidenceMetrics() {
  const [averageConfidence, setAverageConfidence] = useState<number | null>(null);
  const [confidenceDistribution, setConfidenceDistribution] = useState<ConfidenceData[]>([]);
  const [highConfidencePercentage, setHighConfidencePercentage] = useState<number | null>(null);
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
                metrics {
                  averageConfidenceScore
                  confidenceDistribution
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
    
        const data = result.data.metrics[0];

        // parse confidence distribution
        const confidenceDist = JSON.parse(data.confidenceDistribution || "{}");

        // set average confidence
        setAverageConfidence(data.averageConfidenceScore);
    
        let formattedDist = Object.entries(confidenceDist).map(([range, count]) => ({
          fullRange: range, // Keep the full range
          shortRange: range.split("-")[0], // Show only the first part on X-axis
          count: count as number,
        }));

        // Sort by numerical value of first part of the range
        formattedDist.sort((a, b) => parseFloat(a.shortRange) - parseFloat(b.shortRange));

        setConfidenceDistribution(formattedDist);

        // Calculate high confidence percentage
        const highConfidenceCount = formattedDist
          .filter(({ shortRange }) => parseFloat(shortRange) >= 0.8)
          .reduce((sum, { count }) => sum + count, 0);

        const totalDetections = formattedDist.reduce((sum, { count }) => sum + count, 0);
        setHighConfidencePercentage(totalDetections ? (100 * highConfidenceCount) / totalDetections : 0);

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
              <BarChart data={confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortRange" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [`${value}`, `Range: ${props.payload.fullRange}`]} 
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




