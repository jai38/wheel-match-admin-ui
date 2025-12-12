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
import type { AlloyPCD } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function AlloyPCDs() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch PCDs
  const { data, isLoading, error } = useQuery({
    queryKey: ["alloyPCDs", page],
    queryFn: () => alloysService.getPCDs({ page, limit }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newPCD: { name: string }) => alloysService.createPCD(newPCD),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alloyPCDs"] });
      setFormData({ name: "" });
      setIsOpen(false);
      toast({ title: "Alloy PCD created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating alloy PCD",
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
      setFormData({ name: "" });
    }
    setIsOpen(open);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading alloy PCDs: {error.message}
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
            <h1 className="text-3xl font-bold tracking-tight">Alloy PCDs</h1>
            <p className="text-muted-foreground mt-1">
              Manage alloy wheel PCD (Pitch Circle Diameter) specifications
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Alloy PCD
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Alloy PCD</DialogTitle>
                <DialogDescription>
                  Create a new alloy wheel PCD specification (e.g., 5x112)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="value">PCD Value</Label>
                  <Input
                    id="value"
                    placeholder="e.g., 5x112"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
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
                    <TableHead>PCD Value</TableHead>
                    {/* <TableHead className="text-right">Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((pcd) => (
                    <TableRow key={pcd.id}>
                      <TableCell className="font-medium">{pcd.name}</TableCell>
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
              <p className="text-muted-foreground">No alloy PCDs found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
