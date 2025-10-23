import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    company: "",
    model: "",
    enabled: true,
  });

  const handleSave = () => {
    toast.success(isEdit ? "Car updated successfully" : "Car created successfully");
    navigate("/cars");
  };

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
              Configure car details, images, colors, and wheel coordinates
            </p>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Make & Model</TabsTrigger>
            <TabsTrigger value="images">Car Images</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="coordinates">Wheel Coordinates</TabsTrigger>
            <TabsTrigger value="listing">Listing</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Car Make & Model</CardTitle>
                <CardDescription>Basic information about the car</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Car Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., BMW, Mercedes, Audi"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model Name</Label>
                  <Input
                    id="model"
                    placeholder="e.g., M3, C-Class, A4"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Car Images</CardTitle>
                <CardDescription>Upload base images for different angles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Drag and drop images or click to upload
                  </p>
                  <Button variant="secondary">Choose Files</Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Upload images for: Front, Side, Rear, 3/4 angles
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Color Variants</CardTitle>
                <CardDescription>Add available colors for this car model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">+ Add Color</Button>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  No colors added yet. Click "Add Color" to get started.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coordinates">
            <Card>
              <CardHeader>
                <CardTitle>Wheel Coordinates</CardTitle>
                <CardDescription>
                  Define wheel positions for each angle (X, Y, Width, Height)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Front View</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Input placeholder="X" />
                      <Input placeholder="Y" />
                      <Input placeholder="W" />
                      <Input placeholder="H" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Side View</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Input placeholder="X" />
                      <Input placeholder="Y" />
                      <Input placeholder="W" />
                      <Input placeholder="H" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listing">
            <Card>
              <CardHeader>
                <CardTitle>Listing Settings</CardTitle>
                <CardDescription>Control visibility of this car</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enabled">Enable Car Listing</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this car visible in the marketplace
                    </p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/cars")}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Car</Button>
        </div>
      </div>
    </MainLayout>
  );
}
