import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

interface RawDataItem {
  classLabel: string;
  classified: boolean;
  reviewed: boolean;
}

interface AggregatedData {
  [key: string]: {
    classifiedCount: number;
    reviewedCount: number;
  };
}

export default function AccuracyMetrics() {
  const [metrics, setMetrics] = useState([
    { name: "Accuracy", value: 0 },
    { name: "Average Precision", value: 0 },
    { name: "Recall", value: 0 },
    { name: "F1 Score", value: 0 },
  ]);
  const [averagePrecision, setAveragePrecision] = useState<number | null>(null); // To store average precision
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
              results {
                classLabel
                classified
                reviewed
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

        const rawData: RawDataItem[] = result.data.results;
        if (!rawData || rawData.length === 0) {
          throw new Error("No data available");
        }

        // Calculate accuracy 
        const classifiedCount = rawData.filter((img) => img.classified).length;
        const reviewedCount = rawData.filter((img) => img.reviewed).length;
        const accuracy = reviewedCount > 0 ? classifiedCount / reviewedCount : 0;

        // Aggregate data by classLabel
        const aggregatedData: AggregatedData = rawData.reduce(
          (acc, item) => {
            if (!acc[item.classLabel]) {
              acc[item.classLabel] = { classifiedCount: 0, reviewedCount: 0 };
            }
            if (item.classified) acc[item.classLabel].classifiedCount++;
            if (item.reviewed) acc[item.classLabel].reviewedCount++;
            return acc;
          },
          {} as AggregatedData
        );

        // Compute precision for each class label
        const computedMetrics = Object.entries(aggregatedData).map(([label, counts]) => ({
          name: label,
          value: counts.reviewedCount > 0 ? counts.classifiedCount / counts.reviewedCount : 0,
        }));

        // Calculate average precision (mean of individual precisions)
        const avgPrecision =
          computedMetrics.length > 0
            ? computedMetrics.reduce((sum, item) => sum + item.value, 0) / computedMetrics.length
            : 0;
        setAveragePrecision(avgPrecision);

        // Set metrics with calculated accuracy and average precision
        setMetrics([
          { name: "Accuracy", value: accuracy },
          { name: "Average Precision", value: avgPrecision },
          { name: "Recall", value: 0.88 },  // Example value for recall
          { name: "F1 Score", value: 0.85 },  // Example value for F1 score
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
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Accuracy Metrics</CardTitle>
        <CardDescription>Performance metrics based on ground truth data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((item) => (
              <div key={item.name}>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-2xl font-bold">{item.value.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


