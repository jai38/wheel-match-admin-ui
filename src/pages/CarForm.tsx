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
import { useCarMakes, useCarModels, useCarColors, useCarVariants, useCar, useCreateCar, useUpdateCar } from "@/hooks/useCars";
import { useToast } from "@/components/ui/use-toast";
import type { CarCreateRequest } from "@/lib/api";

export default function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [carId, setCarId] = useState<number | undefined>(id ? parseInt(id, 10) : undefined);
  
  const [formData, setFormData] = useState<Partial<CarCreateRequest>>({
    makeId: 0,
    modelId: 0,
    colorId: 0,
    variantId: 0,
    isActive: true,
    x_front: 0,
    y_front: 0,
    x_rear: 0,
    y_rear: 0,
    wheelSize: 0,
  });
  const [carImage, setCarImage] = useState<string>("");

  const { data: existingCar, isLoading: carLoading } = useCar(carId);

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

  const createCar = useCreateCar();
  const updateCar = useUpdateCar();

  useEffect(() => {
    if (carId && existingCar) {
      setFormData({
        makeId: existingCar.variant?.model?.make?.id || 0,
        modelId: existingCar.variant?.model?.id || 0,
        colorId: existingCar.colorId,
        variantId: existingCar.variantId,
        isActive: existingCar.isActive ?? true,
        x_front: existingCar.x_front || 0,
        y_front: existingCar.y_front || 0,
        x_rear: existingCar.x_rear || 0,
        y_rear: existingCar.y_rear || 0,
        wheelSize: existingCar.wheelSize || 0,
      });
      if (existingCar.carImage) {
        setCarImage(existingCar.carImage);
      }
    }
  }, [existingCar, carId]);

  const handleStep1Submit = () => {
    if (!formData.makeId || !formData.modelId || !formData.colorId || !formData.variantId) {
      toast({
        title: "Incomplete Form",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (carId) {
      updateCar.mutate({ id: carId, data: formData }, {
        onSuccess: () => {
          toast({ title: "Step 1 Completed" });
          setCurrentStep(2);
        },
      });
    } else {
      createCar.mutate(formData as CarCreateRequest, {
        onSuccess: (savedCar) => {
          setCarId(savedCar.id);
          toast({ title: "Car created! Now add an image." });
          setCurrentStep(2);
        },
      });
    }
  };
  
  const handleStep2Submit = () => {
    if (!carId) return;
    updateCar.mutate({ id: carId, data: { carImage } }, {
      onSuccess: () => {
        toast({ title: "Step 2 Completed" });
        setCurrentStep(3);
      },
    });
  };

  const handleStep3Submit = () => {
    if (!carId) return;
    updateCar.mutate({ id: carId, data: formData }, {
      onSuccess: () => {
        toast({ title: "Car Saved Successfully!" });
        navigate("/cars");
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCarImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const isSaving = createCar.isPending || updateCar.isPending;

  if (carId && carLoading) {
    return <MainLayout><div className="flex items-center justify-center h-64"><Loader className="h-8 w-8 animate-spin text-primary" /></div></MainLayout>;
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
              {carId ? "Edit Car" : "Add New Car"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {`Step ${currentStep} of 3`}
            </p>
          </div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Car Details</CardTitle>
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
                        value={formData.makeId?.toString()}
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
                          value={formData.modelId?.toString()}
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
                          value={formData.colorId?.toString()}
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
                          value={formData.variantId?.toString()}
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
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Upload Car Image</CardTitle>
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
        )}
        
        {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Wheel Placement</CardTitle>
                <CardDescription>Set the coordinates for wheel placement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="x_front">Front Wheel X *</Label>
                    <Input id="x_front" type="number" value={formData.x_front} onChange={(e) => setFormData({...formData, x_front: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="y_front">Front Wheel Y *</Label>
                    <Input id="y_front" type="number" value={formData.y_front} onChange={(e) => setFormData({...formData, y_front: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="x_rear">Rear Wheel X *</Label>
                    <Input id="x_rear" type="number" value={formData.x_rear} onChange={(e) => setFormData({...formData, x_rear: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="y_rear">Rear Wheel Y *</Label>
                    <Input id="y_rear" type="number" value={formData.y_rear} onChange={(e) => setFormData({...formData, y_rear: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="wheelSize">Wheel Size *</Label>
                    <Input id="wheelSize" type="number" value={formData.wheelSize} onChange={(e) => setFormData({...formData, wheelSize: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        <div className="flex justify-between gap-4">
            <div>
              {currentStep > 1 && <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={isSaving}>Previous</Button>}
            </div>
            <div>
              {currentStep === 1 && <Button onClick={handleStep1Submit} disabled={isSaving}>Next</Button>}
              {currentStep === 2 && <Button onClick={handleStep2Submit} disabled={isSaving}>Next</Button>}
              {currentStep === 3 && <Button onClick={handleStep3Submit} disabled={isSaving}>Save Car</Button>}
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
