import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import type { ComparisonDataState, MachineData } from "@/pages/Index";
import { compareMachines, compareMachinesEntire } from "@/lib/machineComparison";

interface FileUploadProps {
  onDataProcessed: (data: ComparisonDataState) => void;
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
      
      // Helper function to get value from row with case-insensitive key matching
      const getRowValue = (row: any, ...possibleKeys: string[]): string => {
        const rowKeys = Object.keys(row);
        for (const key of possibleKeys) {
          // Try exact match first
          if (row[key] !== undefined) return row[key]?.toString() || "";
          // Try case-insensitive match
          const foundKey = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
          if (foundKey && row[foundKey] !== undefined) return row[foundKey]?.toString() || "";
        }
        return "";
      };
      
      // Transform the data to match our interface
      const machines: MachineData[] = jsonData.map((row: any) => ({
        manufacturer: getRowValue(row, "Manufacturer"),
        modelSeries: getRowValue(row, "Model Series"),
        modelName: getRowValue(row, "Model Name"),
        productType: getRowValue(row, "Product Type"),
        clampingForce: getRowValue(row, "Clamping force (US Ton)", "Clamping Force (US Ton)", "Clamping Force"),
        screwType: getRowValue(row, "Screw Type"),
        screwDiameter: getRowValue(row, "Screw Diameter"),
        tieBarDistance: getRowValue(row, "Tie-bar Distance", "Tie-Bar Distance", "Tiebar Distance"),
        screwStroke: getRowValue(row, "Screw Stroke"),
        shotSize: getRowValue(row, "Shot size", "Shot Size"),
        optionPrice: getRowValue(row, "Option Price"),
        freight: getRowValue(row, "Freight"),
        listPrice: getRowValue(row, "List Price"),
        salesPrice: getRowValue(row, "Sales Price"),
        customer: getRowValue(row, "Customer"),
        checkedTime: getRowValue(row, "Checked Time"),
        salesType: getRowValue(row, "Sales Type"),
        injectionUnit: getRowValue(row, "Injection Unit"),
      }));

      // Process comparison logic - generate both representative and entire versions
      const representativeResult = compareMachines(machines);
      const entireResult = compareMachinesEntire(machines);
      
      onDataProcessed({
        representative: representativeResult,
        entire: entireResult,
        rawMachines: machines,
      });
      
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
        border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer
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
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin" />
            <div>
              <p className="text-base sm:text-lg font-medium">Processing {fileName}...</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                AI is analyzing your data and generating comparisons
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 sm:p-4 rounded-full bg-primary/10">
              {isDragActive ? (
                <FileSpreadsheet className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              ) : (
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              )}
            </div>
            
            <div>
              <p className="text-base sm:text-lg font-medium mb-1">
                {isDragActive
                  ? "Drop your Excel file here"
                  : "Drag & drop your Excel file here"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                or tap to browse files (.xlsx, .xls)
              </p>
            </div>

            <Button type="button" variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
              Select File
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
