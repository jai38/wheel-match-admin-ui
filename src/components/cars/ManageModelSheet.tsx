import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader,
  Plus,
  Trash2,
  Car as CarIcon,
  ImageIcon,
  Edit,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import CarCanvas from "./CarCanvas";
import { useAlloys } from "@/hooks/useAlloys";
import { useUpdateCarModel } from "@/hooks/useCars";

interface ManageModelSheetProps {
  model: CarModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageModelSheet({
  model,
  isOpen,
  onClose,
}: ManageModelSheetProps) {
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [editingCarId, setEditingCarId] = useState<number | null>(null);

  // Wheel Config State
  const [selectedAlloyId, setSelectedAlloyId] = useState<string>("");
  const [wheelConfig, setWheelConfig] = useState({
    x_front: 525,
    y_front: 775,
    x_rear: 1445,
    y_rear: 775,
    wheelSize: 190,
  });

  const queryClient = useQueryClient();

  // Initialize wheel config from model
  useEffect(() => {
    if (model) {
      console.log("Model updated in ManageModelSheet", model);
      setWheelConfig({
        x_front: model.x_front || 525,
        y_front: model.y_front || 775,
        x_rear: model.x_rear || 1445,
        y_rear: model.y_rear || 775,
        wheelSize: model.alloySize || 190,
      });
    }
  }, [model]);

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

  // Fetch Alloys for preview
  const { data: alloysData, isLoading: alloysLoading } = useAlloys({
    limit: 100,
  });

  // Robustly get alloys array from paginated response
  const alloys = alloysData?.items || alloysData?.alloys || [];

  const selectedAlloy =
    alloys.find((a) => a.id.toString() === selectedAlloyId) || alloys[0];
  const previewCar =
    cars.length > 0 ? cars.find((c) => c.isDefault) || cars[0] : null;
  const previewCarImage = previewCar?.carImage;
  // Fallback to legacy images array if image_url is missing
  const previewAlloyImage =
    selectedAlloy?.image_url ||
    (selectedAlloy as any)?.images?.[0]?.image_url ||
    (selectedAlloy as any)?.images?.[0];

  const updateModelMutation = useUpdateCarModel();

  const handleSaveWheelConfig = () => {
    if (!model) return;
    updateModelMutation.mutate({
      id: model.id,
      data: {
        x_front: wheelConfig.x_front,
        y_front: wheelConfig.y_front,
        x_rear: wheelConfig.x_rear,
        y_rear: wheelConfig.y_rear,
        alloySize: wheelConfig.wheelSize,
      },
    });
  };

  // ... (keep existing mutations)
  const createCarMutation = useMutation({
    mutationFn: async () => {
      if (!model || !selectedColorId || !selectedFile) return;
      const newCar = await carsService.createCar({
        modelId: model.id,
        colorId: parseInt(selectedColorId),
        wheelSize: model.defaultAlloySize || 190, // Using default from model
        isActive: true,
        isDefault: isDefault,
      });
      await carsService.uploadCarImage(newCar.id, selectedFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", model?.id] });
      toast.success("Car color variant added successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add car color variant");
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async () => {
      if (!model || !selectedColorId || !editingCarId) return;
      await carsService.updateCar(editingCarId, {
        colorId: parseInt(selectedColorId),
        isDefault: isDefault,
      });
      if (selectedFile) {
        await carsService.uploadCarImage(editingCarId, selectedFile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", model?.id] });
      toast.success("Car variant updated successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update car variant");
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: async (id: number) => {
      await carsService.deleteCar(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", model?.id] });
      toast.success("Car variant deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete car variant");
    },
  });

  const resetForm = () => {
    setSelectedColorId("");
    setSelectedFile(null);
    setIsDefault(false);
    setEditingCarId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColorId) {
      toast.error("Please select a color");
      return;
    }

    if (editingCarId) {
      updateCarMutation.mutate();
    } else {
      if (!selectedFile) {
        toast.error("Please select an image");
        return;
      }
      createCarMutation.mutate();
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCarId(car.id);
    setSelectedColorId(car.colorId.toString());
    setIsDefault(car.isDefault || false);
    setSelectedFile(null);
  };

  if (!model) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[800px] overflow-y-auto sm:max-w-[800px]">
        <SheetHeader>
          <SheetTitle>Manage {model.name}</SheetTitle>
          <SheetDescription>
            Manage variants and wheel configuration.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="variants" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variants">Color Variants</TabsTrigger>
            <TabsTrigger value="wheel-config">Wheel Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="variants" className="space-y-6">
            <div className="py-6 space-y-8">
              {/* Add/Edit Variant Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {editingCarId ? "Edit Variant" : "Add New Color Variant"}
                  </h3>
                  {editingCarId && (
                    <Button variant="ghost" size="sm" onClick={resetForm}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Edit
                    </Button>
                  )}
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={selectedColorId}
                      onValueChange={setSelectedColorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          colors.map((color: CarColor) => (
                            <SelectItem
                              key={color.id}
                              value={color.id.toString()}>
                              {color.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Car Image {editingCarId && "(Optional)"}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                        className="cursor-pointer"
                      />
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={isDefault}
                      onCheckedChange={setIsDefault}
                    />
                    <Label htmlFor="isDefault">Mark as Default Color</Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      createCarMutation.isPending || updateCarMutation.isPending
                    }
                    className="w-full">
                    {createCarMutation.isPending ||
                    updateCarMutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        {editingCarId ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>
                        {editingCarId ? (
                          <Edit className="mr-2 h-4 w-4" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        {editingCarId ? "Update Variant" : "Add Variant"}
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <Separator />

              {/* Existing Variants List */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  Existing Variants ({cars.length})
                </h3>

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
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cars.map((car: Car) => (
                          <TableRow key={car.id}>
                            <TableCell>
                              {car.carImage ? (
                                <div className="h-10 w-16 relative rounded overflow-hidden bg-muted">
                                  <img
                                    src={car.carImage}
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
                            <TableCell>
                              {car.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(car)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this variant?",
                                    )
                                  ) {
                                    deleteCarMutation.mutate(car.id);
                                  }
                                }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wheel-config" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Select Preview Alloy</Label>
                  <Select
                    value={selectedAlloyId}
                    onValueChange={setSelectedAlloyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an alloy to preview" />
                    </SelectTrigger>
                    <SelectContent>
                      {alloysLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading alloys...
                        </SelectItem>
                      ) : alloys.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No alloys found
                        </SelectItem>
                      ) : (
                        alloys.map((alloy) => (
                          <SelectItem
                            key={alloy.id}
                            value={alloy.id.toString()}>
                            {alloy.alloyName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {previewCarImage ? (
                <div className="border rounded-lg p-4 bg-muted/10">
                  <CarCanvas
                    carImage={previewCarImage}
                    wheelImage={previewAlloyImage || ""}
                    x_front={wheelConfig.x_front}
                    y_front={wheelConfig.y_front}
                    x_rear={wheelConfig.x_rear}
                    y_rear={wheelConfig.y_rear}
                    wheelSize={wheelConfig.wheelSize}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                  No car image available for preview. Add a variant first.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Front Wheel X</Label>
                  <Input
                    type="number"
                    value={wheelConfig.x_front}
                    onChange={(e) =>
                      setWheelConfig({
                        ...wheelConfig,
                        x_front: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Front Wheel Y</Label>
                  <Input
                    type="number"
                    value={wheelConfig.y_front}
                    onChange={(e) =>
                      setWheelConfig({
                        ...wheelConfig,
                        y_front: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rear Wheel X</Label>
                  <Input
                    type="number"
                    value={wheelConfig.x_rear}
                    onChange={(e) =>
                      setWheelConfig({
                        ...wheelConfig,
                        x_rear: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rear Wheel Y</Label>
                  <Input
                    type="number"
                    value={wheelConfig.y_rear}
                    onChange={(e) =>
                      setWheelConfig({
                        ...wheelConfig,
                        y_rear: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Wheel Size (Pixels)</Label>
                  <Input
                    type="number"
                    value={wheelConfig.wheelSize}
                    onChange={(e) =>
                      setWheelConfig({
                        ...wheelConfig,
                        wheelSize: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Adjust this to match the wheel scale relative to the car.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSaveWheelConfig}
                disabled={updateModelMutation.isPending}
                className="w-full">
                {updateModelMutation.isPending
                  ? "Saving..."
                  : "Save Wheel Configuration"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
