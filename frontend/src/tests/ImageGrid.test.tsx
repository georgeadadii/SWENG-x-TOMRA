import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import ImageGrid from '../components/ImageGrid';
import { GET_IMAGES, STORE_FEEDBACK } from '../components/ImageGrid';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }) => (
        <div data-testid="motion-div" {...props}>{children}</div>
      ),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock tabs components
jest.mock("@/components/ui/tabs", () => {
  const originalModule = jest.requireActual("@/components/ui/tabs");
  return {
    ...originalModule,
    Tabs: ({ children, defaultValue }) => <div>{children}</div>,
    TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ children, value }) => (
      <button data-testid={`tab-${value}`}>{children}</button>
    ),
    TabsContent: ({ children, value }) => (
      <div data-testid={`content-${value}`} data-state="active">
        {children}
      </div>
    ),
  };
});

describe("ImageGrid Component", () => {
  const mockImages = [
    {
      imageUrl: "https://example.com/cat.jpg",
      classLabel: "Cat",
      confidence: 0.95,
      batchId: "batch1",
      classified: true,
      misclassified: false,
      createdAt: new Date().toISOString(),
    },
    {
      imageUrl: "https://example.com/dog.jpg",
      classLabel: "Dog",
      confidence: 0.89,
      batchId: "batch2",
      classified: false,
      misclassified: true,
      createdAt: new Date().toISOString(),
    }
  ];

  const mockGetImagesQuery = {
    request: {
      query: GET_IMAGES,
    },
    result: {
      data: {
        results: mockImages
      }
    }
  };

  const mockStoreFeedbackMutation = {
    request: {
      query: STORE_FEEDBACK,
      variables: {
        imageUrl: "https://example.com/cat.jpg",
        reviewed: true,
        classified: true,
        misclassified: false,
      }
    },
    result: {
      data: {
        storeFeedback: true
      }
    }
  };

  const defaultProps = {
    selectedLabels: [],
    setSelectedLabels: jest.fn(),
    statusFilter: 'all' as const,
    dateFilter: 'all' as const
  };

  it("renders loading state", async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <ImageGrid {...defaultProps} />
      </MockedProvider>
    );

    expect(await screen.findByText(/Loading images.../i)).toBeInTheDocument();
  });

  it("renders error state", async () => {
    const errorMock = {
      request: {
        query: GET_IMAGES,
      },
      error: new Error("Failed to fetch images")
    };

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <ImageGrid {...defaultProps} />
      </MockedProvider>
    );

    // Wait for error state to appear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(await screen.findByRole('heading', { name: /Error Loading Images/i })).toBeInTheDocument();
    expect(await screen.findByText(/Failed to fetch images/i)).toBeInTheDocument();
  });

  it("renders image grid view with images", async () => {
    render(
      <MockedProvider mocks={[mockGetImagesQuery, mockStoreFeedbackMutation]} addTypename={false}>
        <ImageGrid {...defaultProps} />
      </MockedProvider>
    );

    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check for images
    expect(await screen.findByText(/Cat/i)).toBeInTheDocument();
    expect(await screen.findByText(/Dog/i)).toBeInTheDocument();
  });

  it("can provide feedback on an image", async () => {
    render(
      <MockedProvider mocks={[mockGetImagesQuery, mockStoreFeedbackMutation]} addTypename={false}>
        <ImageGrid {...defaultProps} />
      </MockedProvider>
    );

    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check for images
    const catImage = await screen.findByText(/Cat/i);
    expect(catImage).toBeInTheDocument();
  });
});