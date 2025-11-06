import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader, Upload } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCarMakes, useCarModels, useCarColors, useCarVariants, useCar, useCreateCar, useUpdateCar } from "@/hooks/useCars";
import { useToast } from "@/components/ui/use-toast";
import type { CarCreateRequest } from "@/lib/api";

export default function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const carId = id ? parseInt(id) : undefined;
  const isEdit = Boolean(id);

  // Form data state
  const [formData, setFormData] = useState<CarCreateRequest>({
    makeId: 0,
    modelId: 0,
    colorId: 0,
    variantId: 0,
    isActive: true,
  });
  const [carImage, setCarImage] = useState<string>("");

  // Fetch existing car data if editing
  const { data: existingCar, isLoading: carLoading } = useCar(carId);

  // Fetch master data
  const { data: makesData, isLoading: makesLoading } = useCarMakes({ limit: 100 });
  const { data: colorsData, isLoading: colorsLoading } = useCarColors({ limit: 100 });
  const { data: modelsData, isLoading: modelsLoading } = useCarModels({
    makeId: formData.makeId || undefined,
    limit: 100,
  });
  const { data: variantsData, isLoading: variantsLoading } = useCarVariants({
    modelId: formData.modelId || undefined,
    limit: 100,
  });

  // Mutations
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();

  // Load existing car data when fetched
  useEffect(() => {
    if (isEdit && existingCar) {
      setFormData({
        makeId: existingCar.variant?.model?.make?.id || 0,
        modelId: existingCar.variant?.model?.id || 0,
        colorId: existingCar.colorId,
        variantId: existingCar.variantId,
        isActive: existingCar.isActive ?? true,
      });
      if (existingCar.carImage) {
        setCarImage(existingCar.carImage);
      }
    }
  }, [existingCar, isEdit]);

  const handleSaveDetails = () => {
    if (!formData.makeId || !formData.modelId || !formData.colorId || !formData.variantId) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isEdit) {
      createCar.mutate(formData, {
        onSuccess: (savedCar) => {
          toast({ title: "Car created successfully!" });
          navigate(`/cars/${savedCar.id}`);
        },
      });
    } else {
      updateCar.mutate(
        { id: carId!, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Car details updated successfully!" });
          },
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setCarImage(imageUrl);
        if (carId) {
          updateCar.mutate(
            { id: carId, data: { ...formData } },
            {
              onSuccess: () => {
                toast({ title: "Image updated successfully!" });
              },
            }
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isLoading = carLoading || makesLoading || colorsLoading || modelsLoading || variantsLoading;
  const isSaving = createCar.isPending || updateCar.isPending;

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
              {isEdit ? "Edit Car" : "Add New Car"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit ? "Update car details and images" : "Create a new car listing"}
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="step1" className="w-full">
          <AccordionItem value="step1">
            <AccordionTrigger className="text-lg font-semibold">
              Step 1: Select Car Details
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Car Make & Model</CardTitle>
                  <CardDescription>Select car details from available options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {!makesData?.items || makesData.items.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                    <p className="font-medium">⚠️ No car makes available</p>
                    <p className="text-sm mt-1">Please create car makes from the backend admin panel first.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="make">Car Make *</Label>
                      <Select
                        value={formData.makeId.toString()}
                        onValueChange={(value) =>
                          setFormData({ ...formData, makeId: parseInt(value), modelId: 0 })
                        }
                      >
                        <SelectTrigger id="make" disabled={makesLoading}>
                          <SelectValue placeholder="Select a make" />
                        </SelectTrigger>
                        <SelectContent>
                          {makesData?.items?.map((make) => (
                            <SelectItem key={make.id} value={make.id.toString()}>
                              {make.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      {formData.makeId === 0 ? (
                        <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                          Select a make first
                        </div>
                      ) : !modelsData?.items || modelsData.items.length === 0 ? (
                        <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                          No models available for this make
                        </div>
                      ) : (
                        <Select
                          value={formData.modelId.toString()}
                          onValueChange={(value) =>
                            setFormData({ ...formData, modelId: parseInt(value), variantId: 0 })
                          }
                        >
                          <SelectTrigger id="model" disabled={modelsLoading}>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {modelsData?.items?.map((model) => (
                              <SelectItem key={model.id} value={model.id.toString()}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color *</Label>
                      {!colorsData?.items || colorsData.items.length === 0 ? (
                        <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                          No colors available
                        </div>
                      ) : (
                        <Select
                          value={formData.colorId.toString()}
                          onValueChange={(value) =>
                            setFormData({ ...formData, colorId: parseInt(value) })
                          }
                        >
                          <SelectTrigger id="color" disabled={colorsLoading}>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorsData?.items?.map((color) => (
                              <SelectItem key={color.id} value={color.id.toString()}>
                                {color.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="variant">Variant *</Label>
                      {formData.modelId === 0 ? (
                        <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                          Select a model first
                        </div>
                      ) : !variantsData?.items || variantsData.items.length === 0 ? (
                        <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                          No variants available for this model
                        </div>
                      ) : (
                        <Select
                          value={formData.variantId.toString()}
                          onValueChange={(value) =>
                            setFormData({ ...formData, variantId: parseInt(value) })
                          }
                        >
                          <SelectTrigger id="variant" disabled={variantsLoading}>
                            <SelectValue placeholder="Select a variant" />
                          </SelectTrigger>
                          <SelectContent>
                            {variantsData?.items?.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id.toString()}>
                                {variant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </>
                )}
                  <Button onClick={handleSaveDetails} disabled={isSaving || isLoading} className="w-full mt-4">
                    {isSaving ? "Saving..." : isEdit ? "Update Details" : "Continue to Images"}
                  </Button>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {isEdit && (
            <AccordionItem value="step2">
              <AccordionTrigger className="text-lg font-semibold">
                Step 2: Upload Car Image
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardHeader>
                    <CardTitle>Car Image</CardTitle>
                    <CardDescription>Upload a single car image</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {carImage && (
                      <div className="relative">
                        <img
                          src={carImage}
                          alt="Car preview"
                          className="max-w-md h-auto rounded-lg border"
                        />
                      </div>
                    )}
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="carImage" className="cursor-pointer">
                        <p className="text-muted-foreground mb-2">
                          Click to upload car image
                        </p>
                        <Input
                          id="carImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isSaving}
                        />
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={() => navigate("/cars")} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => navigate("/cars")} disabled={isSaving}>
            {isSaving ? "Saving..." : "Back to Cars"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
