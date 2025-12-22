# AI Readme - Wheel Match Admin UI

## Project Overview
This is the administrative dashboard for managing the Wheel Match data. It allows admins to manage cars, alloys, and their respective master data (brands, models, designs, etc.).

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn-ui
- **State Management:** React Query (@tanstack/react-query), React Context (Auth)
- **Routing:** React Router DOM (v6)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Key Directories
- `src/components`: UI components.
    - `auth`: Authentication components (`ProtectedRoute`).
- `src/pages`: Application pages (Dashboard, Forms, Lists).
- `src/contexts`: React Context providers (`AuthContext`).
- `src/lib`: Utilities and API interaction.

## Routing (Protected)
All routes except `/login` are protected.
- `/dashboard`: Main dashboard.
- **Cars:**
    - `/cars`: List of cars.
    - `/cars/new`, `/cars/:id`: Create/Edit car.
    - Master Data: `/car-makes`, `/car-models`, `/car-colors`.
- **Alloys:**
    - `/alloys`: List of alloys.
    - `/alloys/new`, `/alloys/:id`: Create/Edit alloy.
    - `/alloys/:id/images`: Manage alloy images.
    - Master Data: `/alloy-designs`, `/alloy-pcds`, `/alloy-finishes`, `/alloy-sizes`.

## Development
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
