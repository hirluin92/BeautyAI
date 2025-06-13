// API Endpoints Design with TypeScript Interfaces
// Last Updated: 13/03/2024

/**
 * Security Notes:
 * - All endpoints require authentication via Supabase Auth
 * - RLS policies are active on all tables
 * - Each organization can only access its own data
 * - Service role client is used for privileged operations (e.g., registration)
 * - Role-based access control: owner, staff, admin
 */

// Base Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Domain Types
interface Organization {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  vatNumber?: string;
  planType: 'free' | 'premium' | 'enterprise';
  clientCount: number;
  workingHours: Record<string, { open: string; close: string }>;
  createdAt: string;
  updatedAt: string;
  // RLS: Users can only view/update their own organization
  // Policy: id IN (SELECT organization_id FROM users WHERE id = auth.uid())
}

interface User {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: 'owner' | 'staff' | 'admin';
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  // RLS: Users can only view/update their own profile
  // Policy: auth.uid() = id
}

interface Service {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category?: string;
  isActive: boolean;
  // RLS: Users can only view/manage services of their organization
  // Policy: organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
}

interface Client {
  id: string;
  organizationId: string;
  fullName: string;
  phone: string;
  email?: string;
  whatsappPhone?: string;
  birthDate?: string;
  notes?: string;
  tags?: string[];
  totalSpent: number;
  visitCount: number;
  lastVisitAt?: string;
  // RLS: Users can only view/manage clients of their organization
  // Policy: organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
}

interface Booking {
  id: string;
  organizationId: string;
  clientId: string;
  serviceId: string;
  staffId?: string;
  startAt: string;
  endAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  price: number;
  notes?: string;
  source: string;
  client?: Client;
  service?: Service;
  staff?: User;
  // RLS: Users can only view/manage bookings of their organization
  // Policy: organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
}

// API ENDPOINTS

// Authentication
interface AuthEndpoints {
  // POST /api/auth/register
  // Uses service role client to bypass RLS
  register: {
    body: {
      email: string;
      password: string;
      fullName: string;
      organizationName: string;
      phone?: string;
    };
    response: ApiResponse<{
      user: User;
      organization: Organization;
      session: { accessToken: string; refreshToken: string };
    }>;
  };

  // POST /api/auth/login
  login: {
    body: {
      email: string;
      password: string;
    };
    response: ApiResponse<{
      user: User;
      organization: Organization;
      session: { accessToken: string; refreshToken: string };
    }>;
  };

  // POST /api/auth/logout
  logout: {
    response: ApiResponse<null>;
  };

  // POST /api/auth/refresh
  refresh: {
    body: {
      refreshToken: string;
    };
    response: ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>;
  };
}

// Organizations
interface OrganizationEndpoints {
  // GET /api/organizations/current
  // RLS ensures user can only access their own organization
  getCurrent: {
    response: ApiResponse<Organization>;
  };

  // PATCH /api/organizations/current
  updateCurrent: {
    body: Partial<Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>>;
    response: ApiResponse<Organization>;
  };

  // POST /api/organizations/current/whatsapp/connect
  connectWhatsApp: {
    body: {
      businessId: string;
      phoneNumberId: string;
      accessToken: string;
    };
    response: ApiResponse<{ connected: boolean }>;
  };
}

// Users
interface UserEndpoints {
  // GET /api/users
  list: {
    query: PaginationParams & {
      role?: string;
      isActive?: boolean;
    };
    response: ApiResponse<User[]>;
  };

  // POST /api/users
  create: {
    body: {
      email: string;
      fullName: string;
      role: 'owner' | 'staff';
      phone?: string;
    };
    response: ApiResponse<User>;
  };

  // GET /api/users/:id
  get: {
    params: { id: string };
    response: ApiResponse<User>;
  };

  // PATCH /api/users/:id
  update: {
    params: { id: string };
    body: Partial<Omit<User, 'id' | 'organizationId'>>;
    response: ApiResponse<User>;
  };

  // DELETE /api/users/:id
  delete: {
    params: { id: string };
    response: ApiResponse<null>;
  };
}

// Services
interface ServiceEndpoints {
  // GET /api/services
  list: {
    query: PaginationParams & {
      category?: string;
      isActive?: boolean;
    };
    response: ApiResponse<Service[]>;
  };

  // POST /api/services
  create: {
    body: Omit<Service, 'id' | 'organizationId'>;
    response: ApiResponse<Service>;
  };

  // GET /api/services/:id
  get: {
    params: { id: string };
    response: ApiResponse<Service>;
  };

  // PATCH /api/services/:id
  update: {
    params: { id: string };
    body: Partial<Omit<Service, 'id' | 'organizationId'>>;
    response: ApiResponse<Service>;
  };

  // DELETE /api/services/:id
  delete: {
    params: { id: string };
    response: ApiResponse<null>;
  };
}

// Clients
interface ClientEndpoints {
  // GET /api/clients
  list: {
    query: PaginationParams & {
      search?: string;
      tags?: string[];
    };
    response: ApiResponse<Client[]>;
  };

