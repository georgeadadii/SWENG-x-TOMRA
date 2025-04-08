"use client";

import { useState } from "react";
import ImageClassificationMetrics from "@/components/image-classification-metrics";

const Metrics: React.FC = () => {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  return (
    <div>
      <div className="p-5">
        <h1 className="text-4xl font-bold mb-4">Image Classification Metrics</h1>
      </div>
      <ImageClassificationMetrics 
        selectedBatch={selectedBatch} 
        onBatchChange={setSelectedBatch}
      />
    </div>
  );
};

export default Metrics;
