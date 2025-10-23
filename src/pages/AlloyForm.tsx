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

export default function AlloyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    size: "",
    pcd: "",
    offset: "",
    centerBore: "",
    loadRating: "",
    bis: "",
    enabled: true,
  });

  const handleSave = () => {
    toast.success(isEdit ? "Alloy updated successfully" : "Alloy created successfully");
    navigate("/alloys");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/alloys")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Alloy" : "Add New Alloy"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure alloy specifications, finishes, and compatible vehicles
            </p>
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Alloy Details</TabsTrigger>
            <TabsTrigger value="finishes">Finishes</TabsTrigger>
            <TabsTrigger value="fitment">Fitment Mapping</TabsTrigger>
            <TabsTrigger value="listing">Listing</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Alloy Specifications</CardTitle>
                <CardDescription>Technical details and dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Alloy Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sport Alloy 18 inch"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      placeholder="e.g., 18 inch"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pcd">PCD (Pitch Circle Diameter)</Label>
                    <Input
                      id="pcd"
                      placeholder="e.g., 5x120"
                      value={formData.pcd}
                      onChange={(e) => setFormData({ ...formData, pcd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offset">Offset</Label>
                    <Input
                      id="offset"
                      placeholder="e.g., +35"
                      value={formData.offset}
                      onChange={(e) => setFormData({ ...formData, offset: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="centerBore">Center Bore (mm)</Label>
                    <Input
                      id="centerBore"
                      placeholder="e.g., 72.6"
                      value={formData.centerBore}
                      onChange={(e) => setFormData({ ...formData, centerBore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loadRating">Load Rating (kg)</Label>
                    <Input
                      id="loadRating"
                      placeholder="e.g., 800"
                      value={formData.loadRating}
                      onChange={(e) => setFormData({ ...formData, loadRating: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bis">BIS Certification</Label>
                    <Input
                      id="bis"
                      placeholder="e.g., BIS123456"
                      value={formData.bis}
                      onChange={(e) => setFormData({ ...formData, bis: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finishes">
            <Card>
              <CardHeader>
                <CardTitle>Finish Options</CardTitle>
                <CardDescription>Add different finish variants for this alloy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">+ Add Finish</Button>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  No finishes added yet. Add finishes like Gloss, Matt, or Chrome.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fitment">
            <Card>
              <CardHeader>
                <CardTitle>Compatible Vehicles</CardTitle>
                <CardDescription>Map this alloy to compatible car models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Car Company</Label>
                    <Input placeholder="Select company" />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input placeholder="Select model" />
                  </div>
                </div>
                <Button variant="outline">+ Add Fitment</Button>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  No fitments mapped yet.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listing">
            <Card>
              <CardHeader>
                <CardTitle>Listing Settings</CardTitle>
                <CardDescription>Control visibility of this alloy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enabled">Enable Alloy Listing</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this alloy visible in the marketplace
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
          <Button variant="outline" onClick={() => navigate("/alloys")}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Alloy</Button>
        </div>
      </div>
    </MainLayout>
  );
}
