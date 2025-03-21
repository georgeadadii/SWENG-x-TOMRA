import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import BoxProportionMetrics from "@/components/box-proportion-metrics"; // Adjust the import path as necessary

const mockGraphQLResponse = {
  data: {
    metrics: [
      {
        averageBoxProportion: 0.25,
        boxProportionDistribution: JSON.stringify({
          "0-20": 10,
          "21-40": 20,
          "41-60": 30,
          "61-80": 25,
          "81-100": 15,
        }),
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
    expect(screen.getByText("25.00 %")).toBeInTheDocument(); // 0.25 * 100 = 25.00%

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
});
