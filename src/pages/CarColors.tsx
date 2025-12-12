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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { carsService } from "@/lib/api/services/cars";
import type { CarColor } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function CarColors() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", colorCode: "" });
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch colors
  const { data, isLoading, error } = useQuery({
    queryKey: ["carColors", page],
    queryFn: () => carsService.getColors({ page, limit }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newColor: { name: string; colorCode?: string }) =>
      carsService.createColor(newColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carColors"] });
      setFormData({ name: "", colorCode: "" });
      setIsOpen(false);
      toast({ title: "Car Color created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating car color",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: "", colorCode: "" });
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
                <DialogTitle>Add Car Color</DialogTitle>
                <DialogDescription>
                  Create a new car color with optional hex code
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
                    {/* this should be a color swatch not the input text */}
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
                    {/* {formData.colorCode && (
                      <div
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: formData.colorCode }}
                      />
                    )} */}
                  </div>
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
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
              <p className="text-muted-foreground">No car colors found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
