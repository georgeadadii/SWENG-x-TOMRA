import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import BoundingBoxMetrics from "@/components/bounding-box-metrics";


const mockGraphQLResponse = {
  data: {
    metrics: [
      {
        averageBoxSize: 250.5,
        boxSizeDistribution: JSON.stringify({
          "0-100": 10,
          "101-200": 20,
          "201-300": 30,
          "301-400": 25,
          "401+": 15,
        }),
      },
    ],
  },
};

describe("BoundingBoxMetrics Component", () => {
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

  it("renders and displays the bounding box metrics correctly", async () => {
    render(<BoundingBoxMetrics />);

    await waitFor(() =>
      expect(screen.getByText("Average Bounding Box Size")).toBeInTheDocument()
    );

    expect(screen.getByText("250.50 px")).toBeInTheDocument();

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
  
    render(<BoundingBoxMetrics />);
  
    await waitFor(() =>
      expect(screen.getByText((content) => content.includes("Error:"))).toBeInTheDocument()
    );
  });  
});
