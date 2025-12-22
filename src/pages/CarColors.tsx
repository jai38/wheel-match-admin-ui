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
import { useQuery } from "@tanstack/react-query";
import { carsService } from "@/lib/api/services/cars";
import { 
  useCreateCarColor, 
  useUpdateCarColor, 
  useDeleteCarColor 
} from "@/hooks/useCars";
import type { CarColor } from "@/lib/api";

export default function CarColors() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<CarColor | null>(null);
  const [formData, setFormData] = useState({ name: "", colorCode: "" });
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch colors
  const { data, isLoading, error } = useQuery({
    queryKey: ["carColors", page],
    queryFn: () => carsService.getColors({ page, limit }),
  });

  const createMutation = useCreateCarColor();
  const updateMutation = useUpdateCarColor();
  const deleteMutation = useDeleteCarColor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingColor) {
      updateMutation.mutate(
        { id: editingColor.id, data: formData },
        {
          onSuccess: () => {
            handleOpenChange(false);
          }
        }
      );
    } else {
      createMutation.mutate(
        formData,
        {
          onSuccess: () => {
            handleOpenChange(false);
          }
        }
      );
    }
  };

  const handleEdit = (color: CarColor) => {
    setEditingColor(color);
    setFormData({ name: color.name, colorCode: color.colorCode || "" });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this color?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", colorCode: "" });
      setEditingColor(null);
    }
    setIsOpen(open);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading car colors: {error.message}
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Car Colors</h1>
            <p className="text-muted-foreground mt-1">
              Manage available car colors with color codes
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Car Color
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingColor ? "Edit Car Color" : "Add Car Color"}</DialogTitle>
                <DialogDescription>
                  {editingColor ? "Update existing car color" : "Create a new car color with optional hex code"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Color Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Red"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="colorCode">
                    Hex Code (Select from swatch)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorCode"
                      placeholder="e.g., #FF0000"
                      value={formData.colorCode}
                      disabled
                      onChange={(e) =>
                        setFormData({ ...formData, colorCode: e.target.value })
                      }
                    />{" "}
                    <Input
                      type="color"
                      value={formData.colorCode || "#FFFFFF"}
                      onChange={(e) =>
                        setFormData({ ...formData, colorCode: e.target.value })
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                      title="Pick a color"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingColor ? "Updating..." : "Creating...") : (editingColor ? "Update" : "Create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Hex Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell className="font-medium">
                        {color.name}
                      </TableCell>
                      <TableCell>
                        {color.colorCode && (
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color.colorCode }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{color.colorCode || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(color)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(color.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
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
              <p className="text-muted-foreground">No car colors found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
