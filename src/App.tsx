import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader } from "lucide-react";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Cars = lazy(() => import("./pages/Cars"));
const CarForm = lazy(() => import("./pages/CarForm"));
const Alloys = lazy(() => import("./pages/Alloys"));
const AlloyForm = lazy(() => import("./pages/AlloyForm"));
const AlloyImagesForm = lazy(() => import("./pages/AlloyImagesForm"));
const CarMakes = lazy(() => import("./pages/CarMakes"));
const CarModels = lazy(() => import("./pages/CarModels"));
const CarColors = lazy(() => import("./pages/CarColors"));
const AlloyDesigns = lazy(() => import("./pages/AlloyDesigns"));
const AlloyPCDs = lazy(() => import("./pages/AlloyPCDs"));
const AlloyFinishes = lazy(() => import("./pages/AlloyFinishes"));
const AlloySizes = lazy(() => import("./pages/AlloySizes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cars"
                element={
                  <ProtectedRoute>
                    <Cars />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cars/new"
                element={
                  <ProtectedRoute>
                    <CarForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cars/:id"
                element={
                  <ProtectedRoute>
                    <CarForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloys"
                element={
                  <ProtectedRoute>
                    <Alloys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloys/new"
                element={
                  <ProtectedRoute>
                    <AlloyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloys/:id"
                element={
                  <ProtectedRoute>
                    <AlloyForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloys/:id/images"
                element={
                  <ProtectedRoute>
                    <AlloyImagesForm />
                  </ProtectedRoute>
                }
              />
              {/* Car Master Data Routes */}
              <Route
                path="/car-makes"
                element={
                  <ProtectedRoute>
                    <CarMakes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/car-models"
                element={
                  <ProtectedRoute>
                    <CarModels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/car-colors"
                element={
                  <ProtectedRoute>
                    <CarColors />
                  </ProtectedRoute>
                }
              />
              {/* Alloy Master Data Routes */}
              <Route
                path="/alloy-designs"
                element={
                  <ProtectedRoute>
                    <AlloyDesigns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloy-pcds"
                element={
                  <ProtectedRoute>
                    <AlloyPCDs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloy-finishes"
                element={
                  <ProtectedRoute>
                    <AlloyFinishes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alloy-sizes"
                element={
                  <ProtectedRoute>
                    <AlloySizes />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;