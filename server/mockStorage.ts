// Development-only mock storage to avoid database dependency
import type { IStorage, User, UpsertUser } from './storage';
import bcrypt from 'bcryptjs';

export class MockStorage implements IStorage {
  private users = new Map<string, User>();
  private projects: any[] = [];
  private towers: any[] = [];
  private units: any[] = [];
  private counter = 1;

  constructor() {
    // Initialize with default master user and sample data
    this.initializeMasterUser();
    this.initializeSampleData();
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

  private initializeSampleData() {
    // Sample Projects - Empty initially, users can add their own
    this.projects = [];

    // Sample Towers - Empty initially, users can add their own
    this.towers = [];

    // Sample Units - Empty initially, users can add their own
    this.units = [];
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
  async getProjects(): Promise<any[]> { return this.projects; }
  async getProject(id: string): Promise<any> { 
    return this.projects.find(p => p.id === id); 
  }
  async createProject(project: any): Promise<any> { 
    const newProject = { ...project, id: `project-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    this.projects.push(newProject);
    return newProject; 
  }
  async updateProject(id: string, project: any): Promise<any> { 
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...project, updatedAt: new Date() };
      return this.projects[index];
    }
    return project; 
  }
  async getLeads(projectId?: string): Promise<any[]> { return []; }
  async getLeadsForUser(userId: string, userRole: string, projectId?: string): Promise<any[]> { return []; }
  async getLead(id: string): Promise<any> { return undefined; }
  async createLead(lead: any): Promise<any> { return lead; }
  async updateLead(id: string, lead: any): Promise<any> { return lead; }
  async deleteLead(id: string): Promise<void> { }
  async getLeadsByStatus(status: string): Promise<any[]> { return []; }
  async getUnits(projectId?: string): Promise<any[]> { 
    if (projectId) {
      return this.units.filter(u => u.projectId === projectId);
    }
    return this.units; 
  }
  async getUnit(id: string): Promise<any> { 
    return this.units.find(u => u.id === id); 
  }
  async createUnit(unit: any): Promise<any> { 
    const newUnit = { 
      ...unit, 
      id: `unit-${Date.now()}`, 
      createdAt: new Date(),
      totalPrice: (unit.baseRate || 0) + (unit.plc || 0) + (unit.gst || 0) + (unit.stampDuty || 0)
    };
    this.units.push(newUnit);
    return newUnit; 
  }
  async updateUnit(id: string, unit: any): Promise<any> { 
    const index = this.units.findIndex(u => u.id === id);
    if (index !== -1) {
      this.units[index] = { 
        ...this.units[index], 
        ...unit,
        totalPrice: (unit.baseRate || this.units[index].baseRate || 0) + 
                   (unit.plc || this.units[index].plc || 0) + 
                   (unit.gst || this.units[index].gst || 0) + 
                   (unit.stampDuty || this.units[index].stampDuty || 0)
      };
      return this.units[index];
    }
    return unit; 
  }
  async deleteUnit(id: string): Promise<void> { 
    const index = this.units.findIndex(u => u.id === id);
    if (index !== -1) {
      this.units.splice(index, 1);
    }
  }
  async getAvailableUnits(projectId: string): Promise<any[]> { 
    return this.units.filter(u => u.projectId === projectId && u.status === 'available'); 
  }
  async getTowers(projectId: string): Promise<any[]> { 
    return this.towers.filter(t => t.projectId === projectId); 
  }
  async createTower(tower: any): Promise<any> { 
    const newTower = { ...tower, id: `tower-${Date.now()}`, createdAt: new Date() };
    this.towers.push(newTower);
    return newTower; 
  }
  async getFloors(towerName: string): Promise<number[]> { 
    const tower = this.towers.find(t => t.name === towerName);
    if (tower) {
      return Array.from({ length: tower.floors }, (_, i) => i + 1);
    }
    return []; 
  }
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