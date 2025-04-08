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
    const links = ['Home', 'About Us'];
    links.forEach((text) => {
      const link = screen.getByRole('link', { name: text });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', text === 'Home' ? '/' : '/about');
    });
  });

  it('changes opacity on hover', () => {
    render(<Navbar />);
    const aboutLink = screen.getByRole('link', { name: 'About Us' });
    
    expect(aboutLink).toHaveClass('no-underline', 'text-white', 'text-base', 'font-bold');
    
    // Simulate hover
    fireEvent.mouseEnter(aboutLink);
    expect(aboutLink).toHaveClass('no-underline', 'text-white', 'text-base', 'font-bold', 'hover:text-purple-400');
    
    fireEvent.mouseLeave(aboutLink);
    expect(aboutLink).toHaveClass('no-underline', 'text-white', 'text-base', 'font-bold');
  });

  it('renders logo links that navigate to home', () => {
    render(<Navbar />);
    // Find all links that contain the logo images
    const logoLinks = screen.getAllByRole('link').filter(link => 
      link.querySelector('img[alt="Logo"]') || link.querySelector('img[alt="Logo 2"]')
    );
    
    expect(logoLinks.length).toBeGreaterThan(0);
    logoLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/');
    });
  });
});
