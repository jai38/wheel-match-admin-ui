import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
import { carsService } from "@/lib/api";
import { CarMake, CarModel } from "@/lib/api/types";
import { toast } from "sonner";

export default function CarModelPage() {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const modelsPerPage = 10;

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await carsService.getMakes({ limit: 1000 });
        if(response.items) {
          setMakes(response.items);
        }
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
      const response = await carsService.getModels({ makeId: parseInt(makeId, 10), limit: 1000 });
      if(response.items) {
        setModels(response.items);
      }
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
                <SelectItem key={make.id} value={make.id.toString()}>
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
                <TableHead>Make</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : models.length > 0 ? (
                models
                  .slice((currentPage - 1) * modelsPerPage, currentPage * modelsPerPage)
                  .map((model) => (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{model.make?.name || 'N/A'}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
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
