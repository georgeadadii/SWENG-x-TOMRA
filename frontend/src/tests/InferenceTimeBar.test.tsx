import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import InferenceTimeBar from "@/components/inference-time-bar";

// Mocking recharts components
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
              imageMetrics: [
                {
                  inferenceTime: 120,
                  preprocessingTime: 50,
                  postprocessingTime: 30,
                },
              ],
            },
          }),
      }) as jest.Mock
    );
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
        "Breakdown of preprocessing, inference, and postprocessing times (ms)"
      )
    ).toBeInTheDocument();

    // Ensure elements containing the expected text exist
    expect(screen.getByText(/Total\s*Time/i)).toBeInTheDocument();
    // Ensure the total time is displayed
    expect(screen.getByText("200.00 ms")).toBeInTheDocument();
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


