// Development-only mock storage to avoid database dependency
import type { IStorage, User, UpsertUser } from './storage';
import bcrypt from 'bcryptjs';

export class MockStorage implements IStorage {
  private users = new Map<string, User>();
  private counter = 1;

  constructor() {
    // Initialize with default master user
    this.initializeMasterUser();
  }

  private async initializeMasterUser() {
    const hashedPassword = await bcrypt.hash("admin", 10);
    const masterUser: User = {
      id: '1',
      username: 'admin',
      email: 'admin@realtyflow.com',
      password: hashedPassword,
      firstName: 'Master',
      lastName: 'Admin',
      role: 'master',
      isActive: true,
      phone: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set('1', masterUser);
    this.users.set('admin', masterUser); // Also index by username
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || (this.counter++).toString();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
    
    this.users.set(id, user);
    if (userData.username) {
      this.users.set(userData.username, user);
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.get(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    return this.upsertUser(userData);
  }

  // Stub implementations for other methods (not needed for login)
  async getProjects(): Promise<any[]> { return []; }
  async getProject(id: string): Promise<any> { return undefined; }
  async createProject(project: any): Promise<any> { return project; }
  async updateProject(id: string, project: any): Promise<any> { return project; }
  async getLeads(projectId?: string): Promise<any[]> { return []; }
  async getLead(id: string): Promise<any> { return undefined; }
  async createLead(lead: any): Promise<any> { return lead; }
  async updateLead(id: string, lead: any): Promise<any> { return lead; }
  async deleteLead(id: string): Promise<void> { }
  async getLeadsByStatus(status: string): Promise<any[]> { return []; }
  async getUnits(projectId?: string): Promise<any[]> { return []; }
  async getUnit(id: string): Promise<any> { return undefined; }
  async createUnit(unit: any): Promise<any> { return unit; }
  async updateUnit(id: string, unit: any): Promise<any> { return unit; }
  async deleteUnit(id: string): Promise<void> { }
  async getAvailableUnits(projectId: string): Promise<any[]> { return []; }
  async getTowers(projectId: string): Promise<any[]> { return []; }
  async createTower(tower: any): Promise<any> { return tower; }
  async getFloors(tower: string): Promise<any[]> { return []; }
  async blockUnit(unitId: string): Promise<any> { return {}; }
  async unblockUnit(unitId: string): Promise<any> { return {}; }
  async getBookings(): Promise<any[]> { return []; }
  async getBooking(id: string): Promise<any> { return undefined; }
  async createBooking(booking: any): Promise<any> { return booking; }
  async updateBooking(id: string, booking: any): Promise<any> { return booking; }
  async getPayments(bookingId?: string): Promise<any[]> { return []; }
  async getPendingPayments(): Promise<any[]> { return []; }
  async createPayment(payment: any): Promise<any> { return payment; }
  async updatePayment(id: string, payment: any): Promise<any> { return payment; }
  async getChannelPartners(): Promise<any[]> { return []; }
  async getChannelPartner(id: string): Promise<any> { return undefined; }
  async createChannelPartner(partner: any): Promise<any> { return partner; }
  async updateChannelPartner(id: string, partner: any): Promise<any> { return partner; }
  async getLeadActivities(leadId: string): Promise<any[]> { return []; }
  async createLeadActivity(activity: any): Promise<any> { return activity; }
  async getCommunications(leadId?: string): Promise<any[]> { return []; }
  async createCommunication(communication: any): Promise<any> { return communication; }
  async getNegotiations(): Promise<any[]> { return []; }
  async getNegotiation(id: string): Promise<any> { return undefined; }
  async createNegotiation(negotiation: any): Promise<any> { return negotiation; }
  async updateNegotiation(id: string, negotiation: any): Promise<any> { return negotiation; }
  async getDashboardMetrics(): Promise<any> {
    return {
      totalLeads: 0,
      conversions: 0,
      revenue: '0',
      unitsSold: 0,
      leadsByStatus: [],
      leadsBySource: []
    };
  }
}