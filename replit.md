# RealEstate CRM

## Overview

A comprehensive Sales Management System designed specifically for real estate developers. This application provides end-to-end customer relationship management, from lead capture through post-sales support. The system features a modern React frontend with Express.js backend, utilizing PostgreSQL for data persistence and Replit's authentication system for secure access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with TypeScript and Vite for fast development and hot module replacement
- **UI Framework**: shadcn/ui components with Radix UI primitives for accessible, consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging, authentication, and error handling
- **TypeScript**: Full type safety across the entire application stack
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store for persistent user sessions

### Authentication & Authorization
- **Replit OpenID Connect**: Integrated authentication using Replit's OIDC provider
- **Passport.js**: Authentication middleware with custom strategy for Replit integration
- **Role-based Access**: Three user roles (developer_hq, project_admin, sales_team) with different permission levels
- **Session Security**: HTTP-only cookies with secure flags and configurable TTL

### Database Design
- **PostgreSQL**: Primary database with connection pooling via Neon serverless
- **Drizzle ORM**: Type-safe database schema definition and query building
- **Schema Structure**: Comprehensive CRM schema including users, projects, leads, units, bookings, payments, channel partners, and communications
- **Enums**: Strongly typed enumerations for lead sources, statuses, payment types, and user roles
- **Relationships**: Proper foreign key relationships with cascade behavior

### Data Models
- **Lead Management**: Complete lead lifecycle from source tracking through conversion
- **Project Management**: Multi-project support with unit inventory tracking
- **Customer Journey**: Status-based pipeline management with activity logging
- **Payment Processing**: Flexible payment tracking with multiple status states
- **Channel Partners**: External partner management with commission tracking

### External Dependencies
- **Neon Database**: Serverless PostgreSQL with WebSocket connections
- **Replit Services**: Authentication, hosting, and development environment
- **Radix UI**: Accessible component primitives for consistent user experience
- **Recharts**: Chart library for dashboard visualizations and reporting
- **Date-fns**: Date manipulation and formatting utilities
- **Lucide React**: Icon library for consistent iconography