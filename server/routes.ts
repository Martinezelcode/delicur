import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCustomerSchema,
  insertDeliveryAgentSchema,
  insertOrderSchema,
  updateOrderSchema,
  insertOrderTrackingSchema
} from "@shared/schema";
import { z } from "zod";

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

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      let customers;
      
      if (search && typeof search === 'string') {
        customers = await storage.searchCustomers(search);
      } else {
        customers = await storage.getCustomers();
      }
      
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  app.put('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updates);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        console.error("Error updating customer:", error);
        res.status(500).json({ message: "Failed to update customer" });
      }
    }
  });

  app.delete('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Delivery agent routes
  app.get('/api/agents', isAuthenticated, async (req, res) => {
    try {
      const { active } = req.query;
      let agents;
      
      if (active === 'true') {
        agents = await storage.getActiveDeliveryAgents();
      } else {
        agents = await storage.getDeliveryAgents();
      }
      
      res.json(agents);
    } catch (error) {
      console.error("Error fetching delivery agents:", error);
      res.status(500).json({ message: "Failed to fetch delivery agents" });
    }
  });

  app.post('/api/agents', isAuthenticated, async (req, res) => {
    try {
      const agentData = insertDeliveryAgentSchema.parse(req.body);
      const agent = await storage.createDeliveryAgent(agentData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      } else {
        console.error("Error creating delivery agent:", error);
        res.status(500).json({ message: "Failed to create delivery agent" });
      }
    }
  });

  app.put('/api/agents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertDeliveryAgentSchema.partial().parse(req.body);
      const agent = await storage.updateDeliveryAgent(id, updates);
      res.json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      } else {
        console.error("Error updating delivery agent:", error);
        res.status(500).json({ message: "Failed to update delivery agent" });
      }
    }
  });

  app.delete('/api/agents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDeliveryAgent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting delivery agent:", error);
      res.status(500).json({ message: "Failed to delete delivery agent" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const { status, agentId, search, page = "1", limit = "50" } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        status: status as string,
        agentId: agentId as string,
        search: search as string,
        limit: limitNum,
        offset,
      };

      const result = await storage.getOrders(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  app.put('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = updateOrderSchema.parse(req.body);
      const order = await storage.updateOrder(id, updates);
      
      // Add tracking entry if status changed
      if (updates.status) {
        await storage.addOrderTracking({
          orderId: id,
          status: updates.status,
          notes: `Status updated to ${updates.status}`,
          updatedBy: req.user?.claims?.sub || "admin",
        });
      }
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Failed to update order" });
      }
    }
  });

  app.delete('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Order tracking routes
  app.get('/api/orders/:id/tracking', async (req, res) => {
    try {
      const { id } = req.params;
      const tracking = await storage.getOrderTracking(id);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching order tracking:", error);
      res.status(500).json({ message: "Failed to fetch order tracking" });
    }
  });

  app.post('/api/orders/:id/tracking', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const trackingData = insertOrderTrackingSchema.parse({
        ...req.body,
        orderId: id,
        updatedBy: req.user?.claims?.sub || "admin",
      });
      
      const tracking = await storage.addOrderTracking(trackingData);
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tracking data", errors: error.errors });
      } else {
        console.error("Error adding order tracking:", error);
        res.status(500).json({ message: "Failed to add order tracking" });
      }
    }
  });

  // Order tracking by order number (public)
  app.get('/api/track/:orderNumber', async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      
      // Return public information only
      res.json({
        orderNumber: order.orderNumber,
        status: order.status,
        recipientName: order.recipientName,
        estimatedDelivery: order.estimatedDelivery,
        trackingHistory: order.trackingHistory,
      });
    } catch (error) {
      console.error("Error tracking order:", error);
      res.status(500).json({ message: "Failed to track order" });
    }
  });

  // Rate calculation endpoint
  app.post('/api/calculate-rate', async (req, res) => {
    try {
      const { fromRegion, toRegion, weight, serviceType } = req.body;
      
      // LBC rate calculation logic based on regions and weight
      const baseRates = {
        express: { base: 150, perKg: 50 },
        regular: { base: 100, perKg: 30 },
        economy: { base: 80, perKg: 20 },
      };

      const regionMultipliers = {
        "NCR-NCR": 1.0,
        "NCR-SOUTH LUZON": 1.2,
        "NCR-NORTH LUZON": 1.2,
        "NCR-VISAYAS": 1.8,
        "NCR-MINDANAO": 2.2,
        "SOUTH LUZON-VISAYAS": 1.6,
        "NORTH LUZON-VISAYAS": 1.6,
        "VISAYAS-MINDANAO": 1.4,
      };

      const rateKey = `${fromRegion}-${toRegion}`;
      const multiplier = regionMultipliers[rateKey] || regionMultipliers[`${toRegion}-${fromRegion}`] || 1.5;
      
      const serviceRate = baseRates[serviceType] || baseRates.regular;
      const baseRate = serviceRate.base * multiplier;
      const weightRate = Math.max(0, (parseFloat(weight) - 1)) * serviceRate.perKg;
      const totalRate = baseRate + weightRate;

      res.json({
        rate: Math.round(totalRate * 100) / 100,
        estimatedDays: getEstimatedDays(fromRegion, toRegion),
      });
    } catch (error) {
      console.error("Error calculating rate:", error);
      res.status(500).json({ message: "Failed to calculate rate" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getEstimatedDays(fromRegion: string, toRegion: string): string {
  const deliveryMatrix = {
    "NCR": {
      "NCR": "1",
      "SOUTH LUZON": "1-2",
      "NORTH LUZON": "1-2", 
      "VISAYAS": "2-5",
      "MINDANAO": "3-6",
    },
    "SOUTH LUZON": {
      "NCR": "1-2",
      "VISAYAS": "2-5",
      "MINDANAO": "3-6",
    },
    "NORTH LUZON": {
      "NCR": "1-2",
      "VISAYAS": "2-5", 
      "MINDANAO": "3-6",
    },
    "VISAYAS": {
      "NCR": "2-5",
      "MINDANAO": "3-5",
    },
    "MINDANAO": {
      "NCR": "3-6",
      "VISAYAS": "3-5",
    },
  };

  return deliveryMatrix[fromRegion]?.[toRegion] || 
         deliveryMatrix[toRegion]?.[fromRegion] || 
         "3-7";
}
