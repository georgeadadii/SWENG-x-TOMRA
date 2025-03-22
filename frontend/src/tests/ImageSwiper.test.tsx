import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApolloProvider } from '@apollo/client';
import { useQuery } from '@apollo/client';
import ImageSwiper from '@/components/ImageSwiper';
import mockClient from '__mocks__/apolloClient';


jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

describe('ImageSwiper Component', () => {
  const mockData = {
    results: [
      {
        imageUrl: 'https://example.com/image1.jpg',
        classLabel: 'Cat',
        confidence: 0.95,
      },
      {
        imageUrl: 'https://example.com/image2.jpg',
        classLabel: 'Dog',
        confidence: 0.89,
      },
    ],
  };

  beforeEach(() => {
    mockUseQuery.mockReturnValue({ data: mockData, loading: false, error: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with images', async () => {
    render(
      <ApolloProvider client={mockClient}>
        <ImageSwiper />
      </ApolloProvider>
    );

    const firstImage = screen.getByRole('img', { name: /cat/i });
    expect(firstImage).toBeInTheDocument();
    expect(firstImage).toHaveAttribute('src', 'https://example.com/image1.jpg');

    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 95.00%')).toBeInTheDocument();
  });

  test('handles swipe to the right', async () => {
    render(
      <ApolloProvider client={mockClient}>
        <ImageSwiper />
      </ApolloProvider>
    );

    const rightButton = screen.getByLabelText(/chevron-right/i);
    fireEvent.click(rightButton);

    await waitFor(() => {
      const secondImage = screen.getByRole('img', { name: /dog/i });
      expect(secondImage).toBeInTheDocument();
      expect(secondImage).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });

    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 89.00%')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: true, error: null });

    render(
      <ApolloProvider client={mockClient}>
        <ImageSwiper />
      </ApolloProvider>
    );

    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('displays error state', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: false, error: new Error('Failed to fetch images') });

    render(
      <ApolloProvider client={mockClient}>
        <ImageSwiper />
      </ApolloProvider>
    );

    const errorMessage = screen.getByText(/oops! we couldn't load the images./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays "No images available" when there are no images', () => {
    mockUseQuery.mockReturnValue({ data: { results: [] }, loading: false, error: null });

    render(
      <ApolloProvider client={mockClient}>
        <ImageSwiper />
      </ApolloProvider>
    );

    const noImagesMessage = screen.getByText(/no images available/i);
    expect(noImagesMessage).toBeInTheDocument();
  });
});
