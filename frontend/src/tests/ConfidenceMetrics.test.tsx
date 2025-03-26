import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfidenceMetrics from "@/components/confidence-metrics";

fetchMock.enableMocks();

describe("ConfidenceMetrics Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test("displays loading state initially", () => {
    render(<ConfidenceMetrics />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays error message if API call fails", async () => {
    fetchMock.mockReject(new Error("Failed to fetch"));
    render(<ConfidenceMetrics />);
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test("displays calculated confidence metrics correctly", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        data: {
          imageMetrics: [
            { confidences: [0.9, 0.8, 0.85, 0.6] },
            { confidences: [0.95, 0.7, 0.5, 0.3] },
          ],
        },
      })
    );

    render(<ConfidenceMetrics />);

    await waitFor(() => {
      expect(screen.getByText("Confidence Metrics")).toBeInTheDocument();
      expect(screen.getByText("Average Confidence Score")).toBeInTheDocument();
      expect(screen.getByText("High Confidence Detections (>0.8)"));
    });

    expect(screen.getByText("0.71")).toBeInTheDocument(); // Avg Confidence
    expect(screen.getByText("50.00%")); // High Confidence %
  });
});
