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
import { alloysService } from "@/lib/api/services/alloys";
import type { AlloySize } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function AlloySizes() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    diameter: "",
    width: "",
    offset: "",
    specs: "",
  });
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch sizes
  const { data, isLoading, error } = useQuery({
    queryKey: ["alloySizes", page],
    queryFn: () => alloysService.getSizes({ page, limit }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newSize: {
      diameter: number;
      width: number;
      offset: number;
      specs: string;
    }) => alloysService.createSize(newSize),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloySizes"] });
      setFormData({ diameter: "", width: "", offset: "", specs: "" });
      setIsOpen(false);
      toast({ title: "Alloy Size created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating alloy size",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      diameter: parseFloat(formData.diameter),
      width: parseFloat(formData.width),
      offset: formData.offset ? parseFloat(formData.offset) : undefined,
      specs: formData.specs,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ diameter: "", width: "", offset: "", specs: "" });
    }
    setIsOpen(open);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading alloy sizes: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight">Alloy Sizes</h1>
            <p className="text-muted-foreground mt-1">
              Manage alloy wheel size specifications
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Alloy Size
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Alloy Size</DialogTitle>
                <DialogDescription>
                  Create a new alloy wheel size specification
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diameter">Diameter (inches)</Label>
                    <Input
                      id="diameter"
                      type="number"
                      step="0.1"
                      min="10"
                      max="30"
                      placeholder="e.g., 17"
                      value={formData.diameter}
                      onChange={(e) =>
                        setFormData({ ...formData, diameter: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (inches)</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="5"
                      max="20"
                      placeholder="e.g., 8"
                      value={formData.width}
                      onChange={(e) =>
                        setFormData({ ...formData, width: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="offset">Offset (ET)</Label>
                    <Input
                      id="offset"
                      type="number"
                      step="1"
                      min="-50"
                      max="100"
                      placeholder="e.g., 35"
                      value={formData.offset}
                      onChange={(e) =>
                        setFormData({ ...formData, offset: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="specs">Specs Display</Label>
                    <Input
                      id="specs"
                      placeholder="e.g., 17x8 ET35"
                      value={formData.specs}
                      onChange={(e) =>
                        setFormData({ ...formData, specs: e.target.value })
                      }
                      required
                    />
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
                    <TableHead>Specs</TableHead>
                    <TableHead>Diameter</TableHead>
                    <TableHead>Width</TableHead>
                    <TableHead>Offset</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((size) => (
                    <TableRow key={size.id}>
                      <TableCell className="font-medium">
                        {size.specs}
                      </TableCell>
                      <TableCell>{size.diameter}"</TableCell>
                      <TableCell>{size.width}"</TableCell>
                      <TableCell>ET{size.offset}</TableCell>
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
              <p className="text-muted-foreground">No alloy sizes found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
