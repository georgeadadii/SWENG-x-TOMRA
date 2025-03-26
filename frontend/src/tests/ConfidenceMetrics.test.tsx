import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfidenceMetrics from "@/components/confidence-metrics";

// Mock recharts components
jest.mock("recharts", () => ({
  BarChart: jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: jest.fn(() => <div data-testid="bar" />),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe("ConfidenceMetrics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              imageMetrics: [
                { confidences: [0.95, 0.87, 0.76, 0.65, 0.93, 0.12, 0.35, 0.89, 0.45, 0.78] },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<ConfidenceMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    await act(async () => {
      render(<ConfidenceMetrics />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the correct average confidence score and high confidence percentage", async () => {
    await act(async () => {
      render(<ConfidenceMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Average Confidence Score")).toBeInTheDocument();
    expect(screen.getByText("0.67")).toBeInTheDocument(); // Adjusted based on test data
    expect(screen.getByText("High Confidence Detections (>0.8)")).toBeInTheDocument();
    expect(screen.getByText("50.00%")); // Adjusted based on test data
  });

  it("renders the bar chart with data after successful fetch", async () => {
    await act(async () => {
      render(<ConfidenceMetrics />);
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
      render(<ConfidenceMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Confidence Metrics")).toBeInTheDocument();
    expect(screen.getByText("Distribution and averages of confidence scores")).toBeInTheDocument();
  });
});
