import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  province: varchar("province"),
  zipCode: varchar("zip_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Delivery agents table
export const deliveryAgents = pgTable("delivery_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone").notNull(),
  employeeId: varchar("employee_id").unique().notNull(),
  region: varchar("region").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(),
  
  // Sender information
  senderName: varchar("sender_name").notNull(),
  senderPhone: varchar("sender_phone"),
  senderEmail: varchar("sender_email"),
  senderAddress: text("sender_address").notNull(),
  
  // Recipient information
  recipientName: varchar("recipient_name").notNull(),
  recipientPhone: varchar("recipient_phone"),
  recipientEmail: varchar("recipient_email"),
  recipientAddress: text("recipient_address").notNull(),
  
  // Package details
  packageType: varchar("package_type").notNull(), // document, package, parcel, cargo
  weight: decimal("weight", { precision: 10, scale: 2 }),
  declaredValue: decimal("declared_value", { precision: 12, scale: 2 }),
  description: text("description"),
  
  // Service details
  serviceType: varchar("service_type").notNull(), // express, regular, economy
  fromRegion: varchar("from_region").notNull(),
  toRegion: varchar("to_region").notNull(),
  
  // Payment and service options
  isCod: boolean("is_cod").default(false),
  codAmount: decimal("cod_amount", { precision: 12, scale: 2 }),
  hasInsurance: boolean("has_insurance").default(false),
  hasSmsNotification: boolean("has_sms_notification").default(false),
  
  // Pricing
  shippingRate: decimal("shipping_rate", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  
  // Status and assignment
  status: varchar("status").notNull().default("pending"), // pending, processing, in-transit, delivered, cancelled
  assignedAgentId: varchar("assigned_agent_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
});

// Order tracking history
export const orderTracking = pgTable("order_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  status: varchar("status").notNull(),
  location: varchar("location"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
  updatedBy: varchar("updated_by"), // user id who updated
});

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  assignedAgent: one(deliveryAgents, {
    fields: [orders.assignedAgentId],
    references: [deliveryAgents.id],
  }),
  trackingHistory: many(orderTracking),
}));

export const deliveryAgentsRelations = relations(deliveryAgents, ({ many }) => ({
  assignedOrders: many(orders),
}));

export const orderTrackingRelations = relations(orderTracking, ({ one }) => ({
  order: one(orders, {
    fields: [orderTracking.orderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeliveryAgentSchema = createInsertSchema(deliveryAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderTrackingSchema = createInsertSchema(orderTracking).omit({
  id: true,
  timestamp: true,
});

// Update schemas
export const updateOrderSchema = insertOrderSchema.partial();

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type DeliveryAgent = typeof deliveryAgents.$inferSelect;
export type InsertDeliveryAgent = z.infer<typeof insertDeliveryAgentSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type OrderTracking = typeof orderTracking.$inferSelect;
export type InsertOrderTracking = z.infer<typeof insertOrderTrackingSchema>;

// Order with relations
export type OrderWithDetails = Order & {
  assignedAgent?: DeliveryAgent;
  trackingHistory?: OrderTracking[];
};
