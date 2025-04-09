import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClassPrecision from '@/components/class-precision';


global.fetch = jest.fn() as jest.Mock;
jest.mock('katex/dist/katex.min.css', () => ({}));


describe('ClassPrecision component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('shows loading state initially', () => {
    render(<ClassPrecision selectedBatch={null} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<ClassPrecision selectedBatch={null} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it('shows no data message when no data is available', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { results: [] } }),
    });
    
    render(<ClassPrecision selectedBatch={null} />);
    
    await waitFor(() => {
      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });
  });

  it('displays data correctly when fetch succeeds', async () => {
    const mockData = {
      data: {
        results: [
          { classLabel: 'cat', classified: true, reviewed: true },
          { classLabel: 'cat', classified: true, reviewed: true },
          { classLabel: 'dog', classified: true, reviewed: false },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });
    
    render(<ClassPrecision selectedBatch={null} />);
    
    await waitFor(() => {
      expect(screen.getByText('Class Precision')).toBeInTheDocument();
      expect(screen.getByText('Shows the precision by class labels.')).toBeInTheDocument();
    });
  });

  it('includes batch ID in query when selectedBatch is provided', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { results: [] } }),
    });
    
    render(<ClassPrecision selectedBatch="batch123" />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      
      
      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.query).toContain('batchId: "batch123"');
    });
  });

});