import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ComparisonTable from "@/components/ComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface MachineData {
  brand: string;
  model: string;
  clampingForce: number;
  shotSize: number;
  machinePrice: number;
  salesPrice: number;
  optionPrice: number;
  freight: number;
  checkedTime: string;
  performance?: string;
}

interface ComparisonResult {
  hydraulic: MachineData[];
  electric: MachineData[];
}

const Share = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("comparison_results")
          .select("data")
          .eq("share_id", shareId)
          .single();

        if (fetchError) {
          console.error("Error fetching shared data:", fetchError);
          setError("Could not find the shared comparison results");
          setLoading(false);
          return;
        }

        if (data && data.data) {
          setComparisonData(data.data as unknown as ComparisonResult);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred while loading the comparison results");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading comparison results...</p>
        </div>
      </div>
    );
  }

  if (error || !comparisonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error || "Could not load comparison results"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Machine Price Comparison Results
          </h1>
          <p className="text-lg text-gray-600">
            Shared comparison of hydraulic and electric machines
          </p>
        </header>

        <Tabs defaultValue="hydraulic" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="hydraulic">
              Hydraulic ({comparisonData.hydraulic.length})
            </TabsTrigger>
            <TabsTrigger value="electric">
              Electric ({comparisonData.electric.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hydraulic" className="mt-6">
            <ComparisonTable data={comparisonData.hydraulic} productType="Hydraulic" />
          </TabsContent>

          <TabsContent value="electric" className="mt-6">
            <ComparisonTable data={comparisonData.electric} productType="Electric" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Share;
