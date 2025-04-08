import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "https://sixsense-backend.lemonhill-ac9dfb3e.germanywestcentral.azurecontainerapps.io/graphql";

type BoxData = {
  range: string;
  count: number;
};

export default function BoxProportionMetrics() {
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
              imageMetrics {
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

        const rawData = result.data?.imageMetrics || [];

        // Flatten the proportions (as one image may have multiple values)
        const allProportions: number[] = rawData.flatMap((item: { boxProportions: number[] }) =>
          item.boxProportions
        );

        if (allProportions.length === 0) {
          throw new Error("No box proportion data available");
        }

        // Define fixed number of bins (10)
        const maxProportion = Math.max(...allProportions);
        const binSize = maxProportion / 10;

        const bins: BoxData[] = Array.from({ length: 10 }, (_, i) => ({
          range: `${((i * binSize) * 100).toFixed(1)}% - ${(((i + 1) * binSize) * 100).toFixed(1)}%`,
          count: 0,
        }));

        // Count occurrences in each bin
        allProportions.forEach((proportion) => {
          const index = Math.min(Math.floor(proportion / binSize), 9);
          bins[index].count++;
        });

        // Compute average box proportion
        const avgProportion = (allProportions.reduce((sum, val) => sum + val, 0) / allProportions.length) * 100;

        setDistribution(bins);
        setAverageBoxProportion(avgProportion);
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
