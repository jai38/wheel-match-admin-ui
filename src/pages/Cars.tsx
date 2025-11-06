import { useState } from "react";
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
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, error } = useCars({ page, limit, search: searchQuery });
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Car Master</h1>
            <p className="text-muted-foreground mt-1">
              Manage car makes, models, colors, and wheel coordinates
            </p>
          </div>
          <Button onClick={() => navigate("/cars/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Car Make
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.variant?.model?.make?.name || "N/A"}</TableCell>
                      <TableCell>{car.variant?.model?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {car.color?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{car.variant?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={car.isActive || false}
                          onCheckedChange={() => handleToggleActive(car.id, car.isActive)}
                          disabled={updateCar.isPending}
                        />
                      </TableCell>
                      <TableCell className="text-right">
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
              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total items)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
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
