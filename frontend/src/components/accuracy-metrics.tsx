import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockData = [
  { name: "Accuracy", value: 0.85 },
  { name: "Precision", value: 0.82 },
  { name: "Recall", value: 0.88 },
  { name: "F1 Score", value: 0.85 },
]

export default function AccuracyMetrics() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Accuracy Metrics</CardTitle>
        <CardDescription>Performance metrics based on ground truth data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {mockData.map((item) => (
              <div key={item.name}>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-2xl font-bold">{item.value.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

