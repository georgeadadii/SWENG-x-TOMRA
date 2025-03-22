import { render, screen, fireEvent } from '@testing-library/react';
import ImageBatch from '../components/ImageBatch';
import React from 'react';

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

describe('ImageBatch', () => {
  const onClassify = jest.fn();
  const annotationStatus = {};
  const setHoveredIndex = jest.fn();
  const setSelectedImage = jest.fn();

  const setup = () => {
    render(
      <ImageBatch
        images={sampleImages}
        onClassify={onClassify}
        annotationStatus={annotationStatus}
        hoveredIndex={null}
        setHoveredIndex={setHoveredIndex}
        setSelectedImage={setSelectedImage}
      />
    );
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
    const catContainer = screen.getByAltText('Cat').parentElement;
    fireEvent.mouseEnter(catContainer!);
    expect(setHoveredIndex).toHaveBeenCalled();
    fireEvent.mouseLeave(catContainer!);
    expect(setHoveredIndex).toHaveBeenCalledWith(null);
    fireEvent.click(screen.getByAltText('Dog'));
    expect(setSelectedImage).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: 'https://example.com/image2.jpg' })
    );
  });
});
