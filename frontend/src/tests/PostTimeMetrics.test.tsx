import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostTimeMetrics from "@/components/post-time-metrics";


jest.mock("recharts", () => ({
  LineChart: jest.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: jest.fn(() => <div data-testid="line" />),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe("PostTimeMetrics Component", () => {
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
                  averagePostprocessTime: 78.45,
                  postprocessTimeDistribution: JSON.stringify({
                    "0-50": 12,
                    "51-100": 25,
                    "101-150": 18,
                    "151-200": 7,
                    "201+": 4,
                  }),
                },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<PostTimeMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    await act(async () => {
      render(<PostTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the correct average postprocess time", async () => {
    await act(async () => {
      render(<PostTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Average Postprocess Time")).toBeInTheDocument();
    expect(screen.getByText("78.45 ms")).toBeInTheDocument();
  });

  it("renders the line chart with data after successful fetch", async () => {
    await act(async () => {
      render(<PostTimeMetrics />);
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
      render(<PostTimeMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Postprocess Time Metrics")).toBeInTheDocument();
    expect(screen.getByText("Distribution of Postprocess times (ms)")).toBeInTheDocument();
  });
});
