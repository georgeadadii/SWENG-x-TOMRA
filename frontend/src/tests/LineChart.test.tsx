import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LineChartComponent from "../components/LineChart";


jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe("LineChartComponent", () => {
  it("should render the chart title", () => {
    render(<LineChartComponent />);
    expect(screen.getByText(/Website Traffic Trends/i)).toBeInTheDocument();
  });

  it("should render the LineChart component with two lines", () => {
    render(<LineChartComponent />);

    
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();

   
    const lines = screen.getAllByTestId("line");
    expect(lines).toHaveLength(2);
  });
});
