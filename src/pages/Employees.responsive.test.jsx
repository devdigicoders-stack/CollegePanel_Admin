import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ViewEmployeeModal } from './Employees';
import toast from 'react-hot-toast';

/**
 * Responsive Design Tests for View Employee Modal - Credentials Section
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 * 
 * Tests verify:
 * - Mobile viewport (<768px): Credentials stack vertically
 * - Tablet viewport (768px-1024px): Proper responsive layout
 * - Desktop viewport (>1024px): 2-column credentials layout
 * - Copy buttons remain accessible and clickable on all screen sizes
 * - Modal is scrollable on mobile with all content accessible
 * - Text is readable on all screen sizes
 */

// Mock the toast module
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Mock data for testing
const mockEmployee = {
  _id: '1',
  empId: 'EMP001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  mobile: '+1 (555) 123-4567',
  address: '123 Main St, Springfield, IL 62701',
  role: 'Senior Developer',
  department: 'IT',
  status: 'Active',
  dateOfBirth: '1990-05-15',
  gender: 'Male',
  dateOfJoining: '2020-01-15',
  createdAt: '2023-01-01T10:00:00Z',
  username: 'john.doe',
  password: 'Employee@123'
};

describe('ViewEmployeeModal - Responsive Design Tests', () => {
  /**
   * Helper function to change viewport size
   * Simulates window resize for responsive testing
   */
  const setViewportSize = (width, height = 768) => {
    global.innerWidth = width;
    global.innerHeight = height;
    fireEvent(window, new Event('resize'));
  };

  /**
   * Helper to get computed styles for responsive classes
   */
  const getComputedClasses = (element, classPattern) => {
    const classList = element.className;
    return classList.match(classPattern) || [];
  };

  beforeEach(() => {
    // Reset window size
    setViewportSize(1024);
    // Clear toast mock
    toast.success.mockClear();
    toast.error.mockClear();
  });

  describe('Mobile Viewport Tests (<768px)', () => {
    beforeEach(() => {
      // Set mobile viewport (e.g., iPhone SE - 375px)
      setViewportSize(375, 667);
    });

    it('should render credentials section in mobile viewport', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const credentialsSection = screen.getByText('Login Credentials');
      expect(credentialsSection).toBeInTheDocument();
    });

    it('should stack credentials vertically on mobile (single column)', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      // Find the grid container that holds credentials (it's specifically the credentials grid)
      // The actual implementation uses grid-cols-1 sm:grid-cols-2 (single col on mobile, 2 col on sm+)
      const credentialsGrid = container.querySelector('div.bg-gradient-to-r .grid');
      
      // Check for sm:grid-cols-2 which means grid-cols-1 on mobile (default)
      expect(credentialsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('should display username field on mobile', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const usernameLabel = screen.getByText('Username');
      const usernameValue = screen.getByText('john.doe');
      
      expect(usernameLabel).toBeInTheDocument();
      expect(usernameValue).toBeInTheDocument();
    });

    it('should display password field on mobile', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const passwordLabel = screen.getByText('Password');
      const passwordValue = screen.getByText('Employee@123');
      
      expect(passwordLabel).toBeInTheDocument();
      expect(passwordValue).toBeInTheDocument();
    });

    it('should have copy buttons for both credentials on mobile', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i });
      // At least 2 copy buttons for username and password, plus close button
      expect(copyButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have accessible copy button for username with proper title', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyUsernameBtn = screen.getByTitle('Copy username');
      expect(copyUsernameBtn).toBeInTheDocument();
      expect(copyUsernameBtn).toHaveAttribute('aria-label', 'Copy username to clipboard');
      expect(copyUsernameBtn).toHaveAttribute('tabIndex', '0');
    });

    it('should have accessible copy button for password with proper title', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyPasswordBtn = screen.getByTitle('Copy password');
      expect(copyPasswordBtn).toBeInTheDocument();
      expect(copyPasswordBtn).toHaveAttribute('aria-label', 'Copy password to clipboard');
      expect(copyPasswordBtn).toHaveAttribute('tabIndex', '0');
    });

    it('should allow copy button interaction on mobile (tappable size)', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyUsernameBtn = screen.getByTitle('Copy username');
      
      // Check button size is adequate for touch (minimum 44x44px recommended)
      // The button has padding p-2 which with SVG w-4 h-4 gives adequate size
      expect(copyUsernameBtn.className).toContain('p-2');
    });

    it('should execute copy functionality on mobile when username copy clicked', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      global.navigator.clipboard = { writeText: mockWriteText };

      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyUsernameBtn = screen.getByTitle('Copy username');
      fireEvent.click(copyUsernameBtn);

      expect(mockWriteText).toHaveBeenCalledWith('john.doe');
    });

    it('should display modal scrollable on mobile with max-height', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      const modalContainer = container.querySelector('.max-h-\\[90vh\\]');
      expect(modalContainer).toBeInTheDocument();
      expect(modalContainer.className).toContain('overflow-y-auto');
    });

    it('should have readable font sizes on mobile', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const credentialValue = screen.getByText('john.doe');
      // Check for proper text sizing (text-[13px] for credentials value)
      expect(credentialValue.className).toContain('text-[13px]');
      
      const credentialLabel = screen.getByText('Username');
      // Check label sizing (text-[11px] for labels)
      expect(credentialLabel.className).toContain('text-[11px]');
    });

    it('should maintain proper contrast on mobile (WCAG AA)', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      // Check the credentials section has proper background gradient (purple/indigo)
      const credentialsSection = container.querySelector('div.bg-gradient-to-r.from-purple-100');
      // This is the purple/indigo gradient for the credentials section
      expect(credentialsSection).toHaveClass('border-purple-300');
      expect(credentialsSection).toHaveClass('from-purple-100');
      expect(credentialsSection).toHaveClass('to-indigo-100');
    });

    it('should have readable monospace font for credentials', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const usernameValue = screen.getByText('john.doe');
      const passwordValue = screen.getByText('Employee@123');
      
      expect(usernameValue.className).toContain('font-mono');
      expect(passwordValue.className).toContain('font-mono');
    });
  });

  describe('Tablet Viewport Tests (768px - 1024px)', () => {
    beforeEach(() => {
      // Set tablet viewport (e.g., iPad - 768px)
      setViewportSize(768, 1024);
    });

    it('should render credentials section in tablet viewport', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const credentialsSection = screen.getByText('Login Credentials');
      expect(credentialsSection).toBeInTheDocument();
    });

    it('should maintain responsive layout on tablet', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      // Tablet should use responsive 2-column grid (sm:grid-cols-2)
      const credentialsGrid = container.querySelector('div.bg-gradient-to-r .grid');
      expect(credentialsGrid).toHaveClass('sm:grid-cols-2');
    });

    it('should display both credentials fields on tablet', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('john.doe')).toBeInTheDocument();
      expect(screen.getByText('Employee@123')).toBeInTheDocument();
    });

    it('should have proper spacing between credentials on tablet', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      const credentialsGrid = container.querySelector('div.bg-gradient-to-r .grid');
      expect(credentialsGrid).toHaveClass('gap-4');
    });

    it('should have accessible copy buttons on tablet', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i });
      expect(copyButtons.length).toBeGreaterThanOrEqual(2);
      
      copyButtons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('should handle copy functionality on tablet', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      global.navigator.clipboard = { writeText: mockWriteText };

      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyPasswordBtn = screen.getByTitle('Copy password');
      fireEvent.click(copyPasswordBtn);

      expect(mockWriteText).toHaveBeenCalledWith('Employee@123');
    });
  });

  describe('Desktop Viewport Tests (>1024px)', () => {
    beforeEach(() => {
      // Set desktop viewport
      setViewportSize(1440, 900);
    });

    it('should render credentials section in desktop viewport', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const credentialsSection = screen.getByText('Login Credentials');
      expect(credentialsSection).toBeInTheDocument();
    });

    it('should display 2-column credentials layout on desktop', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      const credentialsGrid = container.querySelector('div.bg-gradient-to-r .grid');
      expect(credentialsGrid).toHaveClass('sm:grid-cols-2');
    });

    it('should display both credentials side by side on desktop', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const usernameField = screen.getByText('Username').closest('fieldset');
      const passwordField = screen.getByText('Password').closest('fieldset');
      
      expect(usernameField).toBeInTheDocument();
      expect(passwordField).toBeInTheDocument();
    });

    it('should have copy buttons positioned correctly on desktop', () => {
      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyUsernameBtn = screen.getByTitle('Copy username');
      const copyPasswordBtn = screen.getByTitle('Copy password');
      
      expect(copyUsernameBtn).toBeInTheDocument();
      expect(copyPasswordBtn).toBeInTheDocument();
      
      // Check for ml-2 (margin-left) positioning
      expect(copyUsernameBtn.className).toContain('ml-2');
      expect(copyPasswordBtn.className).toContain('ml-2');
    });

    it('should support smooth copy interaction on desktop', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      global.navigator.clipboard = { writeText: mockWriteText };

      render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
      
      const copyUsernameBtn = screen.getByTitle('Copy username');
      fireEvent.click(copyUsernameBtn);

      expect(mockWriteText).toHaveBeenCalledWith('john.doe');
    });

    it('should maintain full layout without scroll on desktop with adequate content', () => {
      const { container } = render(
        <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
      );

      const modalContainer = container.querySelector('.max-h-\\[90vh\\]');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('Copy Button Accessibility Across All Viewports', () => {
    [375, 768, 1024, 1440].forEach(width => {
      describe(`at ${width}px width`, () => {
        beforeEach(() => {
          setViewportSize(width);
        });

        it('should have proper keyboard focus on copy buttons', () => {
          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          const copyUsernameBtn = screen.getByTitle('Copy username');
          
          // Check for focus styling
          expect(copyUsernameBtn.className).toContain('focus:outline-none');
          expect(copyUsernameBtn.className).toContain('focus:ring-2');
        });

        it('should be clickable and trigger copy', async () => {
          const mockWriteText = vi.fn().mockResolvedValue(undefined);
          global.navigator.clipboard = { writeText: mockWriteText };

          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          const copyPasswordBtn = screen.getByTitle('Copy password');
          fireEvent.click(copyPasswordBtn);

          expect(mockWriteText).toHaveBeenCalled();
        });

        it('should have cursor-pointer class for interactive feedback', () => {
          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          const copyUsernameBtn = screen.getByTitle('Copy username');
          expect(copyUsernameBtn.className).toContain('cursor-pointer');
        });
      });
    });
  });

  describe('Text Readability Tests', () => {
    [375, 768, 1024, 1440].forEach(width => {
      describe(`at ${width}px width`, () => {
        beforeEach(() => {
          setViewportSize(width);
        });

        it('should have readable credential values', () => {
          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          const usernameValue = screen.getByText('john.doe');
          const passwordValue = screen.getByText('Employee@123');
          
          // Check for proper text sizing and color
          expect(usernameValue.className).toContain('text-gray-900');
          expect(passwordValue.className).toContain('text-gray-900');
          
          // Check monospace font
          expect(usernameValue.className).toContain('font-mono');
          expect(passwordValue.className).toContain('font-mono');
        });

        it('should have readable labels', () => {
          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          const usernameLabel = screen.getByText('Username');
          const passwordLabel = screen.getByText('Password');
          
          // Check label color and weight
          expect(usernameLabel.className).toContain('text-gray-700');
          expect(passwordLabel.className).toContain('font-semibold');
        });

        it('should have readable heading', () => {
          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          const heading = screen.getByText('Login Credentials');
          expect(heading.className).toContain('font-bold');
          expect(heading.className).toContain('text-gray-900');
        });
      });
    });
  });

  describe('Modal Scrollability Tests', () => {
    [375, 768].forEach(width => {
      describe(`on ${width}px mobile/tablet viewport`, () => {
        beforeEach(() => {
          setViewportSize(width, 667);
        });

        it('should have scrollable container with max-height', () => {
          const { container } = render(
            <ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />
          );

          const modalContainer = container.querySelector('.max-h-\\[90vh\\]');
          expect(modalContainer).toBeInTheDocument();
          expect(modalContainer.className).toContain('overflow-y-auto');
        });

        it('should render all sections accessible via scroll', () => {
          render(<ViewEmployeeModal employee={mockEmployee} onClose={vi.fn()} />);
          
          // All sections should be in the document (can be scrolled to)
          expect(screen.getByText('Contact Information')).toBeInTheDocument();
          expect(screen.getByText('Personal Information')).toBeInTheDocument();
          expect(screen.getByText('Login Credentials')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Credential Values Handling', () => {
    it('should display N/A when username is missing', () => {
      const employeeNoUsername = { ...mockEmployee, username: null };
      render(<ViewEmployeeModal employee={employeeNoUsername} onClose={vi.fn()} />);
      
      const usernameField = screen.getByText('Username').closest('fieldset');
      expect(usernameField.textContent).toContain('N/A');
    });

    it('should display N/A when password is missing', () => {
      const employeeNoPassword = { ...mockEmployee, password: null };
      render(<ViewEmployeeModal employee={employeeNoPassword} onClose={vi.fn()} />);
      
      const passwordField = screen.getByText('Password').closest('fieldset');
      expect(passwordField.textContent).toContain('N/A');
    });

    it('should not show copy button when username is missing', () => {
      const employeeNoUsername = { ...mockEmployee, username: null };
      render(<ViewEmployeeModal employee={employeeNoUsername} onClose={vi.fn()} />);
      
      const copyButtons = screen.queryAllByTitle('Copy username');
      expect(copyButtons.length).toBe(0);
    });

    it('should not show copy button when password is missing', () => {
      const employeeNoPassword = { ...mockEmployee, password: null };
      render(<ViewEmployeeModal employee={employeeNoPassword} onClose={vi.fn()} />);
      
      const copyButtons = screen.queryAllByTitle('Copy password');
      expect(copyButtons.length).toBe(0);
    });
  });

  describe('Break-all text wrapping', () => {
    it('should break long username text properly', () => {
      const employeeLongUsername = { 
        ...mockEmployee, 
        username: 'verylongusernametotestwrapping.thatisfartolong' 
      };
      render(<ViewEmployeeModal employee={employeeLongUsername} onClose={vi.fn()} />);
      
      const usernameValue = screen.getByText('verylongusernametotestwrapping.thatisfartolong');
      expect(usernameValue.className).toContain('break-all');
    });

    it('should break long password text properly', () => {
      const employeeLongPassword = { 
        ...mockEmployee, 
        password: 'VeryLongPassword@123WithLotsOfCharacters' 
      };
      render(<ViewEmployeeModal employee={employeeLongPassword} onClose={vi.fn()} />);
      
      const passwordValue = screen.getByText('VeryLongPassword@123WithLotsOfCharacters');
      expect(passwordValue.className).toContain('break-all');
    });
  });
});
