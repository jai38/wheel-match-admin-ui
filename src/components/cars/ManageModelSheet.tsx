import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus, Trash2, Upload, Car as CarIcon, ImageIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { carsService } from "@/lib/api/services/cars";
import type { CarModel, CarColor, Car } from "@/lib/api/types";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ManageModelSheetProps {
  model: CarModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageModelSheet({ model, isOpen, onClose }: ManageModelSheetProps) {
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Fetch Colors
  const { data: colorsData, isLoading: colorsLoading } = useQuery({
    queryKey: ["carColors"],
    queryFn: () => carsService.getColors({ limit: 100 }),
    enabled: isOpen,
  });

  const colors = colorsData?.items || [];

  // Fetch Cars for this model
  const { data: carsData, isLoading: carsLoading } = useQuery({
    queryKey: ["cars", model?.id],
    queryFn: () => carsService.getCars({ modelId: model?.id, limit: 100 }),
    enabled: !!model?.id && isOpen,
  });

  const cars = carsData?.items || [];

  // Create Car Mutation
  const createCarMutation = useMutation({
    mutationFn: async () => {
      if (!model || !selectedColorId || !selectedFile) return;

      // 1. Create Car
      const newCar = await carsService.createCar({
        modelId: model.id,
        colorId: parseInt(selectedColorId),
        wheelSize: model.defaultAlloySize || 0,
        x_front: 0,
        y_front: 0,
        x_rear: 0,
        y_rear: 0,
        isActive: true,
      });

      // 2. Upload Image
      await carsService.uploadCarImages(newCar.id, [selectedFile]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", model?.id] });
      toast.success("Car color variant added successfully");
      setSelectedColorId("");
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add car color variant");
    },
  });

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColorId) {
      toast.error("Please select a color");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    createCarMutation.mutate();
  };

  if (!model) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage {model.name}</SheetTitle>
          <SheetDescription>
            Manage color variants and images for this model.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Add New Variant Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Add New Color Variant</h3>
            <form onSubmit={handleAddColor} className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={selectedColorId} onValueChange={setSelectedColorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      colors.map((color: CarColor) => (
                        <SelectItem key={color.id} value={color.id.toString()}>
                          {color.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Car Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={createCarMutation.isPending} className="w-full">
                {createCarMutation.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </>
                )}
              </Button>
            </form>
          </div>

          <Separator />

          {/* Existing Variants List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Existing Variants ({cars.length})</h3>
            
            {carsLoading ? (
               <div className="space-y-2">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
               </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <CarIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No variants added yet</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Color</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((car: Car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          {car.images && car.images.length > 0 ? (
                            <div className="h-10 w-16 relative rounded overflow-hidden bg-muted">
                              <img 
                                src={car.images[0].image_url} 
                                alt={car.color?.name} 
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-16 bg-muted flex items-center justify-center rounded">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {car.color?.name || "Unknown Color"}
                        </TableCell>
                        {/* <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
