import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { carsService } from "@/lib/api/services/cars";
import type { CarModel, CarMake } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY_MAKE = "carMaster_selectedMake";

export default function CarModels() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", makeId: "" });
  const [filterMakeId, setFilterMakeId] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load saved makeId from localStorage on mount
  useEffect(() => {
    const savedMakeId = localStorage.getItem(STORAGE_KEY_MAKE);
    if (savedMakeId) {
      setFilterMakeId(savedMakeId);
    }
  }, []);

  // Save makeId to localStorage when filter changes
  useEffect(() => {
    if (filterMakeId) {
      localStorage.setItem(STORAGE_KEY_MAKE, filterMakeId);
    }
  }, [filterMakeId]);

  // Fetch makes for dropdown
  const {
    data: makesData,
    isLoading: makesLoading,
    error: makesError,
  } = useQuery({
    queryKey: ["carMakesForSelect"],
    queryFn: () => carsService.getMakes({ limit: 100 }),
  });

  const makes = makesData?.items || [];

  // Fetch models filtered by selected make
  const makeIdNum = filterMakeId ? parseInt(filterMakeId) : null;
  const isValidMakeId =
    makeIdNum !== null && !isNaN(makeIdNum) && makeIdNum > 0;
  const { data, isLoading, error } = useQuery({
    queryKey: ["carModels", page, filterMakeId],
    queryFn: () => {
      const params: { page: number; limit: number; makeId?: number } = {
        page,
        limit,
      };
      if (isValidMakeId && makeIdNum) {
        params.makeId = makeIdNum;
      }
      return carsService.getModels(params);
    },
    enabled: isValidMakeId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newModel: { name: string; makeId: number }) =>
      carsService.createModel(newModel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carModels"] });
      setFormData({ name: "", makeId: "" });
      setIsOpen(false);
      toast({ title: "Car Model created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating car model",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      makeId: parseInt(formData.makeId),
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Pre-fill form with saved makeId when opening dialog
      const savedMakeId = localStorage.getItem(STORAGE_KEY_MAKE);
      setFormData({ name: "", makeId: savedMakeId || "" });
    } else {
      setFormData({ name: "", makeId: "" });
    }
    setIsOpen(open);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading car models: {error.message}
          </p>
        </div>
      </MainLayout>
    );
  }

  const paginationData = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: limit,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Car Models</h1>
            <p className="text-muted-foreground mt-1">
              Manage car models and their makes
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Car Model
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Car Model</DialogTitle>
                <DialogDescription>
                  Create a new car model linked to a make
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Model Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Camry"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="makeId">Car Make</Label>
                  <Select
                    value={formData.makeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, makeId: value })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a make" />
                    </SelectTrigger>
                    <SelectContent>
                      {makesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : makesError ? (
                        <SelectItem value="error" disabled>
                          Error loading makes
                        </SelectItem>
                      ) : makes.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No makes available
                        </SelectItem>
                      ) : (
                        makes.map((make: CarMake) => (
                          <SelectItem key={make.id} value={make.id.toString()}>
                            {make.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="filterMake" className="text-sm">
                Filter by Make
              </Label>
              <Select
                value={filterMakeId}
                onValueChange={(value) => {
                  setFilterMakeId(value);
                  setPage(1);
                }}>
                <SelectTrigger id="filterMake">
                  <SelectValue placeholder="Select a make" />
                </SelectTrigger>
                <SelectContent>
                  {makesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : makesError ? (
                    <SelectItem value="error" disabled>
                      Error loading makes
                    </SelectItem>
                  ) : makes.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No makes available
                    </SelectItem>
                  ) : (
                    makes.map((make: CarMake) => (
                      <SelectItem key={make.id} value={make.id.toString()}>
                        {make.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        {!filterMakeId ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Please select a make to view models
            </p>
          </div>
        ) : (
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
                      <TableHead>Model Name</TableHead>
                      <TableHead>Make</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">
                          {model.name}
                        </TableCell>
                        <TableCell>{model.make?.name || "N/A"}</TableCell>
                        {/* <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" disabled>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" disabled>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing page {paginationData.currentPage} of{" "}
                    {paginationData.totalPages} ({paginationData.totalItems}{" "}
                    total items)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= paginationData.totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No car models found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
