import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader,
  Car,
  ImageIcon,
  Download,
  Upload,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { useAlloys, useDeleteAlloy, useUpdateAlloy } from "@/hooks/useAlloys";
import { CarListModal } from "@/components/CarListModal";
import { BulkMappingDialog } from "@/components/BulkMappingDialog";
import { alloysService } from "@/lib/api";
import { downloadCSV } from "@/lib/exportUtils";
import type { Alloy } from "@/lib/api";

export default function Alloys() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedAlloyId, setSelectedAlloyId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useAlloys({
    page,
    limit,
    search: searchQuery,
  });
  const deleteAlloy = useDeleteAlloy();
  const updateAlloy = useUpdateAlloy();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await alloysService.getAlloys({ limit: 1000 });
      const alloys = response.items || [];

      const csvData = alloys.map(alloy => ({
        Design: alloy.design?.name || '',
        Size: alloy.size?.specs || '',
        Finish: alloy.finish?.name || '',
        PCD: alloy.pcd?.name || '',
        Name: alloy.alloyName || '',
        Status: alloy.isActive ? 'Active' : 'Inactive',
        Image: alloy.image_url || ''
      }));

      downloadCSV(csvData, 'alloys_export.csv');
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleStatus = (alloy: Alloy, checked: boolean) => {
    updateAlloy.mutate({ id: alloy.id, data: { isActive: checked } });
  };

  const handleDelete = (alloyId: number) => {
    if (confirm("Are you sure you want to delete this alloy?")) {
      deleteAlloy.mutate(alloyId);
    }
  };

  const openModal = (alloyId: number) => {
    setSelectedAlloyId(alloyId);
    setIsModalOpen(true);
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading alloys: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alloy Master</h1>
            <p className="text-muted-foreground mt-1">
              Manage alloy wheels, finishes, and compatible cars
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}>
              {isExporting ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Map
            </Button>
            <Button onClick={() => navigate("/alloys/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Alloy
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alloys..."
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
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Alloy Name</TableHead>
                    <TableHead>Design</TableHead>
                    <TableHead>PCD</TableHead>
                    <TableHead>Finish</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mapped Cars</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((alloy) => (
                    <TableRow key={alloy.id}>
                      <TableCell>
                        {alloy.image_url ? (
                          <div className="h-10 w-10 relative rounded overflow-hidden bg-muted border">
                            <img
                              src={alloy.image_url}
                              alt={alloy.alloyName}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-muted flex items-center justify-center rounded border border-dashed">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {alloy.alloyName}
                      </TableCell>
                      <TableCell>{alloy.design?.name || "N/A"}</TableCell>
                      <TableCell>{alloy.pcd?.name || "N/A"}</TableCell>
                      <TableCell>{alloy.finish?.name || "N/A"}</TableCell>
                      <TableCell>{alloy.size?.specs || "N/A"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={alloy.isActive !== false}
                          onCheckedChange={(checked) =>
                            handleToggleStatus(alloy, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(alloy.id)}>
                          <Car className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/alloys/${alloy.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alloy.id)}
                            disabled={deleteAlloy.isPending}>
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
                  Showing page {data.pagination.page} of{" "}
                  {data.pagination.totalPages} ({data.pagination.total} total
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
                    disabled={page >= data.pagination.totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No alloys found</p>
            </div>
          )}
        </div>
      </div>
      {selectedAlloyId && (
        <CarListModal
          alloyId={selectedAlloyId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
      <BulkMappingDialog 
        open={isBulkDialogOpen} 
        onOpenChange={setIsBulkDialogOpen} 
      />
    </MainLayout>
  );
}
