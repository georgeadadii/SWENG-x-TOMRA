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

    const anyDateButtons = screen.getAllByRole('button', { name: /Any date/i });
    expect(anyDateButtons[0]).toBeInTheDocument();

    const allStatusesButtons = screen.getAllByRole('button', { name: /All statuses/i });
    expect(allStatusesButtons[0]).toBeInTheDocument();

    // Check the multi-select placeholder.
    expect(screen.getByPlaceholderText(/Search labels.../i)).toBeInTheDocument();
  });

  test('updates date filter when an option is selected', async () => {
    render(<FilterWrapper />);

    // Retrieve the date dropdown trigger by disambiguating using getAllByRole.
    const anyDateButtons = screen.getAllByRole('button', { name: /Any date/i });
    const dateDropdownTrigger = anyDateButtons[0];
    fireEvent.click(dateDropdownTrigger);

    // Click on the "Last 7 days" option.
    const last7DaysOption = screen.getByText(/Last 7 days/i);
    fireEvent.click(last7DaysOption);

    // Verify that the dropdown now displays "Last 7 days".
    await waitFor(() => {
      const updatedDateButtons = screen.getAllByRole('button', { name: /Last 7 days/i });
      expect(updatedDateButtons[0]).toBeInTheDocument();
    });
  });

  test('updates status filter when an option is selected', async () => {
    render(<FilterWrapper />);

    // Retrieve the status dropdown trigger by disambiguating using getAllByRole.
    const allStatusesButtons = screen.getAllByRole('button', { name: /All statuses/i });
    const statusDropdownTrigger = allStatusesButtons[0];
    fireEvent.click(statusDropdownTrigger);

    // Click on the "Misclassified" option.
    const misclassifiedOption = screen.getByText(/Misclassified/i);
    fireEvent.click(misclassifiedOption);

    // Verify that the dropdown now displays "Misclassified".
    await waitFor(() => {
      const updatedStatusButtons = screen.getAllByRole('button', { name: /Misclassified/i });
      expect(updatedStatusButtons[0]).toBeInTheDocument();
    });
  });
});