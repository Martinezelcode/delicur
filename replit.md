# LBC Express Delivery Management System

## Overview

This is a comprehensive delivery management system for LBC Express, a nationwide express delivery service. The application provides a complete order management solution for delivery operations, including customer management, delivery agent coordination, order tracking, and rate calculation services.

The system is built as a full-stack web application with a React frontend and Express.js backend, designed to handle the complete lifecycle of delivery orders from creation to completion. It includes features for managing customers, delivery agents, orders, and provides real-time tracking capabilities along with comprehensive reporting tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing with authentication-aware route protection
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **Forms**: React Hook Form with Zod validation for robust form handling and validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL session store for persistent login state

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting for scalability and reliability
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Connection Pooling**: Neon serverless connection pooling for efficient database access

### Authentication and Authorization
- **Provider**: Replit Auth with OpenID Connect protocol for secure authentication
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple
- **Route Protection**: Middleware-based authentication checks with automatic redirect handling
- **User Management**: User profile storage with email, name, and profile image support

### Core Business Logic
- **Order Management**: Complete order lifecycle from creation to delivery with status tracking
- **Customer Management**: Customer database with contact information and address management
- **Agent Management**: Delivery agent coordination with regional assignments and status tracking
- **Rate Calculator**: Dynamic shipping rate calculation based on weight, distance, and service type
- **Tracking System**: Real-time order tracking with status updates and location information

### External Dependencies
- **Database Hosting**: Neon PostgreSQL for serverless database hosting
- **Authentication**: Replit Auth service for user authentication and authorization
- **Development Tools**: Vite for fast development and build tooling with hot module replacement
- **Monitoring**: Built-in request logging and error tracking for operational visibility

The architecture follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type consistency across the entire application. The system is designed for deployment on Replit with automatic environment configuration and database provisioning.