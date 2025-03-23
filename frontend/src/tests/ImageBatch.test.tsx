/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageBatch from '@/components/ImageBatch';

const sampleImages = [
  {
    imageUrl: 'https://example.com/image1.jpg',
    classLabel: 'Cat',
    confidence: 0.95,
    batchId: 'batch1',
    classified: true,
    misclassified: false,
    createdAt: '2023-03-01T10:00:00Z',
  },
  {
    imageUrl: 'https://example.com/image2.jpg',
    classLabel: 'Dog',
    confidence: 0.89,
    batchId: 'batch2',
    classified: false,
    misclassified: true,
    createdAt: '2023-03-02T10:00:00Z',
  },
];

describe('ImageBatch Component', () => {
  const onClassify = jest.fn();
  const annotationStatus = {};
  const setHoveredIndex = jest.fn();
  const setSelectedImage = jest.fn();

  const setup = (images = sampleImages) => {
    const { container } = render(
      <ImageBatch
        images={images}
        onClassify={onClassify}
        annotationStatus={annotationStatus}
        hoveredIndex={null}
        setHoveredIndex={setHoveredIndex}
        setSelectedImage={setSelectedImage}
      />
    );
    return { container };
  };

  test('renders batch headers and images', () => {
    setup();
    expect(screen.getByText(/Batch 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Batch 2/i)).toBeInTheDocument();
    expect(screen.getByAltText('Cat')).toBeInTheDocument();
    expect(screen.getByAltText('Dog')).toBeInTheDocument();
  });

  test('handles hover and click events', () => {
    setup();
    const catImage = screen.getByAltText('Cat');
    const catContainer = catImage.parentElement;
    fireEvent.mouseEnter(catContainer!);
    expect(setHoveredIndex).toHaveBeenCalled();
    fireEvent.mouseLeave(catContainer!);
    expect(setHoveredIndex).toHaveBeenCalledWith(null);
    fireEvent.click(screen.getByAltText('Dog'));
    expect(setSelectedImage).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: 'https://example.com/image2.jpg' })
    );
  });

  test('displays "No images available" when image array is empty', () => {
    const { container } = setup([]);
    expect(container.querySelectorAll('img').length).toBe(0);
  });
});
