import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type ChartData = {
  topLabel: string;
  count: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ClassDistribution() {
  const [results, setResult] = useState<ChartData[]>([]);
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
                  topLabel
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

        const rawData: ChartData[] = result.data?.imageMetrics || [];

        // Group by `topLabel` and count the occurrences of each label
        const aggregatedData = rawData.reduce((acc, item) => {
          const label = item.topLabel;
          if (!acc[label]) {
            acc[label] = { topLabel: label, count: 0 };
          }
          acc[label].count++;
          return acc;
        }, {} as Record<string, { topLabel: string; count: number }>);

        // Convert to array and sort by count in descending order
        let sortedData = Object.values(aggregatedData).sort((a, b) => b.count - a.count);

        // Take top 20 and sum up the rest
        const top20 = sortedData.slice(0, 20);
        const otherCount = sortedData.slice(20).reduce((sum, item) => sum + item.count, 0);

        // Add "Other" category if there are more than 20 classes
        let finalData = top20;
        if (otherCount > 0) {
          finalData.push({ topLabel: "Other Classes", count: otherCount });
        }

        setResult(finalData);
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

  // Calculate the total count for percentage calculation
  const totalCount = results.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Distribution</CardTitle>
        <CardDescription>Distribution of detected classes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={results} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                outerRadius={80} 
                fill="#8884d8" 
                dataKey="count" 
                nameKey="topLabel">
                {results.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string) => {
                  const percent = ((value / totalCount) * 100).toFixed(2);
                  return [`${name}: ${value} (${percent}%)`];
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


