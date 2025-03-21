import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClassDistribution from "@/components/class-distribution";


jest.mock("recharts", () => ({
  PieChart: jest.fn(({ children }) => <div data-testid="pie-chart">{children}</div>),
  Pie: jest.fn(() => <div data-testid="pie" />),
  Cell: jest.fn(() => <div data-testid="cell" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  Legend: jest.fn(() => <div data-testid="legend" />),
}));

describe("ClassDistribution Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              results: [
                { classLabel: "Class A", confidence: 0.9 },
                { classLabel: "Class B", confidence: 0.8 },
                { classLabel: "Class A", confidence: 0.85 },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it("renders loading state initially", () => {
    render(<ClassDistribution />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock;
    await act(async () => {
      render(<ClassDistribution />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it("renders the pie chart with data after successful fetch", async () => {
    await act(async () => {
      render(<ClassDistribution />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("displays the correct title and description", async () => {
    await act(async () => {
      render(<ClassDistribution />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Class Distribution")).toBeInTheDocument();
    expect(screen.getByText("Distribution of detected classes")).toBeInTheDocument();
  });
});
