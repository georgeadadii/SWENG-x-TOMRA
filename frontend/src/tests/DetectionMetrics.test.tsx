import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import DetectionMetrics from "@/components/detection-metrics";


jest.mock("recharts", () => ({
  BarChart: jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: jest.fn(() => <div data-testid="bar" />),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe("DetectionMetrics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              metrics: [
                {
                  detectionCountDistribution: JSON.stringify({
                    "0": 5,  // 5 detections in range "0"
                    "1": 10, // 10 detections in range "1"
                    "2": 15, // 15 detections in range "2"
                    "3": 20, // 20 detections in range "3"
                    "4": 25, // 25 detections in range "4"
                  }),
                },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<DetectionMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    await act(async () => {
      render(<DetectionMetrics />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the correct average detections per image", async () => {
    await act(async () => {
      render(<DetectionMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

   
    const totalDetections = 5 + 10 + 15 + 20 + 25; 
    const weightedSum = 0 * 5 + 1 * 10 + 2 * 15 + 3 * 20 + 4 * 25; 
    const expectedAverage = (weightedSum / totalDetections).toFixed(1); 

    expect(screen.getByText("Average Detections per Image")).toBeInTheDocument();
    expect(screen.getByText(expectedAverage)).toBeInTheDocument();
  });

  it("renders the bar chart with data after successful fetch", async () => {
    await act(async () => {
      render(<DetectionMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("displays the correct title and description", async () => {
    await act(async () => {
      render(<DetectionMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Detection Metrics")).toBeInTheDocument();
    expect(screen.getByText("Number of detections per image")).toBeInTheDocument();
  });
});
