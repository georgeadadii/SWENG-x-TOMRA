import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type TimeData = {
  range: string;
  count: number;
};

interface PostTimeMetricsProps {
  selectedBatch: string | null;
}

export default function PostTimeMetrics({ selectedBatch }: PostTimeMetricsProps) {
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<TimeData[]>([]);
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
                postprocessingTime
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

        // Add null check for result.data and imageMetrics
        if (!result.data?.imageMetrics) {
          throw new Error("No data received from the server");
        }

        const rawData = result.data.imageMetrics;

        // Extract postprocessing times with proper type checking
        const allTimes: number[] = rawData
          .filter((item: any) => item && typeof item.postprocessingTime === 'number' && !isNaN(item.postprocessingTime))
          .map((item: any) => item.postprocessingTime);

        if (allTimes.length === 0) {
          throw new Error("No postprocessing time data available");
        }

        // Calculate average time
        const total = allTimes.reduce((sum, val) => sum + val, 0);
        setAverageTime(total / allTimes.length);

        // Create bins for distribution
        const minTime = Math.min(...allTimes);
        const maxTime = Math.max(...allTimes);

        // Ensure we have valid min and max times
        if (isNaN(minTime) || isNaN(maxTime)) {
          throw new Error("Invalid postprocessing time data");
        }

        const numBins = 10;
        const binSize = (maxTime - minTime) / numBins;
        const bins: TimeData[] = Array.from({ length: numBins }, (_, i) => ({
          range: `${(minTime + i * binSize)} - ${(minTime + (i + 1) * binSize)}`,
          count: 0,
        }));

        // Count occurrences in each bin
        allTimes.forEach((time: number) => {
          const index = Math.min(Math.floor((time - minTime) / binSize), numBins - 1);
          if (index >= 0) {
            bins[index].count++;
          }
        });

        setDistribution(bins);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setDistribution([]); // Reset distribution on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (distribution.length === 0) return <p>No data available</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Postprocessing Time Metrics</CardTitle>
        <CardDescription>Distribution of postprocessing times (ms)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Postprocessing Time</p>
            <p className="text-2xl font-bold">{averageTime?.toFixed(2)} ms</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  tickFormatter={(value: string) => {
                    // Format the tick to display with 2 decimals
                    const start = parseFloat(value.split("-")[0]);
                    return start.toFixed(2);
                  }}
                />
                <YAxis />
                <Tooltip/>
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
