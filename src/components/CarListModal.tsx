import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/MultiSelect";
import { useCarModels } from "@/hooks/useCars";
import { useAlloy, useUpdateAlloy } from "@/hooks/useAlloys";
import { Loader, Trash2 } from "lucide-react";

interface CarListModalProps {
  alloyId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CarListModal({
  alloyId,
  open,
  onOpenChange,
}: CarListModalProps) {
  const [selectedModelIds, setSelectedModelIds] = useState<number[]>([]);

  // Fetch Alloy to get current modelIds
  const { data: alloy, isLoading: alloyLoading } = useAlloy(alloyId);

  // Fetch Models
  const { data: modelsData, isLoading: modelsLoading } = useCarModels({
    limit: 1000,
  });

  const updateAlloyMutation = useUpdateAlloy();

  const allModels = modelsData?.items || [];

  const mappedModels = useMemo(() => {
    if (!alloy?.modelIds || !allModels.length) return [];
    return allModels.filter((model) => alloy.modelIds.includes(model.id));
  }, [alloy?.modelIds, allModels]);

  const handleAddModels = async () => {
    if (selectedModelIds.length === 0 || !alloy) return;

    const currentModelIds = alloy.modelIds || [];
    const newModelIds = [...new Set([...currentModelIds, ...selectedModelIds])];

    updateAlloyMutation.mutate({
      id: alloyId,
      data: { modelIds: newModelIds },
    });
    setSelectedModelIds([]);
  };

  const handleRemoveModel = async (modelId: number) => {
    if (!alloy) return;
    const currentModelIds = alloy.modelIds || [];
    const newModelIds = currentModelIds.filter((id) => id !== modelId);

    updateAlloyMutation.mutate({
      id: alloyId,
      data: { modelIds: newModelIds },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Compatible Models</DialogTitle>
          <DialogDescription>
            Add or remove car models that are compatible with this alloy. (All
            color variants of the model will be included)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <MultiSelect
              options={
                allModels
                  .filter((model) => !alloy?.modelIds?.includes(model.id))
                  .map((model) => ({
                    value: model.id.toString(),
                    label: `${model.make?.name} ${model.name}`,
                  })) || []
              }
              value={selectedModelIds.map(String)}
              onChange={(value) => setSelectedModelIds(value.map(Number))}
              placeholder="Select models to add"
              disabled={modelsLoading || alloyLoading}
              className="flex-1"
            />
            <Button
              onClick={handleAddModels}
              disabled={
                updateAlloyMutation.isPending || selectedModelIds.length === 0
              }>
              {updateAlloyMutation.isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Add Models"
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Mapped Models</h4>
            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
              {alloyLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : mappedModels?.length === 0 ? (
                <p className="p-4 text-sm text-center text-muted-foreground">
                  No models have been mapped to this alloy yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {mappedModels?.map((model) => (
                    <li
                      key={model.id}
                      className="flex items-center justify-between p-3">
                      <span>
                        {model.make?.name} {model.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveModel(model.id)}
                        disabled={updateAlloyMutation.isPending}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
