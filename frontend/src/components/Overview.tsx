import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

const GRAPHQL_ENDPOINT = "https://sixsense-backend.lemonhill-ac9dfb3e.germanywestcentral.azurecontainerapps.io/graphql";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

type MetricsData = {
  totalImages: number;
  averageConfidenceScore: number;
  averageDetections: number;
  averagePreprocessTime: number;
  averageInferenceTime: number;
  averagePostprocessTime: number;
};

export default function Overview() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
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
                confidences
                preprocessingTime
                inferenceTime
                postprocessingTime
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

        const imageMetrics = result.data.imageMetrics;

        // Calculate total images
        const totalImages = imageMetrics.length;
        const allConfidences: number[] = imageMetrics.flatMap((item: { confidences: number[] }) => item.confidences);
        const detectionsPerImage = imageMetrics.map((item: { confidences: string[] }) => item.confidences.length);
        // Calculate averages
        const averageConfidenceScore = 
          allConfidences.reduce((sum, val) => sum + val, 0) / allConfidences.length;
        const averageDetections = 
          detectionsPerImage.reduce((sum: any, val: any) => sum + val, 0) / detectionsPerImage.length;  
        const averagePreprocessTime =
          imageMetrics.reduce((sum: number, img: any) => sum + img.preprocessingTime, 0) / totalImages;
        const averageInferenceTime =
          imageMetrics.reduce((sum: number, img: any) => sum + img.inferenceTime, 0) / totalImages;
        const averagePostprocessTime =
          imageMetrics.reduce((sum: number, img: any) => sum + img.postprocessingTime, 0) / totalImages;

        setMetrics({
          totalImages,
          averageConfidenceScore,
          averageDetections,
          averagePreprocessTime,
          averageInferenceTime,
          averagePostprocessTime,
        });
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

  if (!metrics) return null; // Ensure metrics is not null before proceeding

  const {
    totalImages = 0,
    averageConfidenceScore = 0,
    averageDetections = 0,
    averagePreprocessTime = 0,
    averageInferenceTime = 0,
    averagePostprocessTime = 0,
  } = metrics;

  const totalLatency = averagePreprocessTime + averageInferenceTime + averagePostprocessTime;
  const preprocessPercentage = (averagePreprocessTime / totalLatency) * 100;
  const inferencePercentage = (averageInferenceTime / totalLatency) * 100;
  const postprocessPercentage = (averagePostprocessTime / totalLatency) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>A brief overview of the images and key performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium">Total Images</p>
              <p className="text-2xl font-bold">{totalImages}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Average Confidence Score</p>
              <p className="text-2xl font-bold">{averageConfidenceScore.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Average Detections</p>
              <p className="text-2xl font-bold">{averageDetections.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-[800px]">
        <CardHeader>
          <CardTitle>Average Time Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <div className="flex flex-col items-center">
                <p>Preprocessing:</p>
                <p className="font-bold">{averagePreprocessTime.toFixed(2)} ms</p>
              </div>
              <div className="flex flex-col items-center">
                <p>Inference:</p>
                <p className="font-bold">{averageInferenceTime.toFixed(2)} ms</p>
              </div>
              <div className="flex flex-col items-center">
                <p>Postprocessing:</p>
                <p className="font-bold">{averagePostprocessTime.toFixed(2)} ms</p>
              </div>
              <div className="flex flex-col items-center">
                <p>Total Latency:</p>
                <p className="font-bold">{totalLatency.toFixed(2)} ms</p>
              </div>
            </div>
            <div className="relative w-full h-6 bg-white-200 overflow-visible px-2">
              <div className="flex w-full h-6">
                <div className="h-full flex-shrink-0" style={{ width: `${preprocessPercentage}%`, backgroundColor: COLORS[0] }} />
                <div className="h-full flex-shrink-0" style={{ width: `${inferencePercentage}%`, backgroundColor: COLORS[1] }} />
                <div className="h-full flex-shrink-0" style={{ width: `${postprocessPercentage}%`, backgroundColor: COLORS[2] }} />
              </div>

              <div className="absolute top-0 left-0 w-full h-full flex px-2">
                <div className="flex items-center justify-center text-black text-xs font-bold flex-shrink-0"
                  style={{ width: `${preprocessPercentage}%`, minWidth: "30px" }}>
                  {preprocessPercentage.toFixed(1)}%
                </div>
                <div className="flex items-center justify-center text-black text-xs font-bold flex-shrink-0"
                  style={{ width: `${inferencePercentage}%`, minWidth: "30px" }}>
                  {inferencePercentage.toFixed(1)}%
                </div>
                <div className="flex items-center justify-center text-black text-xs font-bold flex-shrink-0"
                  style={{ width: `${postprocessPercentage}%`, minWidth: "30px" }}>
                  {postprocessPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <p>Preprocess</p>
              <p>Inference</p>
              <p>Postprocess</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


