import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageClassificationFilter } from '../components/filter';
import '@testing-library/jest-dom';
import React, {useState} from 'react';
import type { Option } from '@/components/ui/multi-select';

function FilterWrapper() {
  const [selectedLabels, setSelectedLabels] = useState<Option[]>([]); // specify the type here
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

    // Check header and description
    expect(screen.getByText(/Image Classification Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Filter classification images based on various criteria/i)).toBeInTheDocument();

    // Verify default dropdown labels and MultiSelect placeholder
    expect(screen.getByText(/Any date/i)).toBeInTheDocument();
    expect(screen.getByText(/All statuses/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search labels.../i)).toBeInTheDocument();
  });

  test('updates date filter when an option is selected', async () => {
    render(<FilterWrapper />);

    // Click the date dropdown trigger (initially displaying "Any date")
    const dateDropdownTrigger = screen.getByText(/Any date/i);
    fireEvent.click(dateDropdownTrigger);

    // Click on the "Last 7 days" option
    const last7DaysOption = screen.getByText(/Last 7 days/i);
    fireEvent.click(last7DaysOption);

    // Verify that the dropdown now displays "Last 7 days"
    await waitFor(() => {
      expect(screen.getByText(/Last 7 days/i)).toBeInTheDocument();
    });
  });

  test('updates status filter when an option is selected', async () => {
    render(<FilterWrapper />);

    // Click the status dropdown trigger (initially displaying "All statuses")
    const statusDropdownTrigger = screen.getByText(/All statuses/i);
    fireEvent.click(statusDropdownTrigger);

    // Click on the "Misclassified" option
    const misclassifiedOption = screen.getByText(/Misclassified/i);
    fireEvent.click(misclassifiedOption);

    // Verify that the dropdown now displays "Misclassified"
    await waitFor(() => {
      expect(screen.getByText(/Misclassified/i)).toBeInTheDocument();
    });
  });
});