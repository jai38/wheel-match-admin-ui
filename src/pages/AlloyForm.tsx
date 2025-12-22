import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader, Upload } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  useAlloyDesigns,
  useAlloyPCDs,
  useAlloyFinishes,
  useAlloySizes,
  useAlloy,
  useCreateAlloy,
  useUpdateAlloy,
} from "@/hooks/useAlloys";
import { useToast } from "@/components/ui/use-toast";
import type { AlloyCreateRequest } from "@/lib/api";

export default function AlloyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const alloyId = id ? parseInt(id) : undefined;
  const isEdit = Boolean(id);

  // Form data state
  const [formData, setFormData] = useState<AlloyCreateRequest>({
    name: "",
    designId: 0,
    pcdId: 0,
    finishId: 0,
    sizeId: 0,
    buy_url: "",
  });
  const [alloyImages, setAlloyImages] = useState<string[]>([]);

  // Fetch existing alloy data if editing
  const { data: existingAlloy, isLoading: alloyLoading } = useAlloy(alloyId);

  // Fetch master data
  const { data: designsData, isLoading: designsLoading } = useAlloyDesigns({
    limit: 100,
  });
  const { data: pcdsData, isLoading: pcdsLoading } = useAlloyPCDs({
    limit: 100,
  });
  const { data: finishesData, isLoading: finishesLoading } = useAlloyFinishes({
    limit: 100,
  });
  const { data: sizesData, isLoading: sizesLoading } = useAlloySizes({
    limit: 100,
  });

  // Mutations
  const createAlloy = useCreateAlloy();
  const updateAlloy = useUpdateAlloy();

  // Load existing alloy data when fetched
  useEffect(() => {
    if (isEdit && existingAlloy) {
      setFormData({
        name: existingAlloy.name,
        designId: existingAlloy.designId,
        pcdId: existingAlloy.pcdId,
        finishId: existingAlloy.finishId,
        sizeId: existingAlloy.sizeId,
        buy_url: existingAlloy.buy_url,
      });
    }
  }, [existingAlloy, isEdit]);

  // Auto-generate alloy name
  useEffect(() => {
    const { designId, pcdId, finishId, sizeId } = formData;

    if (
      designId &&
      pcdId &&
      finishId &&
      sizeId &&
      designsData &&
      pcdsData &&
      finishesData &&
      sizesData
    ) {
      const design = designsData.items?.find((d) => d.id === designId);
      const pcd = pcdsData.items?.find((p) => p.id === pcdId);
      const finish = finishesData.items?.find((f) => f.id === finishId);
      const size = sizesData.items?.find((s) => s.id === sizeId);

      if (design && pcd && finish && size) {
        const newName = `${size.specs} ${design.name} ${pcd.name} ${finish.name}`;
        setFormData((prev) => ({ ...prev, name: newName }));
      }
    }
  }, [
    formData.designId,
    formData.pcdId,
    formData.finishId,
    formData.sizeId,
    designsData,
    pcdsData,
    finishesData,
    sizesData,
  ]);

  const handleSave = () => {
    if (
      formData.designId === 0 ||
      formData.pcdId === 0 ||
      formData.finishId === 0 ||
      formData.sizeId === 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isEdit && alloyId) {
      updateAlloy.mutate(
        { id: alloyId, data: formData },
        {
          onSuccess: () => {
            navigate("/alloys");
          },
        },
      );
    } else {
      createAlloy
        .mutateAsync(formData)
        .then((newAlloy) => {
          toast({
            title: "Next Step: Upload Images",
            description: `Alloy "${newAlloy.alloyName}" has been created.`,
          });
          if (newAlloy.id) {
            navigate(`/alloys/${newAlloy.id}/images`);
          } else {
            toast({
              title: "Error",
              description:
                "Could not get Alloy ID from the server. Cannot proceed to image upload.",
              variant: "destructive",
            });
            navigate("/alloys");
          }
        })
        .catch(() => {
          // Error is handled by the hook's onError, but catch prevents unhandled promise rejection
        });
    }
  };

  const isLoading =
    alloyLoading ||
    designsLoading ||
    pcdsLoading ||
    finishesLoading ||
    sizesLoading;
  const isSaving = createAlloy.isPending || updateAlloy.isPending;

  if (isEdit && alloyLoading) {
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/alloys")}>
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

        {/* <Tabs defaultValue="details" className="w-full"> */}
        {/* <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Alloy Details</TabsTrigger>
            <TabsTrigger value="cars">Car List</TabsTrigger>
          </TabsList> */}

        {/* <TabsContent value="details"> */}
        <Card>
          <CardHeader>
            <CardTitle>Alloy Specifications</CardTitle>
            <CardDescription>
              Select alloy specifications from available options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!designsData?.items || designsData.items.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                <p className="font-medium">⚠️ No alloy data available</p>
                <p className="text-sm mt-1">
                  Please create alloy designs, PCDs, finishes, and sizes from
                  the backend admin panel first.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="design">Design *</Label>
                  <Select
                    value={formData.designId.toString()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        designId: parseInt(value),
                      })
                    }>
                    <SelectTrigger id="design" disabled={designsLoading}>
                      <SelectValue placeholder="Select a design" />
                    </SelectTrigger>
                    <SelectContent>
                      {designsData?.items?.map((design) => (
                        <SelectItem
                          key={design.id}
                          value={design.id.toString()}>
                          {design.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pcd">PCD (Bolt Pattern) *</Label>
                  {!pcdsData?.items || pcdsData.items.length === 0 ? (
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                      No PCDs available
                    </div>
                  ) : (
                    <Select
                      value={formData.pcdId.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, pcdId: parseInt(value) })
                      }>
                      <SelectTrigger id="pcd" disabled={pcdsLoading}>
                        <SelectValue placeholder="Select a PCD" />
                      </SelectTrigger>
                      <SelectContent>
                        {pcdsData?.items?.map((pcd) => (
                          <SelectItem key={pcd.id} value={pcd.id.toString()}>
                            {pcd.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finish">Finish *</Label>
                  {!finishesData?.items || finishesData.items.length === 0 ? (
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                      No finishes available
                    </div>
                  ) : (
                    <Select
                      value={formData.finishId.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          finishId: parseInt(value),
                        })
                      }>
                      <SelectTrigger id="finish" disabled={finishesLoading}>
                        <SelectValue placeholder="Select a finish" />
                      </SelectTrigger>
                      <SelectContent>
                        {finishesData?.items?.map((finish) => (
                          <SelectItem
                            key={finish.id}
                            value={finish.id.toString()}>
                            {finish.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">
                    Size (Diameter x Width ET Offset) *
                  </Label>
                  {!sizesData?.items || sizesData.items.length === 0 ? (
                    <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                      No sizes available
                    </div>
                  ) : (
                    <Select
                      value={formData.sizeId.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          sizeId: parseInt(value),
                        })
                      }>
                      <SelectTrigger id="size" disabled={sizesLoading}>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizesData?.items?.map((size) => (
                          <SelectItem key={size.id} value={size.id.toString()}>
                            {size.specs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buy_url">Buy URL (Optional)</Label>
                  <Input
                    id="buy_url"
                    placeholder="https://example.com/product/alloy-123"
                    value={formData.buy_url || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, buy_url: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        {/* </TabsContent> */}

        {/* <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle>Compatible Vehicles</CardTitle>
                <CardDescription>
                  Map this alloy to compatible car models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Manage Car List</Button>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  No cars mapped yet.
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        {/* </Tabs> */}

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/alloys")}
            disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Alloy"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
