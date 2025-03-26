import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import BoundingBoxMetrics from "@/components/bounding-box-metrics";


const mockGraphQLResponse = {
  data: {
    imageMetrics: [
      {
        bboxCoordinates: [
          "10,20,30,40",  // box 1
          "50,60,70,80",  // box 2
          "100,110,120,130", // box 3
          "150,160,170,180", // box 4
        ],
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

    await waitFor(() => {
      expect(screen.getByText("Bounding Box Metrics")).toBeInTheDocument();
      expect(screen.getByText("Average Bounding Box Size")).toBeInTheDocument();
      expect(screen.getByText("400.00 px")).toBeInTheDocument();
    });

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

    render(<BoundingBoxMetrics />);

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Error:"))).toBeInTheDocument();
    });
  });
});
