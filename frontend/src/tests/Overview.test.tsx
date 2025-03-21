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
          metrics: [
            {
              totalImages: 100,
              averageConfidenceScore: 0.85,
              averagePreprocessTime: 200,
              averageInferenceTime: 300,
              averagePostprocessTime: 100,
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
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("0.85")).toBeInTheDocument();
      expect(screen.getByText("200.00 ms")).toBeInTheDocument();
      expect(screen.getByText("300.00 ms")).toBeInTheDocument();
      expect(screen.getByText("100.00 ms")).toBeInTheDocument();
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
      expect(bars[0].style.width).toBe("33.33333333333333%");
      expect(bars[1].style.width).toBe("50%"); 
      expect(bars[2].style.width).toBe("16.666666666666664%"); 
    });
  });
  
});



