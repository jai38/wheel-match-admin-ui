# API Routes Documentation

## Base URLs

- **Development**: `http://localhost:4000`
- **Version 1**: `/api/v1`
- **Legacy (backward compatibility)**: `/api`

## Authentication

All admin endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-token-here>
```

---

## Public Routes

### Authentication
Base: `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login (returns JWT token) | ❌ |
| POST | `/logout` | User logout | ✅ |
| GET | `/profile` | Get current user profile | ✅ |

---

## Admin Routes (Protected)

All routes below support both versioned and legacy paths:
- Versioned: `/api/v1/admin/...`
- Legacy: `/api/admin/...`

### Car Master Data
Base: `/api/v1/admin/car` or `/api/admin/car`

#### Makes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/makes` | Create new car make |
| GET | `/makes` | List all makes (with pagination) |

**Query Parameters** (GET):
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search by name

#### Models
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/models` | Create new car model |
| GET | `/models` | List all models (with pagination) |

**Query Parameters** (GET):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name
- `makeId` - Filter by make ID

#### Colors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/colors` | Create new color |
| GET | `/colors` | List all colors (with pagination) |

**Query Parameters** (GET):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name or hex code

#### Variants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/variants` | Create new variant |
| GET | `/variants` | List all variants (with pagination) |

**Query Parameters** (GET):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name
- `modelId` - Filter by model ID

---

### Car Entity (Full)
Base: `/api/v1/admin/cars` or `/api/admin/cars`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new car |
| GET | `/` | List all cars (with pagination & filters) |
| GET | `/:id` | Get single car by ID |
| PUT | `/:id` | Update car by ID |
| DELETE | `/:id` | Delete car by ID |

**Query Parameters** (GET list):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name
- `makeId` - Filter by make
- `modelId` - Filter by model
- `colorId` - Filter by color
- `variantId` - Filter by variant

**Response includes**: Full nested data (make, model, color, variant)

---

### Alloy Master Data
Base: `/api/v1/admin/alloy` or `/api/admin/alloy`

#### Designs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/designs` | Create new alloy design |
| GET | `/designs` | List all designs (with pagination) |

#### PCDs (Pitch Circle Diameter)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pcds` | Create new PCD |
| GET | `/pcds` | List all PCDs (with pagination) |

#### Finishes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/finishes` | Create new finish |
| GET | `/finishes` | List all finishes (with pagination) |

#### Sizes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sizes` | Create new size |
| GET | `/sizes` | List all sizes (with pagination) |

**Size Model**:
- `diameter` (float) - 10-30 inches
- `width` (float) - 5-20 inches
- `offset` (int) - -50 to 100
- `specs` (string) - Display format (e.g., "17x8 ET35")

---

### Alloy Entity (Full)
Base: `/api/v1/admin/alloys` or `/api/admin/alloys`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new alloy product |
| GET | `/` | List all alloys (with pagination & filters) |
| GET | `/:id` | Get single alloy by ID |
| PUT | `/:id` | Update alloy by ID |

**Query Parameters** (GET list):
- `page` - Page number
- `limit` - Items per page
- `search` - Search by alloy name
- `designId` - Filter by design
- `pcdId` - Filter by PCD
- `finishId` - Filter by finish
- `sizeId` - Filter by size
- `diameter` - Filter by diameter value
- `isActive` - Filter by active status (true/false)

**Special Features**:
- **Auto-generated name**: `{specs} {design} {pcd} {finish}`
  - Example: "17x8 ET35 Mesh 5x112 Gloss Black"
- **Unique combination**: Cannot create duplicate combinations of design/pcd/finish/size
- **Multiple images**: Array of image URLs
- **Response includes**: Full nested data (design, pcd, finish, size)

---

## Common Response Formats

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Paginated List Response
```json
{
  "status": "success",
  "message": "Resources retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Example Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword",
  "name": "Admin User"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

### Create Car Make
```bash
POST /api/v1/admin/car/makes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Toyota",
  "slug": "toyota"
}
```

### Create Alloy Product
```bash
POST /api/v1/admin/alloys
Authorization: Bearer <token>
Content-Type: application/json

{
  "designId": 1,
  "pcdId": 2,
  "finishId": 3,
  "sizeId": 4,
  "alloyImages": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "isActive": true
}
```

### List Cars with Filters
```bash
GET /api/v1/admin/cars?page=1&limit=10&makeId=5&colorId=3
Authorization: Bearer <token>
```

---

## API Structure Benefits

### Organized Hierarchy
```
/api
  /auth (public authentication)
  /v1
    /admin
      /car (master data: makes, models, colors, variants)
      /cars (full car entities)
      /alloy (master data: designs, pcds, finishes, sizes)
      /alloys (full alloy products)
```

### Benefits:
1. **Clear separation** between master data and full entities
2. **Version support** for future API changes
3. **Backward compatibility** with legacy endpoints
4. **Consistent patterns** across all resources
5. **Easy to understand** and maintain

---

## Notes

- All dates are in ISO 8601 format
- All IDs are positive integers
- Search is case-insensitive and uses LIKE pattern matching
- Pagination defaults: page=1, limit=10
- Maximum page limit: 100 items
- Rate limiting: 100 requests per 15 minutes (production only)
- Token expiration: 15 minutes (configurable)

---

## Testing

Import the `postman-collection.json` file into Postman for pre-configured requests with examples.

Set environment variables:
- `base_url`: http://localhost:4000
- `token`: (obtained after login)
