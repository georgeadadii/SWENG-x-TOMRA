import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

/*const mockData = [
  { name: "Class A", value: 400 },
  { name: "Class B", value: 300 },
  { name: "Class C", value: 200 },
  { name: "Class D", value: 100 },
]*/

type ChartData = {
  classLabel: string;
  count: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

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
                results {
                  classLabel
                  confidence
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
    
        const rawData: ChartData[] = result.data?.results || [];

        // Group by `classLabel` and count the occurrences of each label
        const aggregatedData = rawData.reduce((acc, item) => {
          if (!acc[item.classLabel]) {
            acc[item.classLabel] = { classLabel: item.classLabel, count: 0 };
          }
          acc[item.classLabel].count ++;
          return acc;
        }, {} as Record<string, { classLabel: string; count: number }>);
    
        const data = Object.values(aggregatedData).map((group) => ({
          classLabel: group.classLabel,
          count: group.count,
        }));
    
        setResult(data);
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
        <CardTitle>Class Distribution</CardTitle>
        <CardDescription>Distribution of detected classes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={results} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="count" nameKey="classLabel">
                {results.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

