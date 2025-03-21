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

interface OverviewCardProps {
  title: string;
  children: React.ReactNode;
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

export default function ImageClassificationMetrics() {
  return (
    <Tabs defaultValue="internal" className="space-y-4 p-5">
      <TabsList>
        <TabsTrigger value="internal">Internal Metrics</TabsTrigger>
        <TabsTrigger value="feedback">Feedback-based Metrics</TabsTrigger>
      </TabsList>

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
              <Overview />
            </div>
          </TabsContent>

          <TabsContent value="confidence" className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ConfidenceMetrics />
              <ClassDistribution />
              <ClassConfidence />
            </div>

          </TabsContent>

          <TabsContent value="bounding" className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <BoundingBoxMetrics />
              <BoxProportionMetrics />
              <DetectionMetrics />
            </div>

          </TabsContent>

          <TabsContent value="time" className="space-y-4">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <InferenceTimeMetrics />
              <PreTimeMetrics />
              <PostTimeMetrics />
              <InferenceTimeBar />
            </div>

          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="feedback" className="space-y-4">
        <AccuracyMetrics />
      </TabsContent>
    </Tabs>
  );
}