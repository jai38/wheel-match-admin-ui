import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { bulkService } from "@/lib/api";
import { Loader, Upload, Download, FileSpreadsheet, CheckCircle, AlertTriangle } from "lucide-react";
import { downloadCSV } from "@/lib/exportUtils";

interface BulkCarImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BulkCarImportDialog({ open, onOpenChange }: BulkCarImportDialogProps) {
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

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                Make: "BMW",
                Model: "M3",
                Color: "Black",
                "Color Code": "#000000",
                Status: "Active",
                "Is Default": "Yes",
                "Image URL": "https://example.com/car.png"
            }
        ];
        downloadCSV(templateData, 'Car_Import_Template.csv');
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await bulkService.uploadCarImport(file);
            setResult(res.data);
            setFile(null);
        } catch (e: any) {
            console.error(e);
            setError(e.response?.data?.message || e.message || "Failed to upload cars");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Import Cars</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to add multiple cars, makes, and models at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <h3 className="font-medium flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" /> 1. Get Template
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Use the "Export Cars CSV" file as a template or download a sample here.
                        </p>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" /> Download Sample Template
                        </Button>
                    </div>

                    <div className="space-y-2 border p-4 rounded-md">
                        <h3 className="font-medium flex items-center gap-2">
                            <Upload className="h-4 w-4" /> 2. Upload Cars
                        </h3>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="car-excel-upload">CSV or Excel File</Label>
                            <Input 
                                id="car-excel-upload" 
                                type="file" 
                                accept=".csv, .xlsx, .xls" 
                                onChange={handleFileChange} 
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">
                            <b>Note:</b> If Make, Model, or Color do not exist, they will be created automatically.
                        </p>
                    </div>

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
                                <AlertTitle className="text-green-800">Import Complete</AlertTitle>
                                <AlertDescription className="text-green-700">
                                    Total: {result.total}. Success: {result.success}. Failed: {result.failed}.
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
                                <Loader className="mr-2 h-4 w-4 animate-spin" /> Importing...
                            </>
                        ) : (
                            "Start Import"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
