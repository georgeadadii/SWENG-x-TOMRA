import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfidenceMetrics from "@/components/confidence-metrics";

// Mocking the fetch response
jest.mock("window.fetch", () =>
  jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            imageMetrics: [
              {
                confidences: [0.85, 0.90, 0.76, 0.92, 0.65],
              },
            ],
          },
        }),
    })
  )
);

describe("ConfidenceMetrics Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<ConfidenceMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch")));
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

    // Check average confidence score
    expect(screen.getByText("Average Confidence Score")).toBeInTheDocument();
    expect(screen.getByText(/0\.83/)).toBeInTheDocument(); // Matches the calculated average (0.85 + 0.90 + 0.76 + 0.92 + 0.65 = 4.08 / 5 = 0.816 => 0.83)

    // Check high confidence percentage
    expect(screen.getByText("High Confidence Detections (>0.8)")).toBeInTheDocument();
    expect(screen.getByText(/60\.00%/)).toBeInTheDocument(); // Matches the calculated percentage of high confidence (> 0.8)
  });

  it("renders the bar chart with data after successful fetch", async () => {
    await act(async () => {
      render(<ConfidenceMetrics />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Check if bar chart elements are rendered
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });
});

