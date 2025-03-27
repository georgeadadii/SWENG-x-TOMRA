import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ImageGrid from '../components/ImageGrid';
import { MockedProvider, MockLink, MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import * as apolloClientModule from '@/lib/apolloClient';
import '@testing-library/jest-dom';

const GET_IMAGES = gql`
  query GetImages {
    results {
      imageUrl
      classLabel
      confidence
      batchId
      classified
      misclassified
      createdAt
    }
  }
`;

const errorMock: MockedResponse = {
  request: { query: GET_IMAGES },
  error: new Error("Failed to fetch images"),
};

const successMock: MockedResponse = {
  request: { query: GET_IMAGES },
  result: {
    data: {
      results: [
        {
          imageUrl: "https://example.com/cat.jpg",
          classLabel: "Cat",
          confidence: 0.95,
          batchId: "batch1",
          classified: true,
          misclassified: false,
          createdAt: "2023-03-01T10:00:00Z",
        },
        {
          imageUrl: "https://example.com/dog.jpg",
          classLabel: "Dog",
          confidence: 0.89,
          batchId: "batch2",
          classified: false,
          misclassified: true,
          createdAt: "2023-03-02T10:00:00Z",
        },
      ],
    },
  },
};

const emptyMock: MockedResponse = {
  request: { query: GET_IMAGES },
  result: { data: { results: [] } },
};

const createMockClient = (mocks: MockedResponse[]) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink(mocks),
  });

describe("ImageGrid Component", () => {
  beforeEach(() => {
    Object.defineProperty(apolloClientModule, 'default', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("renders error state", async () => {
    Object.defineProperty(apolloClientModule, 'default', {
      value: createMockClient([errorMock]),
      writable: true,
      configurable: true,
    });

    render(
      <MockedProvider addTypename={false}>
        <ImageGrid
          selectedLabels={[]}
          setSelectedLabels={() => { }}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Error Loading Images/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch images/i)).toBeInTheDocument();
    });
  });

  it("renders image grid view with images", async () => {
    Object.defineProperty(apolloClientModule, 'default', {
      value: createMockClient([successMock]),
      writable: true,
      configurable: true,
    });

    render(
      <MockedProvider addTypename={false}>
        <ImageGrid
          selectedLabels={[]}
          setSelectedLabels={() => { }}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cat")).toBeInTheDocument();
      expect(screen.getByText("Dog")).toBeInTheDocument();
    });

    // Check for the elements with the background images
    const catContainer = screen.getByText("Cat").closest(".relative");
    expect(catContainer).toBeInTheDocument();

    const dogContainer = screen.getByText("Dog").closest(".relative");
    expect(dogContainer).toBeInTheDocument();
  });

  it("opens modal on image click and closes when clicking outside", async () => {
    Object.defineProperty(apolloClientModule, 'default', {
      value: createMockClient([successMock]),
      writable: true,
      configurable: true,
    });

    render(
      <MockedProvider addTypename={false}>
        <ImageGrid
          selectedLabels={[]}
          setSelectedLabels={() => { }}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cat")).toBeInTheDocument();
    });

    // Click on the div containing the image
    const catElement = screen.getByText("Cat").closest(".relative");
    if (catElement) {
      fireEvent.click(catElement);
    }

    // Wait for the modal to appear and check for confidence text in the modal
    await waitFor(() => {
      expect(screen.getByText(/Confidence:/i)).toBeInTheDocument();
    });

    // Check for the modal overlay and close the modal
    const modalOverlay = document.querySelector('.fixed.inset-0');
    if (modalOverlay) {
      fireEvent.click(modalOverlay);
    }

    // Wait for the modal to close
    await waitFor(() => {
      expect(screen.queryByText(/Confidence:/i)).not.toBeInTheDocument();
    });
  });

  it("renders no images when data is empty", async () => {
    Object.defineProperty(apolloClientModule, 'default', {
      value: createMockClient([emptyMock]),
      writable: true,
      configurable: true,
    });

    render(
      <MockedProvider addTypename={false}>
        <ImageGrid
          selectedLabels={[]}
          setSelectedLabels={() => { }}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    await waitFor(() => {
      const images = screen.queryAllByRole("img");
      expect(images.length).toBe(0);
    });
  });
});