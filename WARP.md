# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

JWT-based authentication backend for the Wheel Match Admin Panel. Built with Node.js, Express, TypeScript, MySQL, and Sequelize ORM. Uses ES modules (not CommonJS).

## Development Commands

### Setup & Installation
```bash
npm install                  # Install dependencies
cp .env.example .env         # Create environment file (update DB_PASSWORD and JWT_SECRET)
npm run build                # Compile TypeScript to dist/
npm run db:migrate           # Run database migrations (requires built code)
npm run db:seed              # Seed database with default admin user
```

### Running the Application
```bash
npm run dev                  # Development server with hot reload (uses ts-node)
npm start                    # Production server (uses compiled dist/ code)
```

### Database Operations
```bash
npm run db:migrate           # Apply database schema changes
npm run db:seed              # Add default admin user (email: admin@wheelmatch.local, password: Admin123)
```

### Code Quality
```bash
npm run lint                 # Run ESLint on src/**/*.ts
npm run format               # Format code with Prettier
```

### Docker
```bash
docker-compose up --build    # Start MySQL + app (auto-migrates and seeds)
docker-compose down          # Stop services
docker-compose down -v       # Stop and remove volumes
```

## Architecture

### Module System
Uses **ES modules** with `.js` extensions in imports despite `.ts` source files. All imports must include `.js` extension (e.g., `import User from './models/User.js'`).

### Authentication Flow
1. **Password Security**: Passwords hashed with bcrypt (10 salt rounds) via `utils/password.ts`
2. **JWT Generation**: Tokens created with payload `{userId, email, role}` via `utils/jwt.ts`
3. **Token Validation**: `middlewares/auth.ts` verifies Bearer tokens and attaches decoded user to `req.user`
4. **Response Format**: All responses use standardized format via `utils/response.ts`:
   - Success: `{status: "success", message: string, data?: any}`
   - Error: `{status: "error", message: string}`

### Request Pipeline
```
Request → CORS & Body Parsing (app.ts)
       → Route Handler (routes/authRoutes.ts)
       → Validation Middleware (express-validator)
       → Controller (controllers/authController.ts)
       → Model/Database (models/User.ts)
       → Response Helper (utils/response.ts)
       → Error Handler (middlewares/errorHandler.ts)
```

### Database Layer
- **ORM**: Sequelize with MySQL dialect
- **Connection**: Configured in `config/database.ts` with connection pooling (max: 5, idle: 10s)
- **Migrations**: Manual table creation via `config/migrate.ts` (uses `sequelize.sync()`)
- **Seeding**: Default admin user creation in `config/seed.ts`
- **Model Definition**: User model in `models/User.ts` with TypeScript interfaces for type safety

### Key Files
- `src/app.ts` - Express app configuration (middleware, routes, error handlers)
- `src/server.ts` - Server startup and database connection test
- `src/middlewares/auth.ts` - JWT authentication middleware (adds `req.user`)
- `src/utils/response.ts` - Standardized API response helpers (`sendSuccess`, `sendError`)
- `src/controllers/authController.ts` - Authentication logic with validation rules

## API Endpoints

### Public Routes
- `POST /api/auth/register` - Create new admin user (requires: name, email, password)
- `POST /api/auth/login` - Authenticate user (requires: email, password)

### Protected Routes (require `Authorization: Bearer <token>`)
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout (client-side token removal)

### Utility Routes
- `GET /health` - Health check endpoint

## Environment Variables

Required in `.env`:
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode (development/production)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection
- `JWT_SECRET` - Secret key for JWT signing (must be changed in production)
- `JWT_EXPIRES_IN` - Token expiration (default: 15m)

## TypeScript Configuration

- Target: ES2022 with ES modules
- Strict mode enabled (all strict checks on)
- Output: `dist/` directory
- Source maps and declarations generated
- Unused locals/parameters flagged as errors

## Extension Notes

The codebase is designed for Phase 2+ additions:
- Car management endpoints
- Alloy management endpoints
- Car-Alloy mapping
- RBAC (role-based access control)
- Refresh tokens
- Password reset
- Email verification

When adding new features, follow existing patterns:
- Use Sequelize models for database entities
- Create controllers with express-validator rules
- Use standardized response helpers
- Protect routes with authenticate middleware
- Extend Express Request interface for custom properties
