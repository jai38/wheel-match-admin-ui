# API Integration Guide

## Overview

This document describes the API integration layer for the Wheel Match Admin Frontend. The integration is built with **TypeScript**, **Axios**, and **React Query** for optimal performance, type safety, and developer experience.

## Architecture

```
src/
├── lib/
│   └── api/
│       ├── client.ts           # Axios instance with interceptors
│       ├── types.ts            # TypeScript type definitions
│       ├── index.ts            # Central exports
│       └── services/
│           ├── auth.ts         # Authentication API
│           ├── cars.ts         # Cars management API
│           └── alloys.ts       # Alloys management API
└── hooks/
    ├── useAuth.ts              # Auth React Query hooks
    ├── useCars.ts              # Cars React Query hooks
    └── useAlloys.ts            # Alloys React Query hooks
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:4001
VITE_API_VERSION=v1
```

## Features

### ✅ Core Features

1. **Type-Safe API Client**

   - Full TypeScript support
   - Interfaces matching backend schema
   - Auto-completion in IDE

2. **Automatic Token Management**

   - JWT token stored in localStorage
   - Auto-attached to all requests
   - Auto-redirect on 401 (unauthorized)

3. **Global Error Handling**

   - Axios interceptors for consistent error handling
   - User-friendly error messages
   - Automatic toast notifications

4. **React Query Integration**

   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Automatic cache invalidation

5. **Request/Response Interceptors**
   - Add auth token automatically
   - Handle expired sessions
   - Log errors for debugging

## Usage Examples

### Authentication

```typescript
import { useLogin, useLogout, useProfile } from "@/hooks/useAuth";

function LoginPage() {
  const login = useLogin();

  const handleSubmit = (credentials) => {
    login.mutate(credentials);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={login.isPending}>
        {login.isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Fetching Data

```typescript
import { useCars } from "@/hooks/useCars";

function CarsPage() {
  const { data, isLoading, error } = useCars({ page: 1, limit: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.items.map((car) => (
        <div key={car.id}>
          {car.make?.name} {car.model?.name}
        </div>
      ))}
    </div>
  );
}
```

### Creating Data

```typescript
import { useCreateCar } from "@/hooks/useCars";

