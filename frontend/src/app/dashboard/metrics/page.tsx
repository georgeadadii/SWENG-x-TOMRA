"use client";

import { useState } from "react";
import ImageClassificationMetrics from "@/components/image-classification-metrics";
import BatchSelector from "@/components/batch-selector";

const Metrics: React.FC = () => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between p-5">
        <h1 className="text-4xl font-bold">Image Classification Metrics</h1>
        <div className="w-64">
          <BatchSelector onBatchChange={setSelectedBatch} />
        </div>
      </div>
      <ImageClassificationMetrics selectedBatch={selectedBatch} />
    </div>
  );
};

export default Metrics;
