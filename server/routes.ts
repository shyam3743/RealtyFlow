import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { 
  insertLeadSchema, 
  insertProjectSchema, 
  insertUnitSchema, 
  insertBookingSchema,
  insertPaymentSchema,
  insertChannelPartnerSchema,
  insertLeadActivitySchema,
  insertCommunicationSchema,
  insertNegotiationSchema,
  loginSchema,
  registerSchema
} from "@shared/schema";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";

// Seed master user
async function seedMasterUser() {
  try {
    const existingMaster = await storage.getUserByUsername("admin");
    if (!existingMaster) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await storage.createUser({
        username: "admin",
        email: "admin@realtyflow.com",
        password: hashedPassword,
        firstName: "Master",
        lastName: "Admin",
        role: "master" as const,
        isActive: true
      });
      console.log("Master user created: admin/admin");
    }
  } catch (error) {
    console.error("Error seeding master user:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed default master user
  await seedMasterUser();

  // Custom Auth middleware
  const isCustomAuthenticated = async (req: any, res: any, next: any) => {
    // Check if it's custom auth session
    if ((req.session as any)?.isCustomAuth && (req.session as any)?.userId) {
      const user = await storage.getUser((req.session as any).userId);
      if (user) {
        req.user = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
          },
          role: user.role
        };
        return next();
      }
    }
    
    // Check if it's OAuth session
    if (req.user?.claims?.sub) {
      return next();
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Custom Auth routes (for username/password login)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(loginData.username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check if role matches
      if (user.role !== loginData.role) {
        return res.status(401).json({ message: "Invalid role selection" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(loginData.password, user.password || '');
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Set user session (similar to how Replit auth works)
      (req as any).user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        }
      };
      
      // Store session
      (req.session as any).userId = user.id;
      (req.session as any).isCustomAuth = true;
      
      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const registerData = registerSchema.parse(req.body);
      
      // Only allow sales_admin and sales_executive registration
      if (!['sales_admin', 'sales_executive'].includes(registerData.role)) {
        return res.status(400).json({ message: "Invalid role for registration" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(registerData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(registerData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(registerData.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        username: registerData.username,
        email: registerData.email,
        password: hashedPassword,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone,
        role: registerData.role as "sales_admin" | "sales_executive",
        isActive: true
      });
      
      res.json({ 
        message: "Registration successful", 
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Updated user route to handle both OAuth and custom auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId;
      
      // Check if it's custom auth session
      if ((req.session as any)?.isCustomAuth && (req.session as any)?.userId) {
        userId = (req.session as any).userId;
      } 
      // Check if it's OAuth session
      else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    if ((req.session as any)?.isCustomAuth) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } else {
      // Handle OAuth logout
      res.redirect('/api/logout');
    }
  });

  // Auth routes
  // Dashboard routes
  app.get('/api/dashboard/metrics', isCustomAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Project routes
  app.get('/api/projects', isCustomAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        developerId: req.user.claims.sub
      });
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Unit routes - Complete inventory management
  app.get('/api/units', isCustomAuthenticated, async (req, res) => {
    try {
      const { projectId } = req.query;
      const units = await storage.getUnits(projectId as string);
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get('/api/towers/:projectId', isCustomAuthenticated, async (req, res) => {
    try {
      const towers = await storage.getTowers(req.params.projectId);
      res.json(towers);
    } catch (error) {
      console.error("Error fetching towers:", error);
      res.status(500).json({ message: "Failed to fetch towers" });
    }
  });

  app.get('/api/floors/:tower', isCustomAuthenticated, async (req, res) => {
    try {
      const floors = await storage.getFloors(req.params.tower);
      res.json(floors);
    } catch (error) {
      console.error("Error fetching floors:", error);
      res.status(500).json({ message: "Failed to fetch floors" });
    }
  });

  app.post('/api/units/:unitId/block', isCustomAuthenticated, async (req, res) => {
    try {
      const unit = await storage.blockUnit(req.params.unitId);
      res.json(unit);
    } catch (error) {
      console.error("Error blocking unit:", error);
      res.status(500).json({ message: "Failed to block unit" });
    }
  });

  app.post('/api/units/:unitId/unblock', isCustomAuthenticated, async (req, res) => {
    try {
      const unit = await storage.unblockUnit(req.params.unitId);
      res.json(unit);
    } catch (error) {
      console.error("Error unblocking unit:", error);
      res.status(500).json({ message: "Failed to unblock unit" });
    }
  });

  app.post('/api/units', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(validatedData);
      res.json(unit);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating unit:", error);
      res.status(500).json({ message: "Failed to create unit" });
    }
  });

  app.put('/api/projects/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Lead routes
  app.get('/api/leads', isCustomAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const leads = await storage.getLeads(projectId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post('/api/leads', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertLeadSchema.parse({
        ...req.body,
        assignedTo: req.user.claims.sub
      });
      const lead = await storage.createLead(validatedData);
      res.json(lead);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put('/api/leads/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, validatedData);
      res.json(lead);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete('/api/leads/:id', isCustomAuthenticated, async (req, res) => {
    try {
      await storage.deleteLead(req.params.id);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.delete('/api/leads/:id', isCustomAuthenticated, async (req, res) => {
    try {
      await storage.deleteLead(req.params.id);
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.get('/api/leads/status/:status', isCustomAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getLeadsByStatus(req.params.status);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads by status:", error);
      res.status(500).json({ message: "Failed to fetch leads by status" });
    }
  });

  // Lead Activities routes
  app.get('/api/leads/:leadId/activities', isCustomAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getLeadActivities(req.params.leadId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ message: "Failed to fetch lead activities" });
    }
  });

  app.post('/api/leads/:leadId/activities', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertLeadActivitySchema.parse({
        ...req.body,
        leadId: req.params.leadId,
        userId: req.user.claims.sub
      });
      const activity = await storage.createLeadActivity(validatedData);
      res.json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating lead activity:", error);
      res.status(500).json({ message: "Failed to create lead activity" });
    }
  });

  // Unit routes
  app.get('/api/units', isCustomAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const units = await storage.getUnits(projectId);
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get('/api/units/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error fetching unit:", error);
      res.status(500).json({ message: "Failed to fetch unit" });
    }
  });

  app.post('/api/units', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(validatedData);
      res.json(unit);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating unit:", error);
      res.status(500).json({ message: "Failed to create unit" });
    }
  });

  app.put('/api/units/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertUnitSchema.partial().parse(req.body);
      const unit = await storage.updateUnit(req.params.id, validatedData);
      res.json(unit);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating unit:", error);
      res.status(500).json({ message: "Failed to update unit" });
    }
  });

  app.delete('/api/units/:id', isCustomAuthenticated, async (req, res) => {
    try {
      await storage.deleteUnit(req.params.id);
      res.json({ message: "Unit deleted successfully" });
    } catch (error) {
      console.error("Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit" });
    }
  });

  app.get('/api/projects/:projectId/available-units', isCustomAuthenticated, async (req, res) => {
    try {
      const units = await storage.getAvailableUnits(req.params.projectId);
      res.json(units);
    } catch (error) {
      console.error("Error fetching available units:", error);
      res.status(500).json({ message: "Failed to fetch available units" });
    }
  });

  // Tower routes
  app.get('/api/projects/:projectId/towers', isCustomAuthenticated, async (req, res) => {
    try {
      const towers = await storage.getTowers(req.params.projectId);
      res.json(towers);
    } catch (error) {
      console.error("Error fetching towers:", error);
      res.status(500).json({ message: "Failed to fetch towers" });
    }
  });

  app.post('/api/projects/:projectId/towers', isCustomAuthenticated, async (req, res) => {
    try {
      const tower = await storage.createTower({
        ...req.body,
        projectId: req.params.projectId
      });
      res.json(tower);
    } catch (error) {
      console.error("Error creating tower:", error);
      res.status(500).json({ message: "Failed to create tower" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isCustomAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post('/api/bookings', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        salesPersonId: req.user.claims.sub
      });
      const booking = await storage.createBooking(validatedData);
      
      // Update unit status to booked
      await storage.updateUnit(validatedData.unitId, { status: 'booked' });
      
      res.json(booking);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put('/api/bookings/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, validatedData);
      res.json(booking);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Payment routes
  app.get('/api/payments', isCustomAuthenticated, async (req, res) => {
    try {
      const bookingId = req.query.bookingId as string;
      const payments = await storage.getPayments(bookingId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get('/api/payments/pending', isCustomAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPendingPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      res.status(500).json({ message: "Failed to fetch pending payments" });
    }
  });

  app.post('/api/payments', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.json(payment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put('/api/payments/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(req.params.id, validatedData);
      res.json(payment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  // Channel Partner routes
  app.get('/api/channel-partners', isCustomAuthenticated, async (req, res) => {
    try {
      const partners = await storage.getChannelPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching channel partners:", error);
      res.status(500).json({ message: "Failed to fetch channel partners" });
    }
  });

  app.get('/api/channel-partners/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const partner = await storage.getChannelPartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ message: "Channel partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Error fetching channel partner:", error);
      res.status(500).json({ message: "Failed to fetch channel partner" });
    }
  });

  app.post('/api/channel-partners', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertChannelPartnerSchema.parse(req.body);
      const partner = await storage.createChannelPartner(validatedData);
      res.json(partner);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating channel partner:", error);
      res.status(500).json({ message: "Failed to create channel partner" });
    }
  });

  app.put('/api/channel-partners/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const validatedData = insertChannelPartnerSchema.partial().parse(req.body);
      const partner = await storage.updateChannelPartner(req.params.id, validatedData);
      res.json(partner);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating channel partner:", error);
      res.status(500).json({ message: "Failed to update channel partner" });
    }
  });

  // Communication routes
  app.get('/api/communications', isCustomAuthenticated, async (req, res) => {
    try {
      const leadId = req.query.leadId as string;
      const communications = await storage.getCommunications(leadId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.post('/api/communications', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertCommunicationSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub
      });
      const communication = await storage.createCommunication(validatedData);
      res.json(communication);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating communication:", error);
      res.status(500).json({ message: "Failed to create communication" });
    }
  });

  // Negotiation routes
  app.get('/api/negotiations', isCustomAuthenticated, async (req, res) => {
    try {
      const negotiations = await storage.getNegotiations();
      res.json(negotiations);
    } catch (error) {
      console.error("Error fetching negotiations:", error);
      res.status(500).json({ message: "Failed to fetch negotiations" });
    }
  });

  app.get('/api/negotiations/:id', isCustomAuthenticated, async (req, res) => {
    try {
      const negotiation = await storage.getNegotiation(req.params.id);
      if (!negotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }
      res.json(negotiation);
    } catch (error) {
      console.error("Error fetching negotiation:", error);
      res.status(500).json({ message: "Failed to fetch negotiation" });
    }
  });

  app.post('/api/negotiations', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertNegotiationSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub
      });
      const negotiation = await storage.createNegotiation(validatedData);
      res.json(negotiation);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating negotiation:", error);
      res.status(500).json({ message: "Failed to create negotiation" });
    }
  });

  app.put('/api/negotiations/:id', isCustomAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertNegotiationSchema.partial().parse(req.body);
      const negotiation = await storage.updateNegotiation(req.params.id, validatedData);
      res.json(negotiation);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating negotiation:", error);
      res.status(500).json({ message: "Failed to update negotiation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
