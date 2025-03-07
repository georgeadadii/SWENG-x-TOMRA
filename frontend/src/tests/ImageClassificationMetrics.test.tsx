import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImageClassificationMetrics from "@/components/image-classification-metrics";

describe("ImageClassificationMetrics", () => {
  it("renders the component without crashing", () => {
    render(<ImageClassificationMetrics />);
    expect(screen.getByText("Internal Metrics")).toBeInTheDocument();
    expect(screen.getByText("Feedback-based Metrics")).toBeInTheDocument();
  });

  it("switches between tabs", async () => {
    render(<ImageClassificationMetrics />);
    fireEvent.click(screen.getByText("Feedback-based Metrics"));
    await waitFor(() => expect(screen.getByText("Feedback-based Metrics")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Internal Metrics"));
    await waitFor(() => expect(screen.getByText("Internal Metrics")).toBeInTheDocument());
  });

  it("renders tab buttons", () => {
    render(<ImageClassificationMetrics />);
    expect(screen.getByText("Confidence")).toBeInTheDocument();
    expect(screen.getByText("Detection")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });
});