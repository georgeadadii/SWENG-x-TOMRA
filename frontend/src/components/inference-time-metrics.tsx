import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { time: "0-50", count: 10 },
  { time: "51-100", count: 20 },
  { time: "101-150", count: 30 },
  { time: "151-200", count: 25 },
  { time: "201-250", count: 15 },
  { time: "251+", count: 5 },
]

export default function InferenceTimeMetrics() {
  const averageTime = 125

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inference Time Metrics</CardTitle>
        <CardDescription>Distribution of inference times (ms)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Inference Time</p>
            <p className="text-2xl font-bold">{averageTime} ms</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

