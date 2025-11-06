import { useState } from "react";
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
import type { CarVariant, CarModel } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function CarVariants() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", modelId: "" });
  const [filterMakeId, setFilterMakeId] = useState<string>("");
  const [filterModelId, setFilterModelId] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch makes for dropdown
  const { data: makesData } = useQuery({
    queryKey: ["carMakesForSelect"],
    queryFn: () => carsService.getMakes({ limit: 1000 }),
  });

  // Fetch models filtered by selected make
  const { data: modelsData } = useQuery({
    queryKey: ["carModelsForSelect", filterMakeId],
    queryFn: () => carsService.getModels({ limit: 1000, makeId: filterMakeId ? parseInt(filterMakeId) : undefined }),
    enabled: !filterMakeId || parseInt(filterMakeId) > 0,
  });

  // Fetch variants filtered by selected model
  const { data, isLoading, error } = useQuery({
    queryKey: ["carVariants", page, filterModelId],
    queryFn: () => carsService.getVariants({ page, limit, modelId: filterModelId ? parseInt(filterModelId) : undefined }),
    enabled: !filterModelId || parseInt(filterModelId) > 0,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newVariant: { name: string; modelId: number }) =>
      carsService.createVariant(newVariant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carVariants"] });
      setFormData({ name: "", modelId: "" });
      setIsOpen(false);
      toast({ title: "Car Variant created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating car variant",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      modelId: parseInt(formData.modelId),
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", modelId: "" });
    }
    setIsOpen(open);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading car variants: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight">Car Variants</h1>
            <p className="text-muted-foreground mt-1">
              Manage car variants and trim levels
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Car Variant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Car Variant</DialogTitle>
                <DialogDescription>
                  Create a new car variant linked to a model
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Variant Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Luxury, Sport"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="modelId">Car Model</Label>
                  <Select
                    value={formData.modelId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, modelId: value })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelsData?.items?.map((model: CarModel) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.make?.name} - {model.name}
                        </SelectItem>
                      ))}
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
              <Label htmlFor="filterMake" className="text-sm">Filter by Make</Label>
              <Select value={filterMakeId} onValueChange={(value) => {
                setFilterMakeId(value);
                setFilterModelId("");
              }}>
                <SelectTrigger id="filterMake">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Makes</SelectItem>
                  {makesData?.items?.map((make: any) => (
                    <SelectItem key={make.id} value={make.id.toString()}>
                      {make.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 max-w-xs">
              <Label htmlFor="filterModel" className="text-sm">Filter by Model</Label>
              <Select value={filterModelId} onValueChange={setFilterModelId} disabled={!filterMakeId}>
                <SelectTrigger id="filterModel">
                  <SelectValue placeholder={filterMakeId ? "All Models" : "Select make first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Models</SelectItem>
                  {modelsData?.items?.map((model: any) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead>Variant Name</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">
                        {variant.name}
                      </TableCell>
                      <TableCell>{variant.model?.name || "N/A"}</TableCell>
                      <TableCell>
                        {variant.model?.make?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
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
                  Showing page {paginationData.currentPage} of{" "}
                  {paginationData.totalPages} ({paginationData.totalItems} total
                  items)
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
              <p className="text-muted-foreground">No car variants found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
