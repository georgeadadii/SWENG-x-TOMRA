import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

interface BatchSelectorProps {
  onBatchChange: (batchId: string | null) => void;
}

export default function BatchSelector({ onBatchChange }: BatchSelectorProps) {
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
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

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0]?.message || "GraphQL query error");
        }

        // Get unique batch IDs
        const uniqueBatches = new Set<string>();
        result.data.imageMetrics.forEach((item: { batchId: string | null }) => {
          if (item.batchId) {
            uniqueBatches.add(item.batchId);
          }
        });

        // Convert to array and sort by batch ID
        const batchArray = Array.from(uniqueBatches)
          .map(id => ({ id, name: `Batch ${id.slice(0, 8)}` }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setBatches(batchArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch batches");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

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