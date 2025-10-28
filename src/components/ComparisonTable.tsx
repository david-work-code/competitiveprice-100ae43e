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

interface ComparisonTableProps {
  data: any[];
  productType: string;
}

const ComparisonTable = ({ data, productType }: ComparisonTableProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No {productType.toLowerCase()} machines found in the uploaded data.
        </p>
      </Card>
    );
  }

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
            {data.map((group, groupIndex) => {
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
                                {model.salesPrice}
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
