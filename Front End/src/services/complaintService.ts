import { api } from './api';
import { Complaint, ComplaintResponse } from '../types';

export interface OwnerComplaint {
  id: number;
  tenantName: string;
  tenantEmail: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  date: string;
}

type ComplaintRole = 'tenant' | 'owner';

const getRolePrefix = (role: ComplaintRole) => (role === 'tenant' ? '/tenant' : '/owner');

export const complaintService = {
  async getTenantComplaints(): Promise<Complaint[]> {
    const response = await api.get<{ success: boolean; data: Complaint[] }>('/tenant/complaints');
    return response.data.data || [];
  },

  async createTenantComplaint(payload: {
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Complaint> {
    const response = await api.post<{ success: boolean; data: Complaint }>('/tenant/complaints', payload);
    return response.data.data;
  },

  async updateTenantComplaint(
    id: number,
    payload: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<Complaint> {
    const response = await api.put<{ success: boolean; data: Complaint }>(`/tenant/complaints/${id}`, payload);
    return response.data.data;
  },

  async deleteTenantComplaint(id: number): Promise<void> {
    await api.delete(`/tenant/complaints/${id}`);
  },

  async getOwnerComplaints(): Promise<OwnerComplaint[]> {
    const response = await api.get<{ success: boolean; data: any[] }>('/owner/complaints');
    const data = response.data.data || [];

    return data.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status,
      priority: c.priority,
      date: c.created_at ? c.created_at.substring(0, 10) : '',
      tenantName: c.tenant?.name || '',
      tenantEmail: c.tenant?.email || '',
    }));
  },

  async updateOwnerComplaintStatus(
    id: number,
    payload: {
      status: 'pending' | 'in_progress' | 'resolved';
      priority?: 'low' | 'medium' | 'high';
    }
  ): Promise<OwnerComplaint> {
    const response = await api.put<{ success: boolean; data: any }>(
      `/owner/complaints/${id}/status`,
      payload
    );
    const c = response.data.data;

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status,
      priority: c.priority,
      date: c.created_at ? c.created_at.substring(0, 10) : '',
      tenantName: c.tenant?.name || '',
      tenantEmail: c.tenant?.email || '',
    };
  },

  async getComplaintResponses(id: number, role: ComplaintRole): Promise<ComplaintResponse[]> {
    const prefix = getRolePrefix(role);
    const response = await api.get<{ success: boolean; data: ComplaintResponse[] }>(
      `${prefix}/complaints/${id}/responses`
    );
    return response.data.data || [];
  },

  async addComplaintResponse(
    id: number,
    payload: { message: string },
    role: ComplaintRole
  ): Promise<ComplaintResponse> {
    const prefix = getRolePrefix(role);
    const response = await api.post<{ success: boolean; data: ComplaintResponse }>(
      `${prefix}/complaints/${id}/responses`,
      payload
    );
    return response.data.data;
  },
};
