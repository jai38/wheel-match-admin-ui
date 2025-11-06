import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, createModel } from "@/lib/mockData";
import { toast } from "sonner";

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelAdded: () => void;
  make?: string;
}

export function AddModelModal({ isOpen, onClose, onModelAdded, make }: AddModelModalProps) {
  const [modelName, setModelName] = useState("");
  const [year, setYear] = useState("");
  const [fuelType, setFuelType] = useState("");

  const handleSubmit = () => {
    if (!modelName || !make) {
      toast.error("Model name and make are required");
      return;
    }
    createModel({
      company: make,
      model: modelName,
    });
    toast.success("Model added successfully");
    onModelAdded();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Model</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="make" className="text-right">
              Make
            </Label>
            <Input id="make" value={make} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model-name" className="text-right">
              Model Name
            </Label>
            <Input
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <Input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fuel-type" className="text-right">
              Fuel Type
            </Label>
            <Input
              id="fuel-type"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Model</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
