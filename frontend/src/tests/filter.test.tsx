/// <reference types="@testing-library/jest-dom" />
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageClassificationFilter } from '@/components/filter';
import type { Option } from '@/components/ui/multi-select';

function FilterWrapper() {
  const [selectedLabels, setSelectedLabels] = useState<Option[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'correct' | 'misclassified' | 'not reviewed'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'all'>('all');

  return (
    <ImageClassificationFilter
      selectedLabels={selectedLabels}
      setSelectedLabels={setSelectedLabels}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
    />
  );
}

describe('ImageClassificationFilter Component', () => {
  test('renders default filter state', () => {
    render(<FilterWrapper />);
    expect(screen.getByText(/Image Classification Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Filter classification images based on various criteria/i)).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: /Any date/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /All statuses/i })[0]).toBeInTheDocument();

    expect(screen.getByText(/Search labels\.\.\./i)).toBeInTheDocument();
  });

  test('updates date filter when an option is selected', async () => {
    render(<FilterWrapper />);
    const dateDropdownTrigger = screen.getAllByRole('button', { name: /Any date/i })[0];
    fireEvent.click(dateDropdownTrigger);
    const last7DaysOption = screen.getByText(/Last 7 days/i);
    fireEvent.click(last7DaysOption);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Last 7 days/i })[0]).toBeInTheDocument();
    });
  });

  test('updates status filter when an option is selected', async () => {
    render(<FilterWrapper />);
    const statusDropdownTrigger = screen.getAllByRole('button', { name: /All statuses/i })[0];
    fireEvent.click(statusDropdownTrigger);
    const misclassifiedOption = screen.getByText(/Misclassified/i);
    fireEvent.click(misclassifiedOption);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Misclassified/i })[0]).toBeInTheDocument();
    });
  });
});
