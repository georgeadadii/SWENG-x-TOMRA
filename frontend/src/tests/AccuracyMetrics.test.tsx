import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AccuracyMetrics from '@/components/accuracy-metrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


jest.mock("recharts", () => ({
  BarChart: ({ children }) => <div className="recharts-wrapper">{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));


jest.mock("@/components/ui/card", () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardDescription: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
}));

describe('AccuracyMetrics', () => {
  const mockData = [
    { name: "Accuracy", value: 0.85 },
    { name: "Precision", value: 0.82 },
    { name: "Recall", value: 0.88 },
    { name: "F1 Score", value: 0.85 },
  ];

  it('renders the component with the correct title and description', () => {
    render(<AccuracyMetrics />);

    expect(screen.getByText('Accuracy Metrics')).toBeInTheDocument();
    expect(screen.getByText('Performance metrics based on ground truth data')).toBeInTheDocument();
  });

  it('renders the correct metrics data', () => {
    render(<AccuracyMetrics />);

    mockData.forEach((item) => {
      
      expect(screen.getByText(item.name)).toBeInTheDocument();

      
      const valueElements = screen.getAllByText(item.value.toFixed(2));
      expect(valueElements.length).toBeGreaterThan(0); // Ensure at least one match
    });
  });

  it('renders the BarChart component', () => {
    const { container } = render(<AccuracyMetrics />);

   
    const chartContainer = container.querySelector('.recharts-wrapper');
    expect(chartContainer).toBeInTheDocument();
  });
});