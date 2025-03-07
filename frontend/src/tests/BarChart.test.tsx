import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassConfidence from '@/components/BarChart';


jest.mock('recharts', () => ({
  BarChart: jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: jest.fn(() => <div data-testid="bar" />),
  XAxis: jest.fn(() => <div data-testid="x-axis" />),
  YAxis: jest.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: jest.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: jest.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe('ClassConfidence Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              results: [
                { classLabel: 'Class A', confidence: 0.9 },
                { classLabel: 'Class B', confidence: 0.8 },
                { classLabel: 'Class A', confidence: 0.85 },
              ],
            },
          }),
      })
    ) as jest.Mock;
  });

  it('renders loading state initially', () => {
    render(<ClassConfidence />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch'))) as jest.Mock;
    await act(async () => {
      render(<ClassConfidence />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('renders the bar chart with data after successful fetch', async () => {
    await act(async () => {
      render(<ClassConfidence />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('displays the correct title and description', async () => {
    await act(async () => {
      render(<ClassConfidence />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Class Confidence')).toBeInTheDocument();
    expect(screen.getByText('Averages of confidence scores for different labels')).toBeInTheDocument();
  });
});

