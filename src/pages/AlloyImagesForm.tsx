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
import { useAlloy, useUploadAlloyImages, useDeleteAlloyImage } from "@/hooks/useAlloys";
import { useToast } from "@/components/ui/use-toast";

export default function AlloyImagesForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const alloyId = id ? parseInt(id) : undefined;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: alloy, isLoading: alloyLoading } = useAlloy(alloyId);
  const uploadImages = useUploadAlloyImages();
  const deleteImage = useDeleteAlloyImage();
  console.log("alloy images form render", { alloy });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const previewToRemove = prev[index];
      URL.revokeObjectURL(previewToRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleExistingImageDelete = (imageId: number) => {
    if (!alloyId) return;
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage.mutate({ alloyId, imageId });
    }
  };

  const handleUpload = () => {
    if (!alloyId || selectedFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select one or more images to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadImages.mutate(
      { id: alloyId, images: selectedFiles },
      {
        onSuccess: () => {
          toast({
            title: "Success!",
            description: "Images have been uploaded and linked to the alloy.",
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
              Upload Images for Alloy
            </h1>
            <p className="text-muted-foreground mt-1">
              Add visuals for: <strong>{alloy?.alloyName}</strong>
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alloy Images</CardTitle>
            <CardDescription>
              Upload one or more images for this alloy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Drag & drop images here, or click to select files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-auto rounded-lg object-cover aspect-square"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {alloy?.images && alloy.images.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mt-6 mb-2">
                  Existing Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {alloy.images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.image_url}
                        alt={`Alloy image ${index}`}
                        className="w-full h-auto rounded-lg object-cover aspect-square"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleExistingImageDelete(image.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploadImages.isPending || selectedFiles.length === 0}>
              {uploadImages.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Finish"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
