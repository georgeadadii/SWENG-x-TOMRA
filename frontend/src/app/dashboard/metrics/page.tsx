"use client";

import ImageClassificationMetrics from "@/components/image-classification-metrics";

const Metrics: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Image Classification Metrics</h1>
      <ImageClassificationMetrics />
    </div>
  );
};

export default Metrics;
