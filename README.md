# Wheel Match Admin Backend

A production-ready backend authentication system for the Wheel Match Admin Panel built with Node.js, Express, TypeScript, MySQL, and JWT authentication.

## Features

- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Secure password hashing with bcrypt
- ✅ MySQL database with Sequelize ORM
- ✅ TypeScript for type safety
- ✅ Docker containerization
- ✅ Input validation
- ✅ Error handling middleware
- ✅ RESTful API design

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0
- **ORM:** Sequelize
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Containerization:** Docker + Docker Compose

## Project Structure

```
wheel-match-admin-backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Database connection
│   │   ├── migrate.ts        # Migration script
│   │   └── seed.ts           # Seeding script
│   ├── controllers/
│   │   └── authController.ts # Auth logic
│   ├── middlewares/
│   │   ├── auth.ts           # JWT verification
│   │   └── errorHandler.ts  # Error handling
│   ├── models/
│   │   └── User.ts           # User model
│   ├── routes/
│   │   └── authRoutes.ts     # Auth endpoints
│   ├── utils/
│   │   ├── jwt.ts            # JWT utilities
│   │   ├── password.ts       # Password hashing
│   │   └── response.ts       # Response helpers
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .env.example              # Environment variables template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd wheel-match-admin-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wheelmatch_admin

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
```

4. **Set up the database**

Create the database manually or let Docker handle it (see Docker section below).

```sql
CREATE DATABASE wheelmatch_admin;
```

5. **Build TypeScript**

```bash
npm run build
```

6. **Run migrations**

```bash
npm run db:migrate
```

7. **Seed the database**

```bash
npm run db:seed
```

This creates a default admin user:
- **Email:** admin@wheelmatch.local
- **Password:** Admin123

8. **Start the development server**

```bash
npm run dev
```

The server will start at `http://localhost:4000`

## Docker Setup

### Using Docker Compose (Recommended)

1. **Start all services** (MySQL + Node.js app)

```bash
docker-compose up --build
```

This will:
- Start MySQL container
- Build and start the Node.js app
- Run migrations automatically
- Seed the database with default admin user
- Expose the API on `http://localhost:4000`

2. **Stop services**

```bash
docker-compose down
```

3. **Clean up (remove volumes)**

```bash
docker-compose down -v
```

## API Endpoints

### Base URL
```
http://localhost:4000/api
```

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Wheel Match Admin Backend is running"
}
```

### Authentication Endpoints

#### 1. Register New Admin User

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "isActive": true
    }
  }
}
```

#### 2. Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@wheelmatch.local",
  "password": "Admin123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@wheelmatch.local",
      "role": "admin",
      "isActive": true
    }
  }
}
```

#### 3. Get User Profile (Protected)

```
GET /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@wheelmatch.local",
    "role": "admin",
    "isActive": true,
    "createdAt": "2024-10-24T17:00:00.000Z",
    "updatedAt": "2024-10-24T17:00:00.000Z"
  }
}
```

#### 4. Logout (Protected)

```
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wheelmatch.local",
    "password": "Admin123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Users Table

| Column       | Type         | Constraints                    |
|--------------|--------------|--------------------------------|
| id           | INT          | PRIMARY KEY, AUTO_INCREMENT    |
| name         | VARCHAR(255) | NOT NULL                       |
| email        | VARCHAR(255) | UNIQUE, NOT NULL               |
| passwordHash | VARCHAR(255) | NOT NULL                       |
| role         | VARCHAR(50)  | DEFAULT 'admin'                |
| isActive     | BOOLEAN      | DEFAULT true                   |
| createdAt    | DATETIME     | AUTO                           |
| updatedAt    | DATETIME     | AUTO                           |

## NPM Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with default data
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Error Handling

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP status codes:
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **500** - Internal Server Error

## Security Considerations

- ✅ Passwords are hashed using bcrypt with salt rounds
- ✅ JWT tokens have expiration time (default: 15 minutes)
- ✅ Sensitive data not included in JWT payload
- ✅ Input validation on all endpoints
- ✅ SQL injection protection via Sequelize ORM
- ✅ CORS enabled for cross-origin requests

**Production Recommendations:**
- Change `JWT_SECRET` to a strong random value
- Use HTTPS in production
- Implement refresh tokens for longer sessions
- Set up rate limiting
- Add request logging
- Configure proper CORS origins

## Future Enhancements

Phase 2+ features ready to be added:
- Car management endpoints
- Alloy management endpoints
- Car-Alloy mapping endpoints
- Role-based access control (RBAC)
- Refresh token implementation
- Password reset functionality
- Email verification
- User management (admin panel)
- Audit logging

## License

ISC

## Author

Wheel Match Admin Team
