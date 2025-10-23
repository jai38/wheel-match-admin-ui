import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockCars, Car } from "@/lib/mockData";
import { toast } from "sonner";

export default function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>(mockCars);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCars = cars.filter(
    (car) =>
      car.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleEnabled = (id: string) => {
    setCars(cars.map((car) => (car.id === id ? { ...car, enabled: !car.enabled } : car)));
    toast.success("Car status updated");
  };

  const handleDelete = (id: string) => {
    setCars(cars.filter((car) => car.id !== id));
    toast.success("Car deleted successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Car Master</h1>
            <p className="text-muted-foreground mt-1">
              Manage car makes, models, colors, and wheel coordinates
            </p>
          </div>
          <Button onClick={() => navigate("/cars/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Car Make
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car Company</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">{car.company}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {car.colors.map((color) => (
                        <Badge key={color} variant="secondary">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{car.images} images</TableCell>
                  <TableCell>
                    <Switch checked={car.enabled} onCheckedChange={() => toggleEnabled(car.id)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/cars/${car.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(car.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
