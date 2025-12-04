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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ComparisonTableProps {
  dataRepresentative: any[];
  dataEntire: any[];
  productType: string;
}

const getTonnageCategory = (clampingForce: number): string => {
  if (clampingForce < 400) return "Small (<400 Tons)";
  if (clampingForce <= 1100) return "Medium (400~1100 Tons)";
  return "Large (>1100 Tons)";
};

const ComparisonTable = ({ dataRepresentative, dataEntire, productType }: ComparisonTableProps) => {
  const [selectedClampingForce, setSelectedClampingForce] = useState<string>("all");
  const [selectedTonnageCategory, setSelectedTonnageCategory] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  // Use representative data for main view
  const data = dataRepresentative;

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

      if (selectedClampingForce !== "all" && clampingForce.toString() !== selectedClampingForce) {
        return false;
      }

      if (selectedTonnageCategory !== "all") {
        const category = getTonnageCategory(clampingForce);
        if (category !== selectedTonnageCategory) {
          return false;
        }
      }

      return true;
    });
  }, [data, selectedClampingForce, selectedTonnageCategory]);

  // Extract unique manufacturers for column headers, with LS Mtron first
  const manufacturers = Array.from(
    new Set(
      data.flatMap((group) =>
        Object.keys(group).filter((key) => key !== "referenceSpecs")
      )
    )
  ).sort((a, b) => {
    const isLSA = a === "LS" || a === "LS Mtron";
    const isLSB = b === "LS" || b === "LS Mtron";
    if (isLSA) return -1;
    if (isLSB) return 1;
    return a.localeCompare(b);
  });

  const lsManufacturer = manufacturers[0];
  const isLSFirst = lsManufacturer === "LS" || lsManufacturer === "LS Mtron";

  // Find entire data for selected group
  const getEntireGroupData = (referenceSpecs: any) => {
    return dataEntire.find(
      (g) =>
        g.referenceSpecs?.clampingForce === referenceSpecs?.clampingForce &&
        g.referenceSpecs?.shotSize === referenceSpecs?.shotSize &&
        g.referenceSpecs?.screwType === referenceSpecs?.screwType
    );
  };

  const handleRowClick = (group: any) => {
    const entireGroup = getEntireGroupData(group.referenceSpecs);
    setSelectedGroup(entireGroup || group);
  };

  // Detail view for selected group
  if (selectedGroup) {
    const detailManufacturers = Object.keys(selectedGroup)
      .filter((key) => key !== "referenceSpecs")
      .sort((a, b) => {
        const isLSA = a === "LS" || a === "LS Mtron";
        const isLSB = b === "LS" || b === "LS Mtron";
        if (isLSA) return -1;
        if (isLSB) return 1;
        return a.localeCompare(b);
      });

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedGroup(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-sm sm:text-base">
            <span className="font-semibold">Specification:</span>{" "}
            {selectedGroup.referenceSpecs?.clampingForce} US Ton / {selectedGroup.referenceSpecs?.shotSize} oz. / {selectedGroup.referenceSpecs?.screwType}
          </div>
        </div>

        <div className="relative border rounded-md -mx-3 sm:mx-0">
          <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 z-30">
                <TableRow className="bg-muted">
                  <TableHead className="font-bold text-xs sm:text-sm sticky left-0 z-40 bg-muted border-r min-w-[100px] sm:min-w-[120px] p-2 sm:p-3">Manufacturer</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[120px] sm:min-w-[150px] p-2 sm:p-3">Model</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] p-2 sm:p-3">Clamping Force</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[70px] sm:min-w-[90px] p-2 sm:p-3">Shot Size</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] p-2 sm:p-3">Screw Type</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] p-2 sm:p-3">Injection Unit</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] p-2 sm:p-3">Tie-bar</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[70px] sm:min-w-[80px] p-2 sm:p-3">Type</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[100px] sm:min-w-[120px] p-2 sm:p-3">List Price</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[100px] sm:min-w-[120px] p-2 sm:p-3">Option</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[80px] sm:min-w-[100px] p-2 sm:p-3">Freight</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[100px] sm:min-w-[130px] p-2 sm:p-3">Sales Price</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[100px] sm:min-w-[120px] p-2 sm:p-3">Customer</TableHead>
                  <TableHead className="font-bold text-xs sm:text-sm min-w-[90px] sm:min-w-[100px] p-2 sm:p-3">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailManufacturers.flatMap((manufacturer) => {
                  const models = selectedGroup[manufacturer] || [];
                  return models.map((model: any, idx: number) => (
                    <TableRow key={`${manufacturer}-${idx}`} className="hover:bg-muted/30">
                      <TableCell className="font-medium sticky left-0 z-20 bg-background border-r text-xs sm:text-sm p-2 sm:p-3">
                        {manufacturer}
                      </TableCell>
                      <TableCell className="font-semibold text-primary text-xs sm:text-sm p-2 sm:p-3">{model.modelName}</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{model.clampingForce} US Ton</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{model.shotSize} oz.</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{model.screwType || "—"}</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{model.injectionUnit || "—"}</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{model.tieBarDistance ? `${model.tieBarDistance}"` : "—"}</TableCell>
                      <TableCell className="p-2 sm:p-3">
                        <Badge variant={model.salesType === "STOCK" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                          {model.salesType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{formatCurrency(model.listPrice)}</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{formatCurrency(model.optionPrice)}</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{formatCurrency(model.freight)}</TableCell>
                      <TableCell className="font-bold text-primary text-xs sm:text-sm p-2 sm:p-3">{formatCurrency(model.salesPrice)}</TableCell>
                      <TableCell className="text-xs sm:text-sm p-2 sm:p-3">{model.customer || "—"}</TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground p-2 sm:p-3">{model.checkedTime}</TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium">Clamping Force</label>
          <Select value={selectedClampingForce} onValueChange={setSelectedClampingForce}>
            <SelectTrigger className="w-full h-9 sm:h-10">
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
          <label className="text-xs sm:text-sm font-medium">Tonnage Category</label>
          <Select value={selectedTonnageCategory} onValueChange={setSelectedTonnageCategory}>
            <SelectTrigger className="w-full h-9 sm:h-10">
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

      <p className="text-xs sm:text-sm text-muted-foreground italic">
        💡 Click on any row to view all sales history for that specification
      </p>

      <div className="relative border rounded-md -mx-3 sm:mx-0">
        <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 z-30">
              <TableRow className="bg-muted">
                <TableHead className="font-bold text-xs sm:text-sm lg:text-base sticky left-0 z-40 bg-muted border-r min-w-[140px] sm:min-w-[180px] lg:min-w-[200px] p-2 sm:p-3 lg:p-4">
                  Machine Specifications (Reference)
                </TableHead>
                {manufacturers.map((manufacturer, idx) => (
                  <TableHead 
                    key={manufacturer} 
                    className={`font-bold text-xs sm:text-sm lg:text-base min-w-[180px] sm:min-w-[220px] lg:min-w-[250px] p-2 sm:p-3 lg:p-4 ${
                      idx === 0 && isLSFirst ? 'sticky left-[140px] sm:left-[180px] lg:left-[200px] z-40 bg-muted border-r' : ''
                    }`}
                  >
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
                  <TableRow 
                    key={`${groupIndex}-${rowIndex}`} 
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleRowClick(group)}
                  >
                    {rowIndex === 0 && (
                      <TableCell
                        rowSpan={maxModels}
                        className="align-top border-r font-medium bg-background sticky left-0 z-20 min-w-[140px] sm:min-w-[180px] lg:min-w-[200px] p-2 sm:p-3 lg:p-4"
                      >
                        <div className="space-y-2 sm:space-y-3 py-1 sm:py-2">
                          <div className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide border-b pb-1">
                            Specifications
                          </div>
                          <div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Clamping Force:</span>
                            <p className="text-xs sm:text-sm font-semibold">{referenceSpecs.clampingForce} US Ton</p>
                          </div>
                          <div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Shot Size:</span>
                            <p className="text-xs sm:text-sm font-semibold">{referenceSpecs.shotSize} oz.</p>
                          </div>
                          <div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">Screw Type:</span>
                            <p className="text-xs sm:text-sm font-semibold">{referenceSpecs.screwType}</p>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    
                    {manufacturers.map((manufacturer, idx) => {
                      const models = group[manufacturer] || [];
                      const model = models[rowIndex];
                      const isFirstManufacturer = idx === 0 && isLSFirst;

                      return (
                        <TableCell 
                          key={manufacturer} 
                          className={`align-top p-2 sm:p-3 lg:p-4 ${
                            isFirstManufacturer ? 'sticky left-[140px] sm:left-[180px] lg:left-[200px] z-20 bg-background border-r' : ''
                          }`}
                        >
                          {model ? (
                            <div className="space-y-2 sm:space-y-3 py-1 sm:py-2">
                              <div className="font-semibold text-sm sm:text-base lg:text-lg text-primary border-b pb-1 sm:pb-2">
                                {model.modelName}
                              </div>
                              
                              <div className="space-y-1 sm:space-y-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
                                  Machine Specifications
                                </div>
                                <div className="text-xs sm:text-sm space-y-1">
                                  <div>
                                    <span className="text-muted-foreground">Clamping Force:</span>{" "}
                                    <span className="font-medium">{model.clampingForce} US Ton</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Shot Size:</span>{" "}
                                    <span className="font-medium">{model.shotSize} oz.</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Screw Type:</span>{" "}
                                    <span className="font-medium">{model.screwType || <span className="text-muted-foreground/50">—</span>}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Injection Unit:</span>{" "}
                                    <span className="font-medium">{model.injectionUnit || <span className="text-muted-foreground/50">—</span>}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Tie-bar Distance:</span>{" "}
                                    <span className="font-medium">{model.tieBarDistance ? `${model.tieBarDistance} inches` : <span className="text-muted-foreground/50">—</span>}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 sm:space-y-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
                                  Availability
                                </div>
                                <div>
                                  <Badge
                                    variant={model.salesType === "STOCK" ? "default" : "secondary"}
                                    className="text-[10px] sm:text-xs"
                                  >
                                    {model.salesType}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-1 sm:space-y-2 border-t pt-2 sm:pt-3">
                                <div className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wide">
                                  Pricing Information
                                </div>
                                <div className="text-base sm:text-lg lg:text-xl font-bold text-primary">
                                  Sales Price: {formatCurrency(model.salesPrice)}
                                </div>
                                <div className="text-xs sm:text-sm space-y-1">
                                  <div className="text-muted-foreground">
                                    <span className="text-xs">List Price:</span> {formatCurrency(model.listPrice)}
                                  </div>
                                  <div className="text-muted-foreground">
                                    <span className="text-xs">Option Price:</span> {formatCurrency(model.optionPrice)}
                                  </div>
                                  <div className="text-muted-foreground">
                                    <span className="text-xs">Freight:</span> {formatCurrency(model.freight)}
                                  </div>
                                  <div className="text-muted-foreground">
                                    <span className="text-xs">Customer:</span> {model.customer || <span className="text-muted-foreground/50">—</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="text-[10px] sm:text-xs text-muted-foreground border-t pt-1 sm:pt-2">
                                Last Updated: {model.checkedTime}
                              </div>
                            </div>
                          ) : (
                            <div className="py-1 sm:py-2 text-muted-foreground/50 text-center">—</div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default ComparisonTable;
