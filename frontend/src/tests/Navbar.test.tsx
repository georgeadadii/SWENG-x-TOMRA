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
  
  it('renders navigation links with correct hrefs', () => {
    render(<Navbar />);
    const links = ['Products', 'About', 'Support'];
    links.forEach((text) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `#${text.toLowerCase()}`);
    });
  });

  it('does not change opacity on hover (current design)', () => {
    render(<Navbar />);
    const productsLink = screen.getByRole('link', { name: /Products/i });
    
    expect(productsLink).toHaveClass('no-underline', 'text-white', 'text-base', 'font-bold');
    
    // Simulate hover
    fireEvent.mouseEnter(productsLink);
    expect(productsLink).toHaveClass('no-underline', 'text-white', 'text-base', 'font-bold');
    
    fireEvent.mouseLeave(productsLink);
    expect(productsLink).toHaveClass('no-underline', 'text-white', 'text-base', 'font-bold');
  });
});
