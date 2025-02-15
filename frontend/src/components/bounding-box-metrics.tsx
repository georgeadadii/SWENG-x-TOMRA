import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { range: "0-100", count: 10 },
  { range: "101-200", count: 20 },
  { range: "201-300", count: 30 },
  { range: "301-400", count: 25 },
  { range: "401+", count: 15 },
]

export default function BoundingBoxMetrics() {
  const averageSize = 250

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bounding Box Metrics</CardTitle>
        <CardDescription>Size distribution of bounding boxes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Average Bounding Box Size</p>
            <p className="text-2xl font-bold">{averageSize} px</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

