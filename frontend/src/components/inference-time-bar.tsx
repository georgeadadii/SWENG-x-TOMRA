import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function InferenceTimeBar() {
  const [timeData, setTimeData] = useState([
    { name: "Total Time", value: 0 },
    { name: "Inference Time", value: 0 },
    { name: "Preprocessing Time", value: 0 },
    { name: "Postprocessing Time", value: 0 },
  ]);
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
                totalInferenceTime
                totalPostprocessingTime
                totalPreprocessingTime
                totalTime
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

        setTimeData([
          { name: "Total Time", value: data.totalTime },
          { name: "Inference Time", value: data.totalInferenceTime },
          { name: "Preprocessing Time", value: data.totalPreprocessingTime },
          { name: "Postprocessing Time", value: data.totalPostprocessingTime },
        ]);
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Time Performance Metrics</CardTitle>
        <CardDescription>
          Total inference time, postprocessing time, preprocessing time, and total time (ms)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120}/>
                <Tooltip />
                <Bar dataKey="value">
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>

  );
}


