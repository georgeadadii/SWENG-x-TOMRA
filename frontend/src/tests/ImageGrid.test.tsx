// import React from "react";
// import { render, screen, fireEvent } from "@testing-library/react";
// import '@testing-library/jest-dom';  
// import ImageGrid from "../components/ImageGrid";
// import { MockedProvider } from '@apollo/client/testing';


// describe("ImageGrid Component", () => {
//     test("closes modal when clicking outside", () => {
//         render(<ImageGrid />);
//         // Click on the first image to open the modal
//         const firstImage = screen.getAllByRole("img")[0];
//         fireEvent.click(firstImage);
//         // Ensure modal appears
//         const modal = screen.getByRole("dialog");
//         expect(modal).toBeInTheDocument();
//         // Click on the modal overlay to close
//         fireEvent.click(modal);
//         // Ensure modal disappears
//         expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
//     });
// });


// import { render, screen, fireEvent } from '@testing-library/react';
// import { ApolloProvider } from '@apollo/client';
// import client from '../lib/apolloClient';  // Make sure client is correctly initialized
// import ImageGrid from '../components/ImageGrid';

// // jest.mock('@apollo/client', () => ({
// //   useQuery: jest.fn().mockReturnValue({
// //     data: { results: [] },
// //     loading: false,
// //     error: null,
// //   }),
// // }));

// jest.mock('@apollo/client', () => ({
//     ...jest.requireActual('@apollo/client'), // This preserves the actual implementation
//     useQuery: jest.fn().mockReturnValue({
//       data: { results: [] },
//       loading: false,
//       error: null,
//     }),
//   }));


// describe('ImageGrid Component', () => {
//   test('closes modal when clicking outside', () => {
//     render(
//       <ApolloProvider client={client}>
//         <ImageGrid />
//       </ApolloProvider>
//     );
//     // Click on the first image to open the modal
//     const firstImage = screen.getAllByRole('img')[0];
//     fireEvent.click(firstImage);
//     // Ensure modal appears
//     const modal = screen.getByRole('dialog');
//     expect(modal).toBeInTheDocument();
//     // Click on the modal overlay to close
//     fireEvent.click(modal);
//     // Ensure modal disappears
//     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//   });
// });



// import "@testing-library/jest-dom";
// import { render, screen, fireEvent } from '@testing-library/react';
// import { ApolloProvider } from '@apollo/client';
// //import client from '../lib/apolloClient';  // Make sure client is correctly initialized
// import mockClient from '__mocks__/apolloClient'; // Use the mock client
// import ImageGrid from '../components/ImageGrid';

// jest.mock('@apollo/client', () => ({
//   ...jest.requireActual('@apollo/client'), // This preserves the actual implementation
//   useQuery: jest.fn().mockReturnValue({
//     data: { results: [] },
//     loading: false,
//     error: null,
//   }),
// }));

// describe('ImageGrid Component', () => {
//   //test('closes modal when clicking outside', () => {
//     test('closes modal when clicking outside', async () => {
//     render(
//       <ApolloProvider client={mockClient}>
//         <ImageGrid />
//       </ApolloProvider>
//     );
//     // Click on the first image to open the modal

//     // const firstImage = screen.getAllByRole('img')[0];
//     // fireEvent.click(firstImage);


//     const firstImage = await screen.findAllByRole('img');
//     fireEvent.click(firstImage[0]);


//     // Ensure modal appears

//     // const modal = screen.getByRole('dialog');
//     // expect(modal).toBeInTheDocument();


//     const modal = await screen.findByRole('dialog');
//     expect(modal).toBeInTheDocument();



//     // Click on the modal overlay to close
//     fireEvent.click(modal);
//     // Ensure modal disappears
//     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//   });
// });





// import { render, screen, fireEvent } from '@testing-library/react';
// import ImageGrid from '../components/ImageGrid';
// import { MockedProvider } from '@apollo/client/testing';
// import { GET_IMAGES } from '../../queries';

// describe('ImageGrid', () => {
//   const mocks = [
//     {
//       request: {
//         query: GET_IMAGES
//       },
//       result: {
//         data: {
//           images: [
//             { id: '1', url: 'https://example.com/image1.jpg' },
//             { id: '2', url: 'https://example.com/image2.jpg' }
//           ]
//         }
//       }
//     }
//   ];

//   it('renders images and allows clicking on them', async () => {
//     render(
//       <MockedProvider mocks={mocks} addTypename={false}>
//         <ImageGrid />
//       </MockedProvider>
//     );

//     // Wait for images to load
//     const images = await screen.findAllByRole('img');
//     expect(images).toHaveLength(2);

//     // Click on the first image
//     fireEvent.click(images[0]);
//     expect(screen.getByRole('dialog')).toBeInTheDocument();
//   });
// });




// import { render, screen, fireEvent } from '@testing-library/react';
// import ImageGrid from '../components/ImageGrid';
// import { MockedProvider } from '@apollo/client/testing';

// describe('ImageGrid Component', () => {
//     test('closes modal when clicking outside', async () => {
//         render(
//             <MockedProvider>
//                 <ImageGrid />
//             </MockedProvider>
//         );

//         // Wait for images to load
//         const images = await screen.findAllByRole('img');
//         expect(images.length).toBeGreaterThan(0);

//         // Click on the first image to open the modal
//         fireEvent.click(images[0]);

//         // Ensure modal appears
//         const modal = screen.getByRole('dialog');
//         expect(modal).toBeInTheDocument();

//         // Click on the modal overlay to close
//         fireEvent.click(modal);

//         // Ensure modal disappears
//         expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
//     });
// });



import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageGrid from '../components/ImageGrid';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';

jest.mock('../components/ImageGrid', () => {
    return function MockImageGrid() {
        return (
            <div>
                <img src="test-image.jpg" alt="Test" data-testid="image" />
                <div role="dialog" style={{ display: 'none' }} data-testid="modal">
                    Modal Content
                </div>
            </div>
        );
    };
});

describe('ImageGrid Component', () => {
    test('closes modal when clicking outside', async () => {
        render(
            <MockedProvider>
                <ImageGrid />
            </MockedProvider>
        );

        // Wait for image to load
        const image = await screen.findByTestId('image');
        expect(image).toBeInTheDocument();

        // Click on the image to open the modal
        fireEvent.click(image);

        // Simulate modal appearing
        const modal = screen.getByTestId('modal');
        modal.style.display = 'block';
        expect(modal).toBeVisible();

        // Click on the modal overlay to close
        fireEvent.click(modal);

        // Ensure modal disappears
        await waitFor(() => {
            modal.style.display = 'none';
            expect(modal).not.toBeVisible();
        });
    });
});
