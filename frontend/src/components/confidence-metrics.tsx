import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { range: "0-0.2", count: 10 },
  { range: "0.2-0.4", count: 20 },
  { range: "0.4-0.6", count: 30 },
  { range: "0.6-0.8", count: 25 },
  { range: "0.8-1.0", count: 15 },
]

export default function ConfidenceMetrics() {
  const averageConfidence = 0.65
  const highConfidencePercentage = 40

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confidence Metrics</CardTitle>
        <CardDescription>Distribution and averages of confidence scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Confidence Score</p>
            <p className="text-2xl font-bold">{averageConfidence.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">High Confidence Detections ({">"}0.8)</p>
            <p className="text-2xl font-bold">{highConfidencePercentage}%</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

