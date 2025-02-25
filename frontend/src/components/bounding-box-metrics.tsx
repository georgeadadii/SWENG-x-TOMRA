import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type BoxData = {
  range: number;
  count: number;
};

/*const mockData = [
  { range: "0-100", count: 10 },
  { range: "101-200", count: 20 },
  { range: "201-300", count: 30 },
  { range: "301-400", count: 25 },
  { range: "401+", count: 15 },
]*/
export default function BoundingBoxMetrics() {
  //const averageSize = 250
  const [averageBoxSize, setAverageBoxSize] = useState<number | null>(null);
  const [distribution, setDistribution] = useState<BoxData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const averageDetections = 5.7
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
                averageBoxSize
                boxSizeDistribution
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

        // parse distribution
        const dist = JSON.parse(data.boxSizeDistribution || "{}");

        const formattedDist = Object.entries(dist).map(([range, count]) => ({
          range: range as unknown as number,
          count: count as number,
        }));

        setDistribution(formattedDist);

        setAverageBoxSize(data.averageBoxSize);
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
                <XAxis dataKey="range" tick={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

