import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type BoxData = {
  range: string;
  count: number;
};

export default function BoundingBoxMetrics() {
  const [averageBoxSize, setAverageBoxSize] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<BoxData[]>([]);
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
              imageMetrics {
                bboxCoordinates
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

        // Extract bounding box areas
        const allBoxSizes: number[] = rawData.flatMap((item: { bboxCoordinates: string[] }) =>
          item.bboxCoordinates.map((coordStr) => {
            const coords = coordStr.split(",").map(parseFloat);
            if (coords.length !== 4 || coords.some(isNaN)) return null;
            const [x1, y1, x2, y2] = coords;
            return Math.abs(x2 - x1) * Math.abs(y2 - y1);
          }).filter((size): size is number => size !== null)
        );

        if (allBoxSizes.length === 0) {
          throw new Error("No bounding box data available");
        }

        // Define fixed number of bins 
        const maxSize = Math.max(...allBoxSizes);
        const binSize = maxSize / 15;

        const bins: BoxData[] = Array.from({ length: 15 }, (_, i) => ({
          range: `${Math.round(i * binSize)} - ${Math.round((i + 1) * binSize)}`,
          count: 0,
        }));

        // Count occurrences in each bin
        allBoxSizes.forEach((size) => {
          const index = Math.min(Math.floor(size / binSize), 14);
          bins[index].count++;
        });

        // Compute average bounding box size
        const avgBoxSize = allBoxSizes.reduce((sum, val) => sum + val, 0) / allBoxSizes.length;

        setDistribution(bins);
        setAverageBoxSize(avgBoxSize);
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
        <CardTitle>Bounding Box Metrics</CardTitle>
        <CardDescription>Size distribution of bounding boxes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Bounding Box Size</p>
            <p className="text-2xl font-bold">{averageBoxSize?.toFixed(2)} px</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tickFormatter={(value: string) => value.split(" - ")[0]} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




