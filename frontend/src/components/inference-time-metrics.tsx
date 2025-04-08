import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

type inferenceData = {
  range: string;
  count: number;
};

interface InferenceTimeMetricsProps {
  selectedBatch: string | null;
}

export default function inferenceTimeMetrics({ selectedBatch }: InferenceTimeMetricsProps) {
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<inferenceData[]>([]);
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
                inferenceTime
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

        const inferenceTimes: number[] = result.data.imageMetrics
          .filter((img: any) => img && typeof img.inferenceTime === 'number')
          .map((img: any) => img.inferenceTime);

        if (inferenceTimes.length === 0) {
          throw new Error("No inference time data available");
        }

        // Calculate average inference time
        const total = inferenceTimes.reduce((sum, time) => sum + time, 0);
        setAverageTime(total / inferenceTimes.length);

        // Dynamically calculate the number of bins
        const minTime = Math.min(...inferenceTimes);
        const maxTime = Math.max(...inferenceTimes);

        // Ensure we have valid min and max times
        if (isNaN(minTime) || isNaN(maxTime)) {
          throw new Error("Invalid inference time data");
        }

        // Dynamically calculate bin size for exactly 10 bins
        const numBins = 10;
        const binSize = (maxTime - minTime) / numBins;

        const bins: { [key: string]: number } = {};
        for (let i = 0; i < numBins; i++) {
          const binStart = minTime + i * binSize;
          const binEnd = binStart + binSize;
          const binLabel = `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`;
          bins[binLabel] = 0;
        }

        // Populate bins with counts
        inferenceTimes.forEach((time) => {
          if (typeof time === 'number' && !isNaN(time)) {
            const binIndex = Math.floor((time - minTime) / binSize);
            if (binIndex >= 0 && binIndex < numBins) {
              const binStart = minTime + binIndex * binSize;
              const binEnd = binStart + binSize;
              const binLabel = `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`;
              bins[binLabel] = (bins[binLabel] || 0) + 1;
            }
          }
        });

        // Convert bins to array format for Recharts
        const formattedDist = Object.entries(bins)
          .filter(([_, count]) => count !== undefined && count !== null)
          .map(([range, count]) => ({
            range,
            count: count || 0,
          }));

        setDistribution(formattedDist);
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
        <CardTitle>Inference Time Metrics</CardTitle>
        <CardDescription>Distribution of inference times (ms)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Inference Time</p>
            <p className="text-2xl font-bold">{averageTime?.toFixed(2)} ms</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="range"
                  tickFormatter={(value: string) => value.split("-")[0]}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




