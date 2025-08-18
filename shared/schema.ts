import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum('user_role', ['master', 'developer_hq', 'sales_admin', 'sales_executive']);
export const leadSourceEnum = pgEnum('lead_source', ['99acres', 'magicbricks', 'website', 'walk_in', 'broker', 'google_ads', 'meta_ads', 'referral']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'site_visit', 'negotiation', 'booking', 'sale', 'post_sales', 'lost', 'inactive']);
export const unitStatusEnum = pgEnum('unit_status', ['available', 'blocked', 'booked', 'sold']);
export const propertyTypeEnum = pgEnum('property_type', ['flat', 'bungalow', 'row_house', 'shop', 'office']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'partial']);
export const projectStatusEnum = pgEnum('project_status', ['pre_launch', 'active', 'sold_out', 'completed']);
export const communicationTypeEnum = pgEnum('communication_type', ['call', 'email', 'whatsapp', 'sms', 'meeting', 'site_visit']);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('sales_executive'),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  location: varchar("location").notNull(),
  description: text("description"),
  totalUnits: integer("total_units").notNull(),
  availableUnits: integer("available_units").notNull(),
  blockedUnits: integer("blocked_units").default(0),
  soldUnits: integer("sold_units").default(0),
  basePrice: decimal("base_price", { precision: 15, scale: 2 }),
  status: projectStatusEnum("status").default('pre_launch'),
  imageUrl: varchar("image_url"),
  launchDate: timestamp("launch_date"),
  completionDate: timestamp("completion_date"),
  developerId: varchar("developer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Towers
export const towers = pgTable("towers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  name: varchar("name").notNull(),
  floors: integer("floors").notNull(),
  unitsPerFloor: integer("units_per_floor").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Units
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  towerId: varchar("tower_id").references(() => towers.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  unitNumber: varchar("unit_number").notNull(),
  floor: integer("floor").notNull(),
  propertyType: propertyTypeEnum("property_type").default('flat'),
  size: decimal("size", { precision: 8, scale: 2 }).notNull(),
  baseRate: decimal("base_rate", { precision: 15, scale: 2 }).notNull(),
  plc: decimal("plc", { precision: 15, scale: 2 }).default('0'),
  gst: decimal("gst", { precision: 5, scale: 2 }).default('0'),
  stampDuty: decimal("stamp_duty", { precision: 15, scale: 2 }).default('0'),
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
  status: unitStatusEnum("status").default('available'),
  view: varchar("view"),
  facing: varchar("facing"),
  blockedAt: timestamp("blocked_at"),
  blockExpiryAt: timestamp("block_expiry_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leads
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  source: leadSourceEnum("source").notNull(),
  status: leadStatusEnum("status").default('new'),
  projectId: varchar("project_id").references(() => projects.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  preferences: text("preferences"),
  notes: text("notes"),
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead Activities
export const leadActivities = pgTable("lead_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: communicationTypeEnum("type").notNull(),
  description: text("description").notNull(),
  outcome: text("outcome"),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  unitId: varchar("unit_id").references(() => units.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  salesPersonId: varchar("sales_person_id").references(() => users.id).notNull(),
  tokenAmount: decimal("token_amount", { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).default('0'),
  finalAmount: decimal("final_amount", { precision: 15, scale: 2 }).notNull(),
  paymentPlan: varchar("payment_plan"),
  bookingDate: timestamp("booking_date").defaultNow(),
  agreementDate: timestamp("agreement_date"),
  possessionDate: timestamp("possession_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: paymentStatusEnum("status").default('pending'),
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Channel Partners
export const channelPartners = pgTable("channel_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  company: varchar("company"),
  address: text("address"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  kycStatus: boolean("kyc_status").default(false),
  agreementDate: timestamp("agreement_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Channel Partner Leads
export const channelPartnerLeads = pgTable("channel_partner_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelPartnerId: varchar("channel_partner_id").references(() => channelPartners.id).notNull(),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 15, scale: 2 }),
  commissionPaid: boolean("commission_paid").default(false),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Communications
export const communications = pgTable("communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  type: communicationTypeEnum("type").notNull(),
  subject: varchar("subject"),
  content: text("content").notNull(),
  recipient: varchar("recipient").notNull(),
  status: varchar("status").default('sent'),
  sentAt: timestamp("sent_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const negotiations = pgTable("negotiations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id),
  unitId: varchar("unit_id").references(() => units.id),
  projectId: varchar("project_id").references(() => projects.id),
  status: varchar("status").default('pending'), // pending, negotiating, approved, rejected
  basePrice: decimal("base_price", { precision: 15, scale: 2 }),
  requestedPrice: decimal("requested_price", { precision: 15, scale: 2 }),
  offeredPrice: decimal("offered_price", { precision: 15, scale: 2 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  tokenAmount: decimal("token_amount", { precision: 15, scale: 2 }),
  paymentPlan: varchar("payment_plan"), // full_dp, subvention, tlp, clp, custom
  isTokenReady: boolean("is_token_ready").default(false),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdBy: varchar("created_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  developer: one(users, {
    fields: [projects.developerId],
    references: [users.id],
  }),
  towers: many(towers),
  units: many(units),
  leads: many(leads),
  bookings: many(bookings),
}));

export const towersRelations = relations(towers, ({ one, many }) => ({
  project: one(projects, {
    fields: [towers.projectId],
    references: [projects.id],
  }),
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  tower: one(towers, {
    fields: [units.towerId],
    references: [towers.id],
  }),
  project: one(projects, {
    fields: [units.projectId],
    references: [projects.id],
  }),
  bookings: many(bookings),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  project: one(projects, {
    fields: [leads.projectId],
    references: [projects.id],
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  activities: many(leadActivities),
  bookings: many(bookings),
  communications: many(communications),
  channelPartnerLeads: many(channelPartnerLeads),
  negotiations: many(negotiations),
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [leadActivities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [leadActivities.userId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  lead: one(leads, {
    fields: [bookings.leadId],
    references: [leads.id],
  }),
  unit: one(units, {
    fields: [bookings.unitId],
    references: [units.id],
  }),
  project: one(projects, {
    fields: [bookings.projectId],
    references: [projects.id],
  }),
  salesPerson: one(users, {
    fields: [bookings.salesPersonId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const channelPartnersRelations = relations(channelPartners, ({ many }) => ({
  channelPartnerLeads: many(channelPartnerLeads),
}));

export const channelPartnerLeadsRelations = relations(channelPartnerLeads, ({ one }) => ({
  channelPartner: one(channelPartners, {
    fields: [channelPartnerLeads.channelPartnerId],
    references: [channelPartners.id],
  }),
  lead: one(leads, {
    fields: [channelPartnerLeads.leadId],
    references: [leads.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  lead: one(leads, {
    fields: [communications.leadId],
    references: [leads.id],
  }),
  createdBy: one(users, {
    fields: [communications.createdBy],
    references: [users.id],
  }),
}));

export const negotiationsRelations = relations(negotiations, ({ one }) => ({
  lead: one(leads, {
    fields: [negotiations.leadId],
    references: [leads.id],
  }),
  unit: one(units, {
    fields: [negotiations.unitId],
    references: [units.id],
  }),
  project: one(projects, {
    fields: [negotiations.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [negotiations.createdBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [negotiations.approvedBy],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  assignedLeads: many(leads),
  activities: many(leadActivities),
  bookings: many(bookings),
  communications: many(communications),
  projects: many(projects),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertChannelPartnerSchema = createInsertSchema(channelPartners).omit({
  id: true,
  createdAt: true,
});

export const insertLeadActivitySchema = createInsertSchema(leadActivities).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTowerSchema = createInsertSchema(towers).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type ChannelPartner = typeof channelPartners.$inferSelect;
export type InsertChannelPartner = z.infer<typeof insertChannelPartnerSchema>;
export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type Tower = typeof towers.$inferSelect;
export type InsertTower = z.infer<typeof insertTowerSchema>;

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["master", "developer_hq", "sales_admin", "sales_executive"]),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum(["sales_admin", "sales_executive"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
