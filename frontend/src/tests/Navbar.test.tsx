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

  it('changes opacity on hover', () => {
    render(<Navbar />);
    
    const productsLink = screen.getByRole('link', { name: /Products/i });
  
    expect(productsLink).toHaveClass('opacity-80');
    
    fireEvent.mouseEnter(productsLink);
    expect(productsLink).toHaveClass('opacity-100');
    
    fireEvent.mouseLeave(productsLink);
    expect(productsLink).toHaveClass('opacity-80');
  });
});
