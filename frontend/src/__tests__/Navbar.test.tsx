import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../components/Navbar';
import '@testing-library/jest-dom';

describe('Navbar Component', () => {
  it('renders the logo', () => {
    render(<Navbar />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo.png'));
  });
  

  it('renders navigation links', () => {
    render(<Navbar />);
    const links = ['Products', 'About', 'Support'];
    links.forEach((text) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `#${text.toLowerCase()}`);
    });
  });

  // it('changes opacity on hover', () => {
  //   render(<Navbar />);
    
  //   const productsLink = screen.getByRole('link', { name: /Products/i });
  
  //   // Check if the initial opacity class is applied (if you use opacity-80 for the initial state)
  //   expect(productsLink).toHaveClass('opacity-80');
    
  //   // Simulate hover over the link and check for opacity change (opacity-100 or similar class for hover)
  //   fireEvent.mouseEnter(productsLink);
  //   expect(productsLink).toHaveClass('opacity-100');
    
  //   // Simulate mouse leave and check for opacity reset to opacity-80
  //   fireEvent.mouseLeave(productsLink);
  //   expect(productsLink).toHaveClass('opacity-80');
  // });
});
