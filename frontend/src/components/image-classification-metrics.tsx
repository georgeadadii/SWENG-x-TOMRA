import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import ConfidenceMetrics from "@/components/confidence-metrics";
import DetectionMetrics from "@/components/detection-metrics";
import ClassDistribution from "@/components/class-distribution";
import BoundingBoxMetrics from "@/components/bounding-box-metrics";
import InferenceTimeMetrics from "@/components/inference-time-metrics";
import AccuracyMetrics from "@/components/accuracy-metrics";
import InferenceTimeBar from "./inference-time-bar";
import ClassConfidence from "./BarChart";
import BoxProportionMetrics from "./box-proportion-metrics";
import PreTimeMetrics from "./pre-time-metrics";
import PostTimeMetrics from "./post-time-metrics";
import Overview from "./Overview";
import ClassPrecision from "./class-precision";
import BatchSelector from "./batch-selector";

interface OverviewCardProps {
  title: string;
  children: React.ReactNode;
}

interface ImageClassificationMetricsProps {
  selectedBatch: string | null;
  onBatchChange: (batchId: string | null) => void;
}

function OverviewCard({ title, children }: OverviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 space-y-2">
      <CardHeader className="flex justify-between items-center">
        <span className="text-lg font-semibold">{title}</span>
        <Button variant="outline" size="icon" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export default function ImageClassificationMetrics({ selectedBatch, onBatchChange }: ImageClassificationMetricsProps) {
  const [activeTab, setActiveTab] = useState<'internal' | 'feedback'>('internal');

  return (
    <Tabs defaultValue="internal" className="space-y-4 p-5" onValueChange={(value) => setActiveTab(value as 'internal' | 'feedback')}>
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="internal">Internal Metrics</TabsTrigger>
          <TabsTrigger value="feedback">Feedback-based Metrics</TabsTrigger>
        </TabsList>
        <BatchSelector onBatchChange={onBatchChange} activeTab={activeTab} />
      </div>

      <TabsContent value="internal" className="space-y-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Metrics Overview</TabsTrigger>
            <TabsTrigger value="confidence">Confidence</TabsTrigger>
            <TabsTrigger value="bounding">Detection</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Overview selectedBatch={selectedBatch} />
            </div>
          </TabsContent>

          <TabsContent value="confidence" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ConfidenceMetrics selectedBatch={selectedBatch} />
              <ClassDistribution selectedBatch={selectedBatch} />
              <ClassConfidence selectedBatch={selectedBatch} />
            </div>
          </TabsContent>

          <TabsContent value="bounding" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <BoundingBoxMetrics selectedBatch={selectedBatch} />
              <BoxProportionMetrics selectedBatch={selectedBatch} />
              <DetectionMetrics selectedBatch={selectedBatch} />
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <InferenceTimeMetrics selectedBatch={selectedBatch} />
              <PreTimeMetrics selectedBatch={selectedBatch} />
              <PostTimeMetrics selectedBatch={selectedBatch} />
              <InferenceTimeBar selectedBatch={selectedBatch} />
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="feedback" className="space-y-4">
        <Tabs defaultValue="accuracy-overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="accuracy-overview">Metrics Overview</TabsTrigger>
            <TabsTrigger value="precision">Precision</TabsTrigger>
          </TabsList>
          <TabsContent value="accuracy-overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AccuracyMetrics selectedBatch={selectedBatch} />
            </div>
          </TabsContent>
          <TabsContent value="precision" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <ClassPrecision selectedBatch={selectedBatch} />
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}