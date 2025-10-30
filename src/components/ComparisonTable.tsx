import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface ComparisonTableProps {
  data: any[];
  productType: string;
}

const getTonnageCategory = (clampingForce: number): string => {
  if (clampingForce < 400) return "Small (<400 Tons)";
  if (clampingForce <= 1100) return "Medium (400~1100 Tons)";
  return "Large (>1100 Tons)";
};

const ComparisonTable = ({ data, productType }: ComparisonTableProps) => {
  const [selectedClampingForce, setSelectedClampingForce] = useState<string>("all");
  const [selectedTonnageCategory, setSelectedTonnageCategory] = useState<string>("all");

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No {productType.toLowerCase()} machines found in the uploaded data.
        </p>
      </Card>
    );
  }

  // Extract unique clamping forces and tonnage categories
  const clampingForces = useMemo(() => {
    const forces = Array.from(
      new Set(
        data.map((group) => group.referenceSpecs?.clampingForce).filter(Boolean)
      )
    ).sort((a, b) => a - b);
    return forces;
  }, [data]);

  const tonnageCategories = useMemo(() => {
    return ["Small (<400 Tons)", "Medium (400~1100 Tons)", "Large (>1100 Tons)"];
  }, []);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter((group) => {
      const clampingForce = group.referenceSpecs?.clampingForce;
      if (!clampingForce) return false;

      // Filter by clamping force
      if (selectedClampingForce !== "all" && clampingForce.toString() !== selectedClampingForce) {
        return false;
      }

      // Filter by tonnage category
      if (selectedTonnageCategory !== "all") {
        const category = getTonnageCategory(clampingForce);
        if (category !== selectedTonnageCategory) {
          return false;
        }
      }

      return true;
    });
  }, [data, selectedClampingForce, selectedTonnageCategory]);

  // Extract unique manufacturers for column headers
  const manufacturers = Array.from(
    new Set(
      data.flatMap((group) =>
        Object.keys(group).filter((key) => key !== "referenceSpecs")
      )
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Clamping Force</label>
          <Select value={selectedClampingForce} onValueChange={setSelectedClampingForce}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All clamping forces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clamping Forces</SelectItem>
              {clampingForces.map((force) => (
                <SelectItem key={force} value={force.toString()}>
                  {force} US Ton
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Tonnage Category</label>
          <Select value={selectedTonnageCategory} onValueChange={setSelectedTonnageCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {tonnageCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Reference Specs</TableHead>
              {manufacturers.map((manufacturer) => (
                <TableHead key={manufacturer} className="font-bold min-w-[250px]">
                  {manufacturer}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((group, groupIndex) => {
              const referenceSpecs = group.referenceSpecs;
              const maxModels = Math.max(
                ...manufacturers.map(
                  (mfr) => group[mfr]?.length || 0
                )
              );

              return Array.from({ length: Math.max(1, maxModels) }).map((_, rowIndex) => (
                <TableRow key={`${groupIndex}-${rowIndex}`} className="hover:bg-muted/30">
                  {rowIndex === 0 && (
                    <TableCell
                      rowSpan={maxModels}
                      className="align-top border-r font-medium bg-muted/20"
                    >
                      <div className="space-y-2 py-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Clamping Force:</span>
                          <p className="font-semibold">{referenceSpecs.clampingForce} US Ton</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Shot Size:</span>
                          <p className="font-semibold">{referenceSpecs.shotSize}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Screw Type:</span>
                          <p className="font-semibold">{referenceSpecs.screwType}</p>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  
                  {manufacturers.map((manufacturer) => {
                    const models = group[manufacturer] || [];
                    const model = models[rowIndex];

                    return (
                      <TableCell key={manufacturer} className="align-top">
                        {model ? (
                          <div className="space-y-2 py-2">
                            <div className="font-semibold text-primary">
                              {model.modelName}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="text-muted-foreground">Clamping Force:</span>{" "}
                                {model.clampingForce} US Ton
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tie-bar Distance:</span>{" "}
                                {model.tieBarDistance || <span className="text-muted-foreground/50">—</span>}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Screw Type:</span>{" "}
                                {model.screwType || <span className="text-muted-foreground/50">—</span>}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Shot Size:</span>{" "}
                                {model.shotSize}
                              </div>
                              <div className="pt-1">
                                <Badge
                                  variant={model.salesType === "STOCK" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {model.salesType}
                                </Badge>
                              </div>
                              <div className="pt-2 text-lg font-bold text-primary">
                                {formatCurrency(model.salesPrice)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                List Price: {formatCurrency(model.listPrice)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Option Price: {formatCurrency(model.optionPrice)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Freight: {formatCurrency(model.freight)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Checked: {model.checkedTime}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-muted-foreground/50">—</div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ComparisonTable;
