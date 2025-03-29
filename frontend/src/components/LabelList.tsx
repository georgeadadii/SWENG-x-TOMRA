"use client";

import { gql, useQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ImageMetric {
  imageUrl: string;
  labels: string[];
}

interface ImageMetricsData {
  imageMetrics: ImageMetric[];
}

const GET_LABELS = gql`
  query GetLabels {
    imageMetrics {
      imageUrl
      labels
    }
  }
`;

const ALL_LABELS = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse",
  "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie",
  "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove",
  "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon",
  "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut",
  "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
  "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book",
  "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
];

interface LabelCount {
  name: string;
  count: number;
}

const LabelList = () => {
  const { data, loading, error } = useQuery<ImageMetricsData>(GET_LABELS, { client });

  const { usedLabels, unusedLabels } = useMemo(() => {
    if (!data?.imageMetrics) return { usedLabels: [], unusedLabels: [] };
    
    // Create a map to count label occurrences
    const labelCounts = new Map<string, number>();
    
    // Process all labels from all images
    data.imageMetrics.forEach((metric) => {
      if (Array.isArray(metric.labels)) {
        metric.labels.forEach((label) => {
          // Only count labels that are in our ALL_LABELS list
          if (ALL_LABELS.includes(label)) {
            labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
          }
        });
      }
    });
    
    // Convert to array of objects with counts
    const usedLabelsWithCounts: LabelCount[] = Array.from(labelCounts.entries())
      .map(([name, count]) => ({ name, count }))
      // Sort by count (descending) - most used to least used
      .sort((a, b) => b.count - a.count);
    
    // Get unused labels
    const usedLabelNames = new Set(usedLabelsWithCounts.map(l => l.name));
    const unusedLabelsList = ALL_LABELS
      .filter(label => !usedLabelNames.has(label))
      .map(name => ({ name, count: 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      usedLabels: usedLabelsWithCounts,
      unusedLabels: unusedLabelsList
    };
  }, [data]);

  return (
    <div className="w-full">
      {loading && <p>Loading labels...</p>}
      {error && <p className="text-red-500">Error loading labels: {error.message}</p>}
      
      <Card className="shadow-md w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-left">Used Labels ({usedLabels.length})</h2>
          <hr className="border-gray-200 mb-4" />
          
          {usedLabels.length === 0 && !loading ? (
            <p className="text-gray-500 italic">No labels currently in use</p>
          ) : (
            <ul className="space-y-0 max-h-96 overflow-y-auto">
              {usedLabels.map(label => (
                <li key={label.name} className="text-left py-2 border-b border-gray-200 last:border-b-0">
                  <div className="text-base font-medium">{label.name}</div>
                  <div className="text-sm text-gray-500">Number of Images: {label.count}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md w-full mt-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4 text-left">Unused Labels ({unusedLabels.length})</h2>
          <hr className="border-gray-200 mb-4" />
          
          {unusedLabels.length === 0 && !loading ? (
            <p className="text-gray-500 italic">All labels are currently in use</p>
          ) : (
            <ul className="space-y-0 max-h-96 overflow-y-auto">
              {unusedLabels.map(label => (
                <li key={label.name} className="text-left py-2 border-b border-gray-200 last:border-b-0">
                  <div className="text-base font-medium">{label.name}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelList;