import type { MachineData, ComparisonResult } from "@/pages/Index";

export function compareMachines(machines: MachineData[]): ComparisonResult {
  const hydraulic = machines.filter((m) => (m.productType || "").toLowerCase().includes("hydraulic"));
  const electric = machines.filter((m) => (m.productType || "").toLowerCase().includes("electric"));

  return {
    hydraulic: groupSimilarMachinesToTableFormat(hydraulic),
    electric: groupSimilarMachinesToTableFormat(electric),
  };
}

type ReferenceSpecs = {
  clampingForce: number | string;
  shotSize: number | string;
  screwType: string;
  performance?: string;
};

type TableGroup = {
  referenceSpecs: ReferenceSpecs;
  [manufacturer: string]: any; // arrays of MachineData per manufacturer
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.\-]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function groupSimilarMachinesToTableFormat(machines: MachineData[]): TableGroup[] {
  if (!machines || machines.length === 0) return [];

  // Group by normalized specs (clamping force range, screw type, shot size range)
  const map = new Map<
    string,
    {
      manufacturers: Record<string, MachineData[]>;
      ref: ReferenceSpecs;
    }
  >();

  machines.forEach((machine) => {
    const clampingForceNum = toNumber(machine.clampingForce);
    const shotSizeNum = toNumber(machine.shotSize);
    const screwTypeNorm = (machine.screwType || "").toLowerCase().trim();
    
    // Normalize performance for grouping
    const performanceValue = (machine.performance || "").toLowerCase().trim();
    const performanceGroup = performanceValue === "high" ? "high" : "standard";

    const forceRange = Math.round(clampingForceNum / 50) * 50; // nearest 50
    const shotRange = Math.round(shotSizeNum / 10) * 10; // nearest 10

    const key = `${forceRange}-${screwTypeNorm}-${shotRange}-${performanceGroup}`;

    if (!map.has(key)) {
      map.set(key, {
        manufacturers: {},
        ref: {
          clampingForce: forceRange,
          shotSize: shotRange,
          screwType: machine.screwType || "",
          performance: performanceGroup === "high" ? "High" : undefined,
        },
      });
    }

    const group = map.get(key)!;
    const mfg = machine.manufacturer || "Unknown";
    if (!group.manufacturers[mfg]) group.manufacturers[mfg] = [];
    group.manufacturers[mfg].push(machine);
  });

  // Convert to the structure expected by ComparisonTable:
  // { referenceSpecs: {...}, [manufacturer]: MachineData[] }
  const result: TableGroup[] = [];
  map.forEach(({ manufacturers, ref }) => {
    result.push({ referenceSpecs: ref, ...manufacturers });
  });

  // Sort by clamping force (ascending), then by shot size (ascending)
  result.sort((a, b) => {
    const forceA = toNumber(a.referenceSpecs.clampingForce);
    const forceB = toNumber(b.referenceSpecs.clampingForce);
    if (forceA !== forceB) return forceA - forceB;
    
    const shotA = toNumber(a.referenceSpecs.shotSize);
    const shotB = toNumber(b.referenceSpecs.shotSize);
    return shotA - shotB;
  });

  return result;
}
