import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

type ConfidenceData = {
  fullRange: string;
  shortRange: string;
  count: number;
};

interface ConfidenceMetricsProps {
  selectedBatch: string | null;
}

export default function ConfidenceMetrics({ selectedBatch }: ConfidenceMetricsProps) {
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
                imageMetrics${selectedBatch ? `(batchId: "${selectedBatch}")` : ''} {
                  confidences
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

        // Flatten all confidence scores from all images
        const allConfidences: number[] = rawData.flatMap((item: { confidences: number[] }) => item.confidences);

        if (allConfidences.length === 0) {
          throw new Error("No confidence data available");
        }

        // Define confidence bins (0.0-0.1, 0.1-0.2, ..., 0.9-1.0)
        const bins = Array.from({ length: 10 }, (_, i) => ({
          fullRange: `${(i / 10).toFixed(1)} - ${(i / 10 + 0.1).toFixed(1)}`,
          shortRange: `${(i / 10).toFixed(1)}-${(i / 10 + 0.1).toFixed(1)}`,
          count: 0,
        }));

        // Count occurrences in each bin
        allConfidences.forEach((conf) => {
          const index = Math.min(Math.floor(conf * 10), 9); // Ensure 1.0 falls into last bin
          bins[index].count++;
        });

        // Compute average confidence
        const avgConfidence = allConfidences.reduce((sum, val) => sum + val, 0) / allConfidences.length;

        // Compute high-confidence percentage (>0.8)
        const highConfidenceCount = allConfidences.filter((c) => c > 0.8).length;
        const highConfidencePct = (highConfidenceCount / allConfidences.length) * 100;

        setConfidenceDistribution(bins);
        setAverageConfidence(avgConfidence);
        setHighConfidencePercentage(highConfidencePct);
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
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





