import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

// Define the correct type for fetched data
type ChartData = {
  label: string;
  confidence: number;
};

type AggregatedData = Record<string, { label: string; totalConfidence: number; count: number }>;

const ClassConfidence: React.FC = () => {
  const [results, setResults] = useState<ChartData[]>([]);
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
                  labels
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

        // Assuming `labels` is an array of labels and `confidences` is an array of corresponding confidence values
        const rawData = result.data?.imageMetrics || [];

        // Flatten the labels and confidences into one array of objects with their respective values
        const flattenedData: ChartData[] = rawData.flatMap((item: { labels: string[]; confidences: number[] }) =>
          item.labels.map((label, index) => ({
            label,
            confidence: item.confidences[index],
          }))
        );

        // Group by `label` and calculate the average confidence for each label
        const aggregatedData: AggregatedData = flattenedData.reduce((acc, item) => {
          if (!acc[item.label]) {
            acc[item.label] = { label: item.label, totalConfidence: 0, count: 0 };
          }
          acc[item.label].totalConfidence += item.confidence;
          acc[item.label].count++;
          return acc;
        }, {} as AggregatedData);

        // Convert the aggregated data to an array with averages
        const averagedData: ChartData[] = Object.values(aggregatedData).map((group) => ({
          label: group.label,
          confidence: parseFloat((group.totalConfidence / group.count).toFixed(2)), // Average confidence
        }));

        setResults(averagedData);
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
        <CardTitle>Class Confidence</CardTitle>
        <CardDescription>Averages of confidence scores for different labels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="confidence" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassConfidence;



