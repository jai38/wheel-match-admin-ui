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
import { useCars } from "@/hooks/useCars";
import {
  useAlloyCars,
  useAddCarsToAlloy,
  useRemoveCarFromAlloy,
} from "@/hooks/useAlloys";
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
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);

  const { data: carsData, isLoading: carsLoading } = useCars({ limit: 1000 });
  const { data: mappedCars, isLoading: mappedCarsLoading } =
    useAlloyCars(alloyId);
  const addCarsMutation = useAddCarsToAlloy();
  const removeCarMutation = useRemoveCarFromAlloy();

  const uniqueModels = useMemo(() => {
    if (!carsData?.items) return [];
    const modelsMap = new Map();
    carsData.items.forEach((car) => {
      if (car.model) {
        modelsMap.set(car.model.id, car.model);
      }
    });
    return Array.from(modelsMap.values());
  }, [carsData]);

  const mappedModels = useMemo(() => {
    if (!mappedCars) return [];
    const modelsMap = new Map();
    mappedCars.forEach((car) => {
      if (car.model) {
        modelsMap.set(car.model.id, car.model);
      }
    });
    return Array.from(modelsMap.values());
  }, [mappedCars]);

  const handleAddCar = async () => {
    if (selectedVariants.length === 0) return;
    const carIds =
      carsData?.items
        ?.filter((car) => selectedVariants.includes(car.modelId))
        .map((car) => car.id) || [];
    addCarsMutation.mutate({ alloyId, carIds });
    setSelectedVariants([]);
  };

  const handleRemoveVariant = async (modelId: number) => {
    const carIdsToRemove =
      mappedCars
        ?.filter((car) => car.modelId === modelId)
        .map((car) => car.id) || [];

    if (carIdsToRemove.length > 0) {
      carIdsToRemove.forEach((carId) => {
        removeCarMutation.mutate({ alloyId, carId });
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Car List</DialogTitle>
          <DialogDescription>
            Add or remove cars that are compatible with this alloy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <MultiSelect
              options={
                uniqueModels
                  .filter(
                    (model) =>
                      !mappedModels.some(
                        (mappedModel) => mappedModel.id === model.id
                      )
                  )
                  .map((model) => ({
                    value: model.id.toString(),
                    label: `${model.make?.name} ${model.name}`,
                  })) || []
              }
              value={selectedVariants.map(String)}
              onChange={(value) => setSelectedVariants(value.map(Number))}
              placeholder="Select models to add"
              disabled={carsLoading}
              className="w-[400px]"
            />
            <Button
              onClick={handleAddCar}
              disabled={addCarsMutation.isPending || selectedVariants.length === 0}
            >
              {addCarsMutation.isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Add Cars"
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Mapped Models</h4>
            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
              {mappedCarsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : mappedModels?.length === 0 ? (
                <p className="p-4 text-sm text-center text-muted-foreground">
                  No cars have been mapped to this alloy yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {mappedModels?.map((model) => (
                    <li
                      key={model.id}
                      className="flex items-center justify-between p-3"
                    >
                      <span>
                        {model.make?.name} {model.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVariant(model.id)}
                        disabled={removeCarMutation.isPending}
                      >
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
