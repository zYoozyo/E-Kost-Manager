import { api } from './api';

export interface InvitationData {
  email: string;
  name?: string;
}

// -------- Owner tenants list (for admin dashboard & tenants page) --------

export interface OwnerTenantApi {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  room?: string | null;
  status?: string | null;
}

let ownerTenantsCache: OwnerTenantApi[] | null = null;
let ownerTenantsCacheTimestamp: number | null = null;
const OWNER_TENANTS_CACHE_TTL_MS = 180_000; // 3 menit

export interface InvitationResponse {
  success: boolean;
  message: string;
  data: {
    invitation: {
      id: number;
      email: string;
      name?: string;
      token: string;
    };
    accept_url: string;
  };
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  data: {
    invitation: {
      id: number;
      email: string;
      name?: string;
      owner_id: number;
    };
    owner_name: string;
    kost_name: string;
  };
}

export interface AcceptInvitationData {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

export const invitationService = {
  async createInvitation(data: InvitationData): Promise<InvitationResponse> {
    const response = await api.post<InvitationResponse>('/invitations', data);
    return response.data;
  },

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const response = await api.post<ValidateTokenResponse>('/invitations/validate', { token });
    return response.data;
  },

  async acceptInvitation(data: AcceptInvitationData): Promise<AcceptInvitationResponse> {
    const response = await api.post<AcceptInvitationResponse>('/invitations/accept', data);
    return response.data;
  },

  async getInvitations() {
    const response = await api.get('/invitations');
    return response.data;
  },

  async deleteInvitation(id: number) {
    const response = await api.delete(`/invitations/${id}`);
    return response.data;
  },

  async getOwnerTenants(force = false): Promise<OwnerTenantApi[]> {
    const now = Date.now();

    if (
      !force &&
      ownerTenantsCache &&
      ownerTenantsCacheTimestamp &&
      now - ownerTenantsCacheTimestamp < OWNER_TENANTS_CACHE_TTL_MS
    ) {
      return ownerTenantsCache;
    }

    const response = await api.get<{ success: boolean; data: OwnerTenantApi[] }>(
      '/admin/tenants'
    );
    const data = response.data.data || [];
    ownerTenantsCache = data;
    ownerTenantsCacheTimestamp = now;
    return data;
  },

  async getAdminTenants(force = false): Promise<OwnerTenantApi[]> {
    const now = Date.now();

    if (
      !force &&
      ownerTenantsCache &&
      ownerTenantsCacheTimestamp &&
      now - ownerTenantsCacheTimestamp < OWNER_TENANTS_CACHE_TTL_MS
    ) {
      return ownerTenantsCache;
    }

    try {
      // Try admin endpoint first
      const response = await api.get<{ success: boolean; data: OwnerTenantApi[] }>(
        '/admin/tenants'
      );
      const data = response.data.data || [];
      ownerTenantsCache = data;
      ownerTenantsCacheTimestamp = now;
      return data;
    } catch (error: any) {
      // If admin endpoint fails (404 or 403), fallback to regular tenants endpoint
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('Admin tenants endpoint not available, falling back to regular tenants endpoint');
        // Try /tenants endpoint instead
        throw error;
      }
      // Re-throw other errors
      throw error;
    }
  },
};