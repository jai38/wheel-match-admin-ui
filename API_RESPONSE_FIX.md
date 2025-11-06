# API Response Structure Fix

## Problem
The backend API was returning data in a different structure than expected:

```json
// Backend returns:
{
  "data": {
    "cars": [...],  // NOT "items"
    "pagination": {...}
  }
}

// Frontend expected:
{
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

## Solution
Created a `normalizeListResponse` helper function that handles both response formats:

```typescript
export const normalizeListResponse = <T,>(
  data: Record<string, unknown>
): { items: T[]; pagination: PaginationMeta } => {
  const items = (data.items || data.cars || data.alloys || []) as T[];
  return { items, pagination: data.pagination as PaginationMeta };
};
```

## What Changed

1. **Updated `PaginatedResponse` type** (`src/lib/api/types.ts`)
   - Made all data fields optional (`items?`, `cars?`, `alloys?`)
   - Allows handling any response format

2. **Updated `Car` type** (`src/lib/api/types.ts`)
   - Changed to match actual backend structure
   - `carImage` instead of `carImages`
   - Nested variant structure with model and make
   - Works with both GET and POST operations

3. **Updated Cars service** (`src/lib/api/services/cars.ts`)
   - `getCars()` now uses `normalizeListResponse<Car>()`
   - Converts backend response to expected format

4. **Updated Alloys service** (`src/lib/api/services/alloys.ts`)
   - `getAlloys()` now uses `normalizeListResponse<Alloy>()`
   - Converts backend response to expected format

5. **Updated Cars page** (`src/pages/Cars.tsx`)
   - Table now accesses nested data correctly
   - `car.variant?.model?.make?.name` instead of `car.make?.name`
   - `car.variant?.model?.name` instead of `car.model?.name`
   - Works with actual backend structure

## Result
✅ Cars and Alloys lists now display data from the actual backend API
✅ All data structures properly typed
✅ No TypeScript errors
✅ Handles both old and new response formats gracefully

## Testing
- [x] Login page works
- [x] Dashboard displays
- [x] Cars list now shows data
- [x] Alloys list now shows data
- [x] Pagination works
- [x] Search works
- [x] Forms work

The UI should now display all cars from the backend API response correctly!
