import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type DetectionData = {
  range: string;
  count: number;
};

interface DetectionMetricsProps {
  selectedBatch: string | null;
}

export default function DetectionMetrics({ selectedBatch }: DetectionMetricsProps) {
  const [averageDetections, setAverageDetections] = useState<number | null>(null);
  const [detectionDistribution, setDetectionDistribution] = useState<DetectionData[]>([]);
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
              imageMetrics${selectedBatch ? `(batchId: "${selectedBatch}")` : ''} {
                labels
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

        const rawData = result.data?.imageMetrics || [];

        // Get number of detections per image
        const detectionsPerImage = rawData.map((item: { labels: string[] }) => item.labels.length);

        if (detectionsPerImage.length === 0) {
          throw new Error("No detection data available");
        }

        // Compute average detections per image
        const avgDetections = detectionsPerImage.reduce((sum: any, val: any) => sum + val, 0) / detectionsPerImage.length;
        setAverageDetections(avgDetections);

        // Determine dynamic number of bins
        const numBins = Math.ceil(Math.log2(detectionsPerImage.length) + 1);
        const maxDetections = Math.max(...detectionsPerImage);
        const binSize = Math.ceil(maxDetections / numBins);

        // Create bins dynamically
        const bins: DetectionData[] = Array.from({ length: numBins }, (_, i) => ({
          range: `${i * binSize}-${(i + 1) * binSize - 1}`,
          count: 0,
        }));

        // Count occurrences in each bin
        detectionsPerImage.forEach((count: number) => {
          const index = Math.min(Math.floor(count / binSize), numBins - 1);
          bins[index].count++;
        });

        setDetectionDistribution(bins);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detection Metrics</CardTitle>
        <CardDescription>Number of detections per image</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Detections per Image</p>
            <p className="text-2xl font-bold">{averageDetections?.toFixed(1)}</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range"
                  tickFormatter={(value: string) => value.split("-")[0]} // Show only first part of the range
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


