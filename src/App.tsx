import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cars from "./pages/Cars";
import CarForm from "./pages/CarForm";
import Alloys from "./pages/Alloys";
import AlloyForm from "./pages/AlloyForm";
import CarMakes from "./pages/CarMakes";
import CarModels from "./pages/CarModels";
import CarColors from "./pages/CarColors";
import CarVariants from "./pages/CarVariants";
import AlloyDesigns from "./pages/AlloyDesigns";
import AlloyPCDs from "./pages/AlloyPCDs";
import AlloyFinishes from "./pages/AlloyFinishes";
import AlloySizes from "./pages/AlloySizes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
          <Route
            path="/car-variants"
            element={
              <ProtectedRoute>
                <CarVariants />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
