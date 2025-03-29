"use client";

import { gql, useQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ImageMetric {
  imageUrl: string;
  labels: string[];
  confidences: number[];
}

interface ImageMetricsData {
  imageMetrics: ImageMetric[];
}

const GET_LABELS = gql`
  query GetLabels {
    imageMetrics {
      imageUrl
      labels
      confidences
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

interface LabelInfo {
  name: string;
  count: number;
  averageConfidence: number;
  images: ImageMetric[];
}

const LabelList = () => {
  const { data, loading, error } = useQuery<ImageMetricsData>(GET_LABELS, { client });

  const { usedLabels, unusedLabels } = useMemo(() => {
    if (!data?.imageMetrics) return { usedLabels: [], unusedLabels: [] };
    
    const labelInfo = new Map<string, LabelInfo>();
    
    data.imageMetrics.forEach((metric) => {
      if (Array.isArray(metric.labels)) {
        metric.labels.forEach((label, index) => {
          if (ALL_LABELS.includes(label)) {
            if (!labelInfo.has(label)) {
              labelInfo.set(label, {
                name: label,
                count: 0,
                averageConfidence: 0,
                images: []
              });
            }
            const info = labelInfo.get(label)!;
            info.count++;
            info.images.push(metric);
            const labelConfidence = metric.confidences[index] || 0;
            info.averageConfidence = info.images.reduce((sum, img, idx) => {
              const labelIdx = img.labels.indexOf(label);
              return sum + (img.confidences[labelIdx] || 0);
            }, 0) / info.count;
          }
        });
      }
    });
    
    const usedLabelsList = Array.from(labelInfo.values())
      .sort((a, b) => b.count - a.count);
    
    // Get unused labels
    const usedLabelNames = new Set(usedLabelsList.map(l => l.name));
    const unusedLabelsList = ALL_LABELS
      .filter(label => !usedLabelNames.has(label))
      .map(name => ({ name, count: 0, averageConfidence: 0, images: [] }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      usedLabels: usedLabelsList,
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
                <li key={label.name} className="text-left py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-base font-medium">{label.name}</div>
                      <div className="text-sm text-gray-500">Number of Images: {label.count}</div>
                      <div className="text-sm text-gray-500">Average Confidence: {(label.averageConfidence * 100).toFixed(1)}%</div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {label.images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 rounded-lg overflow-hidden"
                          style={{
                            backgroundImage: `url(${image.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      ))}
                      {label.images.length > 4 && (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                          +{label.images.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
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