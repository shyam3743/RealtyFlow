import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertLeadSchema, 
  insertProjectSchema, 
  insertUnitSchema, 
  insertBookingSchema,
  insertPaymentSchema,
  insertChannelPartnerSchema,
  insertLeadActivitySchema,
  insertCommunicationSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/projects/:id', isAuthenticated, async (req, res) => {
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
  app.get('/api/leads', isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const leads = await storage.getLeads(projectId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/leads', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/leads/:id', isAuthenticated, async (req, res) => {
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

  app.get('/api/leads/status/:status', isAuthenticated, async (req, res) => {
    try {
      const leads = await storage.getLeadsByStatus(req.params.status);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads by status:", error);
      res.status(500).json({ message: "Failed to fetch leads by status" });
    }
  });

  // Lead Activities routes
  app.get('/api/leads/:leadId/activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getLeadActivities(req.params.leadId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ message: "Failed to fetch lead activities" });
    }
  });

  app.post('/api/leads/:leadId/activities', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/units', isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const units = await storage.getUnits(projectId);
      res.json(units);
    } catch (error) {
      console.error("Error fetching units:", error);
      res.status(500).json({ message: "Failed to fetch units" });
    }
  });

  app.get('/api/units/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/units', isAuthenticated, async (req, res) => {
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

  app.put('/api/units/:id', isAuthenticated, async (req, res) => {
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

  app.get('/api/projects/:projectId/available-units', isAuthenticated, async (req, res) => {
    try {
      const units = await storage.getAvailableUnits(req.params.projectId);
      res.json(units);
    } catch (error) {
      console.error("Error fetching available units:", error);
      res.status(500).json({ message: "Failed to fetch available units" });
    }
  });

  // Tower routes
  app.get('/api/projects/:projectId/towers', isAuthenticated, async (req, res) => {
    try {
      const towers = await storage.getTowers(req.params.projectId);
      res.json(towers);
    } catch (error) {
      console.error("Error fetching towers:", error);
      res.status(500).json({ message: "Failed to fetch towers" });
    }
  });

  app.post('/api/projects/:projectId/towers', isAuthenticated, async (req, res) => {
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
  app.get('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/bookings/:id', isAuthenticated, async (req, res) => {
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
  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const bookingId = req.query.bookingId as string;
      const payments = await storage.getPayments(bookingId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get('/api/payments/pending', isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPendingPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      res.status(500).json({ message: "Failed to fetch pending payments" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req, res) => {
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

  app.put('/api/payments/:id', isAuthenticated, async (req, res) => {
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
  app.get('/api/channel-partners', isAuthenticated, async (req, res) => {
    try {
      const partners = await storage.getChannelPartners();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching channel partners:", error);
      res.status(500).json({ message: "Failed to fetch channel partners" });
    }
  });

  app.get('/api/channel-partners/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/channel-partners', isAuthenticated, async (req, res) => {
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

  app.put('/api/channel-partners/:id', isAuthenticated, async (req, res) => {
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
  app.get('/api/communications', isAuthenticated, async (req, res) => {
    try {
      const leadId = req.query.leadId as string;
      const communications = await storage.getCommunications(leadId);
      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });

  app.post('/api/communications', isAuthenticated, async (req: any, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
