import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import InferenceTimeMetrics from "@/components/inference-time-metrics";

// Mock recharts components
jest.mock("recharts", () => ({
  LineChart: jest.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: jest.fn(() => <div data-testid="line" />),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe("InferenceTimeMetrics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              imageMetrics: [
                { inferenceTime: 30 },
                { inferenceTime: 45 },
                { inferenceTime: 55 },
                { inferenceTime: 70 },
                { inferenceTime: 90 },
                { inferenceTime: 120 },
                { inferenceTime: 150 },
                { inferenceTime: 180 },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<InferenceTimeMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    
    await act(async () => {
      render(<InferenceTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the correct average inference time", async () => {
    await act(async () => {
      render(<InferenceTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Manually calculate expected average
    const expectedAverage = (30 + 45 + 55 + 70 + 90 + 120 + 150 + 180) / 8;

    expect(screen.getByText("Average Inference Time")).toBeInTheDocument();
    expect(screen.getByText(`${expectedAverage.toFixed(2)} ms`)).toBeInTheDocument();
  });

  it("renders the line chart with computed bins", async () => {
    await act(async () => {
      render(<InferenceTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("line")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("displays the correct title and description", async () => {
    await act(async () => {
      render(<InferenceTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Inference Time Metrics")).toBeInTheDocument();
    expect(screen.getByText("Distribution of inference times (ms)")).toBeInTheDocument();
  });
});



