import {
  users,
  customers,
  deliveryAgents,
  orders,
  orderTracking,
  type User,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type DeliveryAgent,
  type InsertDeliveryAgent,
  type Order,
  type InsertOrder,
  type UpdateOrder,
  type OrderWithDetails,
  type OrderTracking,
  type InsertOrderTracking,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  searchCustomers(query: string): Promise<Customer[]>;
  
  // Delivery agent operations
  getDeliveryAgents(): Promise<DeliveryAgent[]>;
  getDeliveryAgent(id: string): Promise<DeliveryAgent | undefined>;
  createDeliveryAgent(agent: InsertDeliveryAgent): Promise<DeliveryAgent>;
  updateDeliveryAgent(id: string, updates: Partial<InsertDeliveryAgent>): Promise<DeliveryAgent>;
  deleteDeliveryAgent(id: string): Promise<void>;
  getActiveDeliveryAgents(): Promise<DeliveryAgent[]>;
  
  // Order operations
  getOrders(filters?: { 
    status?: string; 
    agentId?: string; 
    search?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<{ orders: OrderWithDetails[]; total: number }>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: UpdateOrder): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
  getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | undefined>;
  
  // Order tracking operations
  addOrderTracking(tracking: InsertOrderTracking): Promise<OrderTracking>;
  getOrderTracking(orderId: string): Promise<OrderTracking[]>;
  
  // Dashboard stats
  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
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

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(
        or(
          like(customers.fullName, `%${query}%`),
          like(customers.email, `%${query}%`),
          like(customers.phone, `%${query}%`)
        )
      );
  }

  // Delivery agent operations
  async getDeliveryAgents(): Promise<DeliveryAgent[]> {
    return await db.select().from(deliveryAgents).orderBy(desc(deliveryAgents.createdAt));
  }

  async getDeliveryAgent(id: string): Promise<DeliveryAgent | undefined> {
    const [agent] = await db.select().from(deliveryAgents).where(eq(deliveryAgents.id, id));
    return agent;
  }

  async createDeliveryAgent(agent: InsertDeliveryAgent): Promise<DeliveryAgent> {
    const [newAgent] = await db.insert(deliveryAgents).values(agent).returning();
    return newAgent;
  }

  async updateDeliveryAgent(id: string, updates: Partial<InsertDeliveryAgent>): Promise<DeliveryAgent> {
    const [agent] = await db
      .update(deliveryAgents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deliveryAgents.id, id))
      .returning();
    return agent;
  }

  async deleteDeliveryAgent(id: string): Promise<void> {
    await db.delete(deliveryAgents).where(eq(deliveryAgents.id, id));
  }

  async getActiveDeliveryAgents(): Promise<DeliveryAgent[]> {
    return await db
      .select()
      .from(deliveryAgents)
      .where(eq(deliveryAgents.isActive, true))
      .orderBy(deliveryAgents.fullName);
  }

  // Order operations
  async getOrders(filters?: { 
    status?: string; 
    agentId?: string; 
    search?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<{ orders: OrderWithDetails[]; total: number }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    let whereConditions = [];
    
    if (filters?.status) {
      whereConditions.push(eq(orders.status, filters.status));
    }
    
    if (filters?.agentId) {
      whereConditions.push(eq(orders.assignedAgentId, filters.agentId));
    }
    
    if (filters?.search) {
      whereConditions.push(
        or(
          like(orders.orderNumber, `%${filters.search}%`),
          like(orders.senderName, `%${filters.search}%`),
          like(orders.recipientName, `%${filters.search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [ordersResult, totalResult] = await Promise.all([
      db
        .select({
          order: orders,
          agent: deliveryAgents,
        })
        .from(orders)
        .leftJoin(deliveryAgents, eq(orders.assignedAgentId, deliveryAgents.id))
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(orders)
        .where(whereClause)
    ]);

    const ordersWithDetails: OrderWithDetails[] = ordersResult.map(({ order, agent }) => ({
      ...order,
      assignedAgent: agent || undefined,
    }));

    return {
      orders: ordersWithDetails,
      total: totalResult[0].count,
    };
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const [result] = await db
      .select({
        order: orders,
        agent: deliveryAgents,
      })
      .from(orders)
      .leftJoin(deliveryAgents, eq(orders.assignedAgentId, deliveryAgents.id))
      .where(eq(orders.id, id));

    if (!result) return undefined;

    const tracking = await this.getOrderTracking(id);

    return {
      ...result.order,
      assignedAgent: result.agent || undefined,
      trackingHistory: tracking,
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Generate order number
    const orderNumber = `LBC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();

    // Add initial tracking entry
    await this.addOrderTracking({
      orderId: newOrder.id,
      status: "pending",
      notes: "Order created",
      updatedBy: "system",
    });

    return newOrder;
  }

  async updateOrder(id: string, updates: UpdateOrder): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    // Delete tracking history first
    await db.delete(orderTracking).where(eq(orderTracking.orderId, id));
    // Delete order
    await db.delete(orders).where(eq(orders.id, id));
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | undefined> {
    const [result] = await db
      .select({
        order: orders,
        agent: deliveryAgents,
      })
      .from(orders)
      .leftJoin(deliveryAgents, eq(orders.assignedAgentId, deliveryAgents.id))
      .where(eq(orders.orderNumber, orderNumber));

    if (!result) return undefined;

    const tracking = await this.getOrderTracking(result.order.id);

    return {
      ...result.order,
      assignedAgent: result.agent || undefined,
      trackingHistory: tracking,
    };
  }

  // Order tracking operations
  async addOrderTracking(tracking: InsertOrderTracking): Promise<OrderTracking> {
    const [newTracking] = await db.insert(orderTracking).values(tracking).returning();
    return newTracking;
  }

  async getOrderTracking(orderId: string): Promise<OrderTracking[]> {
    return await db
      .select()
      .from(orderTracking)
      .where(eq(orderTracking.orderId, orderId))
      .orderBy(desc(orderTracking.timestamp));
  }

  // Dashboard stats
  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
  }> {
    const [stats] = await db
      .select({
        totalOrders: count(),
        pendingOrders: count(),
        inTransitOrders: count(),
        deliveredOrders: count(),
      })
      .from(orders);

    const [pending] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const [inTransit] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "in-transit"));

    const [delivered] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "delivered"));

    return {
      totalOrders: stats.totalOrders,
      pendingOrders: pending.count,
      inTransitOrders: inTransit.count,
      deliveredOrders: delivered.count,
    };
  }
}

export const storage = new DatabaseStorage();