function CreateCarForm() {
  const createCar = useCreateCar();

  const handleSubmit = (formData) => {
    createCar.mutate(formData, {
      onSuccess: () => {
        // Navigate or reset form
      },
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Updating Data

```typescript
import { useUpdateCar } from "@/hooks/useCars";

function EditCarForm({ carId }) {
  const updateCar = useUpdateCar();

  const handleSubmit = (formData) => {
    updateCar.mutate({ id: carId, data: formData });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Deleting Data

```typescript
import { useDeleteCar } from "@/hooks/useCars";

function CarActions({ carId }) {
  const deleteCar = useDeleteCar();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteCar.mutate(carId);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## API Services

### Auth Service

```typescript
import { authService } from "@/lib/api";

// Login
const { token, user } = await authService.login({ email, password });

// Get profile
const user = await authService.getProfile();

// Logout
await authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();
```

### Cars Service

```typescript
import { carsService } from "@/lib/api";

// Get all cars with pagination
const { items, pagination } = await carsService.getCars({ page: 1, limit: 10 });

// Get single car
const car = await carsService.getCar(id);

// Create car
const newCar = await carsService.createCar(carData);

// Update car
const updatedCar = await carsService.updateCar(id, updateData);

// Delete car
await carsService.deleteCar(id);

// Get master data
const makes = await carsService.getMakes();
const models = await carsService.getModels({ makeId: 1 });
const colors = await carsService.getColors();
const variants = await carsService.getVariants({ modelId: 1 });
```

### Alloys Service

```typescript
import { alloysService } from "@/lib/api";

// Get all alloys with filters
const { items, pagination } = await alloysService.getAlloys({
  page: 1,
  limit: 10,
  designId: 1,
  isActive: true,
});

// Get single alloy
const alloy = await alloysService.getAlloy(id);

// Create alloy
const newAlloy = await alloysService.createAlloy(alloyData);

// Update alloy
const updatedAlloy = await alloysService.updateAlloy(id, updateData);

// Get master data
const designs = await alloysService.getDesigns();
const pcds = await alloysService.getPCDs();
const finishes = await alloysService.getFinishes();
const sizes = await alloysService.getSizes();
```

## React Query Hooks

### Available Hooks

#### Authentication

- `useLogin()` - Login user
- `useRegister()` - Register user
- `useLogout()` - Logout user
- `useProfile()` - Get current user profile
- `useIsAuthenticated()` - Check auth status

#### Cars

- `useCars(params)` - Fetch cars list
- `useCar(id)` - Fetch single car
- `useCreateCar()` - Create car
- `useUpdateCar()` - Update car
- `useDeleteCar()` - Delete car
- `useCarMakes(params)` - Fetch car makes
- `useCarModels(params)` - Fetch car models
- `useCarColors(params)` - Fetch car colors
- `useCarVariants(params)` - Fetch car variants

#### Alloys

- `useAlloys(params)` - Fetch alloys list
- `useAlloy(id)` - Fetch single alloy
- `useCreateAlloy()` - Create alloy
- `useUpdateAlloy()` - Update alloy
- `useDeleteAlloy()` - Delete alloy
- `useAlloyDesigns(params)` - Fetch alloy designs
- `useAlloyPCDs(params)` - Fetch PCDs
- `useAlloyFinishes(params)` - Fetch finishes
- `useAlloySizes(params)` - Fetch sizes

## Error Handling

All API errors are handled consistently:

```typescript
// Errors have this structure
interface ApiError {
  status: "error";
  message: string;
  statusCode: number;
}

// Usage in hooks
const { error } = useCars();
if (error) {
  console.log(error.message); // User-friendly message
  console.log(error.statusCode); // HTTP status code
}
```

### Automatic Error Actions

- **401 Unauthorized**: Auto-logout and redirect to login
- **403 Forbidden**: Console error, toast notification
- **404 Not Found**: Console error, toast notification
- **409 Conflict**: Console error, toast notification
- **500 Server Error**: Console error, toast notification
- **Network Error**: Toast notification with retry suggestion

## Caching Strategy

React Query caching configuration:

```typescript
// Query stale times
- Master data (makes, models, etc.): 5 minutes
- List queries (cars, alloys): 2 minutes
- Detail queries (single car/alloy): 5 minutes
- User profile: 5 minutes
```

Cache is automatically invalidated after mutations:

- Creating/updating/deleting cars invalidates `["cars"]` cache
- Creating master data invalidates respective caches

## Type Safety

All API responses are typed:

```typescript
// Paginated response
interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// API response wrapper
interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}
```

## Best Practices

1. **Always use hooks in components**

   ```typescript
   // ✅ Good
   const { data } = useCars();

   // ❌ Bad - don't call service directly in components
   const data = await carsService.getCars();
   ```

2. **Handle loading and error states**

   ```typescript
   const { data, isLoading, error } = useCars();

   if (isLoading) return <Spinner />;
   if (error) return <ErrorMessage />;
   return <CarList data={data} />;
   ```

3. **Use optimistic updates for better UX**

   ```typescript
   const updateCar = useUpdateCar();
   updateCar.mutate(data, {
     onSuccess: () => {
       // Update succeeded
     },
   });
   ```

4. **Leverage cache**
   ```typescript
   // Data is automatically cached and reused
   const { data: cars1 } = useCars({ page: 1 });
   const { data: cars2 } = useCars({ page: 1 }); // Uses cache
   ```

## Testing the Integration

### Prerequisites

1. Backend running at `http://localhost:4001`
2. Database seeded with test data

### Quick Test

```typescript
// In browser console
import { authService } from "@/lib/api";

// Test login
const response = await authService.login({
  email: "admin@wheelmatch.local",
  password: "Admin123",
});
console.log(response);
```

## Troubleshooting

### CORS Errors

Ensure backend `.env` has:

```env
ALLOWED_ORIGINS=http://localhost:5173
```

### 401 Errors

- Check token in localStorage: `localStorage.getItem("auth_token")`
- Verify backend is running
- Check token hasn't expired (15 min default)

### Network Errors

- Verify `VITE_API_BASE_URL` in `.env`
- Ensure backend is accessible
- Check browser network tab

## Next Steps

- [ ] Connect Login page to use `useLogin` hook
- [ ] Update Cars page to use `useCars` hook
- [ ] Update Alloys page to use `useAlloys` hook
- [ ] Implement protected routes
- [ ] Add form validation with backend errors
- [ ] Implement image upload functionality

---

**Note**: This integration layer is production-ready with proper error handling, caching, and type safety. All hooks follow React Query best practices.
