import {
  users,
  projects,
  leads,
  units,
  towers,
  bookings,
  payments,
  channelPartners,
  channelPartnerLeads,
  leadActivities,
  communications,
  negotiations,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Lead,
  type InsertLead,
  type Unit,
  type InsertUnit,
  type Tower,
  type InsertTower,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
  type ChannelPartner,
  type InsertChannelPartner,
  type LeadActivity,
  type InsertLeadActivity,
  type Communication,
  type InsertCommunication,
  type Negotiation,
  type InsertNegotiation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, sum, gte, lte } from "drizzle-orm";
import { MockStorage } from "./mockStorage";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  
  // Lead operations
  getLeads(projectId?: string): Promise<Lead[]>;
  getLeadsForUser(userId: string, userRole: string, projectId?: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  
  // Unit operations
  getUnits(projectId?: string): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit>;
  deleteUnit(id: string): Promise<void>;
  getAvailableUnits(projectId: string): Promise<Unit[]>;
  
  // Tower operations
  getTowers(projectId: string): Promise<Tower[]>;
  getFloors(tower: string): Promise<number[]>;
  createTower(tower: InsertTower): Promise<Tower>;
  blockUnit(unitId: string): Promise<Unit>;
  unblockUnit(unitId: string): Promise<Unit>;
  
  // Booking operations
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  
  // Payment operations
  getPayments(bookingId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment>;
  getPendingPayments(): Promise<Payment[]>;
  
  // Channel Partner operations
  getChannelPartners(): Promise<ChannelPartner[]>;
  getChannelPartner(id: string): Promise<ChannelPartner | undefined>;
  createChannelPartner(partner: InsertChannelPartner): Promise<ChannelPartner>;
  updateChannelPartner(id: string, partner: Partial<InsertChannelPartner>): Promise<ChannelPartner>;
  
  // Lead Activity operations
  getLeadActivities(leadId: string): Promise<LeadActivity[]>;
  createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity>;
  
  // Communication operations
  getCommunications(leadId?: string): Promise<Communication[]>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  
  // Negotiation operations
  getNegotiations(): Promise<Negotiation[]>;
  getNegotiation(id: string): Promise<Negotiation | undefined>;
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation>;
  
  // Dashboard analytics
  getDashboardMetrics(): Promise<{
    totalLeads: number;
    conversions: number;
    revenue: string;
    unitsSold: number;
    leadsByStatus: Array<{ status: string; count: number }>;
    leadsBySource: Array<{ source: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // Lead operations
  async getLeads(projectId?: string): Promise<Lead[]> {
    const query = db.select().from(leads);
    if (projectId) {
      return await query.where(eq(leads.projectId, projectId)).orderBy(desc(leads.createdAt));
    }
    return await query.orderBy(desc(leads.createdAt));
  }

  async getLeadsForUser(userId: string, userRole: string, projectId?: string): Promise<Lead[]> {
    // Apply role-based filtering
    if (userRole === 'master' || userRole === 'developer_hq') {
      // Master and Developer HQ can see all leads
      return await this.getLeads(projectId);
    } else if (userRole === 'sales_admin') {
      // Sales Admin can see leads assigned to themselves or sales executives under them
      const baseQuery = db
        .select()
        .from(leads)
        .leftJoin(users, eq(leads.assignedTo, users.id));

      if (projectId) {
        const result = await baseQuery.where(
          and(
            eq(leads.projectId, projectId),
            sql`(${leads.assignedTo} = ${userId} OR ${users.role} = 'sales_executive')`
          )
        ).orderBy(desc(leads.createdAt));
        return result.map((row: any) => row.leads);
      } else {
        const result = await baseQuery.where(
          sql`(${leads.assignedTo} = ${userId} OR ${users.role} = 'sales_executive')`
        ).orderBy(desc(leads.createdAt));
        return result.map((row: any) => row.leads);
      }
    } else if (userRole === 'sales_executive') {
      // Sales Executive can only see their own leads
      const query = db
        .select()
        .from(leads);

      if (projectId) {
        return await query.where(
          and(
            eq(leads.projectId, projectId),
            eq(leads.assignedTo, userId)
          )
        ).orderBy(desc(leads.createdAt));
      } else {
        return await query.where(
          eq(leads.assignedTo, userId)
        ).orderBy(desc(leads.createdAt));
      }
    }

    return [];
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.status, status as any));
  }

  // Unit operations
  async getUnits(projectId?: string): Promise<Unit[]> {
    const query = db.select().from(units);
    if (projectId) {
      return await query.where(eq(units.projectId, projectId));
    }
    return await query.orderBy(units.unitNumber);
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    const [unit] = await db.select().from(units).where(eq(units.id, id));
    return unit;
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const [newUnit] = await db.insert(units).values(unit).returning();
    return newUnit;
  }

  async updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit> {
    const [updatedUnit] = await db
      .update(units)
      .set(unit)
      .where(eq(units.id, id))
      .returning();
    return updatedUnit;
  }

  async getAvailableUnits(projectId: string): Promise<Unit[]> {
    return await db
      .select()
      .from(units)
      .where(and(eq(units.projectId, projectId), eq(units.status, 'available')));
  }

  async deleteUnit(id: string): Promise<void> {
    await db.delete(units).where(eq(units.id, id));
  }

  // Tower operations
  async getTowers(projectId: string): Promise<Tower[]> {
    const result = await db.select().from(towers)
      .where(eq(towers.projectId, projectId));
    return result;
  }

  async getFloors(towerName: string): Promise<number[]> {
    // Get tower ID from name first
    const tower = await db.select().from(towers).where(eq(towers.name, towerName)).limit(1);
    if (!tower.length) return [];
    
    const result = await db.select({ floor: units.floor }).from(units)
      .where(eq(units.towerId, tower[0].id))
      .groupBy(units.floor)
      .orderBy(units.floor);
    return result.map(r => r.floor);
  }

  async createTower(tower: InsertTower): Promise<Tower> {
    const [newTower] = await db.insert(towers).values(tower).returning();
    return newTower;
  }

  async blockUnit(unitId: string): Promise<Unit> {
    const [updatedUnit] = await db
      .update(units)
      .set({ status: 'blocked', blockedAt: new Date() })
      .where(eq(units.id, unitId))
      .returning();
    return updatedUnit;
  }

  async unblockUnit(unitId: string): Promise<Unit> {
    const [updatedUnit] = await db
      .update(units)
      .set({ status: 'available', blockedAt: null })
      .where(eq(units.id, unitId))
      .returning();
    return updatedUnit;
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(booking)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Payment operations
  async getPayments(bookingId?: string): Promise<Payment[]> {
    const query = db.select().from(payments);
    if (bookingId) {
      return await query.where(eq(payments.bookingId, bookingId)).orderBy(payments.dueDate);
    }
    return await query.orderBy(payments.dueDate);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.status, 'pending'))
      .orderBy(payments.dueDate);
  }

  // Channel Partner operations
  async getChannelPartners(): Promise<ChannelPartner[]> {
    return await db.select().from(channelPartners).orderBy(channelPartners.name);
  }

  async getChannelPartner(id: string): Promise<ChannelPartner | undefined> {
    const [partner] = await db.select().from(channelPartners).where(eq(channelPartners.id, id));
    return partner;
  }

  async createChannelPartner(partner: InsertChannelPartner): Promise<ChannelPartner> {
    const [newPartner] = await db.insert(channelPartners).values(partner).returning();
    return newPartner;
  }

  async updateChannelPartner(id: string, partner: Partial<InsertChannelPartner>): Promise<ChannelPartner> {
    const [updatedPartner] = await db
      .update(channelPartners)
      .set(partner)
      .where(eq(channelPartners.id, id))
      .returning();
    return updatedPartner;
  }

  // Lead Activity operations
  async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return await db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.leadId, leadId))
      .orderBy(desc(leadActivities.createdAt));
  }

  async createLeadActivity(activity: InsertLeadActivity): Promise<LeadActivity> {
    const [newActivity] = await db.insert(leadActivities).values(activity).returning();
    return newActivity;
  }

  // Communication operations
  async getCommunications(leadId?: string): Promise<Communication[]> {
    const query = db.select().from(communications);
    if (leadId) {
      return await query.where(eq(communications.leadId, leadId)).orderBy(desc(communications.sentAt));
    }
    return await query.orderBy(desc(communications.sentAt));
  }

  async createCommunication(communication: InsertCommunication): Promise<Communication> {
    const [newCommunication] = await db.insert(communications).values(communication).returning();
    return newCommunication;
  }

  // Negotiation operations
  async getNegotiations(): Promise<Negotiation[]> {
    return await db.select().from(negotiations).orderBy(desc(negotiations.createdAt));
  }

  async getNegotiation(id: string): Promise<Negotiation | undefined> {
    const [negotiation] = await db.select().from(negotiations).where(eq(negotiations.id, id));
    return negotiation;
  }

  async createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation> {
    const [newNegotiation] = await db.insert(negotiations).values(negotiation).returning();
    return newNegotiation;
  }

  async updateNegotiation(id: string, negotiation: Partial<InsertNegotiation>): Promise<Negotiation> {
    const [updatedNegotiation] = await db
      .update(negotiations)
      .set({ ...negotiation, updatedAt: new Date() })
      .where(eq(negotiations.id, id))
      .returning();
    return updatedNegotiation;
  }

  // Dashboard analytics
  async getDashboardMetrics(): Promise<{
    totalLeads: number;
    conversions: number;
    revenue: string;
    unitsSold: number;
    leadsByStatus: Array<{ status: string; count: number }>;
    leadsBySource: Array<{ source: string; count: number }>;
  }> {
    const [totalLeadsResult] = await db.select({ count: count() }).from(leads);
    const [conversionsResult] = await db.select({ count: count() }).from(bookings);
    const [revenueResult] = await db.select({ total: sum(bookings.finalAmount) }).from(bookings);
    const [unitsSoldResult] = await db.select({ count: count() }).from(bookings);

    const leadsByStatusQuery = await db
      .select({
        status: leads.status,
        count: count()
      })
      .from(leads)
      .groupBy(leads.status);

    const leadsBySourceQuery = await db
      .select({
        source: leads.source,
        count: count()
      })
      .from(leads)
      .groupBy(leads.source);

    return {
      totalLeads: totalLeadsResult.count,
      conversions: conversionsResult.count,
      revenue: revenueResult.total || '0',
      unitsSold: unitsSoldResult.count,
      leadsByStatus: leadsByStatusQuery.map(item => ({
        status: item.status || 'unknown',
        count: item.count
      })),
      leadsBySource: leadsBySourceQuery.map(item => ({
        source: item.source || 'unknown',
        count: item.count
      }))
    };
  }
}

// Use mock storage in development to avoid database dependency
let storage: IStorage;

if (process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Using mock storage in development mode');
  storage = new MockStorage();
} else {
  storage = new DatabaseStorage();
}

export { storage };
export type { User, UpsertUser };
