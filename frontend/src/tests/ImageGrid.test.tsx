// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import ImageGrid from '../components/ImageGrid';
// import { MockedProvider } from '@apollo/client/testing';
// import '@testing-library/jest-dom';
// import React from 'react';

// jest.mock('../components/ImageGrid', () => {
//     return function MockImageGrid(props: any) {
//         return (
//             <div>
//                 <img src="test-image.jpg" alt="Test" data-testid="image" />
//                 <div role="dialog" style={{ display: 'none' }} data-testid="modal">
//                     Modal Content
//                 </div>
//             </div>
//         );
//     };
// });

// describe('ImageGrid Component', () => {
//     test('closes modal when clicking outside', async () => {
//         render(
//             <MockedProvider>
//                 <ImageGrid 
//                 selectedLabels={[]} 
//                 setSelectedLabels={() => {}} 
//                 statusFilter="all" 
//                 dateFilter="all"
//                 />
//             </MockedProvider>
//         );

//         const image = await screen.findByTestId('image');
//         expect(image).toBeInTheDocument();

//         fireEvent.click(image);

//         const modal = screen.getByTestId('modal');
//         modal.style.display = 'block';
//         expect(modal).toBeVisible();

//         fireEvent.click(modal);

//         await waitFor(() => {
//             modal.style.display = 'none';
//             expect(modal).not.toBeVisible();
//         });
//     });
// });

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
          setSelectedLabels={() => {}}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
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
          setSelectedLabels={() => {}}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByAltText("Cat")).toBeInTheDocument();
      expect(screen.getByAltText("Dog")).toBeInTheDocument();
    });

    const catImage = screen.getByAltText("Cat");
    expect(catImage).toHaveAttribute("src", "https://example.com/cat.jpg");

    const dogImage = screen.getByAltText("Dog");
    expect(dogImage).toHaveAttribute("src", "https://example.com/dog.jpg");
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
          setSelectedLabels={() => {}}
          statusFilter="all"
          dateFilter="all"
        />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByAltText("Cat")).toBeInTheDocument();
    });

    const catImage = screen.getByAltText("Cat");
    fireEvent.click(catImage);

    await waitFor(() => {
      expect(screen.getByText(/AI Tag:/i)).toBeInTheDocument();
    });

    const modalOverlay = document.querySelector('.fixed.inset-0');
    if (modalOverlay) {
      fireEvent.click(modalOverlay);
    }

    await waitFor(() => {
      expect(screen.queryByText(/AI Tag:/i)).not.toBeInTheDocument();
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
          setSelectedLabels={() => {}}
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
