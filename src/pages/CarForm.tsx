import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader, Upload, X, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  useCarModels,
  useCarColors,
  useCar,
  useCreateCar,
  useUpdateCar,
  useUploadCarImage,
  useDeleteCarImage,
} from "@/hooks/useCars";
import { useToast } from "@/components/ui/use-toast";
import type { CarCreateRequest } from "@/lib/api";

export default function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const carId = id ? parseInt(id, 10) : undefined;
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<CarCreateRequest>({
    modelId: 0,
    colorId: 0,
    isActive: true,
    isDefault: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingCar, isLoading: carLoading } = useCar(carId);
  const { data: modelsData, isLoading: modelsLoading } = useCarModels({
    limit: 100,
  });
  const { data: colorsData, isLoading: colorsLoading } = useCarColors({
    limit: 100,
  });

  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const uploadCarImage = useUploadCarImage();
  const deleteCarImage = useDeleteCarImage();

  useEffect(() => {
    if (isEdit && existingCar) {
      setFormData({
        modelId: existingCar.model?.id || 0,
        colorId: existingCar.colorId,
        isActive: existingCar.isActive ?? true,
        isDefault: existingCar.isDefault ?? false,
      });
    }
  }, [existingCar, isEdit]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleExistingImageDelete = () => {
    if (!carId) return;
    if (confirm("Are you sure you want to delete the current image?")) {
      deleteCarImage.mutate(carId);
    }
  };

  const handleSave = async () => {
    if (formData.modelId === 0 || formData.colorId === 0) {
      toast({
        title: "Validation Error",
        description: "Please select both a model and a color",
        variant: "destructive",
      });
      return;
    }

    try {
      let savedCarId = carId;

      if (isEdit && carId) {
        await updateCar.mutateAsync({ id: carId, data: formData });
      } else {
        const newCar = await createCar.mutateAsync(formData);
        savedCarId = newCar.id;
      }

      // Upload image if selected
      if (savedCarId && selectedFile) {
        await uploadCarImage.mutateAsync({ id: savedCarId, image: selectedFile });
      }

      toast({
        title: "Success",
        description: `Car variant has been ${isEdit ? "updated" : "created"}.`,
      });
      navigate("/cars");
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const isLoading = carLoading || modelsLoading || colorsLoading;
  const isSaving = createCar.isPending || updateCar.isPending || uploadCarImage.isPending;

  if (isEdit && carLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cars")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Car Variant" : "Add New Car Variant"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure model, color, and visuals for the wheel matching tool
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Variant Details</CardTitle>
                <CardDescription>
                  Select the car model and color combination
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Car Model *</Label>
                    <Select
                      value={formData.modelId.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, modelId: parseInt(value) })
                      }>
                      <SelectTrigger id="model" disabled={modelsLoading}>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelsData?.items?.map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.make?.name} {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color *</Label>
                    <Select
                      value={formData.colorId.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, colorId: parseInt(value) })
                      }>
                      <SelectTrigger id="color" disabled={colorsLoading}>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorsData?.items?.map((color) => (
                          <SelectItem key={color.id} value={color.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: color.colorCode }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isDefault: checked })
                      }
                    />
                    <Label htmlFor="isDefault">Default for this model</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Car Image</CardTitle>
                <CardDescription>
                  Upload a single high-quality side-profile image of the car.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Click to select or drag & drop car image
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {imagePreview && (
                  <div className="relative group max-w-md mx-auto">
                    <img
                      src={imagePreview}
                      alt="New selection"
                      className="w-full h-auto rounded-lg object-contain border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Visual</CardTitle>
              </CardHeader>
              <CardContent>
                {existingCar?.carImage ? (
                  <div className="relative group">
                    <img
                      src={existingCar.carImage}
                      alt="Current variant"
                      className="w-full h-auto rounded-lg object-contain border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleExistingImageDelete}
                      disabled={deleteCarImage.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-muted rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground text-center px-4">
                      No image uploaded yet for this variant.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button onClick={handleSave} disabled={isSaving || isLoading} className="w-full">
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Variant"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/cars")}
                disabled={isSaving}
                className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
