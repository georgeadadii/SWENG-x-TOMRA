import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Overview from "../components/Overview";

beforeAll(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockFetchSuccess = () =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        data: {
          imageMetrics: [
            {
              confidences: [0.9, 0.8, 0.7],
              preprocessingTime: 100,
              inferenceTime: 200,
              postprocessingTime: 300,
            },
          ],
        },
      }),
  });

const mockFetchFailure = () => Promise.reject(new Error("Failed to fetch data"));

describe("Overview Component", () => {
  it("renders the loading state initially", async () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Simulates a pending request

    render(<Overview />);
    
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    global.fetch.mockImplementation(mockFetchFailure);

    await act(async () => {
      render(<Overview />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch data/i)).toBeInTheDocument();
    });
  });

  it("renders the metrics correctly after data is fetched", async () => {
    global.fetch.mockImplementation(mockFetchSuccess);

    await act(async () => {
      render(<Overview />);
    });

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument(); // 1 total image
      expect(screen.getByText("0.80")).toBeInTheDocument(); // Average confidence score
      expect(screen.getByText("3.0")).toBeInTheDocument(); // Average detections
      expect(screen.getByText("100.00 ms")).toBeInTheDocument(); // Preprocessing time
      expect(screen.getByText("200.00 ms")).toBeInTheDocument(); // Inference time
      expect(screen.getByText("300.00 ms")).toBeInTheDocument(); // Postprocessing time
    });
  });

  it("renders the bar chart with correct percentages", async () => {
    global.fetch.mockImplementation(mockFetchSuccess);

    await act(async () => {
      render(<Overview />);
    });

    await waitFor(() => {
      const bars = document.querySelectorAll("div.h-full.flex-shrink-0[style*='width']");

      expect(bars.length).toBe(3);
      expect(bars[0].style.width).toBe("16.666666666666664%"); // Preprocessing
      expect(bars[1].style.width).toBe("33.33333333333333%"); // Inference
      expect(bars[2].style.width).toBe("50%"); // Postprocessing
    });
  });
});




