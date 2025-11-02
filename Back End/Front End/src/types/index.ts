export interface LoginResponse {
  token: string;
  user: User;
}
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'tenant' | 'owner';
  phone?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Kost {
  id: number;
  name: string;
  address: string;
  description: string;
  price: number;
  capacity: number;
  available_rooms: number;
  facilities: string[];
  images: string[];
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: number;
  kost_id: number;
  room_number: string;
  price: number;
  is_available: boolean;
  tenant_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  tenant_id: number;
  room_id: number;
  amount: number;
  due_date: string;
  paid_at?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: number;
  tenant_id: number;
  kost_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'admin' | 'tenant') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  role: 'admin' | 'tenant';
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  accessCode: string;
  role?: 'admin' | 'tenant' | 'owner';
}