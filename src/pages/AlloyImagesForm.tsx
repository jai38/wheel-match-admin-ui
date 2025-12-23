import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader, Upload, X, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAlloy, useUploadAlloyImage, useDeleteAlloyImage } from "@/hooks/useAlloys";
import { useToast } from "@/components/ui/use-toast";

export default function AlloyImagesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const alloyId = id ? parseInt(id) : undefined;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: alloy, isLoading: alloyLoading } = useAlloy(alloyId);
  const uploadImage = useUploadAlloyImage();
  const deleteImage = useDeleteAlloyImage();
  console.log("alloy images form render", { alloy });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
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
    if (!alloyId) return;
    if (confirm("Are you sure you want to replace/delete this image?")) {
      deleteImage.mutate({ alloyId });
    }
  };

  const handleUpload = () => {
    if (!alloyId || !selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadImage.mutate(
      { id: alloyId, image: selectedFile },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Image has been uploaded and linked to the alloy.",
          });
          navigate(`/alloys`);
        },
      },
    );
  };

  if (alloyLoading) {
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
              Manage Image for Alloy
            </h1>
            <p className="text-muted-foreground mt-1">
              Visual for: <strong>{alloy?.alloyName}</strong>
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alloy Image</CardTitle>
            <CardDescription>
              Upload a single image for this alloy. If an image already exists, it will be replaced.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Drag & drop image here, or click to select file
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
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-medium">New Selection Preview</h3>
                <div className="relative group max-w-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto rounded-lg object-cover aspect-square"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {alloy?.image_url && (
              <div className="flex flex-col items-center gap-4 border-t pt-6">
                <h3 className="text-lg font-medium">Current Image</h3>
                <div className="relative group max-w-sm">
                  <img
                    src={alloy.image_url}
                    alt="Current Alloy"
                    className="w-full h-auto rounded-lg object-cover aspect-square"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleExistingImageDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploadImage.isPending || !selectedFile}>
              {uploadImage.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Replace"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
