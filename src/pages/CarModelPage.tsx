import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { AddModelModal } from "@/components/AddModelModal";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Car, getMakes, getModelsByMake } from "@/lib/mockData";
import { toast } from "sonner";

export default function CarModelPage() {
  const navigate = useNavigate();
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<Car[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modelsPerPage = 5;

  useEffect(() => {
    setMakes(getMakes());
  }, []);

  const handleMakeChange = (make: string) => {
    setSelectedMake(make);
    setLoading(true);
    setTimeout(() => {
      setModels(getModelsByMake(make));
      setLoading(false);
      setCurrentPage(1);
    }, 500);
  };

  const toggleEnabled = (id: string) => {
    setModels(models.map((model) => (model.id === id ? { ...model, enabled: !model.enabled } : model)));
    toast.success("Model status updated");
  };

  const handleDelete = (id: string) => {
    setModels(models.filter((model) => model.id !== id));
    toast.success("Model deleted successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Car Models</h1>
            <p className="text-muted-foreground mt-1">
              Manage car models by make.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Model
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select onValueChange={handleMakeChange} value={selectedMake}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : models.length > 0 ? (
                models
                  .slice((currentPage - 1) * modelsPerPage, currentPage * modelsPerPage)
                  .map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.model}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {model.colors.map((color) => (
                            <Badge key={color} variant="secondary">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{model.images} images</TableCell>
                      <TableCell>
                        <Switch
                          checked={model.enabled}
                          onCheckedChange={() => toggleEnabled(model.id)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/cars/${model.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(model.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {selectedMake ? "No models found." : "Select a make to see the models."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {models.length > modelsPerPage && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(models.length / modelsPerPage))
                    );
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      <AddModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onModelAdded={() => handleMakeChange(selectedMake)}
        make={selectedMake}
      />
    </MainLayout>
  );
}
