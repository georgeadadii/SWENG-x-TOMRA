import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

type BoxData = {
  range: string;
  count: number;
};

interface BoxProportionMetricsProps {
  selectedBatch: string | null;
}

export default function BoxProportionMetrics({ selectedBatch }: BoxProportionMetricsProps) {
  const [averageBoxProportion, setAverageBoxProportion] = useState<number | null>(null);
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
              imageMetrics${selectedBatch ? `(batchId: "${selectedBatch}")` : ''} {
                boxProportions
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

        // Flatten the proportions with proper type checking
        const allProportions: number[] = rawData
          .filter((item: any) => item?.boxProportions && Array.isArray(item.boxProportions))
          .flatMap((item: any) => 
            item.boxProportions.filter((prop: any) => typeof prop === 'number' && !isNaN(prop))
          );

        if (allProportions.length === 0) {
          throw new Error("No box proportion data available");
        }

        // Define fixed number of bins (10)
        const maxProportion = Math.max(...allProportions);
        const minProportion = Math.min(...allProportions);

        // Ensure we have valid min and max proportions
        if (isNaN(minProportion) || isNaN(maxProportion)) {
          throw new Error("Invalid proportion data");
        }

        const binSize = (maxProportion - minProportion) / 10;
        const bins: BoxData[] = Array.from({ length: 10 }, (_, i) => ({
          range: `${((minProportion + i * binSize) * 100).toFixed(1)}% - ${((minProportion + (i + 1) * binSize) * 100).toFixed(1)}%`,
          count: 0,
        }));

        // Count occurrences in each bin
        allProportions.forEach((proportion) => {
          const index = Math.min(Math.floor((proportion - minProportion) / binSize), 9);
          if (index >= 0) {
            bins[index].count++;
          }
        });

        // Compute average box proportion
        const avgProportion = (allProportions.reduce((sum, val) => sum + val, 0) / allProportions.length) * 100;

        setDistribution(bins);
        setAverageBoxProportion(avgProportion);
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
        <CardTitle>Bounding Box Proportion Metrics</CardTitle>
        <CardDescription>Proportion distribution of bounding boxes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Bounding Box Proportion</p>
            <p className="text-2xl font-bold">{averageBoxProportion?.toFixed(2)} %</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tickFormatter={(value: string) => value.split("-")[0]} />
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
