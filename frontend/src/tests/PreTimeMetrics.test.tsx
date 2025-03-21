import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PreTimeMetrics from "@/components/pre-time-metrics";


jest.mock("recharts", () => ({
  LineChart: jest.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: jest.fn(() => <div data-testid="line" />),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe("PreTimeMetrics Component", () => {
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
                  averagePreprocessTime: 65.32,
                  preprocessTimeDistribution: JSON.stringify({
                    "0-50": 15,
                    "51-100": 22,
                    "101-150": 18,
                    "151-200": 10,
                    "201+": 5,
                  }),
                },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<PreTimeMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    await act(async () => {
      render(<PreTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the correct average preprocess time", async () => {
    await act(async () => {
      render(<PreTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Average Preprocess Time")).toBeInTheDocument();
    expect(screen.getByText("65.32 ms")).toBeInTheDocument();
  });

  it("renders the line chart with data after successful fetch", async () => {
    await act(async () => {
      render(<PreTimeMetrics />);
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
      render(<PreTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Preprocess Time Metrics")).toBeInTheDocument();
    expect(screen.getByText("Distribution of Preprocess times (ms)")).toBeInTheDocument();
  });
});
