import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

interface BatchSelectorProps {
  onBatchChange: (batchId: string | null) => void;
  activeTab: 'internal' | 'feedback';
}

export default function BatchSelector({ onBatchChange, activeTab }: BatchSelectorProps) {
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch the relevant data based on active tab
        if (activeTab === 'internal') {
          // Fetch batch IDs from imageMetrics
          const imageMetricsResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query {
                  imageMetrics {
                    batchId
                  }
                }
              `,
            }),
          });

          if (!imageMetricsResponse.ok) {
            throw new Error(`HTTP error! Status: ${imageMetricsResponse.status}`);
          }

          const imageMetricsResult = await imageMetricsResponse.json();
          if (imageMetricsResult.errors) {
            throw new Error(imageMetricsResult.errors[0]?.message || "GraphQL query error");
          }

          // Get unique batch IDs from imageMetrics
          const uniqueBatches = new Set<string>();
          if (imageMetricsResult.data?.imageMetrics) {
            imageMetricsResult.data.imageMetrics.forEach((item: { batchId: string | null }) => {
              if (item.batchId) {
                uniqueBatches.add(item.batchId);
              }
            });
          }

          // Convert to array and sort by batch ID
          const batchArray = Array.from(uniqueBatches)
            .map(id => ({ id, name: `Batch ${id.slice(0, 8)}` }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setBatches(batchArray);
        } else {
          // Fetch batch IDs from results
          const resultsResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query {
                  results {
                    batchId
                  }
                }
              `,
            }),
          });

          if (!resultsResponse.ok) {
            throw new Error(`HTTP error! Status: ${resultsResponse.status}`);
          }

          const resultsResult = await resultsResponse.json();
          if (resultsResult.errors) {
            throw new Error(resultsResult.errors[0]?.message || "GraphQL query error");
          }

          // Get unique batch IDs from results
          const uniqueBatches = new Set<string>();
          if (resultsResult.data?.results) {
            resultsResult.data.results.forEach((item: { batchId: string | null }) => {
              if (item.batchId) {
                uniqueBatches.add(item.batchId);
              }
            });
          }

          // Convert to array and sort by batch ID
          const batchArray = Array.from(uniqueBatches)
            .map(id => ({ id, name: `Batch ${id.slice(0, 8)}` }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setBatches(batchArray);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch batches");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [activeTab]);

  if (loading) return <p>Loading batches...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <Select onValueChange={(value) => onBatchChange(value === "all" ? null : value)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a batch" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Batches</SelectItem>
        {batches.map((batch) => (
          <SelectItem key={batch.id} value={batch.id}>
            {batch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 