  // POST /api/clients
  create: {
    body: Omit<Client, 'id' | 'organizationId' | 'totalSpent' | 'visitCount' | 'lastVisitAt'>;
    response: ApiResponse<Client>;
  };

  // GET /api/clients/:id
  get: {
    params: { id: string };
    response: ApiResponse<Client>;
  };

  // PATCH /api/clients/:id
  update: {
    params: { id: string };
    body: Partial<Omit<Client, 'id' | 'organizationId' | 'totalSpent' | 'visitCount'>>;
    response: ApiResponse<Client>;
  };

  // GET /api/clients/:id/bookings
  getBookings: {
    params: { id: string };
    query: PaginationParams & {
      status?: string;
      from?: string;
      to?: string;
    };
    response: ApiResponse<Booking[]>;
  };
}

// Bookings
interface BookingEndpoints {
  // GET /api/bookings
  list: {
    query: PaginationParams & {
      status?: string;
      staffId?: string;
      clientId?: string;
      from?: string;
      to?: string;
    };
    response: ApiResponse<Booking[]>;
  };

  // POST /api/bookings
  create: {
    body: {
      clientId: string;
      serviceId: string;
      staffId?: string;
      startAt: string;
      notes?: string;
    };
    response: ApiResponse<Booking>;
  };

  // GET /api/bookings/:id
  get: {
    params: { id: string };
    response: ApiResponse<Booking>;
  };

  // PATCH /api/bookings/:id
  update: {
    params: { id: string };
    body: {
      startAt?: string;
      staffId?: string;
      status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
      notes?: string;
      cancellationReason?: string;
    };
    response: ApiResponse<Booking>;
  };

  // GET /api/bookings/availability
  checkAvailability: {
    query: {
      date: string;
      serviceId: string;
      staffId?: string;
    };
    response: ApiResponse<{
      slots: Array<{
        startAt: string;
        endAt: string;
        available: boolean;
      }>;
    }>;
  };
}

// WhatsApp Chat
interface ChatEndpoints {
  // POST /api/chat/webhook
  webhook: {
    headers: {
      'x-hub-signature-256': string;
    };
    body: any; // Meta webhook payload
    response: { status: 'ok' };
  };

  // POST /api/chat/send
  sendMessage: {
    body: {
      to: string;
      type: 'text' | 'template' | 'interactive';
      content: any;
    };
    response: ApiResponse<{ messageId: string }>;
  };

  // GET /api/chat/sessions
  listSessions: {
    query: PaginationParams & {
      active?: boolean;
      clientId?: string;
    };
    response: ApiResponse<Array<{
      id: string;
      clientId?: string;
      whatsappPhone: string;
      isActive: boolean;
      lastMessageAt: string;
    }>>;
  };

  // GET /api/chat/sessions/:id/messages
  getMessages: {
    params: { id: string };
    query: PaginationParams;
    response: ApiResponse<Array<{
      id: string;
      content: string;
      isFromClient: boolean;
      createdAt: string;
    }>>;
  };
}

// Analytics
interface AnalyticsEndpoints {
  // GET /api/analytics/dashboard
  getDashboard: {
    query: {
      from: string;
      to: string;
    };
    response: ApiResponse<{
      revenue: {
        total: number;
        byDay: Array<{ date: string; amount: number }>;
      };
      bookings: {
        total: number;
        byStatus: Record<string, number>;
        byService: Array<{ serviceId: string; count: number; revenue: number }>;
      };
      clients: {
        total: number;
        new: number;
        returning: number;
      };
      topServices: Array<{
        service: Service;
        bookings: number;
        revenue: number;
      }>;
    }>;
  };

  // GET /api/analytics/revenue
  getRevenue: {
    query: {
      from: string;
      to: string;
      groupBy: 'day' | 'week' | 'month';
    };
    response: ApiResponse<Array<{
      period: string;
      revenue: number;
      bookings: number;
    }>>;
  };
}

// Payments
interface PaymentEndpoints {
  // POST /api/payments/create-checkout
  createCheckout: {
    body: {
      bookingId: string;
      successUrl: string;
      cancelUrl: string;
    };
    response: ApiResponse<{
      checkoutUrl: string;
      sessionId: string;
    }>;
  };

  // POST /api/payments/webhook
  stripeWebhook: {
    headers: {
      'stripe-signature': string;
    };
    body: any; // Stripe webhook payload
    response: { received: true };
  };

  // GET /api/payments
  list: {
    query: PaginationParams & {
      status?: string;
      clientId?: string;
      from?: string;
      to?: string;
    };
    response: ApiResponse<Array<{
      id: string;
      bookingId: string;
      amount: number;
      status: string;
      paidAt?: string;
    }>>;
  };
}

// Export all endpoint types
export type {
  AuthEndpoints,
  OrganizationEndpoints,
  UserEndpoints,
  ServiceEndpoints,
  ClientEndpoints,
  BookingEndpoints,
  ChatEndpoints,
  AnalyticsEndpoints,
  PaymentEndpoints,
  ApiResponse,
  Organization,
  User,
  Service,
  Client,
  Booking
};