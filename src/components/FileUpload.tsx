import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import type { ComparisonResult, MachineData } from "@/pages/Index";
import { compareMachines } from "@/lib/machineComparison";

interface FileUploadProps {
  onDataProcessed: (data: ComparisonResult) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUpload = ({ onDataProcessed, isLoading, setIsLoading }: FileUploadProps) => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string>("");

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      setFileName(file.name);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets["Data"];
      
      if (!worksheet) {
        throw new Error("Could not find 'Data' sheet in the Excel file");
      }

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
      
      // Transform the data to match our interface
      const machines: MachineData[] = jsonData.map((row: any) => ({
        manufacturer: row["Manufacturer"] || "",
        modelSeries: row["Model Series"] || "",
        modelName: row["Model Name"] || "",
        productType: row["Product Type"] || "",
        clampingForce: row["Clamping force (US Ton)"]?.toString() || "",
        screwType: row["Screw Type"] || "",
        screwDiameter: row["Screw Diameter"]?.toString() || "",
        tieBarDistance: row["Tie-bar Distance"]?.toString() || "",
        screwStroke: row["Screw Stroke"]?.toString() || "",
        shotSize: row["Shot size"]?.toString() || "",
        optionPrice: row["Option Price"]?.toString() || "",
        freight: row["Freight"]?.toString() || "",
        listPrice: row["List Price"]?.toString() || "",
        salesPrice: row["Sales Price"]?.toString() || "",
        customer: row["Customer"] || "",
        checkedTime: row["Checked Time"] || "",
        salesType: row["Sales Type"] || "",
      }));

      // Process comparison logic
      const comparisonResult = compareMachines(machines);
      onDataProcessed(comparisonResult);
      
      toast({
        title: "File processed successfully",
        description: `Analyzed ${machines.length} machines and generated comparison tables.`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Please check your file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        processExcelFile(file);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-300
        ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div>
              <p className="text-lg font-medium">Processing {fileName}...</p>
              <p className="text-sm text-muted-foreground mt-1">
                AI is analyzing your data and generating comparisons
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10">
              {isDragActive ? (
                <FileSpreadsheet className="h-12 w-12 text-primary" />
              ) : (
                <Upload className="h-12 w-12 text-primary" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium mb-1">
                {isDragActive
                  ? "Drop your Excel file here"
                  : "Drag & drop your Excel file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files (.xlsx, .xls)
              </p>
            </div>

            <Button type="button" variant="outline" size="sm" className="mt-2">
              Select File
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
