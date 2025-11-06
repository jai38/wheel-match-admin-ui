import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
import { Make, Model } from "@/lib/types";
import { getMakes, getModelsByMake } from "@/lib/api";
import { toast } from "sonner";

export default function CarModelPage() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const modelsPerPage = 5;

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const data = await getMakes();
        setMakes(data);
      } catch (err) {
        setError("Failed to fetch makes.");
        toast.error("Failed to fetch makes.");
      }
    };
    fetchMakes();
  }, []);

  const handleMakeChange = async (makeId: string) => {
    if (!makeId) {
      handleClear();
      return;
    }
    setSelectedMake(makeId);
    setLoading(true);
    setError(null);
    try {
      const data = await getModelsByMake(makeId);
      setModels(data);
    } catch (err) {
      setError("Failed to fetch models.");
      toast.error("Failed to fetch models.");
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const handleClear = () => {
    setSelectedMake("");
    setModels([]);
    setError(null);
  };

  const toggleEnabled = (id: string) => {
    setModels(models.map((model) => (model.id === id ? { ...model, enabled: !model.enabled } : model)));
    toast.success("Model status updated");
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
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select onValueChange={handleMakeChange} value={selectedMake}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMake && (
            <Button variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          )}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : models.length > 0 ? (
                models
                  .slice((currentPage - 1) * modelsPerPage, currentPage * modelsPerPage)
                  .map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
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
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
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
    </MainLayout>
  );
}
