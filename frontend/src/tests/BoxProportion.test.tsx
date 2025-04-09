import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import BoxProportionMetrics from "@/components/box-proportion-metrics"; 

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

  it("renders and displays the bounding box proportion metrics correctly", async () => {
    render(<BoxProportionMetrics />);

    
    await waitFor(() =>
      expect(screen.getByText("Average Bounding Box Proportion")).toBeInTheDocument()
    );

    
    expect(screen.getByText("48.00 %")).toBeInTheDocument(); 
   
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
  
    render(<BoxProportionMetrics />);
  
    // Wait for the error message to appear
    await waitFor(() =>
      expect(screen.getByText("Error: HTTP error! Status: 500")).toBeInTheDocument()
    );
  });  
});


