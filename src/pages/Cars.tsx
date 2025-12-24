import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Loader } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCars, useUpdateCar, useDeleteCar } from "@/hooks/useCars";
import type { Car } from "@/lib/api";

export default function Cars() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Debounce search query with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset page to 1 when search query changes
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Only include search in API call if it's not empty
  const searchParams = debouncedSearchQuery.trim() 
    ? { page, limit, search: debouncedSearchQuery.trim() }
    : { page, limit };
  
  const { data, isLoading, error } = useCars(searchParams);
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();

  const handleToggleActive = (carId: number, currentStatus: boolean | undefined) => {
    updateCar.mutate({
      id: carId,
      data: { isActive: !currentStatus },
    });
  };

  const handleDelete = (carId: number) => {
    if (confirm("Are you sure you want to delete this car?")) {
      deleteCar.mutate(carId);
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading cars: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Car Master</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage car makes, models, colors, and wheel coordinates
            </p>
          </div>
          <Button onClick={() => navigate("/cars/new")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Car Make
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Make</TableHead>
                      <TableHead className="whitespace-nowrap">Model</TableHead>
                      <TableHead className="whitespace-nowrap">Color</TableHead>
                      <TableHead className="whitespace-nowrap">Active</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell className="font-medium whitespace-nowrap">{car.model?.make?.name || "N/A"}</TableCell>
                        <TableCell className="whitespace-nowrap">{car.model?.name || "N/A"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary">
                            {car.color?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={car.isActive || false}
                            onCheckedChange={() => handleToggleActive(car.id, car.isActive)}
                            disabled={updateCar.isPending}
                          />
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/cars/${car.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(car.id)}
                              disabled={deleteCar.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-4 sm:gap-0">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing page {data.pagination.currentPage || page} of {data.pagination.totalPages} ({data.pagination.totalItems} total items)
                </p>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="flex-1 sm:flex-none"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="flex-1 sm:flex-none"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No cars found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}