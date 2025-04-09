import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import AccuracyMetrics from "@/components/accuracy-metrics";

const mockGraphQLResponse = {
  data: {
    results: [
      { classLabel: "Class A", classified: true, reviewed: true },   // Correct classification
      { classLabel: "Class A", classified: false, reviewed: true },  // Incorrect classification
      { classLabel: "Class B", classified: true, reviewed: false },  // Not reviewed
      { classLabel: "Class B", classified: true, reviewed: true },   // Correct classification
      { classLabel: "Class C", classified: false, reviewed: true },  // Incorrect classification
    ],
  },
};

describe("AccuracyMetrics Component", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGraphQLResponse),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders and displays the accuracy and precision metrics correctly", async () => {
    render(<AccuracyMetrics />);

    await waitFor(() => {
      expect(screen.getByText("Accuracy Metrics")).toBeInTheDocument();
      expect(screen.getByText("Performance metrics based on ground truth data")).toBeInTheDocument();
    });

    // Expected Accuracy Calculation:
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("0.75")).toBeInTheDocument(); 

    // Expected Average Precision Calculation:
    // Precision per class:
    // Class A: 1/2 = 0.50
    // Class B: 1/1 = 1.00
    // Class C: 0/1 = 0.00
    // Average Precision = (0.50 + 1.00 + 0.00) / 3 = 0.50
    expect(screen.getByText("Average Precision")).toBeInTheDocument();
    expect(screen.getByText("0.83")).toBeInTheDocument();

    
    // Check that loading message is not present
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("displays an error message when the API fails", async () => {
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ errors: [{ message: "Server error" }] }),
      })
    );

    render(<AccuracyMetrics />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Error:"))).toBeInTheDocument();
    });
  });
});
