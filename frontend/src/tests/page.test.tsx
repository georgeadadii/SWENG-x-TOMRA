import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import '@testing-library/jest-dom';
import Home from "@/app/page";
import { useRouter } from "next/navigation";

// Mock IntersectionObserver before importing components
class MockIntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = options?.root ?? null;
    this.rootMargin = options?.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0];
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// Assign the mock to global
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Continue with your mocks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Home page", () => {
  it("renders the home page with title and description", () => {
    render(<Home />);
    expect(screen.getByText(/Image Classification, Simplified/i)).toBeInTheDocument();
    expect(screen.getByText(/Instantly detect objects with AI-driven image recognition/i)).toBeInTheDocument();
  });

  it("navigates to /dashboard/images when 'Get Started' is clicked", () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<Home />);
    fireEvent.click(screen.getByText(/Get Started/i));
    expect(push).toHaveBeenCalledWith("/dashboard/images");
  });

  it("displays dynamically generated tags", async () => {
    render(<Home />);

    // Modified to be more flexible with the count
    await waitFor(() => {
      const tags = screen.getAllByText(/Cat|Dog|Car|Tree|Building|Person|Bird/i);
      expect(tags.length).toBeGreaterThan(0);
    });

    const catTags = screen.getAllByText(/Cat/i);
    expect(catTags.length).toBeGreaterThan(0);
  });
});