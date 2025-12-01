import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import ComparisonTable from "@/components/ComparisonTable";
import { Upload, Zap, Share2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MachineData {
  manufacturer: string;
  modelSeries: string;
  modelName: string;
  productType: string;
  clampingForce: string;
  screwType: string;
  screwDiameter: string;
  tieBarDistance: string;
  screwStroke: string;
  shotSize: string;
  optionPrice: string;
  freight: string;
  listPrice: string;
  salesPrice: string;
  customer: string;
  checkedTime: string;
  salesType: string;
  performance?: string;
  injectionUnit?: string;
}

export interface ComparisonResult {
  hydraulic: any[];
  electric: any[];
}

export interface ComparisonDataState {
  representative: ComparisonResult;
  entire: ComparisonResult;
  rawMachines: MachineData[];
}

const Index = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonDataState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  const handleFileProcessed = async (data: ComparisonDataState) => {
    setComparisonData(data);
    
    // Automatically generate share link
    await saveAndGenerateShareLink(data.representative);
  };

  const saveAndGenerateShareLink = async (data: ComparisonResult) => {
    try {
      // Generate a unique share ID
      const newShareId = crypto.randomUUID();
      
      // Save to database
      const { error } = await supabase
        .from("comparison_results")
        .insert({
          share_id: newShareId,
          data: data as any,
        } as any);

      if (error) {
        console.error("Error saving comparison results:", error);
        toast.error("Failed to generate share link");
        return;
      }

      setShareId(newShareId);
      toast.success("Share link generated!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate share link");
    }
  };

  const copyShareLink = () => {
    if (!shareId) return;
    
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  const handleUploadNew = () => {
    setComparisonData(null);
    setShareId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Machine Price Comparison
              </h1>
              <p className="text-sm text-muted-foreground">
                Intelligent competitor analysis for injection molding machines
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!comparisonData ? (
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 shadow-medium">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upload Your Data</h2>
                <p className="text-muted-foreground">
                  Upload your Excel file with machine specifications and pricing data.
                  Our AI will automatically analyze and compare similar models across manufacturers.
                </p>
              </div>

              <FileUpload
                onDataProcessed={handleFileProcessed}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Automatic grouping by Product Type (Hydraulic/Electric)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Smart matching based on Clamping Force, Shot Size, and Screw Type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Side-by-side manufacturer comparison</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Shows all similar models with pricing and specifications</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {shareId && (
              <Card className="p-4 shadow-medium bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share this comparison
                    </p>
                    <code className="text-xs text-muted-foreground break-all block bg-background/50 p-2 rounded">
                      {window.location.origin}/share/{shareId}
                    </code>
                  </div>
                  <Button
                    onClick={copyShareLink}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </Card>
            )}
            
            <Card className="p-6 shadow-medium">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Comparison Results</h2>
                  <p className="text-sm text-muted-foreground">
                    Similar models grouped by manufacturer for easy price comparison
                  </p>
                </div>
                <Button
                  onClick={handleUploadNew}
                  variant="outline"
                  size="sm"
                >
                  Upload New File
                </Button>
              </div>

              <Tabs defaultValue="hydraulic" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="hydraulic">
                    Hydraulic Machines
                  </TabsTrigger>
                  <TabsTrigger value="electric">
                    Electric Machines
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hydraulic" className="mt-6">
                  <ComparisonTable
                    dataRepresentative={comparisonData.representative.hydraulic}
                    dataEntire={comparisonData.entire.hydraulic}
                    productType="Hydraulic"
                  />
                </TabsContent>

                <TabsContent value="electric" className="mt-6">
                  <ComparisonTable
                    dataRepresentative={comparisonData.representative.electric}
                    dataEntire={comparisonData.entire.electric}
                    productType="Electric"
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
