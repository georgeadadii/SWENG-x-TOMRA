import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BatchSelector from "@/components/batch-selector";


beforeEach(() => {
  global.fetch = jest.fn().mockImplementation((_, options) => {
    const body = JSON.parse(options.body);
    if (body.query.includes("imageMetrics")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            imageMetrics: [
              { batchId: "abc123" },
              { batchId: "def456" },
            ],
          },
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: {
          results: [
            { batchId: "xyz987" },
            { batchId: "uvw654" },
          ],
        },
      }),
    });
  });

  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("BatchSelector", () => {
  it("renders loading state initially", async () => {
    render(<BatchSelector activeTab="internal" onBatchChange={() => {}} />);
    expect(screen.getByText("Loading batches...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText("Loading batches...")).not.toBeInTheDocument();
    });
  });

  it("displays batches after loading", async () => {
    render(<BatchSelector activeTab="internal" onBatchChange={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText("Select a batch")).toBeInTheDocument();
    });
  });

  it("calls onBatchChange when a batch is selected", async () => {
    const mockOnChange = jest.fn();
    render(<BatchSelector activeTab="internal" onBatchChange={mockOnChange} />);
    
    await waitFor(() => {
      expect(screen.getByText("Select a batch")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Select a batch"));
    
    await waitFor(() => {
      expect(screen.getByText("Batch abc123")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText("Batch abc123"));
    expect(mockOnChange).toHaveBeenCalledWith("abc123");
  });

  it("shows error message when fetch fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    
    render(<BatchSelector activeTab="internal" onBatchChange={() => {}} />);
    
    await waitFor(() => {
      const errorElement = screen.getByText(/Error:/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent("Network error");
    });
  });
});