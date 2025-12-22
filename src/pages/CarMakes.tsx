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
import { 
  carsService, 
} from "@/lib/api/services/cars";
import { 
  useCreateCarMake, 
  useUpdateCarMake, 
  useDeleteCarMake 
} from "@/hooks/useCars";
import type { CarMake } from "@/lib/api";

export default function CarMakes() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMake, setEditingMake] = useState<CarMake | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch makes
  const { data, isLoading, error } = useQuery({
    queryKey: ["carMakes", page],
    queryFn: () => carsService.getMakes({ page, limit }),
  });

  const createMutation = useCreateCarMake();
  const updateMutation = useUpdateCarMake();
  const deleteMutation = useDeleteCarMake();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMake) {
      updateMutation.mutate(
        { id: editingMake.id, data: { name: formData.name } },
        {
          onSuccess: () => {
            handleOpenChange(false);
          }
        }
      );
    } else {
      createMutation.mutate(
        { name: formData.name, slug: formData.slug },
        {
          onSuccess: () => {
            handleOpenChange(false);
          }
        }
      );
    }
  };

  const handleEdit = (make: CarMake) => {
    setEditingMake(make);
    setFormData({ name: make.name, slug: make.slug });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this make?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", slug: "" });
      setEditingMake(null);
    }
    setIsOpen(open);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading car makes: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight">Car Makes</h1>
            <p className="text-muted-foreground mt-1">
              Manage car manufacturers and brands
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Car Make
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMake ? "Edit Car Make" : "Add Car Make"}</DialogTitle>
                <DialogDescription>
                  {editingMake ? "Update existing car manufacturer" : "Create a new car manufacturer or brand"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Toyota"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g., toyota"
                    value={formData.slug}
                    disabled
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingMake ? "Updating..." : "Creating...") : (editingMake ? "Update" : "Create")}
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
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((make) => (
                    <TableRow key={make.id}>
                      <TableCell className="font-medium">{make.name}</TableCell>
                      <TableCell>{make.slug}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(make)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(make.id)}
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
              <p className="text-muted-foreground">No car makes found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
