import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader, Settings, Download, Upload } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/exportUtils";
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
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { carsService } from "@/lib/api/services/cars";
import type { CarModel, CarMake } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";
import { ManageModelSheet } from "@/components/cars/ManageModelSheet";
import {
  useCarModels,
  useCreateCarModel,
  useUpdateCarModel,
  useDeleteCarModel,
} from "@/hooks/useCars";
import { BulkCarImportDialog } from "@/components/BulkCarImportDialog";

const STORAGE_KEY_MAKE = "carMaster_selectedMake";

export default function CarModels() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    makeId: "",
    defaultAlloySize: "",
  });
  const [filterMakeId, setFilterMakeId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await carsService.getCars({ pagination: false });
      const cars = response.items || [];

      // Flatten cars to rows
      const csvData = cars.map(car => ({
        Make: car.model?.make?.name || '',
        Model: car.model?.name || '',
        Color: car.color?.name || '',
        'Color Code': car.color?.colorCode || '',
        Status: car.isActive ? 'Active' : 'Inactive',
        'Is Default': car.isDefault ? 'Yes' : 'No',
        'Image URL': car.carImage || ''
      }));

      downloadCSV(csvData, 'cars_export.csv');
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

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

  const makeIdNum = filterMakeId ? parseInt(filterMakeId) : null;
  const isValidMakeId =
    makeIdNum !== null && !isNaN(makeIdNum) && makeIdNum > 0;

  const { data, isLoading, error } = useCarModels({
    page,
    limit,
    makeId: isValidMakeId && makeIdNum ? makeIdNum : undefined,
  });

  const createMutation = useCreateCarModel();
  const updateMutation = useUpdateCarModel();
  const deleteMutation = useDeleteCarModel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const modelData = {
      name: formData.name,
      makeId: parseInt(formData.makeId),
      defaultAlloySize: formData.defaultAlloySize
        ? parseInt(formData.defaultAlloySize)
        : undefined,
    };

    if (editingModelId) {
      updateMutation.mutate(
        { id: editingModelId, data: modelData },
        {
          onSuccess: () => {
            handleOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(modelData, {
        onSuccess: () => {
          handleOpenChange(false);
        },
      });
    }
  };

  const handleToggleStatus = (model: CarModel, checked: boolean) => {
    updateMutation.mutate({ id: model.id, data: { isActive: checked } });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this model?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (model: CarModel) => {
    setEditingModelId(model.id);
    setFormData({
      name: model.name,
      makeId: model.makeId.toString(),
      defaultAlloySize: model.defaultAlloySize?.toString() || "",
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      if (!editingModelId) {
        const savedMakeId = localStorage.getItem(STORAGE_KEY_MAKE);
        setFormData({
          name: "",
          makeId: savedMakeId || "",
          defaultAlloySize: "",
        });
      }
    } else {
      setFormData({ name: "", makeId: "", defaultAlloySize: "" });
      setEditingModelId(null);
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBulkImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}>
              {isExporting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Cars CSV
            </Button>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Car Model
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingModelId ? "Edit Car Model" : "Add Car Model"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingModelId
                      ? "Update existing car model"
                      : "Create a new car model linked to a make"}
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
                            <SelectItem
                              key={make.id}
                              value={make.id.toString()}>
                              {make.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultAlloySize">
                      Default Alloy Size (inches)
                    </Label>
                    <Input
                      id="defaultAlloySize"
                      type="number"
                      placeholder="e.g., 18"
                      value={formData.defaultAlloySize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultAlloySize: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }>
                    {createMutation.isPending || updateMutation.isPending
                      ? editingModelId
                        ? "Updating..."
                        : "Creating..."
                      : editingModelId
                      ? "Update"
                      : "Create"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
                      <TableHead>Default Alloy Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">
                          {model.name}
                        </TableCell>
                        <TableCell>{model.make?.name || "N/A"}</TableCell>
                        <TableCell>
                          {model.defaultAlloySize
                            ? `${model.defaultAlloySize}"`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={model.isActive !== false}
                            onCheckedChange={(checked) =>
                              handleToggleStatus(model, checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(model)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(model.id)}
                              disabled={deleteMutation.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedModel(model)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Manage
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

        <ManageModelSheet
          model={selectedModel}
          isOpen={!!selectedModel}
          onClose={() => setSelectedModel(null)}
        />

        <BulkCarImportDialog 
          open={isBulkImportOpen} 
          onOpenChange={setIsBulkImportOpen} 
        />
      </div>
    </MainLayout>
  );
}
