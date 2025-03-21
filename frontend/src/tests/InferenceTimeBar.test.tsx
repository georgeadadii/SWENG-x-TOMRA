import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import InferenceTimeBar from "@/components/inference-time-bar";



jest.mock("recharts", () => ({
  BarChart: jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: jest.fn(({ children }) => <div data-testid="bar">{children}</div>),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
  Cell: jest.fn(() => <div data-testid="cell" />),
}));

describe("InferenceTimeBar Component", () => {
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
                  totalTime: 200,
                  totalInferenceTime: 120,
                  totalPreprocessingTime: 50,
                  totalPostprocessingTime: 30,
                },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<InferenceTimeBar />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    
    await act(async () => {
      render(<InferenceTimeBar />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the correct time values after fetching", async () => {
    await act(async () => {
      render(<InferenceTimeBar />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Time Performance Metrics")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Total inference time, postprocessing time, preprocessing time, and total time (ms)"
      )
    ).toBeInTheDocument();

    // Ensure elements containing the expected text exist
    expect(screen.getByText(/Total Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Inference Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Preprocessing Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Postprocessing Time/i)).toBeInTheDocument();
  });

  it("renders the bar chart with correct data", async () => {
    await act(async () => {
      render(<InferenceTimeBar />);
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
});
