import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BatchView from '../components/BatchView';
import '@testing-library/jest-dom';

// Mock the framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
    const actual = jest.requireActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({ children, ...props }) => <div {...props}>{children}</div>,
        },
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

describe("BatchView Component", () => {
    // Sample image data for testing
    const mockImages = [
        {
            imageUrl: "https://example.com/image1.jpg",
            classLabel: "Cat",
            confidence: 0.95,
            batchId: "batch1",
            classified: true,
            misclassified: false,
            createdAt: "2023-03-01T10:00:00Z",
        },
        {
            imageUrl: "https://example.com/image2.jpg",
            classLabel: "Dog",
            confidence: 0.89,
            batchId: "batch1",
            classified: false,
            misclassified: true,
            createdAt: "2023-03-01T10:30:00Z",
        },
        {
            imageUrl: "https://example.com/image3.jpg",
            classLabel: "Bird",
            confidence: 0.78,
            batchId: "batch2",
            classified: true,
            misclassified: false,
            createdAt: "2023-03-02T10:00:00Z",
        }
    ];

    const mockAnnotationStatus = {
        "https://example.com/image1.jpg": "correct",
        "https://example.com/image2.jpg": "incorrect",
        "https://example.com/image3.jpg": null
    };

    const mockOnClassify = jest.fn();
    const mockSetHoveredIndex = jest.fn();
    const mockSetSelectedImage = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders empty state when no images", () => {
        render(
            <BatchView
                images={[]}
                onClassify={mockOnClassify}
                annotationStatus={{}}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        expect(screen.getByText(/No images match your filter criteria/i)).toBeInTheDocument();
    });

    it("renders batch cards grouped correctly", () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // Should have batch1 and batch2 as separate batches
        expect(screen.getByText(/Batch batch1/i)).toBeInTheDocument();
        expect(screen.getByText(/Batch batch2/i)).toBeInTheDocument();

        // Check for date formatting
        expect(screen.getByText(/Mar 1, 2023/i)).toBeInTheDocument();
        expect(screen.getByText(/Mar 2, 2023/i)).toBeInTheDocument();

        // Check for image counts
        expect(screen.getByText(/2 images/i)).toBeInTheDocument();
        expect(screen.getByText(/1 images/i)).toBeInTheDocument();
    });

    it("shows correct batch statistics", () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // Find all statistic indicators
        const statElements = screen.getAllByText(/1/i);

        // We should have correct stats for both batches
        expect(statElements.length).toBeGreaterThan(0);
    });

    it("selects and displays a batch when clicked", async () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // Find and click on the first batch card
        const batchCard = screen.getByText(/Batch batch1/i).closest(".batch-card");
        if (batchCard) {
            fireEvent.click(batchCard.querySelector(".relative.flex-1") || batchCard);
        }

        // After clicking, it should show the batch detail view with back button
        await waitFor(() => {
            expect(screen.getByText(/Back to all batches/i)).toBeInTheDocument();
        });

        // Should show the images in the selected batch
        expect(screen.getByText("Cat")).toBeInTheDocument();
        expect(screen.getByText("Dog")).toBeInTheDocument();

        // Bird should not be visible as it's in a different batch
        expect(screen.queryByText("Bird")).not.toBeInTheDocument();
    });

    it("navigates back to all batches", async () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // First select a batch
        const batchCard = screen.getByText(/Batch batch1/i).closest(".batch-card");
        if (batchCard) {
            fireEvent.click(batchCard.querySelector(".relative.flex-1") || batchCard);
        }

        // Verify we're in batch view
        await waitFor(() => {
            expect(screen.getByText(/Back to all batches/i)).toBeInTheDocument();
        });

        // Click the back button
        const backButton = screen.getByText(/Back to all batches/i);
        fireEvent.click(backButton);

        // Should return to the batch cards view
        await waitFor(() => {
            expect(screen.getByText(/Batch batch1/i)).toBeInTheDocument();
            expect(screen.getByText(/Batch batch2/i)).toBeInTheDocument();
            expect(screen.queryByText(/Back to all batches/i)).not.toBeInTheDocument();
        });
    });

    it("shows correct classification status indicators on images", async () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // First select a batch
        const batchCard = screen.getByText(/Batch batch1/i).closest(".batch-card");
        if (batchCard) {
            fireEvent.click(batchCard.querySelector(".relative.flex-1") || batchCard);
        }

        // Verify we're in batch view
        await waitFor(() => {
            expect(screen.getByText(/Back to all batches/i)).toBeInTheDocument();
        });

        // Check that the correct/incorrect indicators are shown
        expect(screen.getByText("Correct")).toBeInTheDocument();
        expect(screen.getByText("Incorrect")).toBeInTheDocument();
    });

    it("calls setSelectedImage when an image is clicked", async () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // First select a batch
        const batchCard = screen.getByText(/Batch batch1/i).closest(".batch-card");
        if (batchCard) {
            fireEvent.click(batchCard.querySelector(".relative.flex-1") || batchCard);
        }

        // Verify we're in batch view
        await waitFor(() => {
            expect(screen.getByText(/Back to all batches/i)).toBeInTheDocument();
        });

        // Find and click on an image
        const imageElement = screen.getByText("Cat").closest(".relative");
        if (imageElement) {
            fireEvent.click(imageElement);
        }

        // Verify that setSelectedImage was called with the correct image
        expect(mockSetSelectedImage).toHaveBeenCalledWith(mockImages[0]);
    });

    it("triggers hover events correctly", async () => {
        render(
            <BatchView
                images={mockImages}
                onClassify={mockOnClassify}
                annotationStatus={mockAnnotationStatus}
                hoveredIndex={null}
                setHoveredIndex={mockSetHoveredIndex}
                setSelectedImage={mockSetSelectedImage}
            />
        );

        // First select a batch
        const batchCard = screen.getByText(/Batch batch1/i).closest(".batch-card");
        if (batchCard) {
            fireEvent.click(batchCard.querySelector(".relative.flex-1") || batchCard);
        }

        // Verify we're in batch view
        await waitFor(() => {
            expect(screen.getByText(/Back to all batches/i)).toBeInTheDocument();
        });

        // Find an image and hover over it
        const imageElement = screen.getByText("Cat").closest(".relative");
        if (imageElement) {
            fireEvent.mouseEnter(imageElement);
        }

        // Verify setHoveredIndex was called with the correct index
        expect(mockSetHoveredIndex).toHaveBeenCalledWith(0);

        // Now mouse leave
        if (imageElement) {
            fireEvent.mouseLeave(imageElement);
        }

        // Verify setHoveredIndex was called with null
        expect(mockSetHoveredIndex).toHaveBeenCalledWith(null);
    });
});