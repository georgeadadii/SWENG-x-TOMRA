import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { range: "0-2", count: 15 },
  { range: "3-5", count: 30 },
  { range: "6-8", count: 25 },
  { range: "9-11", count: 20 },
  { range: "12+", count: 10 },
]

export default function DetectionMetrics() {
  const averageDetections = 5.7

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detection Metrics</CardTitle>
        <CardDescription>Number of detections per image</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Detections per Image</p>
            <p className="text-2xl font-bold">{averageDetections.toFixed(1)}</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

