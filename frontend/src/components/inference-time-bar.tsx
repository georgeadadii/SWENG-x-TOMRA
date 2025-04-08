import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#878f99"];

interface InferenceTimeBarProps {
  selectedBatch: string | null;
}

export default function InferenceTimeBar({ selectedBatch }: InferenceTimeBarProps) {
  const [timeData, setTimeData] = useState([
    { name: "Inference Time", value: 0 },
    { name: "Preprocessing Time", value: 0 },
    { name: "Postprocessing Time", value: 0 },
    { name: "Total Time", value: 0 },
  ]);
  const [totalTime, setTotalTime] = useState<number>(0);
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
                preprocessingTime
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

        const rawData = result.data.imageMetrics;
        if (!rawData || rawData.length === 0) {
          throw new Error("No data available");
        }

        // Sum up times across all images
        const totalPreprocessingTime = rawData.reduce((sum: number, img: any) => sum + img.preprocessingTime, 0);
        const totalInferenceTime = rawData.reduce((sum: number, img: any) => sum + img.inferenceTime, 0);
        const totalPostprocessingTime = rawData.reduce((sum: number, img: any) => sum + img.postprocessingTime, 0);
        const total = totalPreprocessingTime + totalInferenceTime + totalPostprocessingTime;

        setTotalTime(total);
        setTimeData([
          { name: "Inference Time", value: totalInferenceTime },
          { name: "Preprocessing Time", value: totalPreprocessingTime },
          { name: "Postprocessing Time", value: totalPostprocessingTime },
          { name: "Total Time", value: total },
        ]);
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Time Performance Metrics</CardTitle>
        <CardDescription>Breakdown of preprocessing, inference, and postprocessing times (ms)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Total Time</p>
            <p className="text-2xl font-bold">{totalTime?.toFixed(2)} ms</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)} ms`} />
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


