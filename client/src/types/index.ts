export interface DashboardMetrics {
  totalLeads: number;
  conversions: number;
  revenue: string;
  unitsSold: number;
  leadsByStatus: Array<{ status: string; count: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'master' | 'developer_hq' | 'sales_admin' | 'sales_executive';
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadWithDetails {
  id: string;
  name: string;
  email?: string;
  phone: string;
  source: string;
  status: string;
  projectId?: string;
  assignedTo?: string;
  budget?: string;
  preferences?: string;
  notes?: string;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithStats {
  id: string;
  name: string;
  location: string;
  totalUnits: number;
  availableUnits: number;
  blockedUnits: number;
  soldUnits: number;
  status: string;
  imageUrl?: string;
  salesProgress: number;
}
