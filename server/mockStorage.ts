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
    // Sample Projects
    this.projects = [
      {
        id: 'project-1',
        name: 'Skyline Towers',
        location: 'Gurgaon, Haryana',
        description: 'Premium residential apartments with modern amenities',
        totalUnits: 200,
        availableUnits: 150,
        blockedUnits: 20,
        soldUnits: 30,
        basePrice: 5000000,
        status: 'active',
        imageUrl: null,
        launchDate: new Date('2023-01-15'),
        completionDate: new Date('2025-12-31'),
        developerId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'project-2',
        name: 'Green Valley Resort',
        location: 'Noida, Uttar Pradesh',
        description: 'Eco-friendly residential complex with garden view',
        totalUnits: 150,
        availableUnits: 100,
        blockedUnits: 15,
        soldUnits: 35,
        basePrice: 7500000,
        status: 'active',
        imageUrl: null,
        launchDate: new Date('2023-06-01'),
        completionDate: new Date('2026-03-31'),
        developerId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'project-3',
        name: 'Metro Plaza',
        location: 'Delhi, India',
        description: 'Commercial and residential complex near metro station',
        totalUnits: 80,
        availableUnits: 60,
        blockedUnits: 10,
        soldUnits: 10,
        basePrice: 12000000,
        status: 'pre_launch',
        imageUrl: null,
        launchDate: new Date('2024-02-01'),
        completionDate: new Date('2026-12-31'),
        developerId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample Towers
    this.towers = [
      // Skyline Towers
      { id: 'tower-1', projectId: 'project-1', name: 'Tower A', floors: 20, unitsPerFloor: 4, createdAt: new Date() },
      { id: 'tower-2', projectId: 'project-1', name: 'Tower B', floors: 25, unitsPerFloor: 4, createdAt: new Date() },
      { id: 'tower-3', projectId: 'project-1', name: 'Tower C', floors: 18, unitsPerFloor: 6, createdAt: new Date() },
      
      // Green Valley Resort
      { id: 'tower-4', projectId: 'project-2', name: 'Block 1', floors: 15, unitsPerFloor: 5, createdAt: new Date() },
      { id: 'tower-5', projectId: 'project-2', name: 'Block 2', floors: 12, unitsPerFloor: 5, createdAt: new Date() },
      
      // Metro Plaza
      { id: 'tower-6', projectId: 'project-3', name: 'North Wing', floors: 30, unitsPerFloor: 2, createdAt: new Date() },
      { id: 'tower-7', projectId: 'project-3', name: 'South Wing', floors: 25, unitsPerFloor: 2, createdAt: new Date() }
    ];

    // Sample Units (just a few for demonstration)
    this.units = [
      {
        id: 'unit-1',
        towerId: 'tower-1',
        projectId: 'project-1',
        unitNumber: '101',
        floor: 1,
        propertyType: 'flat',
        size: 1200,
        baseRate: 4800000,
        plc: 200000,
        gst: 240000,
        stampDuty: 100000,
        totalPrice: 5340000,
        status: 'available',
        view: 'garden',
        facing: 'north',
        blockedAt: null,
        blockExpiryAt: null,
        createdAt: new Date()
      },
      {
        id: 'unit-2',
        towerId: 'tower-1',
        projectId: 'project-1',
        unitNumber: '102',
        floor: 1,
        propertyType: 'flat',
        size: 1350,
        baseRate: 5400000,
        plc: 250000,
        gst: 270000,
        stampDuty: 120000,
        totalPrice: 6040000,
        status: 'booked',
        view: 'city',
        facing: 'east',
        blockedAt: null,
        blockExpiryAt: null,
        createdAt: new Date()
      }
    ];
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