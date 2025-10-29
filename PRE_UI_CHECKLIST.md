# ✅ Pre-UI Integration Checklist

Before connecting your UI to this backend, verify the following:

## 🔧 Environment Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Set proper values in `.env`:
  - [ ] `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - [ ] `JWT_SECRET` (use strong random value)
  - [ ] `JWT_EXPIRES_IN` (e.g., "15m" or "1h")
  - [ ] `PORT` (default: 4000)
  - [ ] `NODE_ENV` (development or production)
  - [ ] `ALLOWED_ORIGINS` (your frontend URL, e.g., "http://localhost:3000")

## 🗃️ Database Setup

- [ ] MySQL/MariaDB is installed and running
- [ ] Database exists (or will be created by migration)
- [ ] Run migrations: `npm run db:migrate`
- [ ] Verify tables are created
- [ ] (Optional) Seed initial data: `npm run db:seed`

## 🔐 Security Configuration

- [ ] JWT_SECRET is changed from default value
- [ ] ALLOWED_ORIGINS is set to your frontend URL(s)
- [ ] Rate limiting is enabled (production mode)
- [ ] CORS is configured properly

## 🚀 Server Health Check

- [ ] Run `npm run typecheck` - should pass without errors
- [ ] Run `npm run build` - should compile successfully
- [ ] Start server: `npm run dev`
- [ ] Server starts without errors
- [ ] Visit `http://localhost:4000/health` - should return JSON
- [ ] Health check returns:
  ```json
  {
    "status": "ok",
    "message": "Wheel Match Admin Backend is running",
    "environment": "development",
    "timestamp": "..."
  }
  ```

## 📡 API Endpoints Verification

Test these endpoints are accessible:

### Auth Endpoints
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login
- [ ] Both `/api/auth/...` and `/api/v1/auth/...` work

### Admin Endpoints (require authentication)
All these should work with both `/api/admin/...` and `/api/v1/admin/...`:

**Car Master Data:**
- [ ] `GET/POST /api/admin/makes` - Car makes
- [ ] `GET/POST /api/admin/models` - Car models
- [ ] `GET/POST /api/admin/colors` - Colors
- [ ] `GET/POST /api/admin/variants` - Variants

**Alloy Master Data:**
- [ ] `GET/POST /api/admin/alloy/designs` - Alloy designs
- [ ] `GET/POST /api/admin/alloy/pcds` - PCDs
- [ ] `GET/POST /api/admin/alloy/finishes` - Finishes
- [ ] `GET/POST /api/admin/alloy/sizes` - Sizes

**Main Entities:**
- [ ] `GET/POST /api/admin/cars` - Cars (full CRUD)
- [ ] `GET/POST /api/admin/alloys` - Alloys (full CRUD)

## 🔍 Testing with Postman

- [ ] Import `postman-collection.json`
- [ ] Set environment variables in Postman:
  - `base_url`: http://localhost:4000
  - `token`: (obtained after login)
- [ ] Test authentication flow:
  1. Register a user
  2. Login and get token
  3. Use token for subsequent requests
- [ ] Test at least one endpoint from each category

## 🛡️ Security Verification

- [ ] Try accessing admin endpoints without token - should return 401
- [ ] Try invalid token - should return 401
- [ ] Try malicious input - should be sanitized
- [ ] Check rate limiting (make 100+ requests) - should be rate limited
- [ ] Verify CORS - frontend origin should be allowed

## 📊 Code Quality Checks

- [ ] `npm run typecheck` passes ✓
- [ ] `npm run lint` passes (or run `npm run lint:fix`)
- [ ] `npm run format` for consistent formatting
- [ ] All code follows patterns in BEST_PRACTICES.md

## 🎯 Feature Completeness

Verify all required features work:

### Car Management
- [ ] Create car make
- [ ] Create car model (linked to make)
- [ ] Create car color
- [ ] Create car variant
- [ ] Create full car entity
- [ ] List cars with pagination
- [ ] Filter cars by make/model/color
- [ ] Get single car by ID
- [ ] Update car
- [ ] Delete car

### Alloy Management
- [ ] Create alloy design
- [ ] Create alloy PCD
- [ ] Create alloy finish
- [ ] Create alloy size (with diameter/width)
- [ ] Create full alloy product
- [ ] Auto-generated alloy name works
- [ ] List alloys with pagination
- [ ] Filter alloys by size/design/finish
- [ ] Get single alloy by ID
- [ ] Update alloy
- [ ] Prevent duplicate alloy combinations

## 📝 Documentation Review

- [ ] Read `BEST_PRACTICES.md` - understand architecture
- [ ] Read `OPTIMIZATIONS.md` - understand optimizations
- [ ] Read `CLEANUP_SUMMARY.md` - understand changes
- [ ] Review API patterns for consistency

## 🔄 Frontend Integration Guidelines

When integrating with UI:

### Base URL Configuration
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_VERSION = '/api/v1'; // Use versioned API
```

### Authentication
```javascript
// Store token after login
localStorage.setItem('token', response.data.token);

// Add to all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Error Handling
All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Success Responses
All success responses follow this format:
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Pagination
List endpoints support:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `search` (optional search term)

Response includes:
```json
{
  "status": "success",
  "message": "...",
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

## 🚨 Common Issues & Solutions

### Issue: "Missing required environment variables"
**Solution**: Check `.env` file has all required variables

### Issue: "Database connection failed"
**Solution**: Verify MySQL is running and credentials are correct

### Issue: "CORS error in browser"
**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Issue: "401 Unauthorized"
**Solution**: Ensure token is included in Authorization header

### Issue: "Rate limit exceeded"
**Solution**: Wait 15 minutes or disable rate limiting in development

### Issue: "Port already in use"
**Solution**: Change `PORT` in `.env` or kill process using port 4000

## ✅ Final Verification

Run this complete test:

1. Start fresh:
   ```bash
   npm run clean
   npm run build
   ```

2. Environment check:
   ```bash
   npm run typecheck
   npm run lint
   ```

3. Start server:
   ```bash
   npm run dev
   ```

4. Test endpoints:
   - Health check: `curl http://localhost:4000/health`
   - Register: `POST /api/auth/register`
   - Login: `POST /api/auth/login`
   - Protected endpoint with token

5. Check logs for any warnings or errors

## 🎉 Ready for UI Integration!

If all items above are checked, your backend is ready to connect with the frontend!

### Next Steps:
1. Share the following with frontend team:
   - API base URL
   - Postman collection
   - Authentication flow
   - API documentation (BEST_PRACTICES.md)

2. Set up monitoring:
   - Server uptime
   - Error logs
   - Database connection
   - API response times

3. Development workflow:
   - Backend: `npm run dev`
   - Frontend: (your frontend start command)
   - Test integration
   - Iterate!

---

**Good luck with your frontend integration!** 🚀

If you encounter issues, refer to:
- BEST_PRACTICES.md for patterns
- OPTIMIZATIONS.md for feature details
- Inline code comments for specifics
