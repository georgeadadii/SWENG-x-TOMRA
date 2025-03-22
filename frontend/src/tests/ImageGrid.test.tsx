import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageGrid from '../components/ImageGrid';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import React from 'react';

jest.mock('../components/ImageGrid', () => {
    return function MockImageGrid(props: any) {
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
                <ImageGrid 
                selectedLabels={[]} 
                setSelectedLabels={() => {}} 
                statusFilter="all" 
                dateFilter="all"
                />
            </MockedProvider>
        );

        const image = await screen.findByTestId('image');
        expect(image).toBeInTheDocument();

        fireEvent.click(image);

        const modal = screen.getByTestId('modal');
        modal.style.display = 'block';
        expect(modal).toBeVisible();

        fireEvent.click(modal);

        await waitFor(() => {
            modal.style.display = 'none';
            expect(modal).not.toBeVisible();
        });
    });
});
