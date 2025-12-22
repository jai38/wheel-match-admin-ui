import { useState } from "react";
import { Plus, Edit, Trash2, Loader } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { alloysService } from "@/lib/api/services/alloys";
import {
  useCreateAlloyFinish,
  useUpdateAlloyFinish,
  useDeleteAlloyFinish
} from "@/hooks/useAlloys";
import type { AlloyFinish } from "@/lib/api";

export default function AlloyFinishes() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingFinish, setEditingFinish] = useState<AlloyFinish | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch finishes
  const { data, isLoading, error } = useQuery({
    queryKey: ["alloyFinishes", page],
    queryFn: () => alloysService.getFinishes({ page, limit }),
  });

  const createMutation = useCreateAlloyFinish();
  const updateMutation = useUpdateAlloyFinish();
  const deleteMutation = useDeleteAlloyFinish();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFinish) {
      updateMutation.mutate(
        { id: editingFinish.id, data: formData },
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

  const handleEdit = (finish: AlloyFinish) => {
    setEditingFinish(finish);
    setFormData({ name: finish.name, description: finish.description || "" });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this alloy finish?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", description: "" });
      setEditingFinish(null);
    }
    setIsOpen(open);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading alloy finishes: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight">
              Alloy Finishes
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage alloy wheel finish types
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Alloy Finish
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFinish ? "Edit Alloy Finish" : "Add Alloy Finish"}</DialogTitle>
                <DialogDescription>
                  {editingFinish ? "Update existing alloy wheel finish type" : "Create a new alloy wheel finish type"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Finish Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Matte Black"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingFinish ? "Updating..." : "Creating...") : (editingFinish ? "Update" : "Create")}
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
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((finish) => (
                    <TableRow key={finish.id}>
                      <TableCell className="font-medium">
                        {finish.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {finish.description || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(finish)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(finish.id)}
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
              <p className="text-muted-foreground">No alloy finishes found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
