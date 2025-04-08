import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

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

interface AccuracyMetricsProps {
  selectedBatch: string | null;
}

export default function AccuracyMetrics({ selectedBatch }: AccuracyMetricsProps) {
  const [metrics, setMetrics] = useState([
    { name: "Accuracy", value: 0 },
    { name: "Average Precision", value: 0 },
  ]);
  const [averagePrecision, setAveragePrecision] = useState<number | null>(null); // To store average precision
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
            query {
              results${selectedBatch ? `(batchId: "${selectedBatch}")` : ''} {
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

        // Check if we have valid data
        if (!result.data?.results || result.data.results.length === 0) {
          setHasData(false);
          setMetrics([
            { name: "Accuracy", value: 0 },
            { name: "Average Precision", value: 0 },
          ]);
          setAveragePrecision(0);
          return;
        }

        const rawData: RawDataItem[] = result.data.results;
        setHasData(true);

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
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!hasData) return <p>No data available for {selectedBatch ? `batch ${selectedBatch}` : 'the selected criteria'}</p>;

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


