// __tests__/components/clients/client-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ClientForm from '@/components/clients/client-form'
import { createClient } from '../../../lib/supabase/client'
import type { Client } from '../../../types'

// Mock Supabase client: mock globale robusto
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockEq = jest.fn();

jest.mock('lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: mockInsert,
      update: mockUpdate
    }))
  }))
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

beforeEach(() => {
  jest.clearAllMocks();
  // Reset fallback mock chain
  mockInsert.mockImplementation(() => ({
    select: () => ({
      single: () => Promise.resolve({ data: { id: 'new-client-123', full_name: 'Mario Rossi', phone: '3331234567', email: 'mario@example.com', whatsapp_phone: null, birth_date: null, notes: null, tags: [], organization_id: 'org-123', created_at: null, updated_at: null, last_visit_at: null, total_spent: null, visit_count: null }, error: null })
    })
  }));
  mockUpdate.mockImplementation(() => ({
    eq: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: { id: 'client-123', full_name: 'Mario Rossi', phone: '3331234567', email: 'mario@example.com', whatsapp_phone: null, birth_date: null, notes: null, tags: [], organization_id: 'org-123', created_at: null, updated_at: null, last_visit_at: null, total_spent: null, visit_count: null }, error: null })
      })
    })
  }));
});

describe('ClientForm Component', () => {
  const mockOrganizationId = 'org-123'
  const mockClient = {
    id: 'client-123',
    full_name: 'Mario Rossi',
    phone: '3331234567',
    email: 'mario@example.com',
    whatsapp_phone: '',
    birth_date: '',
    notes: 'Cliente VIP',
    tags: ['VIP', 'Fedele'],
    organization_id: mockOrganizationId,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_visit_at: null,
    total_spent: null,
    visit_count: null,
  }

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      )

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/telefono/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/data di nascita/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/note/i)).toBeInTheDocument()
      expect(screen.getByTestId('tags')).toBeInTheDocument()
    })

    it('should show correct button text based on mode', () => {
      const { rerender } = render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      )

      expect(screen.getByText(/crea cliente/i)).toBeInTheDocument()

      rerender(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="edit"
          client={mockClient}
        />
      )

      expect(screen.getByText(/salva modifiche/i)).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      )
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'mario@example.com' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled();
      });
    })

    it('should show error message on API failure', async () => {
      // Override solo per questo test: la catena lancia errore
      mockInsert.mockImplementationOnce(() => ({
        select: () => ({
          single: () => Promise.reject({ message: "Errore durante il salvataggio" })
        })
      }));
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      );
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(screen.getByText(/errore durante il salvataggio/i)).toBeInTheDocument();
      });
    })
  })

  describe('Edit Mode', () => {
    it('should pre-populate form fields in edit mode', () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="edit"
          client={mockClient}
        />
      )

      expect(screen.getByLabelText(/nome completo/i)).toHaveValue(mockClient.full_name)
      expect(screen.getByLabelText(/telefono/i)).toHaveValue(mockClient.phone)
      expect(screen.getByLabelText(/email/i)).toHaveValue(mockClient.email)
      expect(screen.getByLabelText(/note/i)).toHaveValue(mockClient.notes)
    })

    it('should call update endpoint in edit mode', async () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="edit"
          client={mockClient}
        />
      )
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.click(screen.getByText('Salva Modifiche'));
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });
    })
  })

  describe('Tag Management', () => {
    it('should toggle tag selection', () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      )

      // Add a tag
      fireEvent.click(screen.getByText('+ VIP'))
      expect(screen.getByText('VIP')).toBeInTheDocument()

      // Remove the tag
      fireEvent.click(screen.getByText('VIP').closest('span')!.querySelector('button')!)
      expect(screen.queryByText('VIP')).not.toBeInTheDocument()
    })

    it('should allow custom tag input', () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      )

      const customTagInput = screen.getByPlaceholderText(/aggiungi tag personalizzato/i)
      fireEvent.change(customTagInput, { target: { value: 'Custom Tag' } })
      fireEvent.click(customTagInput.nextElementSibling!)

      expect(screen.getByText('Custom Tag')).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should require name and phone', async () => {
      render(
        <ClientForm 
          organizationId={mockOrganizationId}
          mode="create"
        />
      )

      // Trigger blur on full_name and phone (so that onBlur validation runs) 
      const fullNameInput = screen.getByLabelText(/nome completo/i)
      const phoneInput = screen.getByLabelText(/telefono/i)
      fireEvent.change(fullNameInput, { target: { value: '' } })
      fireEvent.blur(fullNameInput)
      fireEvent.change(phoneInput, { target: { value: '' } })
      fireEvent.blur(phoneInput)

      // Try to submit without required fields
      fireEvent.click(screen.getByText(/crea cliente/i))

      await waitFor(() => {
         expect(screen.getByText('Il nome è obbligatorio')).toBeInTheDocument()
         expect(screen.getByText('Il telefono è obbligatorio')).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid email', async () => {
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />)
      
      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } })
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } })
      
      // Enter invalid email and trigger validation
      const emailInput = screen.getByLabelText(/email/i)
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
      fireEvent.blur(emailInput)
      fireEvent.click(screen.getByText('Crea Cliente'))
      
      await waitFor(() => {
        const emailError = screen.getByText('Formato email non valido')
        expect(emailError).toBeInTheDocument()
        expect(emailError).toHaveClass('text-red-600')
      })
    })

    it('should show validation error for empty name', async () => {
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />)
      
      // Fill in phone but leave name empty
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } })
      
      // Trigger validation
      const nameInput = screen.getByLabelText(/nome completo/i)
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.blur(nameInput)
      fireEvent.click(screen.getByText('Crea Cliente'))
      
      await waitFor(() => {
        const nameError = screen.getByText('Il nome è obbligatorio')
        expect(nameError).toBeInTheDocument()
        expect(nameError).toHaveClass('text-red-600')
      })
    })
  })

  describe('ClientForm Advanced', () => {
    const mockOrganizationId = 'org-123';
    const mockClient = {
      id: 'client-123',
      full_name: 'Mario Rossi',
      phone: '3331234567',
      email: 'mario@example.com',
      whatsapp_phone: '',
      birth_date: '',
      notes: 'Cliente VIP',
      tags: ['VIP', 'Fedele'],
      organization_id: mockOrganizationId,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      last_visit_at: null,
      total_spent: null,
      visit_count: null,
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call insert with correct data', async () => {
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />);
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'mario@example.com' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organization_id: mockOrganizationId, full_name: 'Mario Rossi', phone: '3331234567', email: 'mario@example.com' }));
      });
    });

    it('should call update with correct data in edit mode', async () => {
      render(<ClientForm organizationId={mockOrganizationId} mode="edit" client={mockClient} />);
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Bianchi' } });
      fireEvent.click(screen.getByText('Salva Modifiche'));
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ full_name: 'Mario Bianchi' }));
      });
    });

    it('should show success message and call router.push after submit', async () => {
      const push = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push, back: jest.fn() });
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />);
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(screen.getByText(/cliente creato con successo/i)).toBeInTheDocument();
      });
      jest.runAllTimers();
      expect(push).toHaveBeenCalled();
    });

    it('should show validation error for invalid phone', async () => {
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />);
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: 'abc' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(screen.getByText(/formato telefono non valido/i)).toBeInTheDocument();
      });
    });

    it('should show error message for supabase network error', async () => {
      mockInsert.mockImplementationOnce(() => ({
        select: () => ({ single: () => Promise.reject(new Error('Network Error')) })
      }));
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />);
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should show error message for supabase validation error', async () => {
      mockInsert.mockImplementationOnce(() => ({
        select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Validation failed' } }) })
      }));
      render(<ClientForm organizationId={mockOrganizationId} mode="create" />);
      fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Mario Rossi' } });
      fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: '3331234567' } });
      fireEvent.click(screen.getByText('Crea Cliente'));
      await waitFor(() => {
        expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
      });
    });
  })
})