import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { bulkService } from "@/lib/api";
import { Loader, Upload, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface BulkStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function BulkStatusDialog({ open, onOpenChange, onSuccess }: BulkStatusDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await bulkService.uploadStatusUpdate(file);
            setResult(res.data);
            setFile(null); // Clear file selection
            if (onSuccess) {
                onSuccess();
            }
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || e.message || "Failed to upload status update");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Update Alloy Status</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to update alloy statuses. 
                        Use the "Export CSV" file as a template. 
                        Ensure columns "Name" (or "Alloy Name") and "Status" are present.
                        Status should be "Active" or "Inactive".
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                     <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <h3 className="font-medium flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" /> Instructions
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            1. Export your alloys using "Export CSV".<br/>
                            2. Edit the "Status" column to "Active" or "Inactive".<br/>
                            3. Upload the CSV file below.
                        </p>
                    </div>

                    <div className="space-y-2 border p-4 rounded-md">
                        <h3 className="font-medium flex items-center gap-2">
                            <Upload className="h-4 w-4" /> Upload File
                        </h3>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="status-upload">CSV File</Label>
                            <Input 
                                id="status-upload" 
                                type="file" 
                                accept=".csv" 
                                onChange={handleFileChange} 
                            />
                        </div>
                    </div>

                    {/* Results */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="space-y-2">
                            <Alert variant="default" className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Processing Complete</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    Processed: {result.total}. Success: {result.success}. Failed: {result.failed}.
                                </AlertDescription>
                            </Alert>

                            {result.errors && result.errors.length > 0 && (
                                <div className="border rounded-md p-2 bg-destructive/10 text-destructive text-sm max-h-40 overflow-y-auto">
                                    <p className="font-semibold mb-1">Failures:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {result.errors.map((err: any, idx: number) => (
                                            <li key={idx}>
                                                Row {err.row}: {err.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || isLoading}>
                        {isLoading ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
                            </>
                        ) : (
                            "Update Statuses"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
