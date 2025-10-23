import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAlloys, Alloy } from "@/lib/mockData";
import { toast } from "sonner";

export default function Alloys() {
  const navigate = useNavigate();
  const [alloys, setAlloys] = useState<Alloy[]>(mockAlloys);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlloys = alloys.filter((alloy) =>
    alloy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleEnabled = (id: string) => {
    setAlloys(alloys.map((alloy) => (alloy.id === id ? { ...alloy, enabled: !alloy.enabled } : alloy)));
    toast.success("Alloy status updated");
  };

  const handleDelete = (id: string) => {
    setAlloys(alloys.filter((alloy) => alloy.id !== id));
    toast.success("Alloy deleted successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alloy Master</h1>
            <p className="text-muted-foreground mt-1">
              Manage alloy wheels, finishes, and fitment mappings
            </p>
          </div>
          <Button onClick={() => navigate("/alloys/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Alloy
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alloys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alloy Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>PCD</TableHead>
                <TableHead>Offset</TableHead>
                <TableHead>Compatible Cars</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlloys.map((alloy) => (
                <TableRow key={alloy.id}>
                  <TableCell className="font-medium">{alloy.name}</TableCell>
                  <TableCell>{alloy.size}</TableCell>
                  <TableCell>{alloy.pcd}</TableCell>
                  <TableCell>{alloy.offset}</TableCell>
                  <TableCell>{alloy.compatibleCars} cars</TableCell>
                  <TableCell>
                    <Switch checked={alloy.enabled} onCheckedChange={() => toggleEnabled(alloy.id)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/alloys/${alloy.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(alloy.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
