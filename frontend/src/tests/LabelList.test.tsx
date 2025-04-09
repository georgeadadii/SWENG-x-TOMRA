import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import LabelList from '@/components/LabelList';
import { gql } from '@apollo/client';

const GET_LABELS = gql`
  query GetLabels {
    imageMetrics {
      imageUrl
      labels
      confidences
    }
  }
`;

const emptyMock = [
  {
    request: {
      query: GET_LABELS,
    },
    result: {
      data: { imageMetrics: [] }
    },
    delay: 50 
  }
];

describe('LabelList component', () => {
  it('shows loading state', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <LabelList />
      </MockedProvider>
    );
    expect(screen.getByText('Loading labels...')).toBeInTheDocument();
  });

  it('shows no labels message when no labels are used', async () => {
    render(
      <MockedProvider mocks={emptyMock} addTypename={false}>
        <LabelList />
      </MockedProvider>
    );

    expect(screen.getByText('Loading labels...')).toBeInTheDocument();
    await waitFor(() => {
      
      expect(screen.queryByText('Loading labels...')).not.toBeInTheDocument(); 
      expect(screen.getByText('No labels currently in use')).toBeInTheDocument();
    }, { timeout: 3000 }); 

    expect(screen.getByText('Used Labels (0)')).toBeInTheDocument();
    expect(screen.getByText('Unused Labels (0)')).toBeInTheDocument();
  });
});

