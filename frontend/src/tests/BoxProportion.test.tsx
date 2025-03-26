import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import BoxProportionMetrics from "@/components/box-proportion-metrics"; // Adjust the import path as necessary

const mockGraphQLResponse = {
  data: {
    imageMetrics: [
      {
        boxProportions: [0.1, 0.25, 0.4, 0.35, 0.8, 0.5, 0.15, 0.9, 0.75, 0.6],
      },
    ],
  },
};

describe("BoxProportionMetrics Component", () => {
  beforeEach(() => {
    // Mock fetch() for GraphQL API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGraphQLResponse),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Reset mocks after each test
  });

  it("renders and displays the bounding box proportion metrics correctly", async () => {
    render(<BoxProportionMetrics />);

    // Wait for data to load and check if the average bounding box proportion is rendered
    await waitFor(() =>
      expect(screen.getByText("Average Bounding Box Proportion")).toBeInTheDocument()
    );

    // Check the actual average box proportion value
    expect(screen.getByText("48.00 %")).toBeInTheDocument(); // (0.1 + 0.25 + 0.4 + 0.35 + 0.8 + 0.5 + 0.15 + 0.9 + 0.75 + 0.6) / 10 * 100 = 50.00%

    // Ensure that "Loading..." text disappears once data is loaded
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("displays an error message when the API fails", async () => {
    // Mock a failed API response (status 500)
    jest.spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ errors: [{ message: "Server error" }] }),
      })
    );
  
    render(<BoxProportionMetrics />);
  
    // Wait for the error message to appear
    await waitFor(() =>
      expect(screen.getByText("Error: HTTP error! Status: 500")).toBeInTheDocument()
    );
  });  

  /*it("displays the chart with correct distribution", async () => {
    render(<BoxProportionMetrics />);

    // Wait for the chart to load and check if a bar chart is rendered
    await waitFor(() => {
      expect(screen.getByRole("graphics-symbol")).toBeInTheDocument(); // Ensures the bar chart is rendered
    });
    
    // Check if bars exist in the chart for bounding box proportions
    expect(screen.getByText("0.0% - 10.0%")).toBeInTheDocument();
    expect(screen.getByText("10.0% - 20.0%")).toBeInTheDocument();
    expect(screen.getByText("20.0% - 30.0%")).toBeInTheDocument();
    expect(screen.getByText("30.0% - 40.0%")).toBeInTheDocument();
    expect(screen.getByText("40.0% - 50.0%")).toBeInTheDocument();
  });*/
});


