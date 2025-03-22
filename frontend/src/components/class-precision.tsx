import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Box } from "./ui/box";
import { CircleHelp } from "lucide-react";
import "katex/dist/katex.min.css";
import katex from "katex";

const LaTeXComponent = () => {
  const latexString = "\\text{Precision} = \\frac{\\text{True Positives}}{\\text{True Positives} + \\text{False Positives}}";

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(latexString),
      }}
    />
  );
};

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type ChartData = {
    label: string;
    precision: number;
};

type AggregatedData = Record<string, { classifiedCount: number; reviewedCount: number }>;

const ClassPrecision: React.FC = () => {
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

                const rawData = result.data?.results || [];

                // Aggregate counts per label
                const aggregatedData: AggregatedData = rawData.reduce((acc: AggregatedData, item: { classLabel: string; classified: boolean; reviewed: boolean }) => {
                    if (!acc[item.classLabel]) {
                        acc[item.classLabel] = { classifiedCount: 0, reviewedCount: 0 };
                    }
                    if (item.classified) acc[item.classLabel].classifiedCount++;
                    if (item.reviewed) acc[item.classLabel].reviewedCount++;
                    return acc;
                }, {} as AggregatedData);

                // Compute precision per class label
                const computedData: ChartData[] = Object.entries(aggregatedData).map(([label, counts]) => ({
                    label,
                    precision: counts.reviewedCount > 0 ? parseFloat((counts.classifiedCount / counts.reviewedCount).toFixed(2)) : 0, // Avoid division by zero
                }));

                setResults(computedData);
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
                <CardTitle>Class Precision</CardTitle>
                <CardDescription>Shows the precision by class labels.</CardDescription>
                <Dialog>
                    <DialogTrigger>
                        <Box variant="outline" size="icon">
                            <CircleHelp className="h-4 w-4" />
                        </Box>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>What is precision?</DialogTitle>
                            <DialogDescription>
                                Precision in image classification measures the accuracy of positive predictions.
                                It is defined as the ratio of correctly classified instances to the total instances that were predicted as a certain class:
                            </DialogDescription>
                        </DialogHeader>
                        <LaTeXComponent/>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={results} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
                                <YAxis domain={[0, 1]} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
                                <Tooltip formatter={(value) => `${(value as number * 100).toFixed(2)}%`} />
                                <Bar dataKey="precision" fill="#8884d8" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ClassPrecision;

