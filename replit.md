# CodeCheck - C Automated Testing Platform

## Overview

CodeCheck is a web-based platform for automated testing of C programs. It provides a complete learning management system where administrators can create programming assignments with test cases, and students can write, edit, and submit C code that gets automatically evaluated against predefined test cases.

The application follows a monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context API for global app state, TanStack Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Code Editor**: react-simple-code-editor with PrismJS syntax highlighting for C language
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Session-based authentication using express-session with PostgreSQL session store (connect-pg-simple)
- **Password Hashing**: bcryptjs
- **API Design**: RESTful JSON API with `/api` prefix

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit with push-based migrations (`db:push`)

### Data Models
1. **Users**: id, name, email, passwordHash, role (admin/student), createdAt
2. **Assignments**: id, title, description, dueDate, language, minTestsToPass, starterCode, createdAt
3. **Tests**: id, assignmentId (FK), name, input, expected
4. **Submissions**: userId (FK), assignmentId (FK), code, passedTests, totalTests, status, score

### Authentication Flow
- Session-based authentication stored in PostgreSQL
- Two user roles: `admin` and `student`
- Admin users access `/admin` dashboard for managing users and assignments
- Student users access `/dashboard` to view assignments and `/editor/:id` to submit code

### Build System
- Development: Vite dev server with HMR for frontend, tsx for backend
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Server serves static frontend files in production mode

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Session Storage**: connect-pg-simple for persistent sessions

### UI Components
- **Radix UI**: Primitives for accessible components (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component library using Radix primitives
- **Lucide React**: Icon library

### Code Editing
- **PrismJS**: Syntax highlighting for C code
- **react-simple-code-editor**: Lightweight code editor component

### Validation
- **Zod**: Schema validation for API requests and forms
- **drizzle-zod**: Generate Zod schemas from Drizzle table definitions

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner (development only)