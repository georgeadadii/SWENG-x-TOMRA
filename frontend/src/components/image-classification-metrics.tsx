import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConfidenceMetrics from "@/components/confidence-metrics"
import DetectionMetrics from "@/components/detection-metrics"
import ClassDistribution from "@/components/class-distribution"
import BoundingBoxMetrics from "@/components/bounding-box-metrics"
import InferenceTimeMetrics from "@/components/inference-time-metrics"
import AccuracyMetrics from "@/components/accuracy-metrics"
import InferenceTimeBar from "./inference-time-bar"
import BarChartComponent from "./BarChart"
import ClassConfidence from "./BarChart"
import BoxProportionMetrics from "./box-proportion-metrics"
import PreTimeMetrics from "./pre-time-metrics"
import PostTimeMetrics from "./post-time-metrics"

export default function ImageClassificationMetrics() {
  return (
    <Tabs defaultValue="internal" className="space-y-4">
      <TabsList>
        <TabsTrigger value="internal">Internal Metrics</TabsTrigger>
        <TabsTrigger value="feedback">Feedback-based Metrics</TabsTrigger>
      </TabsList>
      <TabsContent value="internal" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ConfidenceMetrics />
          <DetectionMetrics />
          <ClassDistribution />
          <BoundingBoxMetrics />
          <BoxProportionMetrics />
          <ClassConfidence/>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <InferenceTimeMetrics />
          <PreTimeMetrics />
          <PostTimeMetrics />
          <InferenceTimeBar />
        </div>
      </TabsContent>
      <TabsContent value="feedback" className="space-y-4">
        <AccuracyMetrics />
      </TabsContent>
    </Tabs>
  )
}